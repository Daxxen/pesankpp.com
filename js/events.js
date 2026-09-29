/**
 * Kawasan Pendidikan dan Pelatihan
 * Logika Aplikasi Utama
 *
 * Dimuat sebagai ES module (<script type="module" src="js/events.js">) —
 * karena itu semua fungsi yang dipanggil lewat atribut onclick/onchange/
 * onsubmit di HTML WAJIB di-expose eksplisit ke `window` (lihat blok
 * paling bawah file ini), karena isi module TIDAK otomatis jadi variabel
 * global seperti <script> biasa.
 */
import {
  API_URL, GOOGLE_CLIENT_ID,
  LS_USER, LS_ADMIN_TOKEN, LS_USER_TOKEN,
  STATUS_ORDER, STATUS_LABELS, STATUS_TIDAK_MENGUNCI_RUANGAN as STATUS_TIDAK_MENGUNCI_RUANGAN_, statusLabel,
  FEATURED_IDS, BOOKING_COLORS, bookingColor
} from './config.js';
import { ROOMS, findRoom } from './rooms.js';

function printBookingProof(){
  // Isi catatan waktu cetak setiap kali tombol "Cetak Bukti" ditekan,
  // supaya dokumen mencantumkan kapan persis bukti ini dicetak.
  document.querySelectorAll('.print-timestamp').forEach(el=>{
    el.textContent = 'Dicetak pada: ' + new Date().toLocaleString('id-ID', { dateStyle:'full', timeStyle:'short' });
  });
  window.print();
}

/* ===================== BACKEND ===================== */
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
  // bentrok sebelum submit — kalau tidak, begitu user login, data yang
  // di-cache jadi "milik saya saja" (lihat handleGetBookings di Code.gs),
  // sehingga kalender salah menampilkan tanggal orang lain sebagai kosong.
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
    if(data.ok){
      bookingsCache = data.bookings;
    } else {
      console.error('Server membalas ok:false untuk action=bookings:', data.error);
      toast('Gagal memuat data pemesanan: ' + escapeHtml(data.error || 'error tidak diketahui dari server'), 'error');
    }
    return bookingsCache;
  }catch(err){
    console.error(err);
    toast('Gagal memuat data pemesanan dari server. Periksa koneksi Anda.', 'error');
    return bookingsCache;
  }
}
// Alias sinkron ke cache supaya kode render tidak perlu ditulis ulang total.
function getBookings(){ return bookingsCache; }

