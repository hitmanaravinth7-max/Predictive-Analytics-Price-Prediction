package com.example.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.local.AppDatabase
import com.example.data.model.PlatformPrice
import com.example.data.model.PriceAlert
import com.example.data.model.PriceHistoryPoint
import com.example.data.model.Product
import com.example.data.model.PredictionResult
import com.example.data.model.User
import com.example.data.repository.SmartPriceRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

enum class SortOption(val title: String) {
    BEST_VALUE("Best Value"),
    PRICE_LOW_HIGH("Price: Low to High"),
    PREDICTED_DROP("Highest Predicted Drop"),
    RATING("Highest Rated")
}

data class UiState(
    val searchQuery: String = "",
    val selectedCategory: String = "All",
    val sortOption: SortOption = SortOption.BEST_VALUE,
    val selectedProductId: String? = null,
    val selectedProduct: Product? = null,
    val platformPrices: List<PlatformPrice> = emptyList(),
    val priceHistory: List<PriceHistoryPoint> = emptyList(),
    val predictionResult: PredictionResult? = null,
    val historyRangeDays: Int = 60,
    val currentUser: User? = null,
    val isLoginDialogOpen: Boolean = false,
    val isAlertSheetOpen: Boolean = false,
    val isSimulationRunning: Boolean = false,
    val snackbarMessage: String? = null,
    val isLoading: Boolean = false
)

class SmartPriceViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: SmartPriceRepository

    private val _uiState = MutableStateFlow(UiState())
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    init {
        val db = AppDatabase.getDatabase(application)
        repository = SmartPriceRepository(db)

        viewModelScope.launch {
            repository.initializeDataIfEmpty()
            val user = repository.getInitialUser()
            _uiState.update { it.copy(currentUser = user) }
        }
    }

    val products: StateFlow<List<Product>> = combine(
        repository.allProducts,
        _uiState
    ) { all, state ->
        var list = all

        // Filter by category
        if (state.selectedCategory != "All") {
            list = list.filter { it.category.equals(state.selectedCategory, ignoreCase = true) }
        }

        // Filter by search query
        if (state.searchQuery.isNotBlank()) {
            val q = state.searchQuery.trim().lowercase()
            list = list.filter {
                it.title.lowercase().contains(q) ||
                it.brand.lowercase().contains(q) ||
                it.category.lowercase().contains(q)
            }
        }

        // Sort
        when (state.sortOption) {
            SortOption.PRICE_LOW_HIGH -> list.sortedBy { it.currentLowestPrice }
            SortOption.RATING -> list.sortedByDescending { it.rating }
            SortOption.PREDICTED_DROP -> list.sortedByDescending { it.discountPercent }
            SortOption.BEST_VALUE -> list.sortedWith(
                compareByDescending<Product> { it.rating }
                    .thenBy { it.currentLowestPrice }
            )
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val alerts: StateFlow<List<PriceAlert>> = repository.allAlerts
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun onSearchQueryChange(newQuery: String) {
        _uiState.update { it.copy(searchQuery = newQuery) }
    }

    fun onCategorySelect(category: String) {
        _uiState.update { it.copy(selectedCategory = category) }
    }

    fun onSortSelect(sort: SortOption) {
        _uiState.update { it.copy(sortOption = sort) }
    }

    fun selectProduct(productId: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, selectedProductId = productId) }
            val prod = repository.getProductById(productId)
            if (prod != null) {
                val prediction = repository.getPrediction(productId)
                _uiState.update {
                    it.copy(
                        selectedProduct = prod,
                        predictionResult = prediction,
                        isLoading = false
                    )
                }

                // Observe platform prices and history
                launch {
                    repository.getPlatformPrices(productId).collect { prices ->
                        _uiState.update { it.copy(platformPrices = prices) }
                    }
                }
                launch {
                    repository.getPriceHistory(productId).collect { history ->
                        _uiState.update { it.copy(priceHistory = history) }
                    }
                }
            } else {
                _uiState.update { it.copy(isLoading = false) }
            }
        }
    }

    fun clearSelectedProduct() {
        _uiState.update {
            it.copy(
                selectedProductId = null,
                selectedProduct = null,
                platformPrices = emptyList(),
                priceHistory = emptyList(),
                predictionResult = null
            )
        }
    }

    fun setHistoryRange(days: Int) {
        _uiState.update { it.copy(historyRangeDays = days) }
    }

    fun openAlertSheet() {
        _uiState.update { it.copy(isAlertSheetOpen = true) }
    }

    fun closeAlertSheet() {
        _uiState.update { it.copy(isAlertSheetOpen = false) }
    }

    fun createPriceAlert(targetPrice: Double) {
        val prod = _uiState.value.selectedProduct ?: return
        viewModelScope.launch {
            repository.addPriceAlert(
                productId = prod.id,
                productName = prod.title,
                targetPrice = targetPrice,
                currentPrice = prod.currentLowestPrice
            )
            _uiState.update {
                it.copy(
                    isAlertSheetOpen = false,
                    snackbarMessage = "Price drop alert set for $${String.format("%.2f", targetPrice)}"
                )
            }
        }
    }

    fun deleteAlert(alertId: Long) {
        viewModelScope.launch {
            repository.deleteAlert(alertId)
            _uiState.update { it.copy(snackbarMessage = "Alert deleted") }
        }
    }

    fun simulateAlertTrigger(alertId: Long) {
        viewModelScope.launch {
            _uiState.update { it.copy(isSimulationRunning = true) }
            repository.simulatePriceDrop(alertId)
            _uiState.update {
                it.copy(
                    isSimulationRunning = false,
                    snackbarMessage = "🔔 Simulated Alert: Price drop detected! Target met."
                )
            }
        }
    }

    fun openLoginDialog() {
        _uiState.update { it.copy(isLoginDialogOpen = true) }
    }

    fun closeLoginDialog() {
        _uiState.update { it.copy(isLoginDialogOpen = false) }
    }

    fun loginUser(email: String, pass: String) {
        viewModelScope.launch {
            val result = repository.login(email, pass)
            result.onSuccess { user ->
                _uiState.update {
                    it.copy(
                        currentUser = user,
                        isLoginDialogOpen = false,
                        snackbarMessage = "Welcome back, ${user.fullName}!"
                    )
                }
            }.onFailure { err ->
                _uiState.update { it.copy(snackbarMessage = err.message ?: "Login failed") }
            }
        }
    }

    fun registerUser(name: String, email: String, pass: String) {
        viewModelScope.launch {
            val result = repository.register(name, email, pass)
            result.onSuccess { user ->
                _uiState.update {
                    it.copy(
                        currentUser = user,
                        isLoginDialogOpen = false,
                        snackbarMessage = "Account created successfully!"
                    )
                }
            }.onFailure { err ->
                _uiState.update { it.copy(snackbarMessage = err.message ?: "Registration failed") }
            }
        }
    }

    fun clearSnackbar() {
        _uiState.update { it.copy(snackbarMessage = null) }
    }
}
