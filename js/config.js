/**
 * Kawasan Pendidikan dan Pelatihan
 * Konfigurasi Global
 *
 * File ini berisi semua konfigurasi API, credentials, dan konstanta global.
 * Dipindahkan dari inline di index.html untuk mudah diubah tanpa edit HTML.
 */

// =====================================================================
// BACKEND CONFIGURATION
// =====================================================================
// PENTING (pindah ke akun Google khusus KPP): setelah project Apps Script
// dan spreadsheet baru selesai dibuat, GANTI kedua nilai di bawah dengan
// URL Web App baru dan OAuth Client ID baru. Client ID yang sama juga
// harus dipasang di GOOGLE_CLIENT_ID pada Code.gs.

/**
 * URL endpoint Google Apps Script Web App
 * Lihat SETUP.md untuk instruksi lengkap
 */
export const API_URL = 'https://script.google.com/macros/s/AKfycbxQWbno_AH6Koy5cNsDgm5AX4ssF00CHhHwsTkpixxsGp1hTJtCXSqbMUOWitFgvI6aSA/exec';

/**
 * Google OAuth 2.0 Client ID
 * Harus sama persis dengan GOOGLE_CLIENT_ID di Code.gs
 */
export const GOOGLE_CLIENT_ID = '282735792630-rome5sucmf7qcl00jokf0sa9ng59dfj2.apps.googleusercontent.com';

// =====================================================================
// LOCAL STORAGE KEYS
// =====================================================================

export const LS_USER = 'kpp_session_user_v2';
export const LS_ADMIN_TOKEN = 'kpp_admin_token_v2';
export const LS_USER_TOKEN = 'kpp_user_token_v2';

// =====================================================================
// STATUS CONSTANTS
// =====================================================================

/**
 * Urutan status pemesanan berdasarkan workflow
 * Harus sinkron dengan STATUS_* di Code.gs dan Notifications.gs
 */
export const STATUS_ORDER = ['belum_konfirmasi','konfirmasi','menunggu_pembayaran','pembayaran_selesai','ditolak','dibatalkan'];

/**
 * Label untuk setiap status. Harus sinkron dengan STATUS_LABELS_ di Code.gs
 */
export const STATUS_LABELS = {
  belum_konfirmasi: 'Belum Konfirmasi',
  konfirmasi: 'Konfirmasi',
  menunggu_pembayaran: 'Menunggu Pembayaran',
  pembayaran_selesai: 'Pembayaran Selesai',
  ditolak: 'Ditolak',
  dibatalkan: 'Dibatalkan'
};

/**
 * Status yang TIDAK memblokir ruangan (tidak dianggap "terpesan" untuk
 * kalender/cek bentrok). Harus sinkron dengan STATUS_TIDAK_MENGUNCI_RUANGAN_ di Code.gs
 */
export const STATUS_TIDAK_MENGUNCI_RUANGAN = ['ditolak', 'dibatalkan'];

// =====================================================================
// FEATURED ROOMS (di halaman beranda)
// =====================================================================
// Ganti ID di sini kapan saja sesuai ruangan mana yang ingin ditonjolkan.
export const FEATURED_IDS = ['vision-hall', 'catalyst', 'wisma-anggrek-lt1'];

// =====================================================================
// WARNA KALENDER
// =====================================================================
// Kategori instansi (PIDI/BINS/dst.) sudah DIHAPUS dari situs. Sel kalender
// yang terpesan sekarang menampilkan kode referensi pemesanan (A01, A02, ...)
// dan diwarnai menurut STATUS: kuning = Belum Konfirmasi, biru = sudah
// dikonfirmasi (termasuk menunggu/selesai pembayaran).
export const BOOKING_COLORS = {
  pending:   { bg: '#fde9c8', border: '#e2b45f', text: '#7a4e08' },
  confirmed: { bg: '#c7dafa', border: '#7fa4ea', text: '#12356f' }
};

export function bookingColor(status) {
  return status === 'belum_konfirmasi' ? BOOKING_COLORS.pending : BOOKING_COLORS.confirmed;
}

// =====================================================================
// HELPER FUNCTIONS
// =====================================================================

export function statusLabel(status) {
  return STATUS_LABELS[status] || status;
}

export function statusLockingRoom(status) {
  return !STATUS_TIDAK_MENGUNCI_RUANGAN.includes(status);
}