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

// =====================================================================
// WARNA & SINGKATAN KATEGORI INSTANSI — dipakai untuk mewarnai kalender
// (badge per tanggal terpesan) supaya kategori pemesan langsung terlihat
// sekilas tanpa perlu hover/klik. Warna dipilih pastel-tapi-menonjol,
// masing-masing beda hue supaya gampang dibedakan mata, tapi tetap sepadan
// dengan palet navy/biru situs (lihat --navy-900/--blue-accent di style.css).
// =====================================================================
export const PRIORITY_TIER_COLORS = {
  pidi:            { bg: '#f7c59f', border: '#e2935a', text: '#7c3a10' },
  bins:            { bg: '#9bd8de', border: '#4fb0b8', text: '#0b4a4f' },
  satker_uker:     { bg: '#a9dfbf', border: '#5cb583', text: '#14532d' },
  eksternal_lppi:  { bg: '#c9b6ea', border: '#9c78d6', text: '#4c1d78' }
};
export const PRIORITY_TIER_SHORT = {
  pidi: 'PIDI', bins: 'BINS', satker_uker: 'INT', eksternal_lppi: 'EKS'
};

export function priorityTierColor(tier){
  return PRIORITY_TIER_COLORS[tier] || { bg: '#e2e8f0', border: '#94a3b8', text: '#334155' };
}
export function priorityTierShort(tier){
  return PRIORITY_TIER_SHORT[tier] || '?';
}

export function statusLabel(status) {
  return STATUS_LABELS[status] || status;
}

export function priorityTierLabel(tier) {
  return PRIORITY_TIER_LABELS[tier] || '-';
}

export function statusLockingRoom(status) {
  return !STATUS_TIDAK_MENGUNCI_RUANGAN.includes(status);
}
