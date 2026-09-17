package com.example.data.model

enum class RecommendationType(val label: String) {
    STRONG_BUY("Strong Buy"),
    BUY_NOW("Buy Now"),
    WAIT_RECOMMENDED("Wait Recommended"),
    STRONG_WAIT("Strong Wait")
}

data class Product(
    val id: String,
    val title: String,
    val category: String,
    val brand: String,
    val currentLowestPrice: Double,
    val originalPrice: Double,
    val rating: Double,
    val reviewCount: Int,
    val description: String,
    val bestPlatform: String,
    val imageUrl: String = ""
) {
    val discountPercent: Int
        get() = if (originalPrice > currentLowestPrice && originalPrice > 0) {
            (((originalPrice - currentLowestPrice) / originalPrice) * 100).toInt()
        } else 0
}

data class PlatformPrice(
    val id: Long = 0,
    val productId: String,
    val platformName: String, // "Amazon", "Flipkart", "Walmart", "Best Buy", "eBay"
    val price: Double,
    val originalPrice: Double,
    val rating: Double,
    val inStock: Boolean,
    val deliveryDays: Int,
    val sellerName: String,
    val productUrl: String
)

data class PriceHistoryPoint(
    val id: Long = 0,
    val productId: String,
    val dayOffset: Int, // e.g. -60 to 0 (today)
    val dateStr: String,
    val price: Double,
    val platformName: String
)

data class ForecastPoint(
    val dayOffset: Int, // +1 to +14
    val dateStr: String,
    val predictedPrice: Double,
    val lowerBound: Double,
    val upperBound: Double
)

data class PredictionResult(
    val productId: String,
    val currentPrice: Double,
    val historicalMin: Double,
    val historicalMax: Double,
    val historicalAvg: Double,
    val forecastPoints: List<ForecastPoint>,
    val recommendation: RecommendationType,
    val recommendationReason: String,
    val expectedLowestFuturePrice: Double,
    val expectedDropPercent: Double,
    val confidenceScore: Int, // e.g. 88 (%)
    val volatilityRating: String // "Low", "Moderate", "High"
)

data class PriceAlert(
    val id: Long = 0,
    val productId: String,
    val productName: String,
    val targetPrice: Double,
    val currentPrice: Double,
    val isTriggered: Boolean,
    val createdAt: Long = System.currentTimeMillis(),
    val note: String = ""
)

data class User(
    val id: Long = 1,
    val email: String,
    val fullName: String,
    val role: String = "Shopper"
)
