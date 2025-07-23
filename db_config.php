<?php
// db_config.php

$host = "localhost"; // Biasanya localhost untuk pengembangan lokal
$username = "root";  // Username default XAMPP/MAMP/WAMP
$password = "";      // Password default XAMPP/MAMP/WAMP (kosong, kecuali Anda telah mengaturnya)
$database = "bananaking_bd"; // NAMA DATABASE SUDAH DIKOREKSI SESUAI DENGAN PHPADMIN

// Membuat koneksi ke database
$conn = new mysqli($host, $username, $password, $database);

// Memeriksa koneksi
if ($conn->connect_error) {
    die("Koneksi database gagal: " . $conn->connect_error);
}

// Mengatur charset menjadi UTF-8 (penting untuk karakter khusus)
$conn->set_charset("utf8");
?>