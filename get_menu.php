<?php
// get_menu.php

header('Content-Type: application/json'); // Mengatur header untuk respons JSON
include 'db_config.php'; // Memasukkan file konfigurasi database

$sql = "SELECT id, nama_item, deskripsi, harga, gambar FROM menu_items ORDER BY id ASC";
$result = $conn->query($sql);

$menu_items = array();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $menu_items[] = $row;
    }
}

echo json_encode($menu_items); // Mengembalikan data dalam format JSON

$conn->close(); // Menutup koneksi database
?>