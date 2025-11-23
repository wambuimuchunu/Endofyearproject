<?php
// save_conversion.php
require_once 'config.php';

if (!isLoggedIn()) {
    sendJSON(['success' => false, 'message' => 'Not authenticated']);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userId = getUserId();
    $from_currency = $_POST['from_currency'] ?? '';
    $to_currency = $_POST['to_currency'] ?? '';
    $amount = floatval($_POST['amount'] ?? 0);
    $converted_amount = floatval($_POST['converted_amount'] ?? 0);
    $exchange_rate = floatval($_POST['exchange_rate'] ?? 0);

    // Save to conversion history
    $stmt = $conn->prepare("INSERT INTO conversion_history (user_id, from_currency, to_currency, amount, converted_amount, exchange_rate) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("issddd", $userId, $from_currency, $to_currency, $amount, $converted_amount, $exchange_rate);
    $stmt->execute();
    $stmt->close();

    // Update currency pair usage (for caching most common pairs)
    $stmt = $conn->prepare("INSERT INTO currency_pairs (user_id, from_currency, to_currency, usage_count) VALUES (?, ?, ?, 1) ON DUPLICATE KEY UPDATE usage_count = usage_count + 1, last_used = CURRENT_TIMESTAMP");
    $stmt->bind_param("iss", $userId, $from_currency, $to_currency);
    
    if ($stmt->execute()) {
        sendJSON(['success' => true, 'message' => 'Conversion saved']);
    } else {
        sendJSON(['success' => false, 'message' => 'Error saving conversion']);
    }

    $stmt->close();
}
?>