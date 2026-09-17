package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val email: String,
    val fullName: String,
    val passwordHash: String,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "products")
data class ProductEntity(
    @PrimaryKey val id: String,
    val title: String,
    val category: String,
    val brand: String,
    val currentLowestPrice: Double,
    val originalPrice: Double,
    val rating: Double,
    val reviewCount: Int,
    val description: String,
    val bestPlatform: String,
    val imageUrl: String
)

@Entity(tableName = "platform_prices")
data class PlatformPriceEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val productId: String,
    val platformName: String,
    val price: Double,
    val originalPrice: Double,
    val rating: Double,
    val inStock: Boolean,
    val deliveryDays: Int,
    val sellerName: String,
    val productUrl: String
)

@Entity(tableName = "price_history")
data class PriceHistoryEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val productId: String,
    val dayOffset: Int,
    val dateStr: String,
    val price: Double,
    val platformName: String
)

@Entity(tableName = "price_alerts")
data class PriceAlertEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val productId: String,
    val productName: String,
    val targetPrice: Double,
    val currentPrice: Double,
    val isTriggered: Boolean,
    val createdAt: Long = System.currentTimeMillis(),
    val note: String = ""
)