/* ===================== DENAH GEDUNG (Beranda — Hero) ===================== */
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
          <img src="images/denah-gedung.jpg" alt="Denah Gedung Kawasan Pendidikan dan Pelatihan" class="w-full rounded-lg border border-slate-200">
        </div>
      </div>
    </div>`;
  lucide.createIcons();
}
function closeFloorPlanModal(){
  document.getElementById('floorplan-modal-root').innerHTML = '';
}

/* ===================== DATA BOOKING: PERATAAN & LABEL ===================== */
// Meratakan getBookings() menjadi daftar ITEM per-ruangan (dengan status
// grupnya masing-masing) — dipakai untuk kalender ketersediaan & cek bentrok,
// yang selalu bekerja per-ruangan-per-tanggal, terlepas dari bentuk data asli
// (grup+items untuk admin/milik-sendiri, atau sudah rata untuk tampilan publik).
// ref/org/purpose ikut dibawa supaya kalender bisa menampilkan kode
// referensi (A01, dst.) dan "Penyelenggara - Kegiatan".
function flattenBookingItems(list){
  const out = [];
  (list || []).forEach(g => {
    if(Array.isArray(g.items)){
      g.items.forEach(it => out.push(Object.assign({}, it, { status: g.status, groupId: g.groupId, ref: g.ref, org: g.org, purpose: g.purpose })));
    } else if(g.roomId){
      out.push(g); // sudah rata (tampilan publik dari server)
    }
  });
  return out;
}

// Item yang benar-benar "mengunci" ruangan (bukan ditolak/dibatalkan).
function activeItems(){
  return flattenBookingItems(getBookings()).filter(b => STATUS_TIDAK_MENGUNCI_RUANGAN_.indexOf(b.status) === -1);
}

// Teks tampilan "Penyelenggara - Kegiatan" (dipakai notifikasi/tooltip
// kalender). Bila salah satunya kosong, tampilkan yang ada saja.
function bookingLabel(b){
  const org = String(b.org || '').trim();
  const act = String(b.purpose || '').trim();
  if(org && act) return `${org} - ${act}`;
  return org || act || '-';
}

// Kode referensi untuk sel kalender yang sempit. Kode normal (A01 dst.)
// tampil utuh; nilai panjang/lama diganti titik supaya tidak meluber.
function refShort(ref){
  const r = String(ref || '').trim();
  return r && r.length <= 5 ? r : '●';
}

/* ===================== TOASTS ===================== */
// PERHATIAN: message dimasukkan lewat innerHTML — teks dari data pengguna
// (mis. nama penyelenggara) WAJIB di-escapeHtml() sebelum dikirim ke sini.
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

/* ===================== AUTH ===================== */
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
        <div class="w-7 h-7 rounded-full navy-bg text-white flex items-center justify-center text-xs font-bold">${escapeHtml((user.name||'U').charAt(0).toUpperCase())}</div>
        <span class="max-w-[110px] truncate">${escapeHtml(user.name)}</span>
      </div>
      <button onclick="logout()" class="text-xs font-medium text-slate-400 hover:text-[var(--danger)]">Keluar</button>`;
    desktop.innerHTML = html;
    mobile.innerHTML = `<div class="flex items-center gap-2 text-sm font-semibold navy-text mb-3"><div class="w-8 h-8 rounded-full navy-bg text-white flex items-center justify-center text-xs font-bold">${escapeHtml((user.name||'U').charAt(0).toUpperCase())}</div>${escapeHtml(user.name)}</div><button onclick="logout()" class="text-sm font-medium text-[var(--danger)]">Keluar</button>`;
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
      toast(escapeHtml(data.error || 'Gagal masuk dengan akun Google.'), 'error');
      return;
    }
    setUserToken(data.token);
    setUser({ name: data.user.name, email: data.user.email, org: data.user.org, role: 'user', isInternal: true });
    renderAuthArea();
    toast(`Selamat datang, ${escapeHtml(data.user.name)}.`);
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
    toast(`Selamat datang kembali, ${escapeHtml(name)}.`);
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
    toast(`Akun berhasil dibuat. Selamat datang, ${escapeHtml(name)}.`);
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
      toast(escapeHtml(data.error || 'Kredensial admin tidak valid.'), 'error');
      return;
    }
    setAdminToken(data.token);
    setUser({ name: 'Administrator', email, org: 'Pengelola Kawasan Pendidikan dan Pelatihan', role: 'admin' });
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
    subtext.textContent = 'Akun diperlukan untuk mengirim pemesanan, memantau status konfirmasi, dan melihat riwayat penggunaan ruangan di Kawasan Pendidikan dan Pelatihan.';
  } else {
    daftarTab.style.background = 'var(--navy-900)'; daftarTab.style.color = '#fff';
    masukTab.style.background = '#fff'; masukTab.style.color = 'var(--slate-600)';
    daftarForm.classList.remove('hidden'); masukForm.classList.add('hidden');
    heading.textContent = 'Buat akun baru';
    subtext.textContent = 'Daftarkan diri Anda untuk mulai mengajukan pemesanan ruang dan fasilitas di Kawasan Pendidikan dan Pelatihan.';
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
  const navMap = {home:'home', rooms:'rooms', detail:'rooms', calendar:'calendar', contact:'contact', history:'history', booking:'rooms', success:'rooms', login:null, 'admin-login':null, admin:null};
  const target = document.querySelector(`.nav-link[data-nav="${navMap[page]}"]`);
  if(target) target.classList.add('active');

  if(page === 'login') initGoogleSignIn();
  if(page === 'home') { refreshBookings('public').then(renderHomeCalendarWidget); }
  if(page === 'calendar') { refreshBookings('public').then(renderFullCalendarPage); }
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
  // Mencegah XSS: data dari formulir pemesanan (nama, penyelenggara,
  // kegiatan, catatan) bisa diisi bebas oleh siapa saja tanpa login, lalu
  // ditampilkan lagi di dashboard admin/kalender. Tanpa escape ini, isian
  // berisi tag HTML/script bisa dieksekusi di browser pembacanya.
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
// Jumlah hari termasuk hari pertama dan terakhir (1–3 Des = 3 hari).
function daysBetweenInclusive(a, b){
  const [ay,am,ad] = a.split('-').map(Number);
  const [by,bm,bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(by,bm-1,bd) - Date.UTC(ay,am-1,ad)) / 86400000) + 1;
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
        ${room.area ? `<span class="flex items-center gap-1"><i data-lucide="ruler" class="w-3.5 h-3.5"></i>${room.area} m²</span>` : ''}
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

/* ===================== LEGENDA & SEL KALENDER (dipakai bersama) ===================== */
function calendarLegendHtml(sizeCls){
  const c0 = BOOKING_COLORS.pending, c1 = BOOKING_COLORS.confirmed;
  const box = `inline-block ${sizeCls || 'w-4 h-4'} rounded`;
  return `
    <span class="flex items-center gap-1.5"><span class="${box}" style="background:#ecfdf5;border:1px solid #a7f3d0"></span>Tersedia</span>
    <span class="flex items-center gap-1.5"><span class="${box}" style="background:${c1.bg};border:1px solid ${c1.border}"></span>Terpesan (Konfirmasi)</span>
    <span class="flex items-center gap-1.5"><span class="${box}" style="background:${c0.bg};border:1px solid ${c0.border}"></span>Belum Konfirmasi</span>`;
}

/* ===================== WIDGET KALENDER KETERSEDIAAN (Beranda) ===================== */
// Ringkasan 7 hari ke depan untuk ruangan unggulan (FEATURED_IDS). Sel yang
// terpesan menampilkan kode referensi (A01, dst.) dan diwarnai menurut
// status; arahkan kursor untuk melihat "Penyelenggara - Kegiatan".
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
  const bookings = activeItems();

  const headerCells = days.map(d =>
    `<div class="text-center py-1.5"><p class="text-[10px] uppercase tracking-wide text-slate-400">${d.label}</p><p class="text-xs font-semibold navy-text">${d.date}</p></div>`
  ).join('');

  const roomRows = rooms.map(room => {
    const dayCells = days.map(d => {
      const match = bookings.find(b => b.roomId === room.id && d.key >= b.date && d.key <= (b.endDate || b.date));
      if(match){
        const c = bookingColor(match.status);
        return `<div class="h-8 rounded-md flex items-center justify-center text-[10px] font-bold border" style="background:${c.bg};border-color:${c.border};color:${c.text}" title="${escapeHtml(bookingLabel(match))}">${escapeHtml(refShort(match.ref))}</div>`;
      }
      return `<div class="h-8 rounded-md bg-emerald-50 border border-emerald-200"></div>`;
    }).join('');
    return `<div class="text-sm font-medium navy-text truncate pr-3 flex items-center">${escapeHtml(room.name)}</div>${dayCells}`;
  }).join('');

  container.innerHTML = `
    <div class="flex items-center justify-between mb-5 flex-wrap gap-2">
      <div>
        <h3 class="font-display text-lg font-bold navy-text">Ketersediaan 7 hari ke depan</h3>
        <p class="text-xs text-slate-500 mt-0.5">Ruangan unggulan · diperbarui real-time</p>
      </div>
      <button onclick="go('calendar')" class="text-xs font-semibold text-[var(--blue-accent)] hover:underline flex items-center gap-1">Lihat kalender lengkap semua ruangan <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></button>
    </div>
    <div class="grid gap-1.5" style="grid-template-columns: 160px repeat(7, minmax(0,1fr));">
      <div></div>${headerCells}
      ${roomRows}
    </div>
    <div class="flex items-center gap-4 mt-4 text-xs text-slate-500 flex-wrap">
      ${calendarLegendHtml()}
    </div>`;
  lucide.createIcons();
}

