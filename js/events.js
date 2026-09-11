/**
 * KAWASAN EDUKASI DAN DIGITAL KEMANG
 * Logika Aplikasi Utama
 *
 * Dipindahkan dari inline <script> di index.html. Dimuat sebagai ES module
 * (<script type="module" src="app.js">) — karena itu semua fungsi yang
 * dipanggil lewat atribut onclick/onchange/onsubmit di HTML WAJIB
 * di-expose eksplisit ke `window` (lihat blok paling bawah file ini),
 * karena isi module TIDAK otomatis jadi variabel global seperti <script>
 * biasa.
 */
import {
  API_URL, GOOGLE_CLIENT_ID,
  LS_USER, LS_ADMIN_TOKEN, LS_USER_TOKEN,
  STATUS_ORDER, STATUS_LABELS, STATUS_TIDAK_MENGUNCI_RUANGAN as STATUS_TIDAK_MENGUNCI_RUANGAN_, statusLabel,
  PRIORITY_TIER_LABELS, priorityTierLabel
} from './config.js';
import { ROOMS, findRoom, FEATURED_IDS } from './rooms.js';

function printBookingProof(){
  // Isi catatan waktu cetak setiap kali tombol "Cetak Bukti" ditekan,
  // supaya dokumen mencantumkan kapan persis bukti ini dicetak.
  document.querySelectorAll('.print-timestamp').forEach(el=>{
    el.textContent = 'Dicetak pada: ' + new Date().toLocaleString('id-ID', { dateStyle:'full', timeStyle:'short' });
  });
  window.print();
}

/* ===================== BACKEND CONFIG ===================== */
// Tempel URL Web App hasil deploy Google Apps Script (lihat SETUP.md).
// Contoh: https://script.google.com/macros/s/AKfycb.../exec

// Sama persis dengan GOOGLE_CLIENT_ID di Code.gs. Buat lewat Google Cloud
// Console > Credentials > OAuth client ID > Web application. Tambahkan
// domain hosting situs ini ke "Authorized JavaScript origins".

async function apiGet(action, params){
  const qs = new URLSearchParams(Object.assign({ action }, params || {})).toString();
  const res = await fetch(`${API_URL}?${qs}`);
  if(!res.ok) throw new Error('Gagal menghubungi server (' + res.status + ').');
  return res.json();
}
async function apiPost(action, payload){
  // Dikirim sebagai text/plain agar tidak memicu CORS preflight yang
  // tidak didukung Apps Script Web App.
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(Object.assign({ action }, payload || {}))
  });
  return res.json();
}

/* ===================== LOCAL SESSION (bukan penyimpanan data) ===================== */
// Hanya menyimpan identitas sesi di perangkat ini (nama/email yang sedang
// login + token admin). Data pemesanan sesungguhnya SELALU diambil dari
// server (Google Sheets) lewat API_URL, bukan dari sini.

function getUser(){ try{ return JSON.parse(localStorage.getItem(LS_USER)); }catch(e){ return null; } }
function setUser(u){ localStorage.setItem(LS_USER, JSON.stringify(u)); }
function clearUser(){ localStorage.removeItem(LS_USER); localStorage.removeItem(LS_ADMIN_TOKEN); localStorage.removeItem(LS_USER_TOKEN); }
function getAdminToken(){ return localStorage.getItem(LS_ADMIN_TOKEN) || ''; }
function setAdminToken(t){ localStorage.setItem(LS_ADMIN_TOKEN, t); }
function getUserToken(){ return localStorage.getItem(LS_USER_TOKEN) || ''; }
function setUserToken(t){ localStorage.setItem(LS_USER_TOKEN, t); }

function isAdmin(){ const u = getUser(); return !!(u && u.role === 'admin' && getAdminToken()); }

/* ===================== BOOKINGS CACHE ===================== */
// bookingsCache diisi lewat refreshBookings() dan dibaca oleh semua
// fungsi render agar tetap sinkron (bukan lagi localStorage).
let bookingsCache = [];

async function refreshBookings(scope){
  // scope === 'public': PAKSA ambil data booking SELURUH situs, terlepas
  // dari status login. Wajib dipakai oleh kalender ketersediaan & cek
  // bentrok sebelum submit (lihat go('detail',...) di bawah) — kalau
  // tidak, begitu user login, data yang di-cache jadi "milik saya saja"
  // (lihat handleGetBookings di Code.gs), sehingga kalender salah
  // menampilkan tanggal orang lain sebagai kosong.
  // Tanpa scope (default): ikut identitas yang sedang login — dipakai
  // Riwayat Pemesanan (punya sendiri) dan Dashboard Admin (semua data).
  try{
    const params = {};
    if(scope !== 'public'){
      if(isAdmin()) params.token = getAdminToken();
      else {
        const u = getUser();
        if(u && u.isInternal && getUserToken()) params.userToken = getUserToken();
        else if(u && u.email) params.email = u.email;
      }
    }
    const data = await apiGet('bookings', params);
    if(data.ok) bookingsCache = data.bookings;
    return bookingsCache;
  }catch(err){
    console.error(err);
    toast('Gagal memuat data pemesanan dari server. Periksa koneksi Anda.', 'error');
    return bookingsCache;
  }
}
// Fungsi lama getBookings() dipertahankan sebagai alias sinkron ke cache
// supaya kode render yang sudah ada tidak perlu ditulis ulang total.
function getBookings(){ return bookingsCache; }

