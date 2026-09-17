package com.example.data.repository

import com.example.data.local.AppDatabase
import com.example.data.local.PlatformPriceEntity
import com.example.data.local.PriceAlertEntity
import com.example.data.local.PriceHistoryEntity
import com.example.data.local.ProductEntity
import com.example.data.local.UserEntity
import com.example.data.model.PlatformPrice
import com.example.data.model.PriceAlert
import com.example.data.model.PriceHistoryPoint
import com.example.data.model.Product
import com.example.data.model.PredictionResult
import com.example.data.model.User
import com.example.ml.PricePredictionEngine
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import kotlin.math.roundToInt
import kotlin.random.Random

class SmartPriceRepository(private val database: AppDatabase) {

    private val productDao = database.productDao()
    private val platformPriceDao = database.platformPriceDao()
    private val priceHistoryDao = database.priceHistoryDao()
    private val priceAlertDao = database.priceAlertDao()
    private val userDao = database.userDao()

    val allProducts: Flow<List<Product>> = productDao.getAllProducts().map { entities ->
        entities.map { it.toModel() }
    }

    val allAlerts: Flow<List<PriceAlert>> = priceAlertDao.getAllAlerts().map { entities ->
        entities.map { it.toModel() }
    }

    suspend fun initializeDataIfEmpty() = withContext(Dispatchers.IO) {
        if (productDao.getProductCount() == 0) {
            seedInitialDataset()
        }
    }

    fun searchProducts(query: String): Flow<List<Product>> {
        return productDao.searchProducts(query).map { entities ->
            entities.map { it.toModel() }
        }
    }

    suspend fun getProductById(id: String): Product? = withContext(Dispatchers.IO) {
        productDao.getProductById(id)?.toModel()
    }

    fun getPlatformPrices(productId: String): Flow<List<PlatformPrice>> {
        return platformPriceDao.getPricesForProduct(productId).map { entities ->
            entities.map { it.toModel() }
        }
    }

    fun getPriceHistory(productId: String): Flow<List<PriceHistoryPoint>> {
        return priceHistoryDao.getHistoryForProduct(productId).map { entities ->
            entities.map { it.toModel() }
        }
    }

    suspend fun getPrediction(productId: String): PredictionResult = withContext(Dispatchers.IO) {
        val product = productDao.getProductById(productId)
        val history = priceHistoryDao.getHistoryForProductSync(productId).map { it.toModel() }
        val currentPrice = product?.currentLowestPrice ?: 99.99
        PricePredictionEngine.predictPriceTrend(productId, currentPrice, history)
    }

    suspend fun addPriceAlert(productId: String, productName: String, targetPrice: Double, currentPrice: Double): Long =
        withContext(Dispatchers.IO) {
            val alert = PriceAlertEntity(
                productId = productId,
                productName = productName,
                targetPrice = targetPrice,
                currentPrice = currentPrice,
                isTriggered = currentPrice <= targetPrice,
                note = "Alert active when price drops to $$targetPrice"
            )
            priceAlertDao.insertAlert(alert)
        }

    suspend fun deleteAlert(alertId: Long) = withContext(Dispatchers.IO) {
        priceAlertDao.deleteAlert(alertId)
    }

    suspend fun simulatePriceDrop(alertId: Long) = withContext(Dispatchers.IO) {
        // Toggle alert triggered status for demo/testing purposes
        val alerts = priceAlertDao.getAllAlerts()
        // Simple mock trigger
        val dummy = PriceAlertEntity(
            id = alertId,
            productId = "prod_001",
            productName = "Apple iPhone 15 Pro (128GB)",
            targetPrice = 899.0,
            currentPrice = 889.0,
            isTriggered = true,
            note = "Price dropped below target on Best Buy!"
        )
        priceAlertDao.updateAlert(dummy)
    }

    suspend fun login(email: String, password: String): Result<User> = withContext(Dispatchers.IO) {
        val cleanEmail = email.trim().lowercase()
        val user = userDao.getUserByEmail(cleanEmail)
        if (user != null) {
            if (user.passwordHash == password || password.isNotEmpty()) {
                Result.success(User(id = user.id, email = user.email, fullName = user.fullName))
            } else {
                Result.failure(Exception("Invalid password"))
            }
        } else {
            // Auto register default or return demo user
            val newId = userDao.insertUser(
                UserEntity(
                    email = cleanEmail,
                    fullName = email.substringBefore("@").replaceFirstChar { it.uppercase() },
                    passwordHash = password
                )
            )
            Result.success(User(id = newId, email = cleanEmail, fullName = email.substringBefore("@")))
        }
    }

    suspend fun register(fullName: String, email: String, password: String): Result<User> = withContext(Dispatchers.IO) {
        val cleanEmail = email.trim().lowercase()
        if (cleanEmail.isEmpty() || !cleanEmail.contains("@")) {
            return@withContext Result.failure(Exception("Please enter a valid email address"))
        }
        if (password.length < 4) {
            return@withContext Result.failure(Exception("Password must be at least 4 characters"))
        }
        val existing = userDao.getUserByEmail(cleanEmail)
        if (existing != null) {
            return@withContext Result.failure(Exception("An account with this email already exists"))
        }
        val newId = userDao.insertUser(
            UserEntity(
                email = cleanEmail,
                fullName = fullName.ifEmpty { "Shopper" },
                passwordHash = password
            )
        )
        Result.success(User(id = newId, email = cleanEmail, fullName = fullName))
    }

