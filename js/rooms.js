/**
 * KAWASAN EDUKASI DAN DIGITAL KEMANG
 * Data Ruangan
 *
 * Data di file ini sebagian besar diambil PERSIS dari sumber resmi
 * (bukan perkiraan) — termasuk harga (priceHour/priceDay/priceWeek) dan
 * luas ruangan internal maupun eksternal. PENGECUALIAN: kapasitas (orang)
 * untuk ruang kelas (Vision Hall, Catalyst, Frontier, Momentum, Ignite,
 * Spark, Muse, Genesis, Quantum, Pioneer, Ideation, Inspire Hall) MASIH
 * PERKIRAAN kasar dari luas ruangan — lihat catatan di dekat definisi
 * ROOMS untuk detail sumber dan yang wajib dikonfirmasi.
 *
 * REKOMENDASI JANGKA PANJANG: pindahkan data ini ke API backend supaya
 * bisa diubah tanpa deploy ulang dan tersinkron real-time dengan sistem
 * booking.
 */

// =====================================================================
// RUANG KELAS (Vision Hall, Catalyst/Frontier/Momentum/Ignite/Spark/
// Muse/Genesis/Quantum/Pioneer/Ideation, Inspire Hall) — sumber: "Lampiran
// Surat No.28/.../DPRN/Srt/B ... perihal Penggunaan Ruang Kelas pada
// Kawasan Edukasi dan Digitalisasi Bank Indonesia Kemang" (tabel 8 baris).
// Luas (area), lantai (floor), Tarif Harian (priceDay), dan Tarif
// Mingguan (priceWeek) diambil PERSIS dari tabel tsb — TIDAK diperkirakan.
// Surat ini TIDAK mencantumkan tarif per jam sama sekali untuk ruang-ruang
// ini, jadi field priceHour sengaja DIHAPUS (bukan 0) — kalau nanti ada
// kebutuhan sewa per jam untuk ruang kelas ini, perlu tarif resmi baru
// dari pengelola dulu.
// YANG MASIH PERKIRAAN/PLACEHOLDER dan WAJIB dikonfirmasi ke Bapak Darren:
//   - capacity: dihitung kasar dari luas ruangan (asumsi ±1,9 m²/orang gaya
//     kelas, mengikuti rasio kapasitas/luas yang dipakai versi rooms.js
//     sebelumnya) — BUKAN dari tabel resmi, karena tabel resmi ini hanya
//     mencantumkan luas (m²), tidak ada kolom kapasitas orang.
//   - img: Spark/Muse/Genesis dipakaikan foto yang sama dengan Ignite
//     (images/ignite-spark-muse-genesis.jpg, nama filenya sendiri sudah
//     mengisyaratkan 1 foto untuk 4 ruangan sekelompok ini — kemungkinan
//     4 ruangan identik dari 1 baris "Kelas Sedang" di tabel resmi).
//     Quantum/Pioneer/Ideation/Inspire Hall (ruangan baru, lantai 2) belum
//     ada foto asli sama sekali, masih pakai ilustrasi SVG placeholder.
// =====================================================================
export const ROOMS = [
  { id: "vision-hall", isExternal: false, name: "Vision Hall", category: "Auditorium", roomClass: "Ampitheater", capacity: 100, area: 190.4, floor: "Gedung Utama Kawasan Edukasi dan Digital Kemang, Lantai 1", priceDay: 3130000, priceWeek: 17580000,
    desc: "Ruang auditorium bertingkat dengan meja lengkung mengikuti kontur ruangan, cocok untuk seminar, kuliah umum, dan pelatihan skala besar.",
    facilities: ["Kursi bertingkat", "Proyektor & layar besar", "Sistem tata suara", "Pencahayaan panggung"],
    img: "images/vision-hall.jpg" },
  { id: "catalyst", isExternal: false, name: "Catalyst Room", category: "Ruang Pelatihan", roomClass: "Kelas Besar", capacity: 100, area: 190.4, floor: "Gedung Utama Kawasan Edukasi dan Digital Kemang, Lantai 1", priceDay: 3130000, priceWeek: 17580000,
    desc: "Ruang pelatihan dengan kursi meja lipat yang bisa disusun ulang, layar interaktif, dan TV pendamping — fleksibel untuk berbagai format kelas.",
    facilities: ["Kursi meja lipat (movable)", "Layar interaktif BenQ", "TV pendamping", "Meja fasilitator adjustable"],
    img: "images/illustration-catalyst.svg", placeholderImg: true },
  { id: "frontier", isExternal: false, name: "Frontier Room", category: "Ruang Pelatihan", roomClass: "Kelas Besar", capacity: 100, area: 190.4, floor: "Gedung Utama Kawasan Edukasi dan Digital Kemang, Lantai 1", priceDay: 3130000, priceWeek: 17580000,
    desc: "Ruang pelatihan dengan kursi meja lipat yang bisa disusun ulang, layar interaktif, dan TV pendamping — fleksibel untuk berbagai format kelas.",
    facilities: ["Kursi meja lipat (movable)", "Layar interaktif BenQ", "TV pendamping", "Meja fasilitator adjustable"],
    img: "images/illustration-frontier.svg", placeholderImg: true },
  { id: "momentum", isExternal: false, name: "Momentum Room", category: "Ruang Pelatihan", roomClass: "Kelas Besar", capacity: 90, area: 171.6, floor: "Gedung Utama Kawasan Edukasi dan Digital Kemang, Lantai 1", priceDay: 2830000, priceWeek: 15850000,
    desc: "Ruang pelatihan dengan kursi meja lipat yang bisa disusun ulang, layar interaktif, dan TV pendamping — fleksibel untuk berbagai format kelas.",
    facilities: ["Kursi meja lipat (movable)", "Layar interaktif BenQ", "TV pendamping", "Meja fasilitator adjustable"],
    img: "images/illustration-momentum.svg", placeholderImg: true },
  { id: "quantum", isExternal: false, name: "Quantum Room", category: "Ruang Pelatihan", roomClass: "Kelas Besar", capacity: 100, area: 190.4, floor: "Gedung Utama Kawasan Edukasi dan Digital Kemang, Lantai 2", priceDay: 3130000, priceWeek: 17580000,
    desc: "Ruang pelatihan dengan kursi meja lipat yang bisa disusun ulang, layar interaktif, dan TV pendamping — fleksibel untuk berbagai format kelas.",
    facilities: ["Kursi meja lipat (movable)", "Layar interaktif BenQ", "TV pendamping", "Meja fasilitator adjustable"],
    img: "images/illustration-quantum.svg", placeholderImg: true },
  { id: "pioneer", isExternal: false, name: "Pioneer Room", category: "Ruang Pelatihan", roomClass: "Kelas Besar", capacity: 90, area: 171.6, floor: "Gedung Utama Kawasan Edukasi dan Digital Kemang, Lantai 2", priceDay: 2830000, priceWeek: 15850000,
    desc: "Ruang pelatihan dengan kursi meja lipat yang bisa disusun ulang, layar interaktif, dan TV pendamping — fleksibel untuk berbagai format kelas.",
    facilities: ["Kursi meja lipat (movable)", "Layar interaktif BenQ", "TV pendamping", "Meja fasilitator adjustable"],
    img: "images/illustration-pioneer.svg", placeholderImg: true },
  { id: "ideation", isExternal: false, name: "Ideation Room", category: "Ruang Pelatihan", roomClass: "Kelas Besar", capacity: 55, area: 103.8, floor: "Gedung Utama Kawasan Edukasi dan Digital Kemang, Lantai 2", priceDay: 1710000, priceWeek: 9590000,
    desc: "Ruang pelatihan dengan kursi meja lipat yang bisa disusun ulang, layar interaktif, dan TV pendamping — fleksibel untuk berbagai format kelas.",
    facilities: ["Kursi meja lipat (movable)", "Layar interaktif BenQ", "TV pendamping", "Meja fasilitator adjustable"],
    img: "images/illustration-ideation.svg", placeholderImg: true },
  { id: "inspire-hall", isExternal: false, name: "Inspire Hall", category: "Auditorium", roomClass: "Ampitheater", capacity: 100, area: 190.4, floor: "Gedung Utama Kawasan Edukasi dan Digital Kemang, Lantai 2", priceDay: 3130000, priceWeek: 17580000,
    desc: "Ruang auditorium bertingkat dengan meja lengkung mengikuti kontur ruangan, cocok untuk seminar, kuliah umum, dan pelatihan skala besar.",
    facilities: ["Kursi bertingkat", "Proyektor & layar besar", "Sistem tata suara", "Pencahayaan panggung"],
    img: "images/illustration-inspire-hall.svg", placeholderImg: true },
  { id: "ignite", isExternal: false, name: "Ignite Room", category: "Ruang Pelatihan", roomClass: "Kelas Sedang", capacity: 35, area: 72.5, floor: "Gedung Utama Kawasan Edukasi dan Digital Kemang, Lantai 1", priceDay: 1200000, priceWeek: 6700000,
    desc: "Ruang pelatihan berukuran sedang dengan kursi meja lipat yang fleksibel disusun ulang dan TV presentasi.",
    facilities: ["Kursi meja lipat (movable)", "TV presentasi", "Pencahayaan alami"],
    img: "images/ignite-spark-muse-genesis.jpg" },
  { id: "spark", isExternal: false, name: "Spark Room", category: "Ruang Pelatihan", roomClass: "Kelas Sedang", capacity: 35, area: 72.5, floor: "Gedung Utama Kawasan Edukasi dan Digital Kemang, Lantai 1", priceDay: 1200000, priceWeek: 6700000,
    desc: "Ruang pelatihan berukuran sedang dengan kursi meja lipat yang fleksibel disusun ulang dan TV presentasi.",
    facilities: ["Kursi meja lipat (movable)", "TV presentasi", "Pencahayaan alami"],
    img: "images/ignite-spark-muse-genesis.jpg" },
  { id: "muse", isExternal: false, name: "Muse Room", category: "Ruang Pelatihan", roomClass: "Kelas Sedang", capacity: 35, area: 72.5, floor: "Gedung Utama Kawasan Edukasi dan Digital Kemang, Lantai 1", priceDay: 1200000, priceWeek: 6700000,
    desc: "Ruang pelatihan berukuran sedang dengan kursi meja lipat yang fleksibel disusun ulang dan TV presentasi.",
    facilities: ["Kursi meja lipat (movable)", "TV presentasi", "Pencahayaan alami"],
    img: "images/ignite-spark-muse-genesis.jpg" },
  { id: "genesis", isExternal: false, name: "Genesis Room", category: "Ruang Pelatihan", roomClass: "Kelas Sedang", capacity: 35, area: 72.5, floor: "Gedung Utama Kawasan Edukasi dan Digital Kemang, Lantai 1", priceDay: 1200000, priceWeek: 6700000,
    desc: "Ruang pelatihan berukuran sedang dengan kursi meja lipat yang fleksibel disusun ulang dan TV presentasi.",
    facilities: ["Kursi meja lipat (movable)", "TV presentasi", "Pencahayaan alami"],
    img: "images/ignite-spark-muse-genesis.jpg" },

  // =====================================================================
  // RUANGAN EKSTERNAL (Wisma) — sumber: tabel resmi "Tarif Sewa Ruang
  // Penggunaan Waktu Tertentu — Kawasan Edukasi dan Digital Kemang"
  // (bagian A. Wisma, 7 baris — bagian B. Ruangan Lain/Aula/R. Makan
  // sengaja DIPANGKAS dari database ini atas permintaan Bapak Darren,
  // supaya database hanya berisi ruangan yang persis ada di tabel resmi
  // yang dipakai: 12 ruang kelas dari Lampiran Surat No.28/.../DPRN/Srt/B
  // + 7 unit Wisma ini). Tarif (priceDay/priceWeek), luas (area), dan
  // kode ruang (roomCode) diambil PERSIS dari tabel Wisma tsb — TIDAK
  // diperkirakan.
  // YANG MASIH PERKIRAAN/PLACEHOLDER dan WAJIB dikonfirmasi sebelum situs
  // dipakai sungguhan:
  //   - capacity: dihitung kasar dari jumlah kamar tidur (asumsi 2 orang/kamar).
  //   - facilities & desc: masih generik berdasarkan jenis ruangan (Wisma),
  //     BUKAN dari observasi langsung.
  //   - img: Ketujuh unit Wisma (Anggrek Lt.1/2/3, Bougenville, Cempaka,
  //     Dahlia, Edelweis) SUDAH pakai foto asli yang dikirim langsung
  //     (bukan foto stok internet), jadi TIDAK ada `placeholderImg` lagi
  //     pada ruangan-ruangan tsb.
  //   - kondisi "unRF" pada tabel asli disimpan di field `kondisi` apa
  //     adanya karena maknanya belum dikonfirmasi ke Bapak Darren.
  // =====================================================================
  { id: "wisma-anggrek-lt1", isExternal: true, name: "Wisma Anggrek — Lantai 1", category: "Wisma / Penginapan", roomCode: "W.A 7BR-7KM", kondisi: "unRF",
    capacity: 14, area: 134.9, floor: "Gedung Wisma Anggrek, Lantai 1", priceDay: 170000, priceWeek: 940000,
    desc: "Unit wisma 7 kamar tidur dengan 7 kamar mandi di lantai 1 Gedung Anggrek — cocok untuk rombongan peserta diklat yang menginap.",
    facilities: ["7 kamar tidur", "7 kamar mandi dalam", "AC per kamar", "Area istirahat bersama"],
    img: "images/wisma-anggrek-lt1.jpg" },
  { id: "wisma-anggrek-lt2", isExternal: true, name: "Wisma Anggrek — Lantai 2", category: "Wisma / Penginapan", roomCode: "W.A 7BR-7KM", kondisi: "unRF",
    capacity: 14, area: 134.9, floor: "Gedung Wisma Anggrek, Lantai 2", priceDay: 170000, priceWeek: 940000,
    desc: "Unit wisma 7 kamar tidur dengan 7 kamar mandi di lantai 2 Gedung Anggrek — cocok untuk rombongan peserta diklat yang menginap.",
    facilities: ["7 kamar tidur", "7 kamar mandi dalam", "AC per kamar", "Area istirahat bersama"],
    img: "images/wisma-anggrek-lt2.jpg" },
  { id: "wisma-anggrek-lt3", isExternal: true, name: "Wisma Anggrek — Lantai 3", category: "Wisma / Penginapan", roomCode: "W.A 7BR-7KM", kondisi: "unRF",
    capacity: 14, area: 134.9, floor: "Gedung Wisma Anggrek, Lantai 3", priceDay: 170000, priceWeek: 940000,
    desc: "Unit wisma 7 kamar tidur dengan 7 kamar mandi di lantai 3 Gedung Anggrek — cocok untuk rombongan peserta diklat yang menginap.",
    facilities: ["7 kamar tidur", "7 kamar mandi dalam", "AC per kamar", "Area istirahat bersama"],
    img: "images/wisma-anggrek-lt3.jpg" },
  { id: "wisma-bougenville", isExternal: true, name: "Wisma Bougenville", category: "Wisma / Penginapan", roomCode: "W.B 8BR-4KM", kondisi: "unRF",
    capacity: 16, area: 196.8, floor: "Gedung Wisma Bougenville, Lantai 1–2", priceDay: 130000, priceWeek: 690000,
    desc: "Unit wisma 8 kamar tidur dengan 4 kamar mandi mencakup lantai 1 dan 2 Gedung Bougenville — cocok untuk rombongan peserta diklat yang menginap.",
    facilities: ["8 kamar tidur", "4 kamar mandi", "AC per kamar", "Area istirahat bersama"],
    img: "images/wisma-bougenville.jpg" },
  { id: "wisma-cempaka", isExternal: true, name: "Wisma Cempaka", category: "Wisma / Penginapan", roomCode: "W.C 6BR-2KM", kondisi: "unRF",
    capacity: 12, area: 102.1, floor: "Gedung Wisma Cempaka, Lantai 2", priceDay: 70000, priceWeek: 360000,
    desc: "Unit wisma 6 kamar tidur dengan 2 kamar mandi di lantai 2 Gedung Cempaka — cocok untuk rombongan peserta diklat yang menginap.",
    facilities: ["6 kamar tidur", "2 kamar mandi", "AC per kamar", "Area istirahat bersama"],
    img: "images/wisma-cempaka.jpg" },
  { id: "wisma-dahlia", isExternal: true, name: "Wisma Dahlia", category: "Wisma / Penginapan", roomCode: "W.D 8BR-4KM", kondisi: "unRF",
    capacity: 16, area: 196.8, floor: "Gedung Wisma Dahlia, Lantai 1–2", priceDay: 130000, priceWeek: 690000,
    desc: "Unit wisma 8 kamar tidur dengan 4 kamar mandi mencakup lantai 1 dan 2 Gedung Dahlia — cocok untuk rombongan peserta diklat yang menginap.",
    facilities: ["8 kamar tidur", "4 kamar mandi", "AC per kamar", "Area istirahat bersama"],
    img: "images/wisma-dahlia.jpg" },
  { id: "wisma-edelweis", isExternal: true, name: "Wisma Edelweis", category: "Wisma / Penginapan", roomCode: "W.E 1BR-1KM", kondisi: "unRF",
    capacity: 2, area: 29.2, floor: "Gedung Wisma Edelweis, Lantai 1", priceDay: 20000, priceWeek: 110000,
    desc: "Unit wisma studio 1 kamar tidur dengan 1 kamar mandi di lantai 1 Gedung Edelweis — cocok untuk tamu perorangan atau pasangan.",
    facilities: ["1 kamar tidur", "1 kamar mandi dalam", "AC", "Area istirahat"],
    img: "images/wisma-edelweis.jpg" }
];