/* ===================== DENAH GEDUNG (Beranda — Hero) ===================== */
// Klik thumbnail denah di Hero membuka gambar ukuran penuh dalam modal.
function openFloorPlanModal(){
  const root = document.getElementById('floorplan-modal-root');
  root.innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this) closeFloorPlanModal()">
      <div class="modal-box" style="max-width:900px;">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
          <p class="font-display text-lg font-bold navy-text">Denah Gedung</p>
          <button onclick="closeFloorPlanModal()" class="icon-btn-sm flex-shrink-0"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>
        <div class="p-5">
          <img src="images/denah-gedung.jpg" alt="Denah Gedung Kawasan Edukasi dan Digital Kemang" class="w-full rounded-lg border border-slate-200">
        </div>
      </div>
    </div>`;
  lucide.createIcons();
}
function closeFloorPlanModal(){
  document.getElementById('floorplan-modal-root').innerHTML = '';
}

/* ===================== STATUS (4 TAHAP + 2 STATUS AKHIR) ===================== */
// Cermin persis dari STATUS_* / STATUS_LABELS_ di Code.gs & Notifications.gs —
// bila salah satu diubah, ubah juga yang lain.

// Cermin dari PRIORITY_TIER_LABELS_ di Code.gs — murni label untuk
// ditampilkan ke admin sebagai konteks, tidak memengaruhi logika apa pun.

// Meratakan getBookings() menjadi daftar ITEM per-ruangan (dengan status
// grupnya masing-masing) — dipakai untuk kalender ketersediaan & cek bentrok,
// yang selalu bekerja per-ruangan-per-tanggal, terlepas dari bentuk data asli
// (grup+items untuk admin/milik-sendiri, atau sudah rata untuk tampilan publik).
function flattenBookingItems(list){
  const out = [];
  (list || []).forEach(g => {
    if(Array.isArray(g.items)){
      g.items.forEach(it => out.push(Object.assign({}, it, { status: g.status, groupId: g.groupId })));
    } else if(g.roomId){
      out.push(g); // sudah rata (tampilan publik dari server)
    }
  });
  return out;
}

/* ===================== TOASTS ===================== */
function toast(message, type){
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = 'toast' + (type === 'error' ? ' error' : '');
  el.innerHTML = `
    <i data-lucide="${type === 'error' ? 'alert-circle' : 'check-circle-2'}" class="w-4.5 h-4.5 flex-shrink-0 mt-0.5" style="color:${type === 'error' ? 'var(--danger)' : 'var(--ok)'}"></i>
    <span class="text-sm text-slate-700">${message}</span>
  `;
  container.appendChild(el);
  lucide.createIcons();
  setTimeout(() => {
    el.style.transition = 'opacity .3s ease, transform .3s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    setTimeout(() => el.remove(), 300);
  }, 3800);
}

/* ===================== AUTH (DEMO) ===================== */
let pendingAction = null; // {type:'history'} or {type:'booking', roomId, date}

function requireAuth(destination, payload){
  const user = getUser();
  if(user){
    if(destination === 'history'){ go('history'); return; }
    if(destination === 'booking'){ openBookingForm(payload.roomId, payload.date); return; }
    return;
  }
  pendingAction = { type: destination, ...payload };
  go('login');
  toast('Silakan masuk terlebih dahulu untuk melanjutkan.', 'error');
}

function renderAuthArea(){
  const user = getUser();
  const desktop = document.getElementById('nav-auth-area');
  const mobile = document.getElementById('mobile-auth-area');
  if(user && user.role === 'admin'){
    const html = `
      <button onclick="go('admin')" class="text-sm font-semibold text-[var(--blue-accent)] hover:underline flex items-center gap-1.5"><i data-lucide="layout-dashboard" class="w-3.5 h-3.5"></i>Dashboard Admin</button>
      <button onclick="logout()" class="text-xs font-medium text-slate-400 hover:text-[var(--danger)]">Keluar</button>`;
    desktop.innerHTML = html;
    mobile.innerHTML = `<button onclick="go('admin')" class="w-full btn-primary py-2.5 rounded-md font-semibold text-sm mb-2">Dashboard Admin</button><button onclick="logout()" class="text-sm font-medium text-[var(--danger)]">Keluar</button>`;
    lucide.createIcons();
  } else if(user){
    const html = `
      <div class="flex items-center gap-2 text-sm font-medium navy-text">
        <div class="w-7 h-7 rounded-full navy-bg text-white flex items-center justify-center text-xs font-bold">${(user.name||'U').charAt(0).toUpperCase()}</div>
        <span class="max-w-[110px] truncate">${user.name}</span>
      </div>
      <button onclick="logout()" class="text-xs font-medium text-slate-400 hover:text-[var(--danger)]">Keluar</button>`;
    desktop.innerHTML = html;
    mobile.innerHTML = `<div class="flex items-center gap-2 text-sm font-semibold navy-text mb-3"><div class="w-8 h-8 rounded-full navy-bg text-white flex items-center justify-center text-xs font-bold">${(user.name||'U').charAt(0).toUpperCase()}</div>${user.name}</div><button onclick="logout()" class="text-sm font-medium text-[var(--danger)]">Keluar</button>`;
  } else {
    desktop.innerHTML = `<button onclick="go('login')" class="text-sm font-medium text-slate-600 hover:text-navy-900">Masuk</button>`;
    mobile.innerHTML = `<button onclick="go('login');toggleMobileMenu(false);" class="w-full btn-primary py-2.5 rounded-md font-semibold text-sm">Masuk / Daftar</button>`;
  }
}

function logout(){
  clearUser();
  renderAuthArea();
  try{ if(window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect(); }catch(e){}
  toast('Anda telah keluar dari akun.');
  go('home');
}

/* ===================== GOOGLE SIGN-IN (khusus @bi.go.id) ===================== */
function initGoogleSignIn(){
  if(!window.google || !google.accounts || !google.accounts.id) return; // library belum siap
  if(GOOGLE_CLIENT_ID.indexOf('PASTE_GOOGLE') !== -1) return; // belum dikonfigurasi

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential,
    hosted_domain: 'bi.go.id',
    auto_select: false
  });
  const target = document.getElementById('google-signin-btn');
  if(target){
    target.innerHTML = '';
    google.accounts.id.renderButton(target, { theme: 'outline', size: 'large', width: 320, text: 'signin_with', locale: 'id' });
  }
}

async function handleGoogleCredential(response){
  try{
    const data = await apiPost('googleLogin', { credential: response.credential });
    if(!data.ok){
      toast(data.error || 'Gagal masuk dengan akun Google.', 'error');
      return;
    }
    setUserToken(data.token);
    setUser({ name: data.user.name, email: data.user.email, org: data.user.org, role: 'user', isInternal: true });
    renderAuthArea();
    toast(`Selamat datang, ${data.user.name}.`);
    resolvePendingOrGo('home');
  }catch(err){
    toast('Gagal menghubungi server. Periksa koneksi Anda.', 'error');
  }
}

function setFieldError(inputId, message){
  const input = document.getElementById(inputId);
  const err = input.parentElement.querySelector('.field-error');
  if(message){ input.classList.add('input-error'); if(err) err.textContent = message; }
  else { input.classList.remove('input-error'); if(err) err.textContent = ''; }
}

async function submitLogin(e){
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  let ok = true;
  if(!email || !email.includes('@')){ setFieldError('login-email','Masukkan alamat email yang valid.'); ok = false; } else setFieldError('login-email', null);
  if(!password || password.length < 4){ setFieldError('login-password','Kata sandi minimal 4 karakter.'); ok = false; } else setFieldError('login-password', null);
  if(!ok) return;
  if(email.toLowerCase().endsWith('@bi.go.id')){
    toast('Email @bi.go.id terdeteksi — silakan gunakan tombol "Masuk dengan Google" di atas untuk verifikasi otomatis.', 'error');
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true; submitBtn.textContent = 'Memproses...';
  try{
    // Catatan: form ini mengidentifikasi tamu eksternal (untuk mengaitkan
    // riwayat pemesanan lewat email), BUKAN autentikasi kata sandi yang
    // diverifikasi server. Staf @bi.go.id memakai Google Sign-In di atas.
    const data = await apiPost('registerUser', { name: email.split('@')[0].replace(/[._]/g,' ').replace(/\b\w/g, c => c.toUpperCase()), email });
    const name = data.user ? data.user.name : email.split('@')[0];
    setUser({ name, email, org: data.user ? data.user.org : '', role: 'user', isInternal: false });
    renderAuthArea();
    toast(`Selamat datang kembali, ${name}.`);
    resolvePendingOrGo('home');
  }catch(err){
    toast('Gagal menghubungi server. Periksa koneksi Anda.', 'error');
  }finally{
    submitBtn.disabled = false; submitBtn.textContent = 'Masuk sebagai Tamu';
  }
}

async function submitRegister(e){
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const org = document.getElementById('reg-org').value.trim();
  const password = document.getElementById('reg-password').value;
  let ok = true;
  if(!name){ setFieldError('reg-name','Nama lengkap wajib diisi.'); ok = false; } else setFieldError('reg-name', null);
  if(!email || !email.includes('@')){ setFieldError('reg-email','Masukkan alamat email yang valid.'); ok = false; } else setFieldError('reg-email', null);
  if(!password || password.length < 8){ setFieldError('reg-password','Kata sandi minimal 8 karakter.'); ok = false; } else setFieldError('reg-password', null);
  if(!ok) return;
  if(email.toLowerCase().endsWith('@bi.go.id')){
    toast('Email @bi.go.id terdeteksi — silakan gunakan tombol "Masuk dengan Google" di tab Masuk untuk verifikasi otomatis.', 'error');
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true; submitBtn.textContent = 'Memproses...';
  try{
    const data = await apiPost('registerUser', { name, email, org });
    setUser({ name, email, org, role: 'user', isInternal: false });
    renderAuthArea();
    toast(`Akun berhasil dibuat. Selamat datang, ${name}.`);
    resolvePendingOrGo('home');
  }catch(err){
    toast('Gagal menghubungi server. Periksa koneksi Anda.', 'error');
  }finally{
    submitBtn.disabled = false; submitBtn.textContent = 'Buat Akun';
  }
}

async function submitAdminLogin(e){
  e.preventDefault();
  const email = document.getElementById('admin-login-email').value.trim();
  const password = document.getElementById('admin-login-password').value;
  let ok = true;
  if(!email || !email.includes('@')){ setFieldError('admin-login-email','Masukkan alamat email yang valid.'); ok = false; } else setFieldError('admin-login-email', null);
  if(!password){ setFieldError('admin-login-password','Kata sandi wajib diisi.'); ok = false; } else setFieldError('admin-login-password', null);
  if(!ok) return;

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true; submitBtn.textContent = 'Memverifikasi...';
  try{
    const data = await apiPost('adminLogin', { email, password });
    if(!data.ok){
      setFieldError('admin-login-password','Email atau kata sandi admin tidak sesuai.');
      toast(data.error || 'Kredensial admin tidak valid.', 'error');
      return;
    }
    setAdminToken(data.token);
    setUser({ name: 'Administrator', email, org: 'Pengelola Kawasan Edukasi dan Digital Kemang', role: 'admin' });
    renderAuthArea();
    toast('Selamat datang, Administrator.');
    go('admin');
  }catch(err){
    toast('Gagal menghubungi server. Periksa koneksi Anda.', 'error');
  }finally{
    submitBtn.disabled = false; submitBtn.textContent = 'Masuk sebagai Admin';
  }
}

function goAdminEntry(){
  if(isAdmin()){ go('admin'); return; }
  go('admin-login');
}

function resolvePendingOrGo(fallback){
  if(pendingAction){
    const p = pendingAction; pendingAction = null;
    if(p.type === 'history'){ go('history'); return; }
    if(p.type === 'booking'){ openBookingForm(p.roomId, p.date); return; }
  }
  go(fallback);
}

function setAuthTab(tab){
  const masukTab = document.getElementById('tab-masuk');
  const daftarTab = document.getElementById('tab-daftar');
  const masukForm = document.getElementById('form-masuk');
  const daftarForm = document.getElementById('form-daftar');
  const heading = document.getElementById('auth-heading');
  const subtext = document.getElementById('auth-subtext');
  if(tab === 'masuk'){
    masukTab.style.background = 'var(--navy-900)'; masukTab.style.color = '#fff';
    daftarTab.style.background = '#fff'; daftarTab.style.color = 'var(--slate-600)';
    masukForm.classList.remove('hidden'); daftarForm.classList.add('hidden');
    heading.textContent = 'Masuk ke akun Anda';
    subtext.textContent = 'Akun diperlukan untuk mengirim pemesanan, memantau status konfirmasi, dan melihat riwayat penggunaan ruangan di Kawasan Edukasi dan Digital Kemang.';
  } else {
    daftarTab.style.background = 'var(--navy-900)'; daftarTab.style.color = '#fff';
    masukTab.style.background = '#fff'; masukTab.style.color = 'var(--slate-600)';
    daftarForm.classList.remove('hidden'); masukForm.classList.add('hidden');
    heading.textContent = 'Buat akun baru';
    subtext.textContent = 'Daftarkan diri Anda untuk mulai mengajukan pemesanan ruang dan fasilitas di Kawasan Edukasi dan Digital Kemang.';
  }
}

/* ===================== MOBILE MENU ===================== */
function toggleMobileMenu(open){
  document.getElementById('mobile-menu').classList.toggle('open', open);
  document.getElementById('mobile-overlay').classList.toggle('hidden', !open);
}

/* ===================== ROUTER ===================== */
function go(page, roomId){
  if(page === 'admin' && !isAdmin()){
    toast('Silakan masuk sebagai admin untuk mengakses dashboard.', 'error');
    page = 'admin-login';
  }
  closeBookingModal();
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.getElementById('page-' + page).classList.add('fade-in');

  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const navMap = {home:'home', rooms:'rooms', detail:'rooms', contact:'contact', history:'history', booking:'rooms', success:'rooms', login:null, 'admin-login':null, admin:null};
  const target = document.querySelector(`.nav-link[data-nav="${navMap[page]}"]`);
  if(target) target.classList.add('active');

  if(page === 'login') initGoogleSignIn();
  if(page === 'home') { refreshBookings('public').then(renderHomeCalendarWidget); }
  if(page === 'detail' && roomId) { renderDetail(roomId); refreshBookings('public').then(renderCalendar); }
  if(page === 'history') { document.getElementById('history-list').innerHTML = historySkeletonHTML(); refreshBookings().then(renderHistory); }
  if(page === 'admin') { refreshBookings().then(renderAdmin); }
  window.scrollTo({top:0, behavior:'smooth'});
  lucide.createIcons();
}
function historySkeletonHTML(){
  return Array.from({length:3}).map(() => `<div class="skeleton h-24 rounded-xl"></div>`).join('');
}

/* ===================== HELPERS ===================== */
function priceFmt(n){ return 'Rp ' + n.toLocaleString('id-ID'); }
function escapeHtml(str){
  // Mencegah XSS: data dari formulir pemesanan (nama, instansi, keperluan,
  // catatan) bisa diisi bebas oleh siapa saja tanpa login, lalu ditampilkan
  // lagi di dashboard admin. Tanpa escape ini, isian berisi tag HTML/script
  // bisa dieksekusi di browser admin.
  return String(str == null ? '' : str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function pad(n){ return n.toString().padStart(2,'0'); }
function dateKey(y,m,d){ return `${y}-${pad(m+1)}-${pad(d)}`; }
function formatDateLong(dateStr){
  const [y,m,d] = dateStr.split('-').map(Number);
  const dayNames = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const dt = new Date(y, m-1, d);
  return `${dayNames[dt.getDay()]}, ${d} ${monthNames[m-1]} ${y}`;
}

/* ===================== ROOM CARDS ===================== */
function roomCard(room){
  return `
  <div class="group cursor-pointer bg-white rounded-xl overflow-hidden card-shadow border border-slate-100 transition" onclick="go('detail','${room.id}')">
    <div class="overflow-hidden h-56 bg-slate-100 relative">
      <img src="${room.img}" alt="${room.name}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
      ${room.placeholderImg ? `<span class="absolute top-2 right-2 text-[10px] font-semibold bg-white/90 text-slate-600 px-2 py-1 rounded-full shadow-sm">Foto Sementara</span>` : ''}
    </div>
    <div class="p-5">
      <p class="text-xs font-semibold text-[var(--blue-accent)] uppercase tracking-wide mb-1">${room.category}</p>
      <h3 class="font-display text-lg font-bold navy-text mb-2">${room.name}</h3>
      <div class="flex items-center gap-4 text-xs text-slate-500 mb-3">
        <span class="flex items-center gap-1"><i data-lucide="users" class="w-3.5 h-3.5"></i>${room.capacity} orang</span>
        <span class="flex items-center gap-1"><i data-lucide="ruler" class="w-3.5 h-3.5"></i>${room.area} m²</span>
      </div>
      ${room.isExternal
        ? `<p class="font-display text-base font-bold navy-text">${priceFmt(room.priceDay)} <span class="text-xs font-sans font-normal text-slate-500">/ hari</span></p>`
        : `<span class="inline-flex items-center gap-1 text-xs font-semibold text-[var(--navy-900)] bg-[#eef4ff] px-2.5 py-1 rounded-full"><i data-lucide="building-2" class="w-3 h-3"></i>Fasilitas Internal BI</span>`}
    </div>
  </div>`;
}
function renderFeatured(){
  document.getElementById('featured-grid').innerHTML = ROOMS.filter(r => FEATURED_IDS.includes(r.id)).map(roomCard).join('');
  lucide.createIcons();
}

/* ===================== WIDGET KALENDER KETERSEDIAAN (Beranda) ===================== */
// Ringkasan 7 hari ke depan untuk ruangan unggulan (FEATURED_IDS), dipakai
// di beranda saja — bukan pengganti kalender penuh per-ruangan yang sudah
// ada di halaman detail (lihat renderCalendar). Sengaja dibatasi ke
// FEATURED_IDS + 7 hari supaya ringan dimuat di halaman pertama.
// Memakai bookingsCache yang sama dengan cek-bentrok (lihat refreshBookings),
// jadi tidak menambah beban request baru ke server.
function isDateBookedForRoom(roomId, dateStr, bookings){
  return (bookings || []).some(b => {
    if(b.roomId !== roomId) return false;
    const end = b.endDate || b.date;
    return dateStr >= b.date && dateStr <= end;
  });
}

function renderHomeCalendarWidget(){
  const container = document.getElementById('home-calendar-widget');
  if(!container) return;

  const dayNamesShort = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
  const today = new Date();
  const days = Array.from({length:7}).map((_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    return { key: dateKey(d.getFullYear(), d.getMonth(), d.getDate()), label: dayNamesShort[d.getDay()], date: d.getDate() };
  });

  const rooms = ROOMS.filter(r => FEATURED_IDS.includes(r.id));
  const bookings = getBookings() || [];

  const headerCells = days.map(d =>
    `<div class="text-center py-1.5"><p class="text-[10px] uppercase tracking-wide text-slate-400">${d.label}</p><p class="text-xs font-semibold navy-text">${d.date}</p></div>`
  ).join('');

  const roomRows = rooms.map(room => {
    const dayCells = days.map(d => {
      const booked = isDateBookedForRoom(room.id, d.key, bookings);
      return `<div class="h-8 rounded-md ${booked ? 'bg-red-50 border border-red-200' : 'bg-slate-50 border border-slate-200'}"></div>`;
    }).join('');
    return `<div class="text-sm font-medium navy-text truncate pr-3 flex items-center">${escapeHtml(room.name)}</div>${dayCells}`;
  }).join('');

  container.innerHTML = `
    <div class="flex items-center justify-between mb-5 flex-wrap gap-2">
      <div>
        <h3 class="font-display text-lg font-bold navy-text">Ketersediaan 7 hari ke depan</h3>
        <p class="text-xs text-slate-500 mt-0.5">Ruangan unggulan · diperbarui real-time</p>
      </div>
      <button onclick="go('rooms')" class="text-xs font-semibold text-[var(--blue-accent)] hover:underline flex items-center gap-1">Lihat kalender lengkap per ruangan <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></button>
    </div>
    <div class="grid gap-1.5" style="grid-template-columns: 160px repeat(7, minmax(0,1fr));">
      <div></div>${headerCells}
      ${roomRows}
    </div>
    <div class="flex items-center gap-5 mt-4 text-xs text-slate-500">
      <span class="flex items-center gap-1.5"><span class="inline-block w-3 h-3 rounded bg-red-50 border border-red-200"></span>Terpesan</span>
      <span class="flex items-center gap-1.5"><span class="inline-block w-3 h-3 rounded bg-slate-50 border border-slate-200"></span>Tersedia</span>
    </div>`;
  lucide.createIcons();
}
function renderRoomsGrid(){
  const q = (document.getElementById('search-input').value || '').toLowerCase();
  const cat = document.getElementById('filter-category').value;
  const cap = document.getElementById('filter-capacity').value;
  let list = ROOMS.filter(r => {
    const matchQ = !q || r.name.toLowerCase().includes(q) || r.facilities.join(' ').toLowerCase().includes(q);
    const matchCat = !cat || r.category === cat;
    const matchCap = !cap || r.capacity <= parseInt(cap);
    return matchQ && matchCat && matchCap;
  });
  const grid = document.getElementById('rooms-grid');
  grid.innerHTML = list.length ? list.map(roomCard).join('') :
    `<div class="col-span-3 text-center py-16 text-slate-400">Tidak ada ruangan yang cocok dengan pencarian.</div>`;
  lucide.createIcons();
}

/* ===================== CALENDAR (DETAIL PAGE) ===================== */
function realBookedDays(roomId, y, m){
  const bookings = flattenBookingItems(getBookings()).filter(b => b.roomId === roomId && STATUS_TIDAK_MENGUNCI_RUANGAN_.indexOf(b.status) === -1);
  const booked = new Set();
  bookings.forEach(b => {
    const [by,bm,bd] = b.date.split('-').map(Number);
    if(by === y && (bm-1) === m) booked.add(bd);
  });
  return booked;
}

let calState = { room: null, year: 2026, month: 7, selectedDay: null };

function renderCalendar(){
  const { room, year, month } = calState;
  const booked = realBookedDays(room.id, year, month);
  const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month+1, 0).getDate();

  const today = new Date(); today.setHours(0,0,0,0);

  let cells = '';
  for(let i=0;i<offset;i++) cells += `<div class="cal-day cal-empty"></div>`;
  for(let d=1; d<=daysInMonth; d++){
    const thisDate = new Date(year, month, d);
    const isPast = thisDate < today;
    const isBooked = booked.has(d);
    let cls = 'cal-day ';
    let attr = '';
    if(isPast){ cls += 'cal-past'; }
    else if(isBooked){ cls += 'cal-booked'; }
    else { cls += 'cal-available'; attr = `onclick="selectDay(${d})"`; }
    if(calState.selectedDay === d) cls += ' cal-selected';
    cells += `<div class="${cls}" ${attr} id="cal-cell-${d}">${d}</div>`;
  }

  document.getElementById('cal-month-label').textContent = `${monthNames[month]} ${year}`;
  document.getElementById('cal-grid').innerHTML = cells;
  updateBookingCta();
  lucide.createIcons();
}
function shiftMonth(delta){
  calState.month += delta;
  if(calState.month > 11){ calState.month = 0; calState.year++; }
  if(calState.month < 0){ calState.month = 11; calState.year--; }
  calState.selectedDay = null;
  renderCalendar();
}
function selectDay(d){
  calState.selectedDay = d;
  renderCalendar();
}
function updateBookingCta(){
  const btn = document.getElementById('detail-booking-btn');
  const hint = document.getElementById('detail-booking-hint');
  if(!btn) return;
  if(calState.selectedDay){
    btn.disabled = false;
    hint.textContent = `Tanggal dipilih: ${formatDateLong(dateKey(calState.year, calState.month, calState.selectedDay))}`;
  } else {
    btn.disabled = true;
    hint.textContent = 'Pilih tanggal pada kalender untuk melanjutkan.';
  }
}

/* ===================== DETAIL PAGE ===================== */
function renderDetail(roomId){
  const room = findRoom(roomId);
  if(!room) return;
  const today = new Date();
  calState = { room, year: today.getFullYear(), month: today.getMonth(), selectedDay: null };

  const gallery = room.gallery && room.gallery.length ? room.gallery : [room.img];

  document.getElementById('detail-content').innerHTML = `
    <div class="lg:col-span-2 fade-in">
      <div class="rounded-xl overflow-hidden h-96 mb-4 bg-slate-100 relative">
        <img src="${room.img}" class="w-full h-full object-cover" alt="${room.name}">
        ${room.placeholderImg ? `<span class="absolute top-3 right-3 text-xs font-semibold bg-white/90 text-slate-600 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5"><i data-lucide="info" class="w-3.5 h-3.5"></i>Foto Sementara — Menunggu Foto Asli</span>` : ''}
      </div>
      <div class="flex gap-3 mb-8">
        ${gallery.map(g => `<div class="w-24 h-16 rounded-md overflow-hidden border border-slate-200"><img src="${g}" class="w-full h-full object-cover"></div>`).join('')}
      </div>

      <p class="text-xs font-semibold text-[var(--blue-accent)] uppercase tracking-wide mb-2">${room.category}</p>
      <h1 class="font-display text-3xl font-bold navy-text mb-3">${room.name}</h1>
      <p class="text-sm leading-relaxed mb-8">${room.desc}</p>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 border-y border-slate-200 py-6 mb-10">
        <div><p class="text-xs uppercase tracking-wide text-slate-400 mb-1">Kapasitas</p><p class="font-semibold navy-text">${room.capacity} orang</p></div>
        <div><p class="text-xs uppercase tracking-wide text-slate-400 mb-1">Luas</p><p class="font-semibold navy-text">${room.area} m²</p></div>
        <div><p class="text-xs uppercase tracking-wide text-slate-400 mb-1">Lokasi</p><p class="font-semibold navy-text">${room.floor}</p></div>
        <div><p class="text-xs uppercase tracking-wide text-slate-400 mb-1">${room.isExternal ? 'Tarif Harian' : 'Status'}</p><p class="font-semibold navy-text">${room.isExternal ? priceFmt(room.priceDay) : 'Fasilitas Internal (gratis)'}</p></div>
      </div>
      <h3 class="font-display text-xl font-bold navy-text mb-4">Fasilitas</h3>
      <div class="grid md:grid-cols-2 gap-x-8 gap-y-3">
        ${room.facilities.map(f => `<div class="flex items-center gap-2 text-sm"><i data-lucide="check" class="w-4 h-4" style="color:var(--blue-accent)"></i>${f}</div>`).join('')}
      </div>
    </div>

    <div class="fade-in">
      <div class="border border-slate-200 rounded-xl p-6 sticky top-24 card-shadow">
        ${room.isExternal ? `
        <p class="text-xs uppercase tracking-wide text-slate-400 mb-1">Mulai dari</p>
        <p class="font-display text-3xl font-bold navy-text mb-6">${priceFmt(room.priceDay)} <span class="text-sm font-sans font-normal text-slate-500">/ hari</span></p>` : `
        <p class="text-xs uppercase tracking-wide text-slate-400 mb-1">Status</p>
        <p class="font-display text-2xl font-bold navy-text mb-6">Fasilitas Internal <span class="text-sm font-sans font-normal text-slate-500">(tanpa biaya)</span></p>`}

        <div class="flex items-center justify-between mb-3">
          <button onclick="shiftMonth(-1)" class="w-8 h-8 rounded-md border border-slate-200 flex items-center justify-center hover:bg-slate-50"><i data-lucide="chevron-left" class="w-4 h-4"></i></button>
          <span id="cal-month-label" class="font-semibold text-sm navy-text"></span>
          <button onclick="shiftMonth(1)" class="w-8 h-8 rounded-md border border-slate-200 flex items-center justify-center hover:bg-slate-50"><i data-lucide="chevron-right" class="w-4 h-4"></i></button>
        </div>
        <div class="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-400 mb-1">
          <span>SEN</span><span>SEL</span><span>RAB</span><span>KAM</span><span>JUM</span><span>SAB</span><span>MIN</span>
        </div>
        <div id="cal-grid" class="grid grid-cols-7 gap-1 mb-4"></div>

        <div class="flex items-center gap-4 text-xs mb-5">
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm inline-block" style="background:#eef2f7"></span>Tersedia</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm inline-block bg-[#fbe3e6]"></span>Terpesan</span>
        </div>
        <p class="flex items-center gap-2 text-sm mb-4"><i data-lucide="users" class="w-4 h-4" style="color:var(--navy-900)"></i>Maksimal ${room.capacity} peserta</p>
        <p id="detail-booking-hint" class="text-xs text-slate-400 mb-3"></p>
        <button id="detail-booking-btn" onclick="handleDetailBookingClick()" disabled class="btn-primary w-full py-3 rounded-md font-semibold text-sm">Lanjut ke Pemesanan</button>
      </div>
    </div>
  `;
  renderCalendar();
  lucide.createIcons();
}
function handleDetailBookingClick(){
  if(!calState.selectedDay) return;
  const dk = dateKey(calState.year, calState.month, calState.selectedDay);
  requireAuth('booking', { roomId: calState.room.id, date: dk });
}

/* ===================== BOOKING FORM (KERANJANG MULTI-RUANGAN) ===================== */
// TAHAP 2: 1 pemesanan (BookingGroup) bisa berisi BEBERAPA ruangan
// (BookingItem), masing-masing dengan tanggal/jam sendiri. bookingCart
// menyimpan item-item itu di memori sampai dikirim lewat submitBooking().
// Menambah ruangan baru (openBookingForm) MENAMBAHKAN ke keranjang yang
// sudah ada, bukan mereset — supaya tombol "Tambah Ruangan Lain" ->
// go('rooms') -> pilih ruangan lain -> kembali otomatis ke halaman
// pemesanan dengan ruangan sebelumnya tetap ada.
let bookingCart = [];
let groupFieldsInitialized = false;

function timeToMinutes(t){ const [h,m] = (t||'0:0').split(':').map(Number); return h*60+m; }

// Poin 9: banner info (bukan peringatan mengintimidasi) muncul untuk siapa
// pun yang TIDAK memilih tier tertinggi (PIDI). Murni informasi — tidak
// mengunci apa pun di form.
function onPriorityTierChange(){
  const sel = document.getElementById('bk-priority-tier');
  const banner = document.getElementById('priority-info-banner');
  if(!sel || !banner) return;
  banner.classList.toggle('hidden', sel.value === 'pidi');
  lucide.createIcons();
}

function openBookingForm(roomId, date){
  const room = findRoom(roomId);
  if(!room) return;
  const item = {
    cartId: 'c' + Date.now() + '_' + Math.floor(Math.random()*1000),
    roomId,
    date,
    tariffType: room.isExternal ? 'harian' : 'jam',
    startTime: '09:00',
    endTime: '11:00',
    participants: '' // diisi per ruangan — lihat catatan Poin peserta multi-ruangan
  };
  recomputeCartItem(item);
  bookingCart.push(item);
  renderBookingPage();
  go('booking');
  toast(`${room.name} ditambahkan ke pemesanan.`);
}

// Jenis tarif tergantung apakah ruangan internal (Per jam / Per hari) atau
// eksternal (Harian / Mingguan — Mingguan disembunyikan bila room.priceWeek
// tidak ada, mis. Aula Kegiatan Komersil).
function tariffOptionsHtml(room, selected){
  let opts;
  if(room.isExternal){
    opts = [['harian','Harian']];
    if(room.priceWeek) opts.push(['mingguan','Mingguan']);
  } else {
    opts = [['jam','Per jam'], ['hari','Per hari (paket harian)']];
  }
  return opts.map(([v,label]) => `<option value="${v}" ${v === selected ? 'selected' : ''}>${label}</option>`).join('');
}

function addDays(dateStr, n){
  const [y,m,d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m-1, d);
  dt.setDate(dt.getDate() + n);
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`;
}

