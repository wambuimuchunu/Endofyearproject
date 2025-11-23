<?php
// alerts.php
require_once 'config.php';

if (!isLoggedIn()) {
    sendJSON(['success' => false, 'message' => 'Not authenticated']);
}

$userId = getUserId();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get user alerts
    $stmt = $conn->prepare("SELECT * FROM rate_alerts WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $alerts = [];
    while ($row = $result->fetch_assoc()) {
        $alerts[] = $row;
    }
    
    sendJSON(['success' => true, 'alerts' => $alerts]);
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Create new alert
    $fromCurrency = $_POST['from_currency'] ?? '';
    $toCurrency = $_POST['to_currency'] ?? '';
    $targetRate = floatval($_POST['target_rate'] ?? 0);
    $condition = $_POST['condition'] ?? 'above';
    
    $stmt = $conn->prepare("INSERT INTO rate_alerts (user_id, from_currency, to_currency, target_rate, condition_type) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("issds", $userId, $fromCurrency, $toCurrency, $targetRate, $condition);
    
    if ($stmt->execute()) {
        sendJSON(['success' => true, 'message' => 'Alert created successfully']);
    } else {
        sendJSON(['success' => false, 'message' => 'Error creating alert']);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Delete alert
    parse_str(file_get_contents("php://input"), $delete_vars);
    $alertId = $delete_vars['alert_id'] ?? '';
    
    $stmt = $conn->prepare("DELETE FROM rate_alerts WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $alertId, $userId);
    
    if ($stmt->execute()) {
        sendJSON(['success' => true, 'message' => 'Alert deleted successfully']);
    } else {
        sendJSON(['success' => false, 'message' => 'Error deleting alert']);
    }
}
?>