<?php
// logout.php
require_once 'config.php';

session_destroy();
sendJSON(['success' => true, 'message' => 'Logged out successfully']);
?>