// Menghitung tanggal selesai pakai dan estimasi biaya berdasarkan jenis
// tarif yang dipilih. Untuk 'mingguan', rentang dihitung 7 hari (termasuk
// tanggal mulai) dari tanggal check-in.
function computeStay(room, tariff, date){
  if(tariff === 'mingguan') return { endDate: addDays(date, 6), amount: room.priceWeek || 0, text: '7 hari (1 minggu)' };
  if(tariff === 'harian') return { endDate: date, amount: room.priceDay || 0, text: '1 hari' };
  if(tariff === 'hari') return { endDate: date, amount: room.priceDay || 0, text: '1 hari (paket harian)' };
  return null; // 'jam' ditangani terpisah pakai jam mulai/selesai
}

// Menghitung ulang endDate + amount sebuah item keranjang berdasarkan
// ruangan & jenis tarifnya. Fasilitas internal (isExternal=false) SELALU
// amount 0 (tidak ada biaya sewa), berapa pun tarif/jam yang dipilih.
function recomputeCartItem(item){
  const room = findRoom(item.roomId);
  if(!room) return;
  if(item.tariffType === 'jam'){
    item.endDate = item.date;
    item.amount = 0;
  } else {
    const stay = computeStay(room, item.tariffType, item.date) || { endDate: item.date, amount: 0 };
    item.endDate = stay.endDate;
    item.amount = room.isExternal ? stay.amount : 0;
  }
}

