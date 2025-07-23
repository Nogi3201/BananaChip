<?php
// delete_menu.php

header('Content-Type: application/json');
include 'db_config.php'; // Memasukkan file konfigurasi database Anda

$response = array('success' => false, 'message' => '');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $id = $data['id'] ?? ''; // Ambil ID item

    // Validasi dasar
    if (empty($id)) {
        $response['message'] = 'ID item tidak boleh kosong.';
    } else {
        // Opsional: Dapatkan nama gambar lama untuk menghapusnya dari server
        $query_get_image = $conn->prepare("SELECT gambar FROM menu_items WHERE id = ?");
        $query_get_image->bind_param("i", $id);
        $query_get_image->execute();
        $result_get_image = $query_get_image->get_result();
        $image_row = $result_get_image->fetch_assoc();
        $image_to_delete = $image_row['gambar'] ?? '';
        $query_get_image->close();

        // Menggunakan prepared statements untuk keamanan
        $stmt = $conn->prepare("DELETE FROM menu_items WHERE id = ?");
        $stmt->bind_param("i", $id); // "i" untuk integer

        if ($stmt->execute()) {
            $response['success'] = true;
            $response['message'] = 'Item menu berhasil dihapus.';

            // Hapus file gambar dari server setelah data dihapus dari database
            if ($image_to_delete && file_exists(__DIR__ . '/Gambar/' . $image_to_delete)) {
                unlink(__DIR__ . '/Gambar/' . $image_to_delete);
            }

        } else {
            $response['message'] = 'Error: ' . $stmt->error;
        }
        $stmt->close();
    }
} else {
    $response['message'] = 'Metode request tidak valid.';
}

echo json_encode($response);
$conn->close();
?>