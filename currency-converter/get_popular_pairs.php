<?php
// get_popular_pairs.php
require_once 'config.php';

if (!isLoggedIn()) {
    sendJSON(['success' => false, 'message' => 'Not authenticated']);
}

$userId = getUserId();

$stmt = $conn->prepare("SELECT from_currency, to_currency, usage_count FROM currency_pairs WHERE user_id = ? ORDER BY usage_count DESC, last_used DESC LIMIT 5");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$pairs = [];
while ($row = $result->fetch_assoc()) {
    $pairs[] = $row;
}

sendJSON(['success' => true, 'pairs' => $pairs]);
$stmt->close();
?>