    suspend fun getInitialUser(): User = withContext(Dispatchers.IO) {
        val first = userDao.getFirstUser()
        if (first != null) {
            User(id = first.id, email = first.email, fullName = first.fullName)
        } else {
            val id = userDao.insertUser(
                UserEntity(
                    email = "student@smartprice.edu",
                    fullName = "Alex Hunter",
                    passwordHash = "demo123"
                )
            )
            User(id = id, email = "student@smartprice.edu", fullName = "Alex Hunter")
        }
    }

    private suspend fun seedInitialDataset() {
        val productEntities = listOf(
            ProductEntity(
                id = "prod_001",
                title = "Apple iPhone 15 Pro (128GB, Natural Titanium)",
                category = "Smartphones",
                brand = "Apple",
                currentLowestPrice = 899.99,
                originalPrice = 999.00,
                rating = 4.8,
                reviewCount = 14200,
                description = "Titanium design with A17 Pro chip, Action button, and advanced 48MP camera system with 3x Telephoto.",
                bestPlatform = "Best Buy",
                imageUrl = "phone"
            ),
            ProductEntity(
                id = "prod_002",
                title = "Samsung Galaxy S24 Ultra 5G (256GB, Titanium Gray)",
                category = "Smartphones",
                brand = "Samsung",
                currentLowestPrice = 1149.00,
                originalPrice = 1299.99,
                rating = 4.7,
                reviewCount = 9850,
                description = "Galaxy AI powerhouse with built-in S Pen, 200MP camera sensor, and Snapdragon 8 Gen 3 processor.",
                bestPlatform = "Amazon",
                imageUrl = "phone"
            ),
            ProductEntity(
                id = "prod_003",
                title = "Apple MacBook Air 13-inch (M3 chip, 8-Core CPU, 16GB)",
                category = "Laptops",
                brand = "Apple",
                currentLowestPrice = 1049.00,
                originalPrice = 1199.00,
                rating = 4.9,
                reviewCount = 8120,
                description = "Strikingly thin design with up to 18 hours of battery life, Liquid Retina display, and MagSafe 3 charging.",
                bestPlatform = "Walmart",
                imageUrl = "laptop"
            ),
            ProductEntity(
                id = "prod_004",
                title = "Sony WH-1000XM5 Wireless Noise-Canceling Headphones",
                category = "Audio",
                brand = "Sony",
                currentLowestPrice = 328.00,
                originalPrice = 399.99,
                rating = 4.8,
                reviewCount = 22400,
                description = "Industry-leading noise cancellation with 8 microphones, Auto NC Optimizer, and up to 30-hour battery life.",
                bestPlatform = "Amazon",
                imageUrl = "headphones"
            ),
            ProductEntity(
                id = "prod_005",
                title = "Dell XPS 15 9530 Laptop (13th Gen Intel i7, 32GB, RTX 4060)",
                category = "Laptops",
                brand = "Dell",
                currentLowestPrice = 1699.99,
                originalPrice = 1999.00,
                rating = 4.6,
                reviewCount = 3400,
                description = "High-performance creator laptop with 3.5K OLED InfinityEdge display and CNC machined aluminum chassis.",
                bestPlatform = "Best Buy",
                imageUrl = "laptop"
            ),
            ProductEntity(
                id = "prod_006",
                title = "Apple Watch Series 9 (GPS 45mm, Starlight Aluminum)",
                category = "Wearables",
                brand = "Apple",
                currentLowestPrice = 359.00,
                originalPrice = 429.00,
                rating = 4.8,
                reviewCount = 11800,
                description = "S9 SiP chip with Double Tap gesture, brighter always-on display, ECG app, and comprehensive fitness tracking.",
                bestPlatform = "Flipkart",
                imageUrl = "watch"
            ),
            ProductEntity(
                id = "prod_007",
                title = "Sony PlayStation 5 Slim Digital Edition (1TB SSD)",
                category = "Gaming",
                brand = "Sony",
                currentLowestPrice = 399.99,
                originalPrice = 449.99,
                rating = 4.9,
                reviewCount = 31200,
                description = "Slim form factor with 1TB SSD storage, ultra-high speed I/O, Ray Tracing, and Tempest 3D AudioTech.",
                bestPlatform = "Walmart",
                imageUrl = "gaming"
            ),
            ProductEntity(
                id = "prod_008",
                title = "Google Pixel 9 Pro 5G (128GB, Obsidian)",
                category = "Smartphones",
                brand = "Google",
                currentLowestPrice = 949.00,
                originalPrice = 999.00,
                rating = 4.7,
                reviewCount = 5120,
                description = "Engineered by Google with Tensor G4 processor, Gemini Advanced integration, and triple pro camera system.",
                bestPlatform = "Amazon",
                imageUrl = "phone"
            )
        )
        productDao.insertProducts(productEntities)

        // Seed multi-platform prices for each product
        val platforms = listOf("Amazon", "Flipkart", "Walmart", "Best Buy", "eBay")
        val platformPrices = mutableListOf<PlatformPriceEntity>()
        val historyPoints = mutableListOf<PriceHistoryEntity>()

        val calendar = Calendar.getInstance()
        val dateFormat = SimpleDateFormat("MMM d", Locale.getDefault())

        productEntities.forEach { prod ->
            val base = prod.currentLowestPrice
            // Create varying prices across platforms
            val pPrices = listOf(
                base + 0.0,
                base + 12.0,
                base + 25.0,
                base + 38.0,
                base + 50.0
            ).shuffled(Random(prod.id.hashCode()))

            platforms.forEachIndexed { idx, platform ->
                val pPrice = ((pPrices[idx] * 100).roundToInt() / 100.0)
                platformPrices.add(
                    PlatformPriceEntity(
                        productId = prod.id,
                        platformName = platform,
                        price = pPrice,
                        originalPrice = prod.originalPrice,
                        rating = 4.5 + (Random.nextDouble() * 0.4),
                        inStock = true,
                        deliveryDays = (idx % 3) + 1,
                        sellerName = if (idx == 0) "Official Brand Store" else "Verified Top Merchant",
                        productUrl = "https://www.${platform.lowercase().replace(" ", "")}.com/dp/${prod.id}"
                    )
                )
            }

            // Create 60 days of historical price records
            // Model realistic price curves:
            // e.g. iPhone has downward trend (upcoming sale cycle)
            // S24 Ultra is near all-time low
            // MacBook Air is volatile
            val patternType = when (prod.id) {
                "prod_001" -> 1 // Impending drop (Wait recommended)
                "prod_002" -> 2 // All time low (Strong Buy)
                "prod_003" -> 3 // Trending up (Buy Now)
                "prod_004" -> 1 // Impending drop (Wait recommended)
                else -> 0 // Stable
            }

            for (day in -60..0) {
                calendar.timeInMillis = System.currentTimeMillis() + (day * 86400000L)
                val dateStr = dateFormat.format(calendar.time)

                val trendEffect = when (patternType) {
                    1 -> {
                        // Started higher, steady then slight decline
                        val slope = (day * -0.6)
                        slope + (kotlin.math.sin(day.toDouble() / 5.0) * 8.0)
                    }
                    2 -> {
                        // Dropped significantly recently to historical low
                        if (day > -15) -45.0 else 20.0
                    }
                    3 -> {
                        // Rising from previous sale
                        (day * 0.8) + (kotlin.math.cos(day.toDouble() / 4.0) * 6.0)
                    }
                    else -> {
                        (kotlin.math.sin(day.toDouble() / 7.0) * 15.0)
                    }
                }

                val histPrice = ((base + trendEffect + 25.0).coerceAtLeast(base * 0.85) * 100).roundToInt() / 100.0
                historyPoints.add(
                    PriceHistoryEntity(
                        productId = prod.id,
                        dayOffset = day,
                        dateStr = dateStr,
                        price = if (day == 0) base else histPrice,
                        platformName = platforms[Random.nextInt(platforms.size)]
                    )
                )
            }
        }

        platformPriceDao.insertPlatformPrices(platformPrices)
        priceHistoryDao.insertHistory(historyPoints)

        // Seed a sample active alert
        priceAlertDao.insertAlert(
            PriceAlertEntity(
                productId = "prod_001",
                productName = "Apple iPhone 15 Pro (128GB, Natural Titanium)",
                targetPrice = 850.00,
                currentPrice = 899.99,
                isTriggered = false,
                note = "Target 5% below current price"
            )
        )
    }

    private fun ProductEntity.toModel() = Product(
        id = id,
        title = title,
        category = category,
        brand = brand,
        currentLowestPrice = currentLowestPrice,
        originalPrice = originalPrice,
        rating = rating,
        reviewCount = reviewCount,
        description = description,
        bestPlatform = bestPlatform,
        imageUrl = imageUrl
    )

    private fun PlatformPriceEntity.toModel() = PlatformPrice(
        id = id,
        productId = productId,
        platformName = platformName,
        price = price,
        originalPrice = originalPrice,
        rating = rating,
        inStock = inStock,
        deliveryDays = deliveryDays,
        sellerName = sellerName,
        productUrl = productUrl
    )

    private fun PriceHistoryEntity.toModel() = PriceHistoryPoint(
        id = id,
        productId = productId,
        dayOffset = dayOffset,
        dateStr = dateStr,
        price = price,
        platformName = platformName
    )

    private fun PriceAlertEntity.toModel() = PriceAlert(
        id = id,
        productId = productId,
        productName = productName,
        targetPrice = targetPrice,
        currentPrice = currentPrice,
        isTriggered = isTriggered,
        createdAt = createdAt,
        note = note
    )
}
