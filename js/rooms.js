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
 * UNIT WISMA (sesi ini): wisma kini dipesan per unit kamar (Anggrek 1.1 - 3.4,
 * Cempaka 1-4, Bougenville 1-10, Dahlia 1-4, Edelweis 1-6) — lihat WISMA_BUILDINGS.
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
// =====================================================================
// UNIT WISMA (RUANGAN EKSTERNAL) — satu unit kamar = satu ruangan yang bisa
// dipesan. Dibangkitkan otomatis dari konfigurasi di bawah, jadi menambah/
// mengurangi unit cukup mengubah angka di WISMA_BUILDINGS.
//
//   Anggrek    : 3 lantai x 4 unit  -> kode 1.1 ... 1.4, 2.1 ... 2.4, 3.1 ... 3.4
//                (angka pertama = lantai, angka kedua = nomor unit di lantai itu)
//   Cempaka    : 4 unit   -> kode 1 ... 4
//   Bougenville: 10 unit  -> kode 1 ... 10
//   Dahlia     : 4 unit   -> kode 1 ... 4
//   Edelweis   : 6 unit   -> kode 1 ... 6
//
// SUMBER: tarif (priceDay/priceWeek) diambil dari tabel resmi "Tarif Sewa Ruang
// Penggunaan Waktu Tertentu" bagian A. Wisma. Tabel itu mencantumkan satu
// tarif per jenis wisma (bukan per unit), sehingga tarif yang sama DIPAKAI
// UNTUK SETIAP UNIT. WAJIB dikonfirmasi — bila tarif per unit berbeda, ubah
// priceDay/priceWeek di WISMA_BUILDINGS di bawah.
// YANG MASIH PERKIRAAN/PLACEHOLDER:
//   - capacity per unit: dibagi rata dari perkiraan kapasitas satu wisma/lantai
//     (asumsi 2 orang per kamar tidur), dibulatkan ke atas.
//   - luas (area) per unit tidak tersedia, sengaja dikosongkan.
//   - facilities dikosongkan (tidak ditebak); situs menyembunyikan bagiannya.
//   - kondisi "unRF" dari tabel asli disimpan apa adanya di field `kondisi`.
// =====================================================================
const WISMA_KONDISI = "unRF";
const WISMA_BUILDINGS = [
  { key: "anggrek", label: "Anggrek", floors: [1, 2, 3], unitsPerFloor: 4, capacity: 4, priceDay: 170000, priceWeek: 940000,
    buildingFloor: "Gedung Wisma Anggrek", imgOf: f => `images/wisma-anggrek-lt${f}.jpg` },
  { key: "cempaka", label: "Cempaka", units: 4, capacity: 3, priceDay: 70000, priceWeek: 360000,
    buildingFloor: "Gedung Wisma Cempaka, Lantai 2", imgOf: () => "images/wisma-cempaka.jpg" },
  { key: "bougenville", label: "Bougenville", units: 10, capacity: 2, priceDay: 130000, priceWeek: 690000,
    buildingFloor: "Gedung Wisma Bougenville, Lantai 1–2", imgOf: () => "images/wisma-bougenville.jpg" },
  { key: "dahlia", label: "Dahlia", units: 4, capacity: 4, priceDay: 130000, priceWeek: 690000,
    buildingFloor: "Gedung Wisma Dahlia, Lantai 1–2", imgOf: () => "images/wisma-dahlia.jpg" },
  { key: "edelweis", label: "Edelweis", units: 6, capacity: 2, priceDay: 20000, priceWeek: 110000,
    buildingFloor: "Gedung Wisma Edelweis, Lantai 1", imgOf: () => "images/wisma-edelweis.jpg" }
];

function wismaUnits(b) {
  const make = (code, floorNo, unitNo) => ({
    id: `wisma-${b.key}-${code.replace(".", "-")}`,
    isExternal: true,
    name: `Wisma ${b.label} ${code}`,
    category: "Wisma / Penginapan",
    unitCode: code,
    kondisi: WISMA_KONDISI,
    capacity: b.capacity,
    floor: floorNo ? `${b.buildingFloor}, Lantai ${floorNo} · Unit ${unitNo}` : `${b.buildingFloor} · Unit ${unitNo}`,
    priceDay: b.priceDay,
    priceWeek: b.priceWeek,
    desc: floorNo
      ? `Unit kamar ${unitNo} di Lantai ${floorNo} Gedung Wisma ${b.label} (kode ${code}) — cocok untuk peserta diklat yang menginap.`
      : `Unit kamar ${unitNo} Gedung Wisma ${b.label} (kode ${code}) — cocok untuk peserta diklat yang menginap.`,
    facilities: [],
    img: b.imgOf(floorNo)
  });
  const out = [];
  if (b.floors) {
    b.floors.forEach(f => { for (let u = 1; u <= b.unitsPerFloor; u++) out.push(make(`${f}.${u}`, f, u)); });
  } else {
    for (let u = 1; u <= b.units; u++) out.push(make(String(u), null, u));
  }
  return out;
}
const WISMA_UNITS = WISMA_BUILDINGS.flatMap(wismaUnits);

