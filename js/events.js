/**
 * KAWASAN EDUKASI DAN DIGITAL KEMANG
 * Event Handlers
 * 
 * File ini berisi semua event listener menggantikan onclick inline di HTML.
 * Pendekatan ini lebih bersih, lebih aman, dan lebih mudah untuk testing.
 * 
 * Cara menggunakan:
 * 1. Tambahkan class atau data-attribute ke elemen HTML
 * 2. Buat event listener di sini
 * 3. Panggil fungsi yang sudah ada di app.js
 */

/**
 * Inisialisasi semua event listeners
 * Panggil fungsi ini setelah DOM siap
 */
export function initializeEventListeners() {
  // ===== NAVIGASI UTAMA =====
  setupNavigation();
  
  // ===== MOBILE MENU =====
  setupMobileMenu();
  
  // ===== HALAMAN BERANDA =====
  setupHomePageEvents();
  
  // ===== HALAMAN RUANGAN =====
  setupRoomsPageEvents();
  
  // ===== HALAMAN FORM PEMESANAN =====
  setupBookingFormEvents();
  
  // ===== HALAMAN LOGIN =====
  setupLoginPageEvents();
}

// =====================================================================
// NAVIGASI UTAMA
// =====================================================================

function setupNavigation() {
  // Tombol logo di navbar untuk kembali ke beranda
  const logoBtn = document.querySelector('[data-nav-home]');
  if (logoBtn) {
    logoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.go?.('home');
    });
  }

  // Link navigasi desktop
  document.querySelectorAll('[data-nav-link]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.navLink;
      
      if (page === 'history' || page === 'booking') {
        // Halaman yang memerlukan autentikasi
        window.requireAuth?.(page);
      } else {
        window.go?.(page);
      }
    });
  });

  // Tombol "Pesan Ruangan" di navbar
  const bookingBtn = document.querySelector('[data-action="book-room"]');
  if (bookingBtn) {
    bookingBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.go?.('rooms');
    });
  }

  // Portal Admin di top bar
  const adminPortalBtn = document.querySelector('[data-action="admin-portal"]');
  if (adminPortalBtn) {
    adminPortalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.goAdminEntry?.();
    });
  }
}

// =====================================================================
// MOBILE MENU
// =====================================================================

function setupMobileMenu() {
  const toggleBtn = document.querySelector('[data-action="toggle-mobile-menu"]');
  const mobileOverlay = document.getElementById('mobile-overlay');
  
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      window.toggleMobileMenu?.(true);
    });
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', () => {
      window.toggleMobileMenu?.(false);
    });
  }

  // Menu items di mobile menu
  document.querySelectorAll('[data-mobile-nav-link]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.mobileNavLink;
      
      // Tutup menu setelah klik
      window.toggleMobileMenu?.(false);
      
      // Navigate
      if (page === 'history' || page === 'booking') {
        window.requireAuth?.(page);
      } else {
        window.go?.(page);
      }
    });
  });
}

// =====================================================================
// HALAMAN BERANDA (HOME)
// =====================================================================

function setupHomePageEvents() {
  // Tombol "Lihat Semua Ruangan"
  document.querySelectorAll('[data-action="view-all-rooms"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.go?.('rooms');
    });
  });

  // Tombol "Hubungi Kami"
  document.querySelectorAll('[data-action="contact-us"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.go?.('contact');
    });
  });

  // Denah Gedung modal
  const floorPlanBtn = document.querySelector('[data-action="open-floorplan"]');
  if (floorPlanBtn) {
    floorPlanBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.openFloorPlanModal?.();
    });
  }
}

// =====================================================================
// HALAMAN RUANGAN (ROOMS LIST)
// =====================================================================

function setupRoomsPageEvents() {
  // Search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      window.renderRoomsGrid?.();
    });
  }

  // Filter kategori
  const categoryFilter = document.getElementById('filter-category');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      window.renderRoomsGrid?.();
    });
  }

  // Filter kapasitas
  const capacityFilter = document.getElementById('filter-capacity');
  if (capacityFilter) {
    capacityFilter.addEventListener('change', () => {
      window.renderRoomsGrid?.();
    });
  }

  // Tombol "Kembali" di detail ruangan
  const backBtn = document.querySelector('[data-action="back-to-rooms"]');
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.go?.('rooms');
    });
  }
}

// =====================================================================
// HALAMAN FORM PEMESANAN (BOOKING)
// =====================================================================

