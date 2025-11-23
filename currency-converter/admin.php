<?php
// admin.php
require_once 'config.php';

if (!isLoggedIn() || !isAdmin()) {
    sendJSON(['success' => false, 'message' => 'Access denied']);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? '';
    
    switch ($action) {
        case 'stats':
            // Get admin statistics
            $users = $conn->query("SELECT COUNT(*) as total FROM users")->fetch_assoc();
            $conversions = $conn->query("SELECT COUNT(*) as total FROM conversion_history")->fetch_assoc();
            $activeToday = $conn->query("SELECT COUNT(DISTINCT user_id) as active FROM conversion_history WHERE DATE(conversion_date) = CURDATE()")->fetch_assoc();
            $popularPair = $conn->query("SELECT from_currency, to_currency, COUNT(*) as count FROM conversion_history GROUP BY from_currency, to_currency ORDER BY count DESC LIMIT 1")->fetch_assoc();
            
            sendJSON([
                'success' => true,
                'stats' => [
                    'total_users' => $users['total'],
                    'total_conversions' => $conversions['total'],
                    'active_today' => $activeToday['active'],
                    'popular_pair' => $popularPair ? $popularPair['from_currency'] . '/' . $popularPair['to_currency'] : 'None'
                ]
            ]);
            break;
            
        case 'users':
            // Get all users
            $result = $conn->query("SELECT u.*, COUNT(ch.id) as conversion_count FROM users u LEFT JOIN conversion_history ch ON u.id = ch.user_id GROUP BY u.id ORDER BY u.created_at DESC");
            $users = [];
            while ($row = $result->fetch_assoc()) {
                $users[] = $row;
            }
            sendJSON(['success' => true, 'users' => $users]);
            break;
            
        case 'popular_pairs':
            // Get global popular pairs
            $result = $conn->query("SELECT from_currency, to_currency, COUNT(*) as usage_count FROM conversion_history GROUP BY from_currency, to_currency ORDER BY usage_count DESC LIMIT 10");
            $pairs = [];
            while ($row = $result->fetch_assoc()) {
                $pairs[] = $row;
            }
            sendJSON(['success' => true, 'pairs' => $pairs]);
            break;
    }
}
?>