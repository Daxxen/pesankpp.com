/**
 * Kawasan Pendidikan dan Pelatihan
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
 * TAMBAHAN (sesi ini): Aula dan 12 ruang rapat tipe Capstone (Axis, Orbit,
 * Helix, Radius, Origin, Flux, Apex, Vertex, Vector, Nexus, Matrix, Prism)
 * ditambahkan karena dipakai di data pemesanan asli (Excel "Penggunaan
 * Kelas BI Kemang"). Kapasitas keduanya diambil dari sheet RUANGAN di Excel
 * itu (Aula 200 orang, tiap Capstone 10 orang). Luas (area) dan daftar
 * fasilitas belum ada datanya, jadi sengaja dikosongkan (bukan ditebak) dan
 * situs menyembunyikan bagian tsb. Fotonya masih ilustrasi sementara.
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
// ini, jadi field priceHour sengaja DIHAPUS (bukan 0).
// YANG MASIH PERKIRAAN/PLACEHOLDER dan WAJIB dikonfirmasi:
//   - capacity: dihitung kasar dari luas ruangan, BUKAN dari tabel resmi.
//     (Sheet RUANGAN di Excel memuat angka kapasitas yang berbeda — lihat
//     laporan perbandingan; belum dipakai di sini karena belum dikonfirmasi.)
//   - img: Spark/Muse/Genesis dipakaikan foto yang sama dengan Ignite.
//     Quantum/Pioneer/Ideation/Inspire Hall belum ada foto asli.
// =====================================================================
export const ROOMS = [
  { id: "vision-hall", isExternal: false, name: "Vision Hall", category: "Auditorium", roomClass: "Ampitheater", capacity: 100, area: 190.4, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 1", priceDay: 3130000, priceWeek: 17580000,
    desc: "Ruang auditorium bertingkat dengan meja lengkung mengikuti kontur ruangan, cocok untuk seminar, kuliah umum, dan pelatihan skala besar.",
    facilities: ["Kursi bertingkat", "Proyektor & layar besar", "Sistem tata suara", "Pencahayaan panggung"],
    img: "images/vision-hall.jpg" },
  { id: "catalyst", isExternal: false, name: "Catalyst Room", category: "Ruang Pelatihan", roomClass: "Kelas Besar", capacity: 100, area: 190.4, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 1", priceDay: 3130000, priceWeek: 17580000,
    desc: "Ruang pelatihan dengan kursi meja lipat yang bisa disusun ulang, layar interaktif, dan TV pendamping — fleksibel untuk berbagai format kelas.",
    facilities: ["Kursi meja lipat (movable)", "Layar interaktif BenQ", "TV pendamping", "Meja fasilitator adjustable"],
    img: "images/illustration-catalyst.svg", placeholderImg: true },
  { id: "frontier", isExternal: false, name: "Frontier Room", category: "Ruang Pelatihan", roomClass: "Kelas Besar", capacity: 100, area: 190.4, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 1", priceDay: 3130000, priceWeek: 17580000,
    desc: "Ruang pelatihan dengan kursi meja lipat yang bisa disusun ulang, layar interaktif, dan TV pendamping — fleksibel untuk berbagai format kelas.",
    facilities: ["Kursi meja lipat (movable)", "Layar interaktif BenQ", "TV pendamping", "Meja fasilitator adjustable"],
    img: "images/illustration-frontier.svg", placeholderImg: true },
  { id: "momentum", isExternal: false, name: "Momentum Room", category: "Ruang Pelatihan", roomClass: "Kelas Besar", capacity: 90, area: 171.6, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 1", priceDay: 2830000, priceWeek: 15850000,
    desc: "Ruang pelatihan dengan kursi meja lipat yang bisa disusun ulang, layar interaktif, dan TV pendamping — fleksibel untuk berbagai format kelas.",
    facilities: ["Kursi meja lipat (movable)", "Layar interaktif BenQ", "TV pendamping", "Meja fasilitator adjustable"],
    img: "images/illustration-momentum.svg", placeholderImg: true },
  { id: "quantum", isExternal: false, name: "Quantum Room", category: "Ruang Pelatihan", roomClass: "Kelas Besar", capacity: 100, area: 190.4, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 2", priceDay: 3130000, priceWeek: 17580000,
    desc: "Ruang pelatihan dengan kursi meja lipat yang bisa disusun ulang, layar interaktif, dan TV pendamping — fleksibel untuk berbagai format kelas.",
    facilities: ["Kursi meja lipat (movable)", "Layar interaktif BenQ", "TV pendamping", "Meja fasilitator adjustable"],
    img: "images/illustration-quantum.svg", placeholderImg: true },
  { id: "pioneer", isExternal: false, name: "Pioneer Room", category: "Ruang Pelatihan", roomClass: "Kelas Besar", capacity: 90, area: 171.6, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 2", priceDay: 2830000, priceWeek: 15850000,
    desc: "Ruang pelatihan dengan kursi meja lipat yang bisa disusun ulang, layar interaktif, dan TV pendamping — fleksibel untuk berbagai format kelas.",
    facilities: ["Kursi meja lipat (movable)", "Layar interaktif BenQ", "TV pendamping", "Meja fasilitator adjustable"],
    img: "images/illustration-pioneer.svg", placeholderImg: true },
  { id: "ideation", isExternal: false, name: "Ideation Room", category: "Ruang Pelatihan", roomClass: "Kelas Besar", capacity: 55, area: 103.8, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 2", priceDay: 1710000, priceWeek: 9590000,
    desc: "Ruang pelatihan dengan kursi meja lipat yang bisa disusun ulang, layar interaktif, dan TV pendamping — fleksibel untuk berbagai format kelas.",
    facilities: ["Kursi meja lipat (movable)", "Layar interaktif BenQ", "TV pendamping", "Meja fasilitator adjustable"],
    img: "images/illustration-ideation.svg", placeholderImg: true },
  { id: "inspire-hall", isExternal: false, name: "Inspire Hall", category: "Auditorium", roomClass: "Ampitheater", capacity: 100, area: 190.4, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 2", priceDay: 3130000, priceWeek: 17580000,
    desc: "Ruang auditorium bertingkat dengan meja lengkung mengikuti kontur ruangan, cocok untuk seminar, kuliah umum, dan pelatihan skala besar.",
    facilities: ["Kursi bertingkat", "Proyektor & layar besar", "Sistem tata suara", "Pencahayaan panggung"],
    img: "images/illustration-inspire-hall.svg", placeholderImg: true },
  { id: "ignite", isExternal: false, name: "Ignite Room", category: "Ruang Pelatihan", roomClass: "Kelas Sedang", capacity: 35, area: 72.5, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 1", priceDay: 1200000, priceWeek: 6700000,
    desc: "Ruang pelatihan berukuran sedang dengan kursi meja lipat yang fleksibel disusun ulang dan TV presentasi.",
    facilities: ["Kursi meja lipat (movable)", "TV presentasi", "Pencahayaan alami"],
    img: "images/ignite-spark-muse-genesis.jpg" },
  { id: "spark", isExternal: false, name: "Spark Room", category: "Ruang Pelatihan", roomClass: "Kelas Sedang", capacity: 35, area: 72.5, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 1", priceDay: 1200000, priceWeek: 6700000,
    desc: "Ruang pelatihan berukuran sedang dengan kursi meja lipat yang fleksibel disusun ulang dan TV presentasi.",
    facilities: ["Kursi meja lipat (movable)", "TV presentasi", "Pencahayaan alami"],
    img: "images/ignite-spark-muse-genesis.jpg" },
  { id: "muse", isExternal: false, name: "Muse Room", category: "Ruang Pelatihan", roomClass: "Kelas Sedang", capacity: 35, area: 72.5, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 1", priceDay: 1200000, priceWeek: 6700000,
    desc: "Ruang pelatihan berukuran sedang dengan kursi meja lipat yang fleksibel disusun ulang dan TV presentasi.",
    facilities: ["Kursi meja lipat (movable)", "TV presentasi", "Pencahayaan alami"],
    img: "images/ignite-spark-muse-genesis.jpg" },
  { id: "genesis", isExternal: false, name: "Genesis Room", category: "Ruang Pelatihan", roomClass: "Kelas Sedang", capacity: 35, area: 72.5, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 1", priceDay: 1200000, priceWeek: 6700000,
    desc: "Ruang pelatihan berukuran sedang dengan kursi meja lipat yang fleksibel disusun ulang dan TV presentasi.",
    facilities: ["Kursi meja lipat (movable)", "TV presentasi", "Pencahayaan alami"],
    img: "images/ignite-spark-muse-genesis.jpg" },

  // ===== AULA & RUANG RAPAT CAPSTONE (ditambahkan sesi ini — lihat catatan di atas) =====
  { id: "aula", isExternal: false, name: "Aula", category: "Aula Serbaguna", roomClass: "Aula", capacity: 200, floor: "Gedung Serbaguna, Lantai 1",
    desc: "Aula serbaguna Kawasan Pendidikan dan Pelatihan untuk kegiatan berskala besar.",
    facilities: [],
    img: "images/illustration-placeholder.svg", placeholderImg: true },
  { id: "axis", isExternal: false, name: "Axis", category: "Ruang Rapat (Capstone)", roomClass: "Capstone", capacity: 10, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 2",
    desc: "Ruang rapat kecil tipe Capstone untuk diskusi kelompok atau rapat tim.",
    facilities: [],
    img: "images/illustration-placeholder.svg", placeholderImg: true },
  { id: "orbit", isExternal: false, name: "Orbit", category: "Ruang Rapat (Capstone)", roomClass: "Capstone", capacity: 10, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 2",
    desc: "Ruang rapat kecil tipe Capstone untuk diskusi kelompok atau rapat tim.",
    facilities: [],
    img: "images/illustration-placeholder.svg", placeholderImg: true },
  { id: "helix", isExternal: false, name: "Helix", category: "Ruang Rapat (Capstone)", roomClass: "Capstone", capacity: 10, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 2",
    desc: "Ruang rapat kecil tipe Capstone untuk diskusi kelompok atau rapat tim.",
    facilities: [],
    img: "images/illustration-placeholder.svg", placeholderImg: true },
  { id: "radius", isExternal: false, name: "Radius", category: "Ruang Rapat (Capstone)", roomClass: "Capstone", capacity: 10, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 2",
    desc: "Ruang rapat kecil tipe Capstone untuk diskusi kelompok atau rapat tim.",
    facilities: [],
    img: "images/illustration-placeholder.svg", placeholderImg: true },
  { id: "origin", isExternal: false, name: "Origin", category: "Ruang Rapat (Capstone)", roomClass: "Capstone", capacity: 10, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 2",
    desc: "Ruang rapat kecil tipe Capstone untuk diskusi kelompok atau rapat tim.",
    facilities: [],
    img: "images/illustration-placeholder.svg", placeholderImg: true },
  { id: "flux", isExternal: false, name: "Flux", category: "Ruang Rapat (Capstone)", roomClass: "Capstone", capacity: 10, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 2",
    desc: "Ruang rapat kecil tipe Capstone untuk diskusi kelompok atau rapat tim.",
    facilities: [],
    img: "images/illustration-placeholder.svg", placeholderImg: true },
  { id: "apex", isExternal: false, name: "Apex", category: "Ruang Rapat (Capstone)", roomClass: "Capstone", capacity: 10, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 2",
    desc: "Ruang rapat kecil tipe Capstone untuk diskusi kelompok atau rapat tim.",
    facilities: [],
    img: "images/illustration-placeholder.svg", placeholderImg: true },
  { id: "vertex", isExternal: false, name: "Vertex", category: "Ruang Rapat (Capstone)", roomClass: "Capstone", capacity: 10, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 2",
    desc: "Ruang rapat kecil tipe Capstone untuk diskusi kelompok atau rapat tim.",
    facilities: [],
    img: "images/illustration-placeholder.svg", placeholderImg: true },
  { id: "vector", isExternal: false, name: "Vector", category: "Ruang Rapat (Capstone)", roomClass: "Capstone", capacity: 10, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 2",
    desc: "Ruang rapat kecil tipe Capstone untuk diskusi kelompok atau rapat tim.",
    facilities: [],
    img: "images/illustration-placeholder.svg", placeholderImg: true },
  { id: "nexus", isExternal: false, name: "Nexus", category: "Ruang Rapat (Capstone)", roomClass: "Capstone", capacity: 10, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 2",
    desc: "Ruang rapat kecil tipe Capstone untuk diskusi kelompok atau rapat tim.",
    facilities: [],
    img: "images/illustration-placeholder.svg", placeholderImg: true },
  { id: "matrix", isExternal: false, name: "Matrix", category: "Ruang Rapat (Capstone)", roomClass: "Capstone", capacity: 10, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 2",
    desc: "Ruang rapat kecil tipe Capstone untuk diskusi kelompok atau rapat tim.",
    facilities: [],
    img: "images/illustration-placeholder.svg", placeholderImg: true },
  { id: "prism", isExternal: false, name: "Prism", category: "Ruang Rapat (Capstone)", roomClass: "Capstone", capacity: 10, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 2",
    desc: "Ruang rapat kecil tipe Capstone untuk diskusi kelompok atau rapat tim.",
    facilities: [],
    img: "images/illustration-placeholder.svg", placeholderImg: true },

  // =====================================================================
  // RUANGAN EKSTERNAL (Wisma) — sumber: tabel resmi "Tarif Sewa Ruang
  // Penggunaan Waktu Tertentu — Kawasan Pendidikan dan Pelatihan"
  // (bagian A. Wisma, 7 baris). Tarif (priceDay/priceWeek), luas (area), dan
  // kode ruang (roomCode) diambil PERSIS dari tabel Wisma tsb.
  // YANG MASIH PERKIRAAN/PLACEHOLDER:
  //   - capacity: dihitung kasar dari jumlah kamar tidur (asumsi 2 orang/kamar).
  //   - facilities & desc: masih generik berdasarkan jenis ruangan (Wisma).
  //   - kondisi "unRF" pada tabel asli disimpan di field `kondisi` apa
  //     adanya karena maknanya belum dikonfirmasi.
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
 */
export function getRoomsByCategory(category) {
  return ROOMS.filter(r => r.category === category);
}

/**
 * Mendapatkan daftar ruangan berdasarkan kapasitas minimum
 */
export function getRoomsByCapacity(minCapacity) {
  return ROOMS.filter(r => r.capacity >= minCapacity);
}

/**
 * Mencari ruangan berdasarkan kata kunci (nama, kategori, deskripsi, fasilitas)
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