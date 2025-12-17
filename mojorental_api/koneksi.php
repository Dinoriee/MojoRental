<?php

$host = "localhost";
$user = "root";
$pass = ""; 
$db   = "mojorental_db"; // Pastikan nama database di phpMyAdmin sama

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Koneksi gagal: " . $conn->connect_error]));
}
?>