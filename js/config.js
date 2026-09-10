/**
 * KAWASAN EDUKASI DAN DIGITAL KEMANG
 * Konfigurasi Global
 *
 * File ini berisi semua konfigurasi API, credentials, dan konstanta global.
 * Dipindahkan dari inline di index.html untuk mudah diubah tanpa edit HTML.
 */

// =====================================================================
// BACKEND CONFIGURATION
// =====================================================================

/**
 * URL endpoint Google Apps Script Web App
 * Ganti dengan URL dari deployment Google Apps Script Anda
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
// PRIORITY TIER CONSTANTS
// =====================================================================

/**
 * Label untuk kategori instansi/prioritas — konteks penjadwalan untuk admin,
 * BUKAN syarat keberhasilan pemesanan. Harus sinkron dengan
 * PRIORITY_TIER_LABELS_ di Code.gs
 */
export const PRIORITY_TIER_LABELS = {
  pidi: 'PIDI',
  bins: 'BINS',
  satker_uker: 'Satker/Uker (Internal BI)',
  eksternal_lppi: 'Eksternal (LPPI)'
};

// =====================================================================
// FEATURED ROOMS (di halaman beranda)
// =====================================================================

export const FEATURED_IDS = ['vision-hall', 'steering-committee', 'sync-pods'];

// =====================================================================
// HELPER FUNCTIONS
// =====================================================================

export function statusLabel(status) {
  return STATUS_LABELS[status] || status;
}

export function priorityTierLabel(tier) {
  return PRIORITY_TIER_LABELS[tier] || '-';
}

export function statusLockingRoom(status) {
  return !STATUS_TIDAK_MENGUNCI_RUANGAN.includes(status);
}