/* ===================== KALENDER LENGKAP (Semua Ruangan, 1 Bulan) ===================== */
// Menampilkan SEMUA ruangan (internal + eksternal) x satu bulan penuh.
// Klik sel terpesan -> notifikasi "Penyelenggara - Kegiatan" (tanpa data
// pribadi). Baris tanggal dan kolom nama ruangan dibekukan (freeze panes)
// lewat kelas CSS cal-head / cal-sticky-col di style.css.
let fullCalState = { year: new Date().getFullYear(), month: new Date().getMonth() };

function shiftFullCalendarMonth(delta){
  fullCalState.month += delta;
  if(fullCalState.month > 11){ fullCalState.month = 0; fullCalState.year++; }
  if(fullCalState.month < 0){ fullCalState.month = 11; fullCalState.year--; }
  renderFullCalendarPage();
}

function findBookingsForRoomDate(roomId, dateStr, bookings){
  return (bookings || []).filter(b => {
    if(b.roomId !== roomId) return false;
    const end = b.endDate || b.date;
    return dateStr >= b.date && dateStr <= end;
  });
}

// Klik sel kalender (halaman kalender lengkap & kalender detail ruangan):
// bila terpesan, tampilkan HANYA "Penyelenggara - Kegiatan".
function showCalendarCellInfo(roomId, dateStr){
  const room = findRoom(roomId);
  const matches = findBookingsForRoomDate(roomId, dateStr, activeItems());
  if(!matches.length){
    toast(`${escapeHtml(room ? room.name : '')} tersedia pada ${formatDateLong(dateStr)}.`);
    return;
  }
  const labels = [];
  matches.forEach(m => { const l = bookingLabel(m); if(labels.indexOf(l) === -1) labels.push(l); });
  toast(escapeHtml(labels.join('; ')));
}

