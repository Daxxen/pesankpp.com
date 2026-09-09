/**
 * KAWASAN EDUKASI DAN DIGITAL KEMANG
 * Data Ruangan
 * 
 * File ini berisi semua data ruangan.
 * REKOMENDASI: Pindahkan dari file ini ke API backend untuk:
 * - Mudah update data tanpa deploy ulang
 * - Sinkronisasi real-time dengan sistem booking
 * - Manajemen foto dan harga yang lebih fleksibel
 */

/**
 * CATATAN PENTING UNTUK IMPLEMENTASI:
 * 
 * Field capacity di bawah diperkirakan dari jumlah kursi/kamar yang terlihat.
 * Field area (m²), floor (lokasi persis), priceHour, dan priceDay 
 * TIDAK BISA diketahui dari foto saja — nilainya masih PERKIRAAN SEMENTARA 
 * yang WAJIB dikoreksi sebelum situs dipakai sungguhan, supaya tarif 
 * yang tampil ke calon pemesan akurat.
 * 
 * Foto placeholder (SVG) harus diganti dengan foto asli saat tersedia.
 */

export const ROOMS = [
  // =====================================================================
  // RUANGAN INTERNAL (Gedung Utama)
  // =====================================================================
  
  {
    id: "vision-hall",
    isExternal: false,
    name: "Vision Hall",
    category: "Auditorium",
    capacity: 80,
    area: 150,
    floor: "Gedung Utama Kawasan Edukasi dan Digital Kemang (konfirmasi lantai)",
    priceHour: 350000,
    priceDay: 2500000,
    desc: "Ruang auditorium bertingkat dengan meja lengkung mengikuti kontur ruangan, cocok untuk seminar, kuliah umum, dan pelatihan skala besar.",
    facilities: ["Kursi bertingkat", "Proyektor & layar besar", "Sistem tata suara", "Pencahayaan panggung"],
    img: "images/vision-hall.jpg"
  },

  {
    id: "transit-lounge",
    isExternal: false,
    name: "Transit Lounge",
    category: "Area Santai & Fasilitas",
    capacity: 15,
    area: 45,
    floor: "Gedung Utama Kawasan Edukasi dan Digital Kemang (konfirmasi lantai)",
    priceHour: 100000,
    priceDay: 500000,
    desc: "Area lounge santai dengan sofa, meja diskusi kecil, dan pantry mini — cocok untuk pertemuan informal atau area transit peserta diklat.",
    facilities: ["Sofa & armchair", "Meja diskusi santai", "Pantry mini (kulkas, dispenser)", "AC"],
    img: "images/transit-lounge.jpg"
  },

  {
    id: "catalyst",
    isExternal: false,
    name: "Catalyst Room",
    category: "Ruang Pelatihan",
    capacity: 30,
    area: 55,
    floor: "Gedung Utama Kawasan Edukasi dan Digital Kemang (konfirmasi lantai)",
    priceHour: 200000,
    priceDay: 1200000,
    desc: "Ruang pelatihan dengan kursi meja lipat yang bisa disusun ulang, layar interaktif, dan TV pendamping — fleksibel untuk berbagai format kelas.",
    facilities: ["Kursi meja lipat (movable)", "Layar interaktif BenQ", "TV pendamping", "Meja fasilitator adjustable"],
    img: "images/illustration-catalyst.svg",
    placeholderImg: true
  },

  {
    id: "frontier",
    isExternal: false,
    name: "Frontier Room",
    category: "Ruang Pelatihan",
    capacity: 30,
    area: 55,
    floor: "Gedung Utama Kawasan Edukasi dan Digital Kemang (konfirmasi lantai)",
    priceHour: 200000,
    priceDay: 1200000,
    desc: "Ruang pelatihan dengan kursi meja lipat yang bisa disusun ulang, layar interaktif, dan TV pendamping — fleksibel untuk berbagai format kelas.",
    facilities: ["Kursi meja lipat (movable)", "Layar interaktif BenQ", "TV pendamping", "Meja fasilitator adjustable"],
    img: "images/illustration-frontier.svg",
    placeholderImg: true
  },

  {
    id: "momentum",
    isExternal: false,
    name: "Momentum Room",
    category: "Ruang Pelatihan",
    capacity: 30,
    area: 55,
    floor: "Gedung Utama Kawasan Edukasi dan Digital Kemang (konfirmasi lantai)",
    priceHour: 200000,
    priceDay: 1200000,
    desc: "Ruang pelatihan dengan kursi meja lipat yang bisa disusun ulang, layar interaktif, dan TV pendamping — fleksibel untuk berbagai format kelas.",
    facilities: ["Kursi meja lipat (movable)", "Layar interaktif BenQ", "TV pendamping", "Meja fasilitator adjustable"],
    img: "images/illustration-momentum.svg",
    placeholderImg: true
  },

  {
    id: "sync-pods",
    isExternal: false,
    name: "Sync Pods",
    category: "Ruang Diskusi",
    capacity: 6,
    area: 15,
    floor: "Gedung Utama Kawasan Edukasi dan Digital Kemang (konfirmasi lantai)",
    priceHour: 200000,
    priceDay: 800000,
    desc: "Ruang diskusi kecil untuk rapat tim atau sesi mentoring singkat, dilengkapi layar TV untuk presentasi.",
    facilities: ["Meja rapat kecil", "TV presentasi", "Kursi ergonomis", "AC"],
    img: "images/sync-pods.jpg"
  },

  {
    id: "coffee-shop",
    isExternal: false,
    name: "Coffee Shop",
    category: "Area Santai & Fasilitas",
    capacity: 20,
    area: 60,
    floor: "Gedung Utama Kawasan Edukasi dan Digital Kemang (konfirmasi lantai)",
    priceHour: 150000,
    priceDay: 600000,
    desc: "Area kafe dengan meja bar dan meja komunal — cocok sebagai area coffee break atau pertemuan kasual.",
    facilities: ["Meja bar & meja komunal", "Pantry/counter kopi", "Kursi bar", "AC"],
    img: "images/coffee-shop.jpg"
  },

  {
    id: "creative-hub",
    isExternal: false,
    name: "Creative Hub",
    category: "Area Santai & Fasilitas",
    capacity: 20,
    area: 70,
    floor: "Gedung Utama Kawasan Edukasi dan Digital Kemang (konfirmasi lantai)",
    priceHour: 150000,
    priceDay: 700000,
    desc: "Ruang kreatif dan santai dengan ayunan gantung, meja bar tinggi, dan meja foosball — cocok untuk sesi brainstorming non-formal atau ice breaking.",
    facilities: ["Ayunan gantung (hammock)", "Meja bar tinggi", "Meja foosball", "TV"],
    img: "images/creative-hub.jpg"
  },

  {
    id: "steering-committee",
    isExternal: false,
    name: "Steering Committee Room",
    category: "Ruang Rapat",
    capacity: 16,
    area: 60,
    floor: "Gedung Utama Kawasan Edukasi dan Digital Kemang (konfirmasi lantai)",
    priceHour: 250000,
    priceDay: 1500000,
    desc: "Ruang rapat pimpinan dengan meja panjang, dua layar TV besar, dan lemari built-in — cocok untuk rapat komite atau rapat strategis.",
    facilities: ["Meja rapat panjang (16 kursi)", "2 unit TV besar", "Sistem video konferensi", "Karpet & akustik premium"],
    img: "images/steering-committee.jpg"
  },

  {
    id: "ignite",
    isExternal: false,
    name: "Ignite Room",
    category: "Ruang Pelatihan",
    capacity: 40,
    area: 90,
    floor: "Gedung Utama Kawasan Edukasi dan Digital Kemang (konfirmasi lantai)",
    priceHour: 300000,
    priceDay: 1800000,
    desc: "Ruang pelatihan besar dengan kursi meja lipat yang fleksibel disusun ulang dan TV presentasi.",
    facilities: ["Kursi meja lipat (movable)", "TV presentasi", "Pencahayaan alami"],
    img: "images/ignite-spark-muse-genesis.jpg"
  },

  {
    id: "recharge-zone",
    isExternal: false,
    name: "Game Room \"Recharge Zone\"",
    category: "Area Santai & Fasilitas",
    capacity: 10,
    area: 35,
    floor: "Gedung Utama Kawasan Edukasi dan Digital Kemang (konfirmasi lantai)",
    priceHour: 100000,
    priceDay: 400000,
    desc: "Ruang santai dengan bean bag dan TV besar — cocok untuk istirahat sejenak di sela-sela pelatihan atau sesi santai tim.",
    facilities: ["Bean bag", "TV besar (screen mirroring)", "AC", "Pencahayaan ambient"],
    img: "images/recharge-zone.jpg"
  },

  // =====================================================================
  // RUANGAN EKSTERNAL (Wisma & Aula)
  // Sumber: Tabel resmi "Tarif Sewa Ruang Penggunaan Waktu Tertentu"
  // Tarif (priceDay/priceWeek), luas (area), dan kode ruang diambil PERSIS dari tabel
  // =====================================================================

  {
    id: "wisma-anggrek-lt1",
    isExternal: true,
    name: "Wisma Anggrek — Lantai 1",
    category: "Wisma / Penginapan",
    roomCode: "W.A 7BR-7KM",
    kondisi: "unRF",
    capacity: 14,
    area: 134.9,
    floor: "Gedung Wisma Anggrek, Lantai 1",
    priceDay: 170000,
    priceWeek: 940000,
    desc: "Unit wisma 7 kamar tidur dengan 7 kamar mandi di lantai 1 Gedung Anggrek — cocok untuk rombongan peserta diklat yang menginap.",
    facilities: ["7 kamar tidur", "7 kamar mandi dalam", "AC per kamar", "Area istirahat bersama"],
    img: "images/wisma-anggrek-lt1.jpg"
  },

  {
    id: "wisma-anggrek-lt2",
    isExternal: true,
    name: "Wisma Anggrek — Lantai 2",
    category: "Wisma / Penginapan",
    roomCode: "W.A 7BR-7KM",
    kondisi: "unRF",
    capacity: 14,
    area: 134.9,
    floor: "Gedung Wisma Anggrek, Lantai 2",
    priceDay: 170000,
    priceWeek: 940000,
    desc: "Unit wisma 7 kamar tidur dengan 7 kamar mandi di lantai 2 Gedung Anggrek — cocok untuk rombongan peserta diklat yang menginap.",
    facilities: ["7 kamar tidur", "7 kamar mandi dalam", "AC per kamar", "Area istirahat bersama"],
    img: "images/wisma-anggrek-lt2.jpg"
  },

  {
    id: "wisma-anggrek-lt3",
    isExternal: true,
    name: "Wisma Anggrek — Lantai 3",
    category: "Wisma / Penginapan",
    roomCode: "W.A 7BR-7KM",
    kondisi: "unRF",
    capacity: 14,
    area: 134.9,
    floor: "Gedung Wisma Anggrek, Lantai 3",
    priceDay: 170000,
    priceWeek: 940000,
    desc: "Unit wisma 7 kamar tidur dengan 7 kamar mandi di lantai 3 Gedung Anggrek — cocok untuk rombongan peserta diklat yang menginap.",
    facilities: ["7 kamar tidur", "7 kamar mandi dalam", "AC per kamar", "Area istirahat bersama"],
    img: "images/wisma-anggrek-lt3.jpg"
  },

  {
    id: "wisma-bougenville",
    isExternal: true,
    name: "Wisma Bougenville",
    category: "Wisma / Penginapan",
    roomCode: "W.B 8BR-4KM",
    kondisi: "unRF",
    capacity: 16,
    area: 196.8,
    floor: "Gedung Wisma Bougenville, Lantai 1–2",
    priceDay: 130000,
    priceWeek: 690000,
    desc: "Unit wisma 8 kamar tidur dengan 4 kamar mandi mencakup lantai 1 dan 2 Gedung Bougenville — cocok untuk rombongan peserta diklat yang menginap.",
    facilities: ["8 kamar tidur", "4 kamar mandi", "AC per kamar", "Area istirahat bersama"],
    img: "images/wisma-bougenville.jpg"
  },

  {
    id: "wisma-cempaka",
    isExternal: true,
    name: "Wisma Cempaka",
    category: "Wisma / Penginapan",
    roomCode: "W.C 6BR-2KM",
    kondisi: "unRF",
    capacity: 12,
    area: 102.1,
    floor: "Gedung Wisma Cempaka, Lantai 2",
    priceDay: 70000,
    priceWeek: 360000,
    desc: "Unit wisma 6 kamar tidur dengan 2 kamar mandi di lantai 2 Gedung Cempaka — cocok untuk rombongan peserta diklat yang menginap.",
    facilities: ["6 kamar tidur", "2 kamar mandi", "AC per kamar", "Area istirahat bersama"],
    img: "images/wisma-cempaka.jpg"
  },

  {
    id: "wisma-dahlia",
    isExternal: true,
    name: "Wisma Dahlia",
    category: "Wisma / Penginapan",
    roomCode: "W.D 8BR-4KM",
    kondisi: "unRF",
    capacity: 16,
    area: 196.8,
    floor: "Gedung Wisma Dahlia, Lantai 1–2",
    priceDay: 130000,
    priceWeek: 690000,
    desc: "Unit wisma 8 kamar tidur dengan 4 kamar mandi mencakup lantai 1 dan 2 Gedung Dahlia — cocok untuk rombongan peserta diklat yang menginap.",
    facilities: ["8 kamar tidur", "4 kamar mandi", "AC per kamar", "Area istirahat bersama"],
    img: "images/wisma-dahlia.jpg"
  },

  {
    id: "wisma-edelweis",
    isExternal: true,
    name: "Wisma Edelweis",
    category: "Wisma / Penginapan",
    roomCode: "W.E 1BR-1KM",
    kondisi: "unRF",
    capacity: 2,
    area: 29.2,
    floor: "Gedung Wisma Edelweis, Lantai 1",
    priceDay: 20000,
    priceWeek: 110000,
    desc: "Unit wisma studio 1 kamar tidur dengan 1 kamar mandi di lantai 1 Gedung Edelweis — cocok untuk tamu perorangan atau pasangan.",
    facilities: ["1 kamar tidur", "1 kamar mandi dalam", "AC", "Area istirahat"],
    img: "images/wisma-edelweis.jpg"
  },

  {
    id: "aula-pendidikan",
    isExternal: true,
    name: "Aula Serbaguna — Kegiatan Pendidikan",
    category: "Aula Serbaguna",
    roomCode: "Aula (Keg. Pendidikan)",
    kondisi: "unRF",
    capacity: 250,
    area: 594,
    floor: "Gedung Serbaguna, Lantai 1",
    priceDay: 980000,
    priceWeek: 5490000,
    desc: "Aula serbaguna berkapasitas besar untuk kegiatan pendidikan/pelatihan — seminar, wisuda, atau acara pendidikan skala besar lainnya.",
    facilities: ["Kapasitas besar", "Sistem tata suara", "Pencahayaan panggung", "Area parkir luas"],
    img: "images/illustration-aula-pendidikan.svg",
    placeholderImg: true
  },

  {
    id: "aula-komersil",
    isExternal: true,
    name: "Aula Serbaguna — Kegiatan Komersil",
    category: "Aula Serbaguna",
    roomCode: "Aula (Keg. Komersil)",
    kondisi: "unRF",
    capacity: 250,
    area: 594,
    floor: "Gedung Serbaguna, Lantai 1",
    priceDay: 4890000,
    desc: "Aula serbaguna dengan tarif khusus untuk kegiatan komersil (mis. resepsi/acara berbayar pihak ketiga). Tarif mingguan tidak tersedia untuk kategori ini.",
    facilities: ["Kapasitas besar", "Sistem tata suara", "Pencahayaan panggung", "Area parkir luas"],
    img: "images/illustration-aula-komersil.svg",
    placeholderImg: true
  },

  {
    id: "r-makan-lounge",
    isExternal: true,
    name: "R. Makan / Lounge",
    category: "Ruang Makan / Lounge",
    roomCode: "R. Makan/ Lounge",
    kondisi: "unRF",
    capacity: 150,
    area: 250,
    floor: "Gedung Cempaka, Lantai 1",
    priceDay: 190000,
    priceWeek: 1040000,
    desc: "Ruang makan sekaligus lounge untuk kebutuhan konsumsi rombongan peserta atau acara santai — dilengkapi area duduk komunal.",
    facilities: ["Area makan komunal", "Pantry", "AC", "Area lounge"],
    img: "images/illustration-r-makan-lounge.svg",
    placeholderImg: true
  }
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