function removeCartItem(cartId){
  bookingCart = bookingCart.filter(it => it.cartId !== cartId);
  renderBookingPage();
  if(!bookingCart.length) toast('Keranjang pemesanan kosong.');
}

function updateCartItemField(cartId, field, value){
  const item = bookingCart.find(it => it.cartId === cartId);
  if(!item) return;
  item[field] = value;
  if(field === 'participants'){
    // Field ini diketik karakter demi karakter (oninput) — jangan
    // render ulang seluruh kartu (akan merebut fokus input tiap
    // ketikan), cukup bersihkan error lama dan perbarui sidebar.
    const errEl = document.getElementById('cart-participants-error-' + cartId);
    if(errEl) errEl.textContent = '';
    renderCartSummarySidebar();
    return;
  }
  if(field === 'tariffType' && item.tariffType === 'jam'){
    item.startTime = item.startTime || '09:00'; item.endTime = item.endTime || '11:00';
  }
  recomputeCartItem(item);
  renderCartList();
  renderCartSummarySidebar();
}

// Bentrok terhadap data tersimpan di server (diratakan via
// flattenBookingItems) MAUPUN terhadap item lain di keranjang yang sama
// (mis. ruangan yang sama dipilih dua kali dengan jadwal beririsan).
function itemConflictsWithStored(item){
  const candidate = { date: item.date, endDate: item.endDate || item.date, startTime: item.startTime, endTime: item.endTime, tariffType: item.tariffType };
  const stored = flattenBookingItems(getBookings()).filter(b => b.roomId === item.roomId && STATUS_TIDAK_MENGUNCI_RUANGAN_.indexOf(b.status) === -1);
  if(stored.some(b => bookingsConflict(candidate, b))) return true;
  return bookingCart.some(other => other.cartId !== item.cartId && other.roomId === item.roomId &&
    bookingsConflict(candidate, { date: other.date, endDate: other.endDate || other.date, startTime: other.startTime, endTime: other.endTime, tariffType: other.tariffType }));
}

function renderCartList(){
  const wrap = document.getElementById('cart-items-list');
  if(!bookingCart.length){
    wrap.innerHTML = `<div class="text-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">Belum ada ruangan dipilih. Klik "Tambah Ruangan Lain" untuk memilih ruangan.</div>`;
    lucide.createIcons();
    return;
  }
  wrap.innerHTML = bookingCart.map(item => {
    const room = findRoom(item.roomId);
    if(!room) return '';
    const conflict = itemConflictsWithStored(item);
    return `
    <div class="border border-slate-200 rounded-xl p-4" data-cart-id="${item.cartId}">
      <div class="flex items-center justify-between gap-3 mb-3">
        <div class="flex items-center gap-3 min-w-0">
          <img src="${room.img}" class="w-12 h-12 rounded-md object-cover flex-shrink-0" alt="${room.name}">
          <div class="min-w-0">
            <p class="font-display font-semibold navy-text text-sm truncate">${room.name}</p>
            <p class="text-xs text-slate-400 truncate">${room.category} · Maks ${room.capacity} orang</p>
          </div>
        </div>
        <button type="button" onclick="removeCartItem('${item.cartId}')" class="icon-btn-sm flex-shrink-0" title="Hapus ruangan ini"><i data-lucide="trash-2" class="w-4 h-4" style="color:var(--danger)"></i></button>
      </div>
      <div class="grid md:grid-cols-3 gap-3 mb-3">
        <div>
          <label class="block text-xs font-semibold navy-text mb-1">${room.isExternal ? 'Tanggal check-in' : 'Tanggal pemakaian'}</label>
          <input type="date" value="${item.date}" onchange="updateCartItemField('${item.cartId}','date',this.value)" class="w-full border border-slate-300 rounded-md px-3 py-2 text-sm">
        </div>
        <div>
          <label class="block text-xs font-semibold navy-text mb-1">Jenis tarif</label>
          <select onchange="updateCartItemField('${item.cartId}','tariffType',this.value)" class="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white">
            ${tariffOptionsHtml(room, item.tariffType)}
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold navy-text mb-1">Jumlah peserta</label>
          <input type="number" min="1" max="${room.capacity}" value="${item.participants || ''}" placeholder="Maks ${room.capacity} orang" oninput="updateCartItemField('${item.cartId}','participants',this.value)" class="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" id="cart-participants-${item.cartId}">
          <p class="text-xs mt-1" style="color:var(--danger)" id="cart-participants-error-${item.cartId}"></p>
        </div>
      </div>
      ${item.tariffType === 'jam' ? `
      <div class="grid md:grid-cols-2 gap-3 mb-3">
        <div>
          <label class="block text-xs font-semibold navy-text mb-1">Jam mulai</label>
          <input type="time" step="900" value="${item.startTime}" onchange="updateCartItemField('${item.cartId}','startTime',this.value)" class="w-full border border-slate-300 rounded-md px-3 py-2 text-sm">
        </div>
        <div>
          <label class="block text-xs font-semibold navy-text mb-1">Jam selesai</label>
          <input type="time" step="900" value="${item.endTime}" onchange="updateCartItemField('${item.cartId}','endTime',this.value)" class="w-full border border-slate-300 rounded-md px-3 py-2 text-sm">
        </div>
      </div>` : (item.endDate && item.endDate !== item.date ? `<p class="text-xs text-slate-400 mb-3">Check-out: ${formatDateLong(item.endDate)}</p>` : '')}
      <div class="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
        ${conflict
          ? `<span class="flex items-center gap-1.5" style="color:var(--danger)"><i data-lucide="alert-circle" class="w-3.5 h-3.5"></i>Ruangan telah terpesan pada jadwal ini</span>`
          : `<span class="flex items-center gap-1.5" style="color:var(--ok)"><i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i>Ruangan tersedia pada jadwal ini</span>`}
        <span class="font-semibold navy-text">${room.isExternal ? priceFmt(item.amount) : 'Gratis'}</span>
      </div>
    </div>`;
  }).join('');
  lucide.createIcons();
}

function renderCartSummarySidebar(){
  const total = bookingCart.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  const totalParticipants = bookingCart.reduce((sum, it) => sum + (parseInt(it.participants) || 0), 0);
  const hasConflictAny = bookingCart.some(itemConflictsWithStored);
  document.getElementById('booking-room-loc').textContent = `${bookingCart.length} ruangan dipilih`;
  document.getElementById('booking-summary-panel').innerHTML = bookingCart.length ? `
    ${bookingCart.map(item => {
      const room = findRoom(item.roomId);
      if(!room) return '';
      const pLabel = parseInt(item.participants) > 0 ? `${parseInt(item.participants)} peserta` : 'Peserta belum diisi';
      return `<div class="flex items-center justify-between gap-2"><span class="text-slate-500 truncate">${room.name} <span class="text-slate-400">(${pLabel})</span></span><span class="font-medium navy-text flex-shrink-0">${room.isExternal ? priceFmt(item.amount) : 'Gratis'}</span></div>`;
    }).join('')}
    <div class="border-t border-slate-100 pt-3 mt-1 flex items-center justify-between text-xs text-slate-500">
      <span>Total Peserta</span>
      <span class="font-medium navy-text">${totalParticipants > 0 ? totalParticipants + ' orang' : '-'}</span>
    </div>
    <div class="flex items-center justify-between">
      <span class="font-semibold navy-text">Total Biaya</span>
      <span class="font-display text-lg font-bold navy-text">${priceFmt(total)}</span>
    </div>
    ${hasConflictAny ? `<p class="text-xs mt-1" style="color:var(--danger)">Ada ruangan yang bentrok jadwal — perbaiki sebelum mengirim.</p>` : ''}
  ` : `<p class="text-slate-400">Belum ada ruangan dipilih.</p>`;
}

