package com.example.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Alarm
import androidx.compose.material.icons.filled.Analytics
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.components.AuthDialog
import com.example.ui.components.PriceAlertDialog
import com.example.ui.screens.AlertsScreen
import com.example.ui.screens.AnalyticsScreen
import com.example.ui.screens.DashboardScreen
import com.example.ui.screens.ProductDetailScreen
import com.example.ui.screens.SearchScreen
import com.example.ui.viewmodel.SmartPriceViewModel

enum class MainTab(val title: String) {
    DASHBOARD("Home"),
    SEARCH("Search"),
    ALERTS("Alerts"),
    ANALYTICS("Analytics")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SmartPriceApp(viewModel: SmartPriceViewModel) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val products by viewModel.products.collectAsStateWithLifecycle()
    val alerts by viewModel.alerts.collectAsStateWithLifecycle()

    var currentTab by remember { mutableStateOf(MainTab.DASHBOARD) }
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(uiState.snackbarMessage) {
        uiState.snackbarMessage?.let { msg ->
            snackbarHostState.showSnackbar(msg)
            viewModel.clearSnackbar()
        }
    }

    if (uiState.selectedProduct != null) {
        // Detailed Product View
        ProductDetailScreen(
            product = uiState.selectedProduct,
            platformPrices = uiState.platformPrices,
            priceHistory = uiState.priceHistory,
            prediction = uiState.predictionResult,
            historyRangeDays = uiState.historyRangeDays,
            onRangeChange = { viewModel.setHistoryRange(it) },
            onBack = { viewModel.clearSelectedProduct() },
            onSetAlertClick = { viewModel.openAlertSheet() },
            isLoading = uiState.isLoading
        )
    } else {
        // Main Tab Scaffold
        Scaffold(
            snackbarHost = { SnackbarHost(snackbarHostState) },
            topBar = {
                TopAppBar(
                    title = {
                        Text(
                            text = "SmartPrice Predictor",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                    },
                    actions = {
                        IconButton(
                            onClick = { viewModel.openLoginDialog() },
                            modifier = Modifier.testTag("auth_button")
                        ) {
                            Icon(
                                imageVector = Icons.Default.AccountCircle,
                                contentDescription = "User Account",
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(28.dp)
                            )
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    )
                )
            },
            bottomBar = {
                NavigationBar {
                    NavigationBarItem(
                        selected = currentTab == MainTab.DASHBOARD,
                        onClick = { currentTab = MainTab.DASHBOARD },
                        icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                        label = { Text("Home") },
                        modifier = Modifier.testTag("tab_home")
                    )
                    NavigationBarItem(
                        selected = currentTab == MainTab.SEARCH,
                        onClick = { currentTab = MainTab.SEARCH },
                        icon = { Icon(Icons.Default.Search, contentDescription = "Search") },
                        label = { Text("Search") },
                        modifier = Modifier.testTag("tab_search")
                    )
                    NavigationBarItem(
                        selected = currentTab == MainTab.ALERTS,
                        onClick = { currentTab = MainTab.ALERTS },
                        icon = {
                            val activeCount = alerts.size
                            if (activeCount > 0) {
                                BadgedBox(badge = { Badge { Text("$activeCount") } }) {
                                    Icon(Icons.Default.Alarm, contentDescription = "Alerts")
                                }
                            } else {
                                Icon(Icons.Default.Alarm, contentDescription = "Alerts")
                            }
                        },
                        label = { Text("Alerts") },
                        modifier = Modifier.testTag("tab_alerts")
                    )
                    NavigationBarItem(
                        selected = currentTab == MainTab.ANALYTICS,
                        onClick = { currentTab = MainTab.ANALYTICS },
                        icon = { Icon(Icons.Default.Analytics, contentDescription = "Analytics") },
                        label = { Text("Analytics") },
                        modifier = Modifier.testTag("tab_analytics")
                    )
                }
            }
        ) { innerPadding ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
            ) {
                when (currentTab) {
                    MainTab.DASHBOARD -> {
                        DashboardScreen(
                            products = products,
                            alerts = alerts,
                            onProductClick = { viewModel.selectProduct(it) },
                            onNavigateSearch = { category ->
                                if (category.isNotEmpty()) {
                                    viewModel.onCategorySelect(category)
                                }
                                currentTab = MainTab.SEARCH
                            },
                            onNavigateAlerts = { currentTab = MainTab.ALERTS }
                        )
                    }
                    MainTab.SEARCH -> {
                        SearchScreen(
                            searchQuery = uiState.searchQuery,
                            onQueryChange = { viewModel.onSearchQueryChange(it) },
                            selectedCategory = uiState.selectedCategory,
                            onCategoryChange = { viewModel.onCategorySelect(it) },
                            sortOption = uiState.sortOption,
                            onSortChange = { viewModel.onSortSelect(it) },
                            products = products,
                            onProductClick = { viewModel.selectProduct(it) }
                        )
                    }
                    MainTab.ALERTS -> {
                        AlertsScreen(
                            alerts = alerts,
                            onDeleteAlert = { viewModel.deleteAlert(it) },
                            onSimulateTrigger = { viewModel.simulateAlertTrigger(it) },
                            isSimulationRunning = uiState.isSimulationRunning
                        )
                    }
                    MainTab.ANALYTICS -> {
                        AnalyticsScreen()
                    }
                }
            }
        }
    }

    // Price Alert Bottom Sheet Dialog
    if (uiState.isAlertSheetOpen && uiState.selectedProduct != null) {
        PriceAlertDialog(
            currentPrice = uiState.selectedProduct!!.currentLowestPrice,
            onDismiss = { viewModel.closeAlertSheet() },
            onConfirm = { targetPrice ->
                viewModel.createPriceAlert(targetPrice)
            }
        )
    }

    // Auth Dialog
    if (uiState.isLoginDialogOpen) {
        AuthDialog(
            onDismiss = { viewModel.closeLoginDialog() },
            onLogin = { email, pass ->
                viewModel.loginUser(email, pass)
            },
            onRegister = { name, email, pass ->
                viewModel.registerUser(name, email, pass)
            }
        )
    }
}
