<?php
// signup.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $email = trim($_POST['email'] ?? '');
    $confirm_password = $_POST['confirm_password'] ?? '';

    // Validation
    if (empty($username) || empty($password)) {
        sendJSON(['success' => false, 'message' => 'Username and password are required']);
    }

    if (strlen($username) < 3) {
        sendJSON(['success' => false, 'message' => 'Username must be at least 3 characters']);
    }

    if (strlen($password) < 6) {
        sendJSON(['success' => false, 'message' => 'Password must be at least 6 characters']);
    }

    if ($password !== $confirm_password) {
        sendJSON(['success' => false, 'message' => 'Passwords do not match']);
    }

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Check if username exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        sendJSON(['success' => false, 'message' => 'Username already exists']);
    }
    $stmt->close();

    // Insert new user
    $stmt = $conn->prepare("INSERT INTO users (username, password, email) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $username, $hashedPassword, $email);

    if ($stmt->execute()) {
        sendJSON(['success' => true, 'message' => 'Signup successful! Please login.']);
    } else {
        sendJSON(['success' => false, 'message' => 'Error creating account: ' . $stmt->error]);
    }

    $stmt->close();
} else {
    sendJSON(['success' => false, 'message' => 'Invalid request method']);
}
?>