// =====================================================================
// HELPER FUNCTIONS
// =====================================================================

/**
 * Mencari ruangan berdasarkan ID
 * @param {string} id - ID ruangan
 * @returns {object|undefined} Objek ruangan atau undefined jika tidak ditemukan
 */
export function findRoom(id) {
  return ROOMS.find(r => r.id === id);
}

/**
 * Mendapatkan daftar ruangan berdasarkan kategori
 * @param {string} category - Kategori ruangan
 * @returns {array} Array ruangan dalam kategori tersebut
 */
export function getRoomsByCategory(category) {
  return ROOMS.filter(r => r.category === category);
}

/**
 * Mendapatkan daftar ruangan berdasarkan kapasitas minimum
 * @param {number} minCapacity - Kapasitas minimum
 * @returns {array} Array ruangan yang memenuhi kriteria
 */
export function getRoomsByCapacity(minCapacity) {
  return ROOMS.filter(r => r.capacity >= minCapacity);
}

/**
 * Mencari ruangan berdasarkan kata kunci
 * @param {string} keyword - Kata kunci (nama, kategori, atau fasilitas)
 * @returns {array} Array ruangan yang cocok
 */
export function searchRooms(keyword) {
  const lowerKeyword = keyword.toLowerCase();
  return ROOMS.filter(room => {
    return (
      room.name.toLowerCase().includes(lowerKeyword) ||
      room.category.toLowerCase().includes(lowerKeyword) ||
      room.desc.toLowerCase().includes(lowerKeyword) ||
      room.facilities.some(f => f.toLowerCase().includes(lowerKeyword))
    );
  });
}