// Poin 1: kunci tombol "Kirim Pemesanan" bila akun yang sedang login belum
// disetujui admin. Status disegarkan dari server setiap kali halaman ini
// dibuka (bukan cuma dipercaya dari cache localStorage saat login), karena
// admin bisa menyetujui kapan saja setelah sesi login dimulai.
async function refreshMyApprovalLock(){
  const user = getUser();
  const box = document.getElementById('approval-lock-warning');
  const boxText = document.getElementById('approval-lock-warning-text');
  const submitBtn = document.getElementById('booking-submit-btn');
  if(!user){ box.classList.add('hidden'); if(submitBtn) submitBtn.disabled = false; return; }

  try{
    const params = (user.isInternal && getUserToken()) ? { userToken: getUserToken() } : { email: user.email };
    const data = await apiGet('myApprovalStatus', params);
    if(data.ok){
      user.approvalStatus = data.approvalStatus;
      setUser(user);
    }
  }catch(err){ /* pakai status lama dari cache bila gagal menyegarkan */ }

  const locked = user.approvalStatus && user.approvalStatus !== 'disetujui';
  if(locked){
    boxText.textContent = user.approvalStatus === 'ditolak'
      ? 'Pendaftaran akun Anda tidak disetujui oleh pengelola. Silakan hubungi kami bila ini keliru.'
      : 'Akun Anda sedang menunggu persetujuan pengelola. Anda belum bisa mengirim pemesanan sampai akun disetujui.';
    box.classList.remove('hidden');
    if(submitBtn) submitBtn.disabled = true;
  } else {
    box.classList.add('hidden');
    if(submitBtn) submitBtn.disabled = false;
  }
  lucide.createIcons();
}

function renderBookingPage(){
  document.getElementById('booking-back-btn').onclick = () => go('rooms');
  document.getElementById('booking-room-title').textContent = 'Formulir Pemesanan';
  document.getElementById('booking-room-subtitle').textContent = bookingCart.length ? `${bookingCart.length} ruangan dipilih untuk 1 pemesanan` : 'Pilih ruangan untuk mulai memesan.';
  renderCartList();
  renderCartSummarySidebar();
  refreshMyApprovalLock();

  // Field pemesan (nama/instansi/dst.) hanya diisi ulang dari akun yang
  // login SEKALI (saat pertama kali keranjang diisi) — supaya menambah
  // ruangan lain tidak menimpa isian yang sudah diketik pengguna.
  if(!groupFieldsInitialized){
    const user = getUser();
    document.getElementById('bk-name').value = user ? user.name : '';
    document.getElementById('bk-org').value = user && user.org ? user.org : '';
    document.getElementById('bk-email').value = user ? user.email : '';
    document.getElementById('bk-phone').value = '';
    document.getElementById('bk-purpose').value = '';
    document.getElementById('bk-notes').value = '';
    document.getElementById('bk-consent').checked = false;
    document.getElementById('bk-priority-tier').value = 'eksternal_lppi';
    onPriorityTierChange();
    resetAttachments();
    document.getElementById('conflict-warning').classList.add('hidden');
    ['bk-name','bk-org','bk-email','bk-phone','bk-purpose'].forEach(id => setFieldError(id, null));
    groupFieldsInitialized = true;
  }
  lucide.createIcons();
}

function resetBookingCart(){
  bookingCart = [];
  groupFieldsInitialized = false;
  resetAttachments();
}

/* ===================== BOOKING DETAIL MODAL ===================== */
function closeBookingModal(){
  document.getElementById('booking-modal-root').innerHTML = '';
}

// Teks periode 1 item booking (ruangan + tanggal/jam) — cermin dari
// bookingItemPeriodText_() di Notifications.gs.
function bookingItemPeriodText(it){
  const room = findRoom(it.roomId);
  const label = room ? room.name : (it.roomName || '');
  const endDate = it.endDate || it.date;
  if(it.tariffType === 'jam') return `${label}: ${formatDateLong(it.date)} · ${it.startTime}–${it.endTime}`;
  if(endDate && endDate !== it.date) return `${label}: ${formatDateLong(it.date)} – ${formatDateLong(endDate)}`;
  return `${label}: ${formatDateLong(it.date)}`;
}

