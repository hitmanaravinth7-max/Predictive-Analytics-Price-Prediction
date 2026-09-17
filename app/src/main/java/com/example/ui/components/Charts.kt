package com.example.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.ForecastPoint
import com.example.data.model.PriceHistoryPoint
import com.example.ui.theme.AmberWait
import com.example.ui.theme.CyanAccent
import com.example.ui.theme.ElectricBlue
import com.example.ui.theme.EmeraldBuy
import java.util.Locale

@Composable
fun HistoricalPriceChart(
    history: List<PriceHistoryPoint>,
    rangeDays: Int = 60,
    modifier: Modifier = Modifier
) {
    val filteredHistory = history.takeLast(rangeDays)
    if (filteredHistory.isEmpty()) {
        Card(
            modifier = modifier.fillMaxWidth().height(220.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
        ) {
            Box(modifier = Modifier.fillMaxWidth().height(220.dp), contentAlignment = Alignment.Center) {
                Text("Collecting price history...", style = MaterialTheme.typography.bodyMedium)
            }
        }
        return
    }

    val prices = filteredHistory.map { it.price }
    val minPrice = prices.minOrNull() ?: 0.0
    val maxPrice = prices.maxOrNull() ?: 100.0
    val priceSpan = (maxPrice - minPrice).coerceAtLeast(5.0)

    val currentPrice = prices.lastOrNull() ?: minPrice
    val firstPrice = prices.firstOrNull() ?: minPrice
    val priceChange = currentPrice - firstPrice
    val isDrop = priceChange <= 0

    val lineColor = if (isDrop) EmeraldBuy else ElectricBlue

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Historical Price Movement",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Past $rangeDays days across tracked retailers",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "$${String.format(Locale.US, "%.2f", currentPrice)}",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = lineColor
                    )
                    Text(
                        text = "${if (priceChange <= 0) "-" else "+"}$${String.format(Locale.US, "%.2f", kotlin.math.abs(priceChange))}",
                        style = MaterialTheme.typography.labelSmall,
                        color = if (isDrop) EmeraldBuy else AmberWait
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Canvas Line Chart
            Canvas(modifier = Modifier.fillMaxWidth().height(160.dp)) {
                val w = size.width
                val h = size.height
                val paddingBottom = 20f
                val chartHeight = h - paddingBottom

                // Grid lines (horizontal min, mid, max)
                val gridStroke = Stroke(width = 1f, pathEffect = PathEffect.dashPathEffect(floatArrayOf(8f, 8f), 0f))
                val gridColor = Color.Gray.copy(alpha = 0.25f)

                drawLine(gridColor, Offset(0f, 0f), Offset(w, 0f), strokeWidth = 1f)
                drawLine(gridColor, Offset(0f, chartHeight / 2f), Offset(w, chartHeight / 2f), strokeWidth = 1f)
                drawLine(gridColor, Offset(0f, chartHeight), Offset(w, chartHeight), strokeWidth = 1f)

                // Build chart paths
                val path = Path()
                val fillPath = Path()
                val stepX = if (filteredHistory.size > 1) w / (filteredHistory.size - 1) else w

                filteredHistory.forEachIndexed { i, point ->
                    val normY = ((point.price - minPrice) / priceSpan).toFloat()
                    val x = i * stepX
                    val y = chartHeight - (normY * chartHeight)

                    if (i == 0) {
                        path.moveTo(x, y)
                        fillPath.moveTo(x, chartHeight)
                        fillPath.lineTo(x, y)
                    } else {
                        path.lineTo(x, y)
                        fillPath.lineTo(x, y)
                    }
                }

                fillPath.lineTo(w, chartHeight)
                fillPath.close()

                // Draw gradient fill
                drawPath(
                    path = fillPath,
                    brush = Brush.verticalGradient(
                        colors = listOf(
                            lineColor.copy(alpha = 0.35f),
                            lineColor.copy(alpha = 0.02f)
                        ),
                        startY = 0f,
                        endY = chartHeight
                    )
                )

                // Draw stroke
                drawPath(
                    path = path,
                    color = lineColor,
                    style = Stroke(width = 3.5.dp.toPx(), cap = StrokeCap.Round)
                )

                // Draw end point indicator
                val lastNormY = ((currentPrice - minPrice) / priceSpan).toFloat()
                val lastY = chartHeight - (lastNormY * chartHeight)
                drawCircle(color = Color.White, radius = 5.dp.toPx(), center = Offset(w, lastY))
                drawCircle(color = lineColor, radius = 3.5.dp.toPx(), center = Offset(w, lastY))
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Range Labels (Min, Avg, Max)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Low: $${String.format(Locale.US, "%.0f", minPrice)}",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = "Avg: $${String.format(Locale.US, "%.0f", (minPrice + maxPrice) / 2)}",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = "High: $${String.format(Locale.US, "%.0f", maxPrice)}",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun FuturePredictionChart(
    forecastPoints: List<ForecastPoint>,
    currentPrice: Double,
    modifier: Modifier = Modifier
) {
    if (forecastPoints.isEmpty()) return

    val allPrices = forecastPoints.map { it.predictedPrice } + forecastPoints.map { it.lowerBound } + forecastPoints.map { it.upperBound } + currentPrice
    val minPrice = allPrices.minOrNull() ?: (currentPrice * 0.9)
    val maxPrice = allPrices.maxOrNull() ?: (currentPrice * 1.1)
    val priceSpan = (maxPrice - minPrice).coerceAtLeast(5.0)

    val lowestForecast = forecastPoints.minByOrNull { it.predictedPrice }
    val willDrop = lowestForecast != null && lowestForecast.predictedPrice < currentPrice

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "ML Future Price Forecast (14 Days)",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Polynomial regression model with 90% confidence interval",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Forecast Canvas
            Canvas(modifier = Modifier.fillMaxWidth().height(160.dp)) {
                val w = size.width
                val h = size.height
                val chartHeight = h - 20f

                val gridColor = Color.Gray.copy(alpha = 0.2f)
                drawLine(gridColor, Offset(0f, 0f), Offset(w, 0f), strokeWidth = 1f)
                drawLine(gridColor, Offset(0f, chartHeight / 2f), Offset(w, chartHeight / 2f), strokeWidth = 1f)
                drawLine(gridColor, Offset(0f, chartHeight), Offset(w, chartHeight), strokeWidth = 1f)

                val count = forecastPoints.size + 1
                val stepX = w / (count - 1)

                // 1. Shaded Confidence Interval Band (upper bound to lower bound)
                val bandPath = Path()
                // Top boundary (upperBound)
                val currentNormY = ((currentPrice - minPrice) / priceSpan).toFloat()
                val currentY = chartHeight - (currentNormY * chartHeight)
                bandPath.moveTo(0f, currentY)

                forecastPoints.forEachIndexed { i, fp ->
                    val x = (i + 1) * stepX
                    val normUpper = ((fp.upperBound - minPrice) / priceSpan).toFloat()
                    val yUpper = chartHeight - (normUpper * chartHeight)
                    bandPath.lineTo(x, yUpper)
                }

                // Bottom boundary (lowerBound in reverse)
                for (i in forecastPoints.indices.reversed()) {
                    val fp = forecastPoints[i]
                    val x = (i + 1) * stepX
                    val normLower = ((fp.lowerBound - minPrice) / priceSpan).toFloat()
                    val yLower = chartHeight - (normLower * chartHeight)
                    bandPath.lineTo(x, yLower)
                }
                bandPath.lineTo(0f, currentY)
                bandPath.close()

                drawPath(
                    path = bandPath,
                    brush = Brush.verticalGradient(
                        colors = listOf(CyanAccent.copy(alpha = 0.18f), CyanAccent.copy(alpha = 0.05f)),
                        startY = 0f,
                        endY = chartHeight
                    )
                )

                // 2. Regression Predicted Trend Line (Dashed)
                val linePath = Path()
                linePath.moveTo(0f, currentY)

                forecastPoints.forEachIndexed { i, fp ->
                    val x = (i + 1) * stepX
                    val normPred = ((fp.predictedPrice - minPrice) / priceSpan).toFloat()
                    val yPred = chartHeight - (normPred * chartHeight)
                    linePath.lineTo(x, yPred)
                }

                drawPath(
                    path = linePath,
                    color = if (willDrop) EmeraldBuy else AmberWait,
                    style = Stroke(
                        width = 3.dp.toPx(),
                        pathEffect = PathEffect.dashPathEffect(floatArrayOf(12f, 8f), 0f),
                        cap = StrokeCap.Round
                    )
                )

                // Draw Today Marker
                drawCircle(color = ElectricBlue, radius = 4.dp.toPx(), center = Offset(0f, currentY))

                // Highlight lowest predicted price point
                if (lowestForecast != null) {
                    val lowIdx = forecastPoints.indexOf(lowestForecast)
                    val lowX = (lowIdx + 1) * stepX
                    val lowNorm = ((lowestForecast.predictedPrice - minPrice) / priceSpan).toFloat()
                    val lowY = chartHeight - (lowNorm * chartHeight)

                    drawCircle(color = Color.White, radius = 6.dp.toPx(), center = Offset(lowX, lowY))
                    drawCircle(color = EmeraldBuy, radius = 4.5.dp.toPx(), center = Offset(lowX, lowY))
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Chart Legend
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.size(8.dp).background(ElectricBlue, CircleShape))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Today", style = MaterialTheme.typography.labelSmall, fontSize = 11.sp)

                    Spacer(modifier = Modifier.width(12.dp))

                    Box(modifier = Modifier.size(8.dp).background(if (willDrop) EmeraldBuy else AmberWait, CircleShape))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("ML Trend", style = MaterialTheme.typography.labelSmall, fontSize = 11.sp)

                    Spacer(modifier = Modifier.width(12.dp))

                    Box(modifier = Modifier.size(8.dp).background(CyanAccent.copy(alpha = 0.5f), CircleShape))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("90% Interval", style = MaterialTheme.typography.labelSmall, fontSize = 11.sp)
                }

                if (lowestForecast != null) {
                    Text(
                        text = "Target: $${String.format(Locale.US, "%.2f", lowestForecast.predictedPrice)} on ${lowestForecast.dateStr}",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = EmeraldBuy
                    )
                }
            }
        }
    }
}
