<?php
// check_auth.php - Fixed Authentication Check
require_once 'config.php';

// Set proper headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

if (isLoggedIn()) {
    echo json_encode([
        'authenticated' => true,
        'username' => $_SESSION['username'],
        'user_id' => $_SESSION['user_id'],
        'is_admin' => $_SESSION['is_admin'] ?? false
    ]);
} else {
    echo json_encode([
        'authenticated' => false
    ]);
}
exit;
?>