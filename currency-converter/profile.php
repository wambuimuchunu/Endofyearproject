<?php
// profile.php
require_once 'config.php';

if (!isLoggedIn()) {
    sendJSON(['success' => false, 'message' => 'Not authenticated']);
}

$userId = getUserId();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get user profile
    $stmt = $conn->prepare("SELECT username, email, base_currency, created_at FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    // Get user stats
    $stmt = $conn->prepare("SELECT COUNT(*) as total_conversions FROM conversion_history WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $stats = $stmt->get_result()->fetch_assoc();
    
    // Get most used pair
    $stmt = $conn->prepare("SELECT from_currency, to_currency FROM currency_pairs WHERE user_id = ? ORDER BY usage_count DESC LIMIT 1");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $mostUsed = $stmt->get_result()->fetch_assoc();
    
    sendJSON([
        'success' => true,
        'profile' => $user,
        'stats' => $stats,
        'most_used_pair' => $mostUsed ? $mostUsed['from_currency'] . '/' . $mostUsed['to_currency'] : 'None'
    ]);
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Update profile
    $email = $_POST['email'] ?? '';
    $baseCurrency = $_POST['base_currency'] ?? 'USD';
    
    $stmt = $conn->prepare("UPDATE users SET email = ?, base_currency = ? WHERE id = ?");
    $stmt->bind_param("ssi", $email, $baseCurrency, $userId);
    
    if ($stmt->execute()) {
        sendJSON(['success' => true, 'message' => 'Profile updated successfully']);
    } else {
        sendJSON(['success' => false, 'message' => 'Error updating profile']);
    }
}
?>