export const ROOMS = [
  { id: "vision-hall", isExternal: false, name: "Vision Hall", category: "Auditorium", roomClass: "Ampitheater", capacity: 100, area: 190.4, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 1", priceDay: 3130000, priceWeek: 17580000,
    desc: "Ruang auditorium bertingkat dengan meja lengkung mengikuti kontur ruangan, cocok untuk seminar, kuliah umum, dan pelatihan skala besar.",
    facilities: ["Kursi bertingkat", "Proyektor & layar besar", "Sistem tata suara", "Pencahayaan panggung"],
    img: "images/vision-hall.jpg" },
  { id: "catalyst", isExternal: false, name: "Catalyst Room", category: "Ruang Pelatihan", roomClass: "Kelas Besar", capacity: 100, area: 190.4, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 1", priceDay: 3130000, priceWeek: 17580000,
    desc: "Ruang pelatihan dengan kursi meja lipat yang bisa disusun ulang, layar interaktif, dan TV — fleksibel untuk berbagai format kelas.",
    facilities: ["Kursi meja lipat (movable)", "Layar interaktif BenQ", "TV", "Meja fasilitator adjustable"],
    img: "images/illustration-catalyst.svg", placeholderImg: true },
  { id: "frontier", isExternal: false, name: "Frontier Room", category: "Ruang Pelatihan", roomClass: "Kelas Besar", capacity: 100, area: 190.4, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 1", priceDay: 3130000, priceWeek: 17580000,
    desc: "Ruang pelatihan dengan kursi meja lipat yang bisa disusun ulang, layar interaktif, dan TV — fleksibel untuk berbagai format kelas.",
    facilities: ["Kursi meja lipat (movable)", "Layar interaktif BenQ", "TV", "Meja fasilitator adjustable"],
    img: "images/illustration-frontier.svg", placeholderImg: true },
  { id: "momentum", isExternal: false, name: "Momentum Room", category: "Ruang Pelatihan", roomClass: "Kelas Besar", capacity: 90, area: 171.6, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 1", priceDay: 2830000, priceWeek: 15850000,
    desc: "Ruang pelatihan dengan kursi meja lipat yang bisa disusun ulang, layar interaktif, dan TV — fleksibel untuk berbagai format kelas.",
    facilities: ["Kursi meja lipat (movable)", "Layar interaktif BenQ", "TV", "Meja fasilitator adjustable"],
    img: "images/illustration-momentum.svg", placeholderImg: true },
  { id: "quantum", isExternal: false, name: "Quantum Room", category: "Ruang Pelatihan", roomClass: "Kelas Besar", capacity: 100, area: 190.4, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 2", priceDay: 3130000, priceWeek: 17580000,
    desc: "Ruang pelatihan dengan kursi meja lipat yang bisa disusun ulang, layar interaktif, dan TV — fleksibel untuk berbagai format kelas.",
    facilities: ["Kursi meja lipat (movable)", "Layar interaktif BenQ", "TV", "Meja fasilitator adjustable"],
    img: "images/illustration-quantum.svg", placeholderImg: true },
  { id: "pioneer", isExternal: false, name: "Pioneer Room", category: "Ruang Pelatihan", roomClass: "Kelas Besar", capacity: 90, area: 171.6, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 2", priceDay: 2830000, priceWeek: 15850000,
    desc: "Ruang pelatihan dengan kursi meja lipat yang bisa disusun ulang, layar interaktif, dan TV — fleksibel untuk berbagai format kelas.",
    facilities: ["Kursi meja lipat (movable)", "Layar interaktif BenQ", "TV", "Meja fasilitator adjustable"],
    img: "images/illustration-pioneer.svg", placeholderImg: true },
  { id: "ideation", isExternal: false, name: "Ideation Room", category: "Ruang Pelatihan", roomClass: "Kelas Besar", capacity: 55, area: 103.8, floor: "Gedung Utama Kawasan Pendidikan dan Pelatihan, Lantai 2", priceDay: 1710000, priceWeek: 9590000,
    desc: "Ruang pelatihan dengan kursi meja lipat yang bisa disusun ulang, layar interaktif, dan TV — fleksibel untuk berbagai format kelas.",
    facilities: ["Kursi meja lipat (movable)", "Layar interaktif BenQ", "TV", "Meja fasilitator adjustable"],
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

  // Unit Wisma (Anggrek 1.1 ... Edelweis 6) dibangkitkan oleh wismaUnits() di atas.
  ...WISMA_UNITS
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