function setupBookingFormEvents() {
  // Tombol "Kembali" di form pemesanan
  const bookingBackBtn = document.getElementById('booking-back-btn');
  if (bookingBackBtn) {
    bookingBackBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.go?.('rooms');
    });
  }

  // Dropdown "Kategori Instansi"
  const priorityTierSelect = document.getElementById('bk-priority-tier');
  if (priorityTierSelect) {
    priorityTierSelect.addEventListener('change', () => {
      window.onPriorityTierChange?.();
    });
  }

  // Upload file untuk dokumen persuratan
  const attachmentsInput = document.getElementById('bk-attachments');
  if (attachmentsInput) {
    attachmentsInput.addEventListener('change', (e) => {
      window.onAttachmentsSelected?.(e);
    });
  }

  // Form submit
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      window.submitBooking?.(e);
    });
  }

  // Tombol "Lihat Riwayat Pemesanan" di halaman sukses
  document.querySelectorAll('[data-action="view-history"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.requireAuth?.('history');
    });
  });

  // Tombol "Cetak Bukti"
  document.querySelectorAll('[data-action="print-booking"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.printBookingProof?.();
    });
  });
}

// =====================================================================
// HALAMAN LOGIN & REGISTER
// =====================================================================

function setupLoginPageEvents() {
  // Tab "Masuk"
  const tabMasuk = document.getElementById('tab-masuk');
  if (tabMasuk) {
    tabMasuk.addEventListener('click', () => {
      window.setAuthTab?.('masuk');
    });
  }

  // Tab "Daftar"
  const tabDaftar = document.getElementById('tab-daftar');
  if (tabDaftar) {
    tabDaftar.addEventListener('click', () => {
      window.setAuthTab?.('daftar');
    });
  }

  // Form Masuk
  const formMasuk = document.getElementById('form-masuk');
  if (formMasuk) {
    formMasuk.addEventListener('submit', (e) => {
      window.submitLogin?.(e);
    });
  }

  // Form Daftar
  const formDaftar = document.getElementById('form-daftar');
  if (formDaftar) {
    formDaftar.addEventListener('submit', (e) => {
      window.submitRegister?.(e);
    });
  }

  // Link "Masuk sebagai Admin"
  document.querySelectorAll('[data-action="admin-login"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.go?.('admin-login');
    });
  });

  // Form Admin Login
  const formAdminLogin = document.getElementById('form-admin-login');
  if (formAdminLogin) {
    formAdminLogin.addEventListener('submit', (e) => {
      window.submitAdminLogin?.(e);
    });
  }

  // Tombol "Kembali ke situs pemesanan" dari admin login
  document.querySelectorAll('[data-action="back-to-booking"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.go?.('home');
    });
  });
}

// =====================================================================
// ADMIN DASHBOARD
// =====================================================================

export function setupAdminDashboardEvents() {
  // Tab Admin
  document.querySelectorAll('[data-admin-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.adminTab;
      window.setAdminTab?.(tabName);
    });
  });

  // Search di tabel admin
  const adminSearch = document.getElementById('admin-search');
  if (adminSearch) {
    adminSearch.addEventListener('input', () => {
      window.renderAdminTable?.();
    });
  }

  // Filter status
  const filterStatus = document.getElementById('admin-filter-status');
  if (filterStatus) {
    filterStatus.addEventListener('change', () => {
      window.renderAdminTable?.();
    });
  }

  // Filter ruangan
  const filterRoom = document.getElementById('admin-filter-room');
  if (filterRoom) {
    filterRoom.addEventListener('change', () => {
      window.renderAdminTable?.();
    });
  }

  // Filter tanggal
  const filterDate = document.getElementById('admin-filter-date');
  if (filterDate) {
    filterDate.addEventListener('change', () => {
      window.renderAdminTable?.();
    });
  }

  // Tombol reset filter
  document.querySelectorAll('[data-action="reset-filters"]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.resetAdminFilters?.();
    });
  });

  // Tombol export CSV
  document.querySelectorAll('[data-action="export-csv"]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.exportAdminCSV?.();
    });
  });

  // Tombol "Lihat Situs" dari admin
  document.querySelectorAll('[data-action="view-site"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.go?.('home');
    });
  });

  // Tombol "Keluar" dari admin
  document.querySelectorAll('[data-action="logout"]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.logout?.();
    });
  });
}

// =====================================================================
// UTILITY: Menambah event listener untuk element yang di-render dinamis
// =====================================================================

/**
 * Menambah click handler untuk tombol yang di-generate secara dinamis
 * (misal: list ruangan, list pemesanan, dll)
 * 
 * @param {string} selector - CSS selector
 * @param {function} handler - Callback function
 * @param {element} container - Container yang di-listen (default: document)
 */
export function addDynamicEventListener(selector, handler, container = document) {
  container.addEventListener('click', (e) => {
    const el = e.target.closest(selector);
    if (el) {
      handler(e, el);
    }
  });
}

/**
 * Menambah change handler untuk form input yang di-generate dinamis
 * 
 * @param {string} selector - CSS selector
 * @param {function} handler - Callback function
 * @param {element} container - Container yang di-listen (default: document)
 */
export function addDynamicChangeListener(selector, handler, container = document) {
  container.addEventListener('change', (e) => {
    const el = e.target.closest(selector);
    if (el) {
      handler(e, el);
    }
  });
}
