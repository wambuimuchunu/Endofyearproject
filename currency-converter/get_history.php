<?php
// get_history.php
require_once 'config.php';

if (!isLoggedIn()) {
    sendJSON(['success' => false, 'message' => 'Not authenticated']);
}

$userId = getUserId();
$limit = intval($_GET['limit'] ?? 50);

$stmt = $conn->prepare("SELECT * FROM conversion_history WHERE user_id = ? ORDER BY conversion_date DESC LIMIT ?");
$stmt->bind_param("ii", $userId, $limit);
$stmt->execute();
$result = $stmt->get_result();

$history = [];
while ($row = $result->fetch_assoc()) {
    $history[] = $row;
}

sendJSON(['success' => true, 'history' => $history]);
$stmt->close();
?>