function renderFullCalendarPage(){
  const { year, month } = fullCalState;
  const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const dayNamesShort = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);
  const bookings = activeItems();

  document.getElementById('full-cal-month-label').textContent = `${monthNames[month]} ${year}`;

  const dayCols = Array.from({length: daysInMonth}).map((_, i) => {
    const d = new Date(year, month, i+1);
    return { day: i+1, key: dateKey(year, month, i+1), label: dayNamesShort[d.getDay()], isPast: d < today };
  });

  const headerCells = dayCols.map(d =>
    `<div class="text-center py-2 border-l border-slate-100" style="width:42px;min-width:42px;"><p class="text-[9px] uppercase text-slate-400">${d.label}</p><p class="text-xs font-semibold navy-text">${d.day}</p></div>`
  ).join('');

  function roomRowHtml(room){
    const cells = dayCols.map(d => {
      const matches = findBookingsForRoomDate(room.id, d.key, bookings);
      const booked = matches.length > 0;
      const tip = booked ? matches.map(bookingLabel).join('; ') : 'Tersedia';
      const pastCls = d.isPast ? 'opacity-45' : '';
      let inner = '';
      let style = '';
      if(booked){
        const c = bookingColor(matches[0].status);
        style = `background:${c.bg};border-color:${c.border};color:${c.text}`;
        inner = `<span class="text-[9px] font-bold leading-none">${escapeHtml(refShort(matches[0].ref))}</span>`;
      } else {
        style = 'background:#ecfdf5;border-color:#a7f3d0';
      }
      return `<div class="border-l border-slate-100 flex items-center justify-center" style="width:42px;min-width:42px;">
        <button type="button" onclick="showCalendarCellInfo('${room.id}','${d.key}')" title="${escapeHtml(tip)}" class="w-8 h-7 rounded flex items-center justify-center border ${pastCls} hover:opacity-80 transition" style="${style}">${inner}</button>
      </div>`;
    }).join('');
    return `<div class="flex items-stretch border-t border-slate-100">
      <div class="cal-sticky-col flex items-center px-3 py-1.5 text-xs font-medium navy-text truncate" style="width:170px;min-width:170px;">${escapeHtml(room.name)}</div>
      ${cells}
    </div>`;
  }

  const internalRooms = ROOMS.filter(r => !r.isExternal);
  const externalRooms = ROOMS.filter(r => r.isExternal);

  const html = `
    <div class="cal-head flex items-stretch">
      <div class="cal-sticky-col px-3 py-2 text-xs font-semibold navy-text flex items-center" style="width:170px;min-width:170px;">Ruangan</div>
      ${headerCells}
    </div>
    <div class="cal-section-row px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide border-t border-slate-100"><span class="cal-section-text">Fasilitas Internal</span></div>
    ${internalRooms.map(roomRowHtml).join('')}
    <div class="cal-section-row px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide border-t border-slate-100"><span class="cal-section-text">Wisma (Eksternal)</span></div>
    ${externalRooms.map(roomRowHtml).join('')}
  `;
  document.getElementById('full-calendar-grid').innerHTML = html;
  document.getElementById('full-calendar-legend').innerHTML = `
    ${calendarLegendHtml()}
    <span class="flex items-center gap-1.5"><span class="inline-block w-4 h-4 rounded bg-slate-100 opacity-60"></span>Tanggal lampau</span>`;
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
// Mengembalikan Map<tanggal (1–31), booking> untuk bulan y/m. Rentang
// tanggal (mis. 1–3 Des) DIURAIKAN penuh — sebelumnya hanya tanggal awal
// yang ditandai terpesan.
function realBookedDays(roomId, y, m){
  const items = activeItems().filter(b => b.roomId === roomId);
  const booked = new Map();
  const daysInMonth = new Date(y, m+1, 0).getDate();
  const first = dateKey(y, m, 1), last = dateKey(y, m, daysInMonth);
  items.forEach(b => {
    const end = b.endDate || b.date;
    if(b.date > last || end < first) return; // tidak beririsan dengan bulan ini
    const s = b.date < first ? 1 : Number(b.date.slice(8,10));
    const e = end > last ? daysInMonth : Number(end.slice(8,10));
    for(let d = s; d <= e; d++){ if(!booked.has(d)) booked.set(d, b); }
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
  const isToday = d => { const t = new Date(); return d === t.getDate() && month === t.getMonth() && year === t.getFullYear(); };

  let cells = '';
  for(let i=0;i<offset;i++) cells += `<div class="cal-day cal-empty"></div>`;
  for(let d=1; d<=daysInMonth; d++){
    const thisDate = new Date(year, month, d);
    const isPast = thisDate < today;
    const match = booked.get(d);
    let cls = 'cal-day ';
    let attr = '';
    let style = '';
    if(isPast){ cls += 'cal-past'; }
    else if(match){
      cls += 'cal-booked';
      const c = bookingColor(match.status);
      style = `style="background:${c.bg};border-color:${c.border};color:${c.text}"`;
      attr = `title="${escapeHtml(bookingLabel(match))}" onclick="showCalendarCellInfo('${room.id}','${dateKey(year,month,d)}')"`;
    }
    else { cls += 'cal-available'; attr = `onclick="selectDay(${d})"`; }
    if(calState.selectedDay === d) cls += ' cal-selected';
    if(isToday(d) && calState.selectedDay !== d) cls += ' cal-today';
    cells += `<div class="${cls}" ${attr} ${style} id="cal-cell-${d}">${d}</div>`;
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
  const hasFacilities = room.facilities && room.facilities.length;

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
        <div><p class="text-xs uppercase tracking-wide text-slate-400 mb-1">Luas</p><p class="font-semibold navy-text">${room.area ? room.area + ' m²' : '-'}</p></div>
        <div><p class="text-xs uppercase tracking-wide text-slate-400 mb-1">Lokasi</p><p class="font-semibold navy-text">${room.floor}</p></div>
        <div><p class="text-xs uppercase tracking-wide text-slate-400 mb-1">${room.isExternal ? 'Tarif Harian' : 'Status'}</p><p class="font-semibold navy-text">${room.isExternal ? priceFmt(room.priceDay) : 'Fasilitas Internal (gratis)'}</p></div>
      </div>
      ${hasFacilities ? `
      <h3 class="font-display text-xl font-bold navy-text mb-4">Fasilitas</h3>
      <div class="grid md:grid-cols-2 gap-x-8 gap-y-3">
        ${room.facilities.map(f => `<div class="flex items-center gap-2 text-sm"><i data-lucide="check" class="w-4 h-4" style="color:var(--blue-accent)"></i>${f}</div>`).join('')}
      </div>` : ''}
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

        <div class="flex items-center gap-3 text-[11px] mb-5 flex-wrap">
          ${calendarLegendHtml('w-3 h-3')}
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