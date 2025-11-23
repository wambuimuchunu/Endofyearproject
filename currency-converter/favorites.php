<?php
// favorites.php
require_once 'config.php';

if (!isLoggedIn()) {
    sendJSON(['success' => false, 'message' => 'Not authenticated']);
}

$userId = getUserId();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get favorite pairs
    $stmt = $conn->prepare("SELECT * FROM favorite_pairs WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $favorites = [];
    while ($row = $result->fetch_assoc()) {
        $favorites[] = $row;
    }
    
    sendJSON(['success' => true, 'favorites' => $favorites]);
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Add favorite pair
    $fromCurrency = $_POST['from_currency'] ?? '';
    $toCurrency = $_POST['to_currency'] ?? '';
    
    $stmt = $conn->prepare("INSERT IGNORE INTO favorite_pairs (user_id, from_currency, to_currency) VALUES (?, ?, ?)");
    $stmt->bind_param("iss", $userId, $fromCurrency, $toCurrency);
    
    if ($stmt->execute()) {
        sendJSON(['success' => true, 'message' => 'Added to favorites']);
    } else {
        sendJSON(['success' => false, 'message' => 'Error adding favorite']);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Remove favorite pair
    parse_str(file_get_contents("php://input"), $delete_vars);
    $favoriteId = $delete_vars['favorite_id'] ?? '';
    
    $stmt = $conn->prepare("DELETE FROM favorite_pairs WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $favoriteId, $userId);
    
    if ($stmt->execute()) {
        sendJSON(['success' => true, 'message' => 'Removed from favorites']);
    } else {
        sendJSON(['success' => false, 'message' => 'Error removing favorite']);
    }
}
?>