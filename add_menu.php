<?php
// add_menu.php

header('Content-Type: application/json'); // Mengatur header untuk respons JSON
include 'db_config.php'; // Memasukkan file konfigurasi database

$response = array('success' => false, 'message' => '');

// Memeriksa apakah request adalah POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Mengambil data dari input JSON
    $data = json_decode(file_get_contents("php://input"), true);

    $nama_item = $conn->real_escape_string($data['nama_item'] ?? '');
    $deskripsi = $conn->real_escape_string($data['deskripsi'] ?? '');
    $harga = floatval($data['harga'] ?? 0);
    $gambar = $conn->real_escape_string($data['gambar'] ?? '');

    // Validasi input
    if (empty($nama_item) || $harga <= 0) {
        $response['message'] = 'Nama item dan harga tidak boleh kosong dan harga harus lebih dari 0.';
    } else {
        $sql = "INSERT INTO menu_items (nama_item, deskripsi, harga, gambar) VALUES ('$nama_item', '$deskripsi', $harga, '$gambar')";

        if ($conn->query($sql) === TRUE) {
            $response['success'] = true;
            $response['message'] = 'Item menu berhasil ditambahkan.';
            $response['id'] = $conn->insert_id; // Mengembalikan ID item yang baru ditambahkan
        } else {
            $response['message'] = 'Error: ' . $sql . '<br>' . $conn->error;
        }
    }
} else {
    $response['message'] = 'Metode request tidak valid.';
}

echo json_encode($response); // Mengembalikan respons dalam format JSON

$conn->close(); // Menutup koneksi database
?>