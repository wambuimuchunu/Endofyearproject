<?php
// login.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        sendJSON(['success' => false, 'message' => 'Username and password are required']);
    }

    // Check user credentials
    $stmt = $conn->prepare("SELECT id, username, password, is_admin FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        sendJSON(['success' => false, 'message' => 'Invalid username or password']);
    }

    $user = $result->fetch_assoc();

    // Verify password
    if (password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['is_admin'] = $user['is_admin'];
        
        sendJSON([
            'success' => true, 
            'message' => 'Login successful', 
            'username' => $user['username'],
            'is_admin' => $user['is_admin']
        ]);
    } else {
        sendJSON(['success' => false, 'message' => 'Invalid username or password']);
    }

    $stmt->close();
} else {
    sendJSON(['success' => false, 'message' => 'Invalid request method']);
}
?>