function openBookingModal(groupId, adminMode){
  const b = getBookings().find(x => x.groupId === groupId);
  if(!b) return;
  const items = b.items || [];
  const canAct = adminMode; // admin punya kuasa penuh mengubah status kapan saja
  const root = document.getElementById('booking-modal-root');
  root.innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this) closeBookingModal()">
      <div class="modal-box">
        <div class="p-6 border-b border-slate-100 flex items-start justify-between gap-3">
          <div>
            <p class="text-xs uppercase tracking-wide text-slate-400 mb-1">Nomor Referensi</p>
            <p class="font-display text-xl font-bold navy-text">${b.ref}</p>
          </div>
          <button onclick="closeBookingModal()" class="icon-btn-sm flex-shrink-0"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>
        <div class="p-6 space-y-5 print-area">
          <div class="print-letterhead">
            <p class="font-display font-bold text-lg">Kawasan Edukasi dan Digital Kemang</p>
            <p class="text-xs">Bukti Pemesanan Ruangan</p>
          </div>
          <div class="mt-1">${statusBadge(b.status)}</div>
          <div class="space-y-2 border-t border-slate-100 pt-4">
            ${items.map(it => {
              const room = findRoom(it.roomId);
              return `<div class="flex items-center gap-3">
                <img src="${room ? room.img : ''}" class="w-14 h-11 rounded-md object-cover flex-shrink-0 no-print" alt="">
                <div>
                  <p class="font-display font-bold navy-text text-sm">${room ? room.name : it.roomName}</p>
                  <p class="text-xs text-slate-500">${bookingItemPeriodText(it)} ${it.participants ? '· ' + it.participants + ' peserta' : ''} ${(room && room.isExternal) ? '· ' + priceFmt(it.amount || 0) : '· Gratis'}</p>
                </div>
              </div>`;
            }).join('')}
          </div>
          <div class="grid grid-cols-2 gap-y-4 gap-x-4 text-sm border-t border-slate-100 pt-5">
            <div><p class="text-xs text-slate-400 mb-0.5">Penanggung Jawab</p><p class="font-medium navy-text">${escapeHtml(b.name)}</p></div>
            <div><p class="text-xs text-slate-400 mb-0.5">Instansi / Unit Kerja</p><p class="font-medium navy-text">${escapeHtml(b.org)}</p></div>
            <div><p class="text-xs text-slate-400 mb-0.5">Kategori Instansi</p><p class="font-medium navy-text">${priorityTierLabel(b.priorityTier)}</p></div>
            <div><p class="text-xs text-slate-400 mb-0.5">Email</p><p class="font-medium navy-text break-all">${escapeHtml(b.email)}</p></div>
            <div><p class="text-xs text-slate-400 mb-0.5">Telepon</p><p class="font-medium navy-text">${escapeHtml(b.phone)}</p></div>
            <div><p class="text-xs text-slate-400 mb-0.5">Jumlah Peserta</p><p class="font-medium navy-text">${b.participants} orang</p></div>
            <div><p class="text-xs text-slate-400 mb-0.5">Total Estimasi Biaya</p><p class="font-medium navy-text">${priceFmt(b.amount || 0)} <span class="text-xs text-slate-400 font-normal">(Transfer Bank)</span></p></div>
            <div class="col-span-2"><p class="text-xs text-slate-400 mb-0.5">Keperluan Acara</p><p class="font-medium navy-text">${escapeHtml(b.purpose)}</p></div>
            ${b.notes ? `<div class="col-span-2"><p class="text-xs text-slate-400 mb-0.5">Catatan Tambahan</p><p class="font-medium navy-text">${escapeHtml(b.notes)}</p></div>` : ''}
            <div class="col-span-2"><p class="text-xs text-slate-400 mb-0.5">Diajukan pada</p><p class="font-medium navy-text">${new Date(b.createdAt).toLocaleString('id-ID')}</p></div>
          </div>
          ${b.attachmentUrls ? `
          <div class="border-t border-slate-100 pt-4 no-print">
            <p class="text-xs font-semibold navy-text mb-2 flex items-center gap-1.5"><i data-lucide="paperclip" class="w-3.5 h-3.5"></i>Dokumen Persuratan</p>
            <div class="space-y-1.5">
              ${String(b.attachmentUrls).split(',').filter(Boolean).map((url, i) => `
                <a href="${url.trim()}" target="_blank" rel="noopener" class="flex items-center gap-2 text-sm text-[var(--blue-accent)] hover:underline"><i data-lucide="file-text" class="w-4 h-4 flex-shrink-0"></i>Dokumen ${i+1}</a>
              `).join('')}
            </div>
          </div>` : ''}
          ${b.adminNote ? `<div class="bg-[var(--paper)] border border-slate-200 rounded-md p-4 text-sm"><p class="text-xs font-semibold navy-text mb-1">Catatan Pengelola</p><p class="text-slate-600">${escapeHtml(b.adminNote)}</p></div>` : ''}
          <p class="print-footer-note">Dokumen ini adalah bukti pemesanan ruangan. Status pada dokumen ini adalah status terkini saat dicetak dan dapat berubah.</p>
          ${!adminMode ? `<div class="no-print"><button onclick="printBookingProof()" class="btn-outline text-sm font-semibold px-4 py-2.5 rounded-md flex items-center gap-1.5"><i data-lucide="printer" class="w-4 h-4"></i>Cetak Bukti</button></div>` : ''}
          ${canAct ? `
          <div class="border-t border-slate-100 pt-5 no-print">
            <label class="block text-xs font-semibold navy-text mb-1.5">Catatan admin (wajib diisi bila menolak / membatalkan)</label>
            <textarea id="modal-admin-note" rows="2" placeholder="Contoh: Ruangan sedang dalam perawatan pada tanggal tersebut." class="w-full border border-slate-300 rounded-md px-3 py-2 text-sm mb-4">${escapeHtml(b.adminNote || '')}</textarea>
            <div class="flex flex-wrap items-center gap-2">
              <select id="modal-status-select" class="border border-slate-300 rounded-md px-3 py-2.5 text-sm bg-white">
                ${STATUS_ORDER.map(s => `<option value="${s}" ${s === b.status ? 'selected' : ''}>${statusLabel(s)}</option>`).join('')}
              </select>
              <button onclick="adminSetStatus('${b.groupId}')" class="btn-primary text-sm font-semibold px-4 py-2.5 rounded-md flex items-center gap-1.5"><i data-lucide="check" class="w-4 h-4"></i>Ubah Status</button>
            </div>
            <p class="text-xs text-slate-400 mt-2">Admin dapat mengubah ke status apa pun secara manual kapan saja.</p>
          </div>` : ''}
        </div>
      </div>
    </div>`;
  lucide.createIcons();
}

// Sebuah item booking dianggap "per jam" (hanya mengunci rentang jam pada
// SATU tanggal) hanya bila tariffType === 'jam'. Selain itu ('hari' untuk
// internal, 'harian'/'mingguan' untuk eksternal) dianggap mengunci PENUH
// dari date s.d. endDate (00:00–23:59 setiap harinya).
function isHourlyBooking(b){
  return b.tariffType === 'jam';
}

function dateRangesOverlap(aStart, aEnd, bStart, bEnd){
  return aStart <= bEnd && aEnd >= bStart; // format YYYY-MM-DD, aman dibandingkan sebagai string
}

function bookingsConflict(a, b){
  const aEnd = a.endDate || a.date;
  const bEnd = b.endDate || b.date;
  if(!dateRangesOverlap(a.date, aEnd, b.date, bEnd)) return false;
  if(isHourlyBooking(a) && isHourlyBooking(b) && a.date === b.date){
    return a.startTime < b.endTime && a.endTime > b.startTime;
  }
  return true; // salah satu/keduanya booking penuh-hari yang tanggalnya beririsan
}

/* ===================== DOKUMEN PERSURATAN (Poin 7 — multi-file) ===================== */
// File dipilih user disimpan di memori (bukan langsung diunggah) sampai
// submitBooking() mengirim semuanya sebagai base64 dalam 1 payload
// createBooking. Server (Code.gs) yang benar-benar menyimpannya ke Google
// Drive dan menyimpan link-nya — lihat handleCreateBooking/saveAttachments_.
const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_MB = 5;
const ALLOWED_ATTACHMENT_EXT = ['pdf','doc','docx','jpg','jpeg','png'];
let pendingAttachments = []; // [{file, name, sizeLabel}]

function fileExt(name){ return (name.split('.').pop() || '').toLowerCase(); }
function fileSizeLabel(bytes){
  if(bytes < 1024*1024) return Math.max(1, Math.round(bytes/1024)) + ' KB';
  return (bytes/1024/1024).toFixed(1) + ' MB';
}

function onAttachmentsSelected(e){
  const errEl = document.getElementById('attachment-error');
  errEl.textContent = '';
  const incoming = Array.from(e.target.files || []);
  e.target.value = ''; // reset input supaya bisa pilih file yang sama lagi kalau dihapus lalu ditambah ulang

  for(const file of incoming){
    if(pendingAttachments.length >= MAX_ATTACHMENTS){
      errEl.textContent = `Maksimal ${MAX_ATTACHMENTS} file.`;
      break;
    }
    if(!ALLOWED_ATTACHMENT_EXT.includes(fileExt(file.name))){
      errEl.textContent = `Format "${file.name}" tidak didukung. Gunakan PDF/Word/gambar.`;
      continue;
    }
    if(file.size > MAX_ATTACHMENT_MB * 1024 * 1024){
      errEl.textContent = `File "${file.name}" melebihi ${MAX_ATTACHMENT_MB} MB.`;
      continue;
    }
    pendingAttachments.push({ file, name: file.name, sizeLabel: fileSizeLabel(file.size) });
  }
  renderAttachmentList();
}

function removeAttachment(idx){
  pendingAttachments.splice(idx, 1);
  document.getElementById('attachment-error').textContent = '';
  renderAttachmentList();
}

function renderAttachmentList(){
  const wrap = document.getElementById('attachment-list');
  wrap.innerHTML = pendingAttachments.map((a, idx) => `
    <div class="flex items-center justify-between gap-2 border border-slate-200 rounded-md px-3 py-2 text-sm">
      <span class="flex items-center gap-2 min-w-0"><i data-lucide="file-text" class="w-4 h-4 text-slate-400 flex-shrink-0"></i><span class="truncate">${escapeHtml(a.name)}</span><span class="text-xs text-slate-400 flex-shrink-0">(${a.sizeLabel})</span></span>
      <button type="button" onclick="removeAttachment(${idx})" class="icon-btn-sm flex-shrink-0" title="Hapus"><i data-lucide="x" class="w-3.5 h-3.5" style="color:var(--danger)"></i></button>
    </div>`).join('');
  lucide.createIcons();
}

function resetAttachments(){
  pendingAttachments = [];
  document.getElementById('attachment-error').textContent = '';
  renderAttachmentList();
}

function fileToBase64(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || ''); // buang prefix "data:...;base64,"
    reader.onerror = () => reject(new Error('Gagal membaca file ' + file.name));
    reader.readAsDataURL(file);
  });
}

async function buildAttachmentsPayload(){
  return Promise.all(pendingAttachments.map(async a => ({
    name: a.name,
    mimeType: a.file.type || 'application/octet-stream',
    base64: await fileToBase64(a.file)
  })));
}

let bookingSubmitInFlight = false;

async function submitBooking(e){
  e.preventDefault();
  if(bookingSubmitInFlight) return; // proteksi double-submit

  if(!bookingCart.length){ toast('Pilih minimal 1 ruangan untuk dipesan.', 'error'); return; }

  const name = document.getElementById('bk-name').value.trim();
  const org = document.getElementById('bk-org').value.trim();
  const email = document.getElementById('bk-email').value.trim();
  const phone = document.getElementById('bk-phone').value.trim();
  const purpose = document.getElementById('bk-purpose').value.trim();
  const notes = document.getElementById('bk-notes').value.trim();
  const priorityTier = document.getElementById('bk-priority-tier').value;
  const consent = document.getElementById('bk-consent');

  let ok = true;
  if(!name){ setFieldError('bk-name','Nama penanggung jawab wajib diisi.'); ok = false; } else setFieldError('bk-name', null);
  if(!org){ setFieldError('bk-org','Instansi/perusahaan wajib diisi.'); ok = false; } else setFieldError('bk-org', null);
  if(!email || !email.includes('@')){ setFieldError('bk-email','Masukkan email yang valid.'); ok = false; } else setFieldError('bk-email', null);
  if(!phone || phone.length < 8){ setFieldError('bk-phone','Masukkan nomor telepon yang valid.'); ok = false; } else setFieldError('bk-phone', null);

  // Peserta sekarang divalidasi PER RUANGAN — masing-masing ruangan bisa
  // punya jumlah peserta berbeda, dibatasi oleh kapasitas ruangan itu
  // sendiri saja, bukan disamaratakan dengan ruangan terkecil di keranjang.
  bookingCart.forEach(it => {
    const room = findRoom(it.roomId);
    const errEl = document.getElementById('cart-participants-error-' + it.cartId);
    const p = parseInt(it.participants);
    if(!p || p < 1){
      if(errEl) errEl.textContent = 'Jumlah peserta wajib diisi.';
      ok = false;
    } else if(room && p > room.capacity){
      if(errEl) errEl.textContent = `Melebihi kapasitas maksimal ruangan ini (${room.capacity} orang).`;
      ok = false;
    } else if(errEl) errEl.textContent = '';
  });

  if(!purpose){ setFieldError('bk-purpose','Keperluan acara wajib diisi.'); ok = false; } else setFieldError('bk-purpose', null);
  if(consent && !consent.checked){ toast('Anda perlu menyetujui persyaratan penggunaan data sebelum mengirim.', 'error'); ok = false; }
  if(bookingCart.some(itemConflictsWithStored)){ toast('Ada ruangan yang bentrok jadwal — perbaiki sebelum mengirim.', 'error'); ok = false; }

  document.getElementById('conflict-warning').classList.add('hidden');
  if(!ok){ toast('Periksa kembali data yang belum lengkap.', 'error'); return; }

  const user = getUser();
  const items = bookingCart.map(it => {
    const room = findRoom(it.roomId);
    return {
      roomId: it.roomId, roomName: room.name, date: it.date, endDate: it.endDate || it.date,
      startTime: it.tariffType === 'jam' ? it.startTime : '00:00',
      endTime: it.tariffType === 'jam' ? it.endTime : '23:59',
      tariffType: it.tariffType, amount: it.amount || 0, participants: parseInt(it.participants) || 0
    };
  });
  const totalAmount = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  // Jumlah peserta level-pemesanan (dikirim ke server & ditampilkan di
  // dashboard admin/CSV/email) adalah TOTAL dari seluruh ruangan — dipakai
  // untuk gambaran total kebutuhan (mis. konsumsi/parkir), bukan lagi
  // dibatasi oleh kapasitas ruangan terkecil.
  const participants = items.reduce((sum, it) => sum + (Number(it.participants) || 0), 0);

  const submitBtn = document.getElementById('booking-submit-btn');
  bookingSubmitInFlight = true;
  if(submitBtn){ submitBtn.disabled = true; submitBtn.textContent = 'Mengunggah dokumen...'; }

  let attachments = [];
  try{
    attachments = await buildAttachmentsPayload();
  }catch(err){
    bookingSubmitInFlight = false;
    if(submitBtn){ submitBtn.disabled = false; submitBtn.textContent = 'Kirim Pemesanan'; }
    toast('Gagal membaca salah satu file lampiran. Coba pilih ulang filenya.', 'error');
    return;
  }

  const payload = {
    name, org, email, phone, participants, purpose, notes, items, priorityTier, attachments,
    userEmail: user ? user.email : email,
    userToken: (user && user.isInternal) ? getUserToken() : undefined
  };

  if(submitBtn) submitBtn.textContent = 'Mengirim...';

  try{
    const data = await apiPost('createBooking', payload);
    if(!data.ok){
      if(data.notApproved){
        toast(data.error || 'Akun Anda belum disetujui pengelola.', 'error');
        refreshMyApprovalLock();
      } else if(data.conflict){
        const warn = document.getElementById('conflict-warning');
        const room = findRoom(data.roomId);
        document.getElementById('conflict-warning-text').textContent = `Ruangan "${room ? room.name : data.roomId}" sudah terpesan pada jadwal yang dipilih. Silakan ubah tanggal/jam ruangan tersebut.`;
        warn.classList.remove('hidden');
        lucide.createIcons();
        toast('Terjadi bentrok jadwal pada salah satu ruangan.', 'error');
      } else {
        toast(data.error || 'Gagal mengirim pemesanan. Silakan coba lagi.', 'error');
      }
      return;
    }

    document.getElementById('success-summary').innerHTML = `
      <div class="space-y-2 pb-4 mb-4 border-b border-slate-100">
        ${items.map(it => {
          const room = findRoom(it.roomId);
          return `<div class="flex items-center gap-3">
            <img src="${room ? room.img : ''}" class="w-16 h-12 rounded-md object-cover flex-shrink-0" alt="">
            <div>
              <p class="font-display font-bold navy-text text-sm">${room ? room.name : it.roomName}</p>
              <p class="text-xs text-slate-500">${bookingItemPeriodText(it)} ${it.participants ? '· ' + it.participants + ' peserta' : ''}</p>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div class="grid grid-cols-2 gap-y-3 text-sm">
        <div><p class="text-xs text-slate-400">Nomor Referensi</p><p class="font-display font-bold navy-text">${data.ref}</p></div>
        <div><p class="text-xs text-slate-400">Total Estimasi Biaya</p><p class="font-semibold navy-text">${priceFmt(totalAmount)}</p></div>
        <div><p class="text-xs text-slate-400">Penanggung Jawab</p><p class="font-medium navy-text">${escapeHtml(name)}</p></div>
        <div><p class="text-xs text-slate-400">Instansi</p><p class="font-medium navy-text">${escapeHtml(org)}</p></div>
        <div><p class="text-xs text-slate-400">Jumlah Peserta</p><p class="font-medium navy-text">${participants} orang</p></div>
        <div><p class="text-xs text-slate-400">Metode Pembayaran</p><p class="font-medium navy-text">Transfer Bank</p></div>
        <div class="col-span-2"><p class="text-xs text-slate-400">Status</p><p>${statusBadge('belum_konfirmasi')}</p></div>
      </div>`;
    toast('Pemesanan berhasil dikirim dan menunggu konfirmasi. Email konfirmasi telah dikirim ke ' + email + '.');
    resetBookingCart();
    go('success');
  }catch(err){
    toast('Gagal menghubungi server. Periksa koneksi Anda dan coba lagi.', 'error');
  }finally{
    bookingSubmitInFlight = false;
    if(submitBtn){ submitBtn.disabled = false; submitBtn.textContent = 'Kirim Pemesanan'; }
  }
}

/* ===================== HISTORY PAGE ===================== */
function tariffLabel(tariffType){
  return { jam: 'Per Jam', hari: 'Per Hari (Internal)', harian: 'Harian', mingguan: 'Mingguan' }[tariffType] || tariffType;
}
// Ringkasan tanggal/jam SEMUA item sebuah grup pemesanan, untuk daftar
// riwayat/admin. Cermin dari roomListHtml di Notifications.gs.
function groupItemsSummary(b){
  return (b.items || []).map(bookingItemPeriodText).join(' · ');
}
function groupRoomNamesSummary(b){
  const items = b.items || [];
  if(!items.length) return '-';
  if(items.length === 1){ const r = findRoom(items[0].roomId); return r ? r.name : items[0].roomName; }
  return `${items.length} Ruangan (${items.map(it => { const r = findRoom(it.roomId); return r ? r.name : it.roomName; }).join(', ')})`;
}
function statusBadge(status){
  const map = {
    belum_konfirmasi: { cls: 'badge-pending', icon: 'clock' },
    konfirmasi: { cls: 'badge-confirmed', icon: 'check-circle-2' },
    menunggu_pembayaran: { cls: 'badge-payment', icon: 'wallet' },
    pembayaran_selesai: { cls: 'badge-paid', icon: 'badge-check' },
    ditolak: { cls: 'badge-cancelled', icon: 'x-circle' },
    dibatalkan: { cls: 'badge-cancelled', icon: 'ban' }
  };
  const m = map[status] || map.belum_konfirmasi;
  return `<span class="badge ${m.cls}"><i data-lucide="${m.icon}" class="w-3 h-3"></i>${statusLabel(status)}</span>`;
}

let historyFilterStatus = '';
function setHistoryFilter(status){
  historyFilterStatus = status;
  renderHistory();
}
function renderHistoryFilterBar(all){
  const counts = { '': all.length };
  STATUS_ORDER.forEach(s => { counts[s] = 0; });
  all.forEach(b => { if(counts[b.status] !== undefined) counts[b.status]++; });
  const tabs = [{ key: '', label: 'Semua' }].concat(STATUS_ORDER.map(s => ({ key: s, label: statusLabel(s) })));
  document.getElementById('history-filter').innerHTML = tabs.map(t =>
    `<button onclick="setHistoryFilter('${t.key}')" class="admin-tab ${historyFilterStatus === t.key ? 'active' : ''}" style="border:1px solid #e2e8f0;">${t.label} <span class="opacity-70">(${counts[t.key]})</span></button>`
  ).join('');
}

function renderHistory(){
  const user = getUser();
  const list = document.getElementById('history-list');
  const filterBar = document.getElementById('history-filter');
  if(!user){ list.innerHTML = ''; filterBar.innerHTML = ''; return; }

  // Server sudah menyaring data ini sesuai akun yang login (lewat userToken
  // untuk staf internal, atau email untuk tamu) dan sudah menyamakan huruf
  // besar/kecil di sisi server.
  const allBookings = getBookings();
  renderHistoryFilterBar(allBookings);
  const bookings = historyFilterStatus ? allBookings.filter(b => b.status === historyFilterStatus) : allBookings;

  if(!allBookings.length){
    list.innerHTML = `
      <div class="text-center py-20 border border-dashed border-slate-200 rounded-xl">
        <i data-lucide="calendar-x" class="w-10 h-10 mx-auto text-slate-300 mb-3"></i>
        <p class="text-slate-400 text-sm mb-4">Belum ada pemesanan yang diajukan.</p>
        <button onclick="go('rooms')" class="btn-primary px-5 py-2.5 rounded-md text-sm font-semibold">Cari Ruangan</button>
      </div>`;
    lucide.createIcons();
    return;
  }
  if(!bookings.length){
    list.innerHTML = `<div class="text-center py-16 border border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">Tidak ada pemesanan dengan status ini.</div>`;
    lucide.createIcons();
    return;
  }

  list.innerHTML = bookings.map(b => `
    <div class="border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4 card-shadow cursor-pointer" onclick="openBookingModal('${b.groupId}', false)">
      <div class="flex-1">
        <div class="flex items-center gap-2 flex-wrap mb-1">
          <p class="font-display font-bold navy-text">${groupRoomNamesSummary(b)}</p>
          ${statusBadge(b.status)}
        </div>
        <p class="text-xs text-slate-500">${groupItemsSummary(b)} · ${b.participants} peserta</p>
        <p class="text-xs text-slate-400 mt-1">Ref: ${b.ref} · ${priceFmt(b.amount || 0)}</p>
      </div>
      <div class="flex items-center gap-2" onclick="event.stopPropagation()">
        <button onclick="openBookingModal('${b.groupId}', false)" class="text-xs font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-md">Lihat Detail</button>
        ${b.status === 'belum_konfirmasi' ? `<button onclick="cancelBooking('${b.groupId}')" class="text-xs font-semibold text-[var(--danger)] border border-red-200 hover:bg-red-50 px-3 py-2 rounded-md">Batalkan</button>` : ''}
      </div>
    </div>`).join('');
  lucide.createIcons();
}

async function cancelBooking(id){
  if(!confirm('Batalkan pemesanan ini? Tindakan ini tidak dapat diurungkan.')) return;
  try{
    const u = getUser();
    const payload = { id };
    if(u && u.isInternal && getUserToken()) payload.userToken = getUserToken();
    else if(u && u.email) payload.email = u.email;
    const data = await apiPost('cancelOwnBooking', payload);
    if(!data.ok){
      toast(data.error || 'Gagal membatalkan pemesanan.', 'error');
      return;
    }
    toast('Pemesanan berhasil dibatalkan.');
    await refreshBookings();
    renderHistory();
  }catch(err){
    toast('Gagal menghubungi server. Periksa koneksi Anda.', 'error');
  }
}

/* ===================== ADMIN DASHBOARD ===================== */
// Admin punya kuasa penuh mengubah ke status APA PUN secara manual — status
// tujuan diambil dari dropdown #modal-status-select pada modal detail.
async function adminSetStatus(id){
  const bookings = getBookings();
  const target = bookings.find(b => b.groupId === id);
  if(!target) return;
  const sel = document.getElementById('modal-status-select');
  const status = sel ? sel.value : null;
  if(!status) return;
  const noteInput = document.getElementById('modal-admin-note');
  const note = noteInput ? noteInput.value.trim() : '';
  if((status === 'ditolak' || status === 'dibatalkan') && !note){
    toast('Catatan admin wajib diisi untuk penolakan/pembatalan.', 'error');
    if(noteInput) noteInput.classList.add('input-error');
    return;
  }
  const finalNote = note || target.adminNote;
  try{
    const data = await apiPost('updateBookingStatus', { token: getAdminToken(), id, status, adminNote: finalNote });
    if(!data.ok){
      if(data.error && data.error.indexOf('Sesi admin') !== -1){
        toast(data.error, 'error'); logout(); go('admin-login'); return;
      }
      toast(data.error || 'Gagal memperbarui status.', 'error');
      return;
    }
    toast(`Pemesanan ${target.ref} berhasil diubah ke status "${statusLabel(status)}".`);
    closeBookingModal();
    await refreshBookings();
    renderAdmin();
  }catch(err){
    toast('Gagal menghubungi server. Periksa koneksi Anda.', 'error');
  }
}

let adminActiveTab = 'ringkasan';
function setAdminTab(tab){
  adminActiveTab = tab;
  document.getElementById('admin-tab-ringkasan').classList.toggle('active', tab === 'ringkasan');
  document.getElementById('admin-tab-pemesanan').classList.toggle('active', tab === 'pemesanan');
  document.getElementById('admin-tab-pendaftar').classList.toggle('active', tab === 'pendaftar');
  document.getElementById('admin-panel-ringkasan').classList.toggle('hidden', tab !== 'ringkasan');
  document.getElementById('admin-panel-pemesanan').classList.toggle('hidden', tab !== 'pemesanan');
  document.getElementById('admin-panel-pendaftar').classList.toggle('hidden', tab !== 'pendaftar');
  if(tab === 'pemesanan') renderAdminTable();
  if(tab === 'pendaftar') renderAdminPendaftarList();
}

function renderAdmin(){
  if(!isAdmin()) return;
  setAdminTab(adminActiveTab);
  renderAdminKpis();
  renderAdminPendingList();
  renderAdminRoomStats();
  const roomSelect = document.getElementById('admin-filter-room');
  if(roomSelect.options.length <= 1){
    roomSelect.innerHTML += ROOMS.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
  }
  renderAdminTable();
  refreshAdminPendaftarCount();
  lucide.createIcons();
}

function renderAdminKpis(){
  const all = getBookings();
  const belumKonfirmasi = all.filter(b => b.status === 'belum_konfirmasi').length;
  const konfirmasi = all.filter(b => b.status === 'konfirmasi').length;
  const menungguPembayaran = all.filter(b => b.status === 'menunggu_pembayaran').length;
  const revenue = all.filter(b => b.status === 'pembayaran_selesai').reduce((sum,b) => sum + (b.amount || 0), 0);

  const cards = [
    { label: 'Belum Konfirmasi', value: belumKonfirmasi, icon: 'clock', color: 'var(--warn)' },
    { label: 'Konfirmasi', value: konfirmasi, icon: 'check-circle-2', color: 'var(--ok)' },
    { label: 'Menunggu Pembayaran', value: menungguPembayaran, icon: 'wallet', color: 'var(--navy-900)' },
    { label: 'Pendapatan Terbayar', value: priceFmt(revenue), icon: 'badge-check', color: '#116638' }
  ];
  document.getElementById('admin-kpi-grid').innerHTML = cards.map(c => `
    <div class="kpi-card">
      <div class="flex items-center justify-between mb-3">
        <p class="text-xs font-medium text-slate-500">${c.label}</p>
        <i data-lucide="${c.icon}" class="w-4 h-4" style="color:${c.color}"></i>
      </div>
      <p class="font-display text-2xl font-bold navy-text">${c.value}</p>
    </div>`).join('');
}

function renderAdminPendingList(){
  const pending = getBookings().filter(b => b.status === 'belum_konfirmasi').slice(0, 5);
  const el = document.getElementById('admin-pending-list');
  if(!pending.length){
    el.innerHTML = `<div class="text-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">Tidak ada pemesanan yang menunggu konfirmasi.</div>`;
    return;
  }
  el.innerHTML = pending.map(b => `
    <div class="border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50" onclick="openBookingModal('${b.groupId}', true)">
      <div class="min-w-0">
        <p class="font-semibold navy-text text-sm truncate">${groupRoomNamesSummary(b)}</p>
        <p class="text-xs text-slate-500 truncate">${escapeHtml(b.name)} · ${groupItemsSummary(b)}</p>
      </div>
      <i data-lucide="chevron-right" class="w-4 h-4 text-slate-300 flex-shrink-0"></i>
    </div>`).join('');
}

function renderAdminRoomStats(){
  const items = flattenBookingItems(getBookings()).filter(it => STATUS_TIDAK_MENGUNCI_RUANGAN_.indexOf(it.status) === -1);
  const max = Math.max(1, ...ROOMS.map(r => items.filter(it => it.roomId === r.id).length));
  document.getElementById('admin-room-stats').innerHTML = ROOMS.map(r => {
    const count = items.filter(it => it.roomId === r.id).length;
    const pct = Math.round((count / max) * 100);
    return `
    <div>
      <div class="flex items-center justify-between text-xs mb-1">
        <span class="font-medium navy-text">${r.name}</span>
        <span class="text-slate-400">${count} pemesanan</span>
      </div>
      <div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
        <div class="h-full rounded-full" style="width:${pct}%;background:var(--blue-accent);"></div>
      </div>
    </div>`;
  }).join('');
}

function getAdminFilteredBookings(){
  const q = (document.getElementById('admin-search').value || '').toLowerCase();
  const status = document.getElementById('admin-filter-status').value;
  const roomId = document.getElementById('admin-filter-room').value;
  const date = document.getElementById('admin-filter-date').value;
  return getBookings().filter(b => {
    const items = b.items || [];
    const matchQ = !q || [b.ref, b.name, b.org, b.email].join(' ').toLowerCase().includes(q);
    const matchStatus = !status || b.status === status;
    const matchRoom = !roomId || items.some(it => it.roomId === roomId);
    const matchDate = !date || items.some(it => it.date === date || (it.endDate && it.date <= date && it.endDate >= date));
    return matchQ && matchStatus && matchRoom && matchDate;
  });
}

let adminFilteredCache = [];
function renderAdminTable(){
  const list = getAdminFilteredBookings();
  adminFilteredCache = list;
  document.getElementById('admin-result-count').textContent = `${list.length} pemesanan ditemukan`;
  const body = document.getElementById('admin-table-body');
  if(!list.length){
    body.innerHTML = `<tr><td colspan="8" class="text-center py-14 text-slate-400">Tidak ada pemesanan yang cocok dengan filter.</td></tr>`;
    return;
  }
  body.innerHTML = list.map(b => `
    <tr onclick="openBookingModal('${b.groupId}', true)">
      <td class="font-semibold navy-text">${b.ref}</td>
      <td>${groupRoomNamesSummary(b)}</td>
      <td>${groupItemsSummary(b)}</td>
      <td>${escapeHtml(b.name)}</td>
      <td>${escapeHtml(b.org)}<br><span class="badge" style="background:#eef2f7;color:var(--slate-600);margin-top:2px;">${priorityTierLabel(b.priorityTier)}</span></td>
      <td>${b.participants}</td>
      <td>${priceFmt(b.amount || 0)}</td>
      <td>${statusBadge(b.status)}</td>
      <td onclick="event.stopPropagation()">
        ${b.status === 'belum_konfirmasi' ? `
          <div class="flex gap-1.5">
            <button onclick="quickAdminAction('${b.groupId}','konfirmasi')" class="icon-btn-sm" title="Konfirmasi"><i data-lucide="check" class="w-4 h-4" style="color:var(--ok)"></i></button>
            <button onclick="openBookingModal('${b.groupId}', true)" class="icon-btn-sm" title="Tolak / Detail"><i data-lucide="x" class="w-4 h-4" style="color:var(--danger)"></i></button>
          </div>` : `<button onclick="openBookingModal('${b.groupId}', true)" class="text-xs font-semibold text-[var(--blue-accent)] hover:underline">Detail</button>`}
      </td>
    </tr>`).join('');
}

async function quickAdminAction(id, status){
  const bookings = getBookings();
  const target = bookings.find(b => b.groupId === id);
  if(!target) return;
  try{
    const data = await apiPost('updateBookingStatus', { token: getAdminToken(), id, status, adminNote: 'Dikonfirmasi oleh pengelola.' });
    if(!data.ok){ toast(data.error || 'Gagal memperbarui status.', 'error'); return; }
    toast(`Pemesanan ${target.ref} berhasil diubah ke status "${statusLabel(status)}".`);
    await refreshBookings();
    renderAdmin();
  }catch(err){
    toast('Gagal menghubungi server. Periksa koneksi Anda.', 'error');
  }
}

function resetAdminFilters(){
  document.getElementById('admin-search').value = '';
  document.getElementById('admin-filter-status').value = '';
  document.getElementById('admin-filter-room').value = '';
  document.getElementById('admin-filter-date').value = '';
  renderAdminTable();
}

function exportAdminCSV(){
  const list = adminFilteredCache.length ? adminFilteredCache : getAdminFilteredBookings();
  if(!list.length){ toast('Tidak ada data untuk diunduh.', 'error'); return; }
  const headers = ['Referensi','Ruangan','Tanggal & Jam','Nama','Instansi','Email','Telepon','Peserta','Estimasi Biaya','Metode Pembayaran','Status','Catatan Tambahan','Catatan Pengelola','Diajukan'];
  const rows = list.map(b => [
    b.ref, groupRoomNamesSummary(b), groupItemsSummary(b),
    b.name, b.org, b.email, b.phone, b.participants, b.amount || 0,
    'Transfer Bank', statusLabel(b.status), b.notes || '', b.adminNote || '', b.createdAt
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `pemesanan-kedika-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('Data pemesanan berhasil diunduh.');
}

/* ===================== PENDAFTAR MENUNGGU (POIN 1) ===================== */
// Tab admin terpisah untuk menyetujui/menolak akun baru (tamu eksternal
// MAUPUN staf internal @bi.go.id) sebelum mereka bisa mengirim pemesanan.
let adminPendaftarCache = [];

async function refreshAdminPendaftarCount(){
  if(!isAdmin()) return;
  try{
    const data = await apiGet('pendingUsers', { token: getAdminToken() });
    if(data.ok){
      adminPendaftarCache = data.users;
      const badge = document.getElementById('admin-pendaftar-count-badge');
      if(badge) badge.textContent = data.users.length ? `(${data.users.length})` : '';
    }
  }catch(err){ /* diamkan — badge cukup tampil kosong bila gagal */ }
}

async function renderAdminPendaftarList(){
  const el = document.getElementById('admin-pendaftar-list');
  el.innerHTML = `<div class="skeleton h-20 rounded-xl"></div>`;
  try{
    const data = await apiGet('pendingUsers', { token: getAdminToken() });
    if(!data.ok){
      if(data.error && data.error.indexOf('Sesi admin') !== -1){ toast(data.error, 'error'); logout(); go('admin-login'); return; }
      el.innerHTML = `<div class="text-center py-10 text-slate-400 text-sm">${escapeHtml(data.error || 'Gagal memuat data.')}</div>`;
      return;
    }
    adminPendaftarCache = data.users;
    const badge = document.getElementById('admin-pendaftar-count-badge');
    if(badge) badge.textContent = data.users.length ? `(${data.users.length})` : '';
    if(!data.users.length){
      el.innerHTML = `<div class="text-center py-16 border border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">Tidak ada pendaftar yang menunggu persetujuan.</div>`;
      lucide.createIcons();
      return;
    }
    el.innerHTML = data.users.map(u => `
      <div class="border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3 card-shadow">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap mb-1">
            <p class="font-display font-bold navy-text">${escapeHtml(u.name || '(tanpa nama)')}</p>
            <span class="badge" style="background:${u.org === 'Internal (Staf @bi.go.id)' ? '#eef4ff' : '#fdf1e0'};color:${u.org === 'Internal (Staf @bi.go.id)' ? 'var(--navy-900)' : '#8a5a12'}">${u.org === 'Internal (Staf @bi.go.id)' ? 'Staf Internal' : 'Tamu Eksternal'}</span>
          </div>
          <p class="text-xs text-slate-500">${escapeHtml(u.email)}</p>
          <p class="text-xs text-slate-400 mt-0.5">${escapeHtml(u.org || '-')} · Daftar: ${u.createdAt ? new Date(u.createdAt).toLocaleString('id-ID') : '-'}</p>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <button onclick="adminDecideUser('${escapeHtml(u.email)}','disetujui')" class="btn-primary text-xs font-semibold px-4 py-2.5 rounded-md flex items-center gap-1.5"><i data-lucide="check" class="w-3.5 h-3.5"></i>Setujui</button>
          <button onclick="adminDecideUser('${escapeHtml(u.email)}','ditolak')" class="text-xs font-semibold text-[var(--danger)] border border-red-200 hover:bg-red-50 px-4 py-2.5 rounded-md flex items-center gap-1.5"><i data-lucide="x" class="w-3.5 h-3.5"></i>Tolak</button>
        </div>
      </div>`).join('');
    lucide.createIcons();
  }catch(err){
    el.innerHTML = `<div class="text-center py-10 text-slate-400 text-sm">Gagal menghubungi server. Periksa koneksi Anda.</div>`;
  }
}

async function adminDecideUser(email, status){
  if(status === 'ditolak' && !confirm(`Tolak pendaftaran ${email}? Pengguna ini tidak akan bisa mengirim pemesanan.`)) return;
  try{
    const data = await apiPost('updateUserApproval', { token: getAdminToken(), email, status });
    if(!data.ok){
      if(data.error && data.error.indexOf('Sesi admin') !== -1){ toast(data.error, 'error'); logout(); go('admin-login'); return; }
      toast(data.error || 'Gagal memperbarui status akun.', 'error');
      return;
    }
    toast(`Akun ${email} berhasil ${status === 'disetujui' ? 'disetujui' : 'ditolak'}.`);
    renderAdminPendaftarList();
  }catch(err){
    toast('Gagal menghubungi server. Periksa koneksi Anda.', 'error');
  }
}

/* ===================== INIT ===================== */
renderFeatured();
renderRoomsGrid();
renderAuthArea();
setAuthTab('masuk');
refreshBookings('public').then(renderHomeCalendarWidget); // beranda sudah aktif duluan sebelum go() pernah dipanggil
lucide.createIcons();
window.addEventListener('load', initGoogleSignIn); // jaga-jaga bila skrip GIS baru siap belakangan

if(API_URL.indexOf('PASTE_URL') !== -1){
  console.warn('API_URL belum dikonfigurasi. Tempel URL Web App Apps Script pada konstanta API_URL di bagian atas <script>. Lihat SETUP.md.');
  toast('Backend belum terhubung (API_URL kosong). Lihat SETUP.md untuk menyambungkannya.', 'error');
}


/* ===================== EXPOSE KE WINDOW (untuk onclick/onchange/onsubmit di HTML) =====================
 * WAJIB — module ini tidak otomatis membuat fungsi jadi global. Daftar di
 * bawah dikumpulkan dengan menyisir SEMUA atribut onclick/onchange/onsubmit
 * di index.html (termasuk yang dibuat dinamis lewat template string di
 * file ini sendiri, mis. tombol pada kartu ruangan / baris tabel admin).
 * Kalau menambah fungsi baru yang dipanggil dari onclick="..." di HTML,
 * TAMBAHKAN juga di sini — kalau lupa, browser akan error
 * "X is not defined" saat tombolnya diklik.
 */
Object.assign(window, {
  adminDecideUser, adminSetStatus, cancelBooking, closeBookingModal, closeFloorPlanModal,
  exportAdminCSV, go, goAdminEntry, handleDetailBookingClick, logout,
  onAttachmentsSelected, onPriorityTierChange, openBookingModal, openFloorPlanModal,
  printBookingProof, quickAdminAction, removeAttachment, removeCartItem,
  renderAdminTable, renderRoomsGrid, requireAuth, resetAdminFilters, selectDay,
  setAdminTab, setAuthTab, setHistoryFilter, shiftMonth, submitAdminLogin,
  submitBooking, submitLogin, submitRegister, toggleMobileMenu, updateCartItemField
});
