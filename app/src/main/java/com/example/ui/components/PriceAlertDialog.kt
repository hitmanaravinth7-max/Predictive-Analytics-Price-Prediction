package com.example.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import java.util.Locale
import kotlin.math.roundToInt

@Composable
fun PriceAlertDialog(
    currentPrice: Double,
    onDismiss: () -> Unit,
    onConfirm: (targetPrice: Double) -> Unit
) {
    var customPriceInput by remember {
        mutableStateOf(String.format(Locale.US, "%.2f", currentPrice * 0.90))
    }
    var selectedPreset by remember { mutableStateOf<Int?>(10) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Set Price Drop Alert",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Column {
                Text(
                    text = "We will notify you immediately when the price drops to or below your target price across any online store.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "Current Lowest Price: $${String.format(Locale.US, "%.2f", currentPrice)}",
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.SemiBold
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Presets (-5%, -10%, -15%)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf(5, 10, 15).forEach { percent ->
                        val target = currentPrice * (1.0 - (percent / 100.0))
                        FilterChip(
                            selected = selectedPreset == percent,
                            onClick = {
                                selectedPreset = percent
                                customPriceInput = String.format(Locale.US, "%.2f", target)
                            },
                            label = { Text("-$percent% ($${target.roundToInt()})") }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = customPriceInput,
                    onValueChange = {
                        customPriceInput = it
                        selectedPreset = null
                    },
                    label = { Text("Target Price ($)") },
                    prefix = { Text("$") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("target_price_input"),
                    shape = RoundedCornerShape(12.dp)
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val price = customPriceInput.toDoubleOrNull()
                    if (price != null && price > 0) {
                        onConfirm(price)
                    }
                },
                modifier = Modifier.testTag("confirm_alert_button"),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("Activate Alert")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
