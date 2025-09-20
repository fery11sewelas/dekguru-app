// DekGuru - script.js (lengkap untuk fitur dasar)
// Menjaga agar fungsi aman ketika elemen tidak ada di DOM (defensive checks)

// ========== Data =========
const STORAGE_KEYS = {
  jadwal: 'dekguru_jadwal',
  agenda: 'dekguru_agenda',
  tugas: 'dekguru_tugas',
  materi: 'dekguru_materi',
  presensi: 'dekguru_presensi',
  nilai: 'dekguru_nilai',
  siswa: 'dekguru_siswa',
  profile: 'dekguru_profile',
  kelas: 'dekguru_kelas'
};

let jadwalData = [];
let agendaData = [];
let tugasData = [];
let materiData = [];
let presensiData = {}; // struktur: { '2025-09-20': { 'X E1': [ {nis,nama,status} ...] } }
let nilaiData = {};
let siswaData = {};
let profileData = {
  namaGuru: 'Fery Yanto Yudhi Saputro, S.Pd',
  mapel: 'Bahasa Jawa',
  sekolah: 'SMA N 3 Magelang'
};
let kelasData = [
  'X E1','X E2','X E3','X E4','X E5','X E6','X E7','X E8','X E9',
  'XI F6','XI F7','XI F8','XI F9'
];

// ========== Util =========
function safeGet(id){ return document.getElementById(id) || null; }

function loadFromStorage(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  }catch(e){
    console.error('Load error', key, e);
    return fallback;
  }
}
function saveToStorage(key, data){
  try{
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  }catch(e){
    console.error('Save error', key, e);
    return false;
  }
}

// ========== Init =========
document.addEventListener('DOMContentLoaded', ()=>{
  jadwalData = loadFromStorage(STORAGE_KEYS.jadwal, []);
  agendaData = loadFromStorage(STORAGE_KEYS.agenda, []);
  tugasData = loadFromStorage(STORAGE_KEYS.tugas, []);
  materiData = loadFromStorage(STORAGE_KEYS.materi, []);
  presensiData = loadFromStorage(STORAGE_KEYS.presensi, {});
  nilaiData = loadFromStorage(STORAGE_KEYS.nilai, {});
  siswaData = loadFromStorage(STORAGE_KEYS.siswa, {});
  profileData = loadFromStorage(STORAGE_KEYS.profile, profileData);
  kelasData = loadFromStorage(STORAGE_KEYS.kelas, kelasData);

  updateProfileDisplay();
  renderAllTabs();
  // hide sync status after 2s
  const sync = safeGet('syncStatus');
  if(sync) setTimeout(()=>{ sync.style.display='none'; }, 2000);
});

// ========== Profile ==========
function updateProfileDisplay(){
  const name = safeGet('displayNamaGuru');
  const sub = safeGet('displayMapelSekolah');
  if(name) name.textContent = profileData.namaGuru;
  if(sub) sub.textContent = `Guru ${profileData.mapel} - ${profileData.sekolah}`;
}

function toggleProfileEdit(){
  const form = safeGet('profileEditForm');
  const btn = safeGet('editProfileBtn');
  if(!form || !btn) return;
  if(form.classList.contains('hidden')){
    form.classList.remove('hidden');
    safeGet('editNamaGuru').value = profileData.namaGuru || '';
    safeGet('editMapel').value = profileData.mapel || '';
    safeGet('editSekolah').value = profileData.sekolah || '';
    btn.textContent = '❌ Tutup';
  }else{
    form.classList.add('hidden');
    btn.innerHTML = '✏️ Edit Profil';
  }
}

function saveProfile(event){
  if(event && event.preventDefault) event.preventDefault();
  const n = safeGet('editNamaGuru');
  const m = safeGet('editMapel');
  const s = safeGet('editSekolah');
  if(n && m && s){
    profileData.namaGuru = n.value;
    profileData.mapel = m.value;
    profileData.sekolah = s.value;
    saveToStorage(STORAGE_KEYS.profile, profileData);
    updateProfileDisplay();
    alert('✅ Profil tersimpan');
    toggleProfileEdit();
  }
}

function cancelProfileEdit(){
  const form = safeGet('profileEditForm');
  const btn = safeGet('editProfileBtn');
  if(form) form.classList.add('hidden');
  if(btn) btn.innerHTML = '✏️ Edit Profil';
}

// ========== Tabs =========
function showTab(tab){
  document.querySelectorAll('.tab-content').forEach(c=>c.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(b=>{ b.classList.remove('active-tab'); b.classList.add('bg-gray-100','text-gray-700'); });
  const content = safeGet(`content-${tab}`);
  const tabBtn = safeGet(`tab-${tab}`);
  if(content) content.classList.remove('hidden');
  if(tabBtn){ tabBtn.classList.add('active-tab'); tabBtn.classList.remove('bg-gray-100','text-gray-700'); }
}

// ========== Kelas (dropdown helper) ==========
function updateAllKelasDropdowns(){
  const ids = ['kelasSelect','jadwalKelas','agendaKelas','tugasKelas','nilaiKelasSelect'];
  ids.forEach(id=>{
    const el = safeGet(id);
    if(!el) return;
    const current = el.value || '';
    el.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value='';
    placeholder.textContent='-- Pilih Kelas --';
    el.appendChild(placeholder);
    kelasData.forEach(k=>{
      const opt = document.createElement('option');
      opt.value = k;
      opt.textContent = k;
      el.appendChild(opt);
    });
    if(kelasData.includes(current)) el.value = current;
  });
}

// ========== PRESENSI ==========
function renderPresensiUI(){
  const container = safeGet('content-presensi');
  if(!container) return;
  container.innerHTML = `
    <div class="bg-white p-4 rounded shadow">
      <h2 class="text-lg font-semibold mb-2">Presensi Harian</h2>
      <div class="grid md:grid-cols-3 gap-3 mb-3">
        <input type="date" id="tanggalPresensi" class="p-2 border rounded" />
        <select id="kelasSelect" class="p-2 border rounded"></select>
        <div class="flex gap-2">
          <button class="px-3 py-2 bg-blue-600 text-white rounded" onclick="generateDefaultStudents()">🔄 Generate Siswa</button>
          <button class="px-3 py-2 bg-green-600 text-white rounded" onclick="savePresensi()">💾 Simpan Presensi</button>
          <button class="px-3 py-2 bg-gray-600 text-white rounded" onclick="downloadPresensiCSV()">⬇️ Download CSV</button>
        </div>
      </div>
      <div id="presensiArea" class="mt-3"></div>
    </div>
  `;
  updateAllKelasDropdowns();
  const dateInput = safeGet('tanggalPresensi');
  if(dateInput) dateInput.valueAsDate = new Date();
  // attach change listener
  const kelasSelect = safeGet('kelasSelect');
  if(kelasSelect) kelasSelect.addEventListener('change', ()=> renderPresensiList());
  renderPresensiList();
}

function generateDefaultStudents(){
  const kelas = safeGet('kelasSelect')?.value || kelasData[0];
  if(!kelas) return alert('Pilih kelas dulu');
  // If students for class not exist, create sample students
  if(!siswaData[kelas] || siswaData[kelas].length===0){
    siswaData[kelas] = [];
    for(let i=1;i<=25;i++){
      siswaData[kelas].push({
        nis: (1000 + i).toString(),
        nama: `Siswa ${i}`
      });
    }
    saveToStorage(STORAGE_KEYS.siswa, siswaData);
  }
  renderPresensiList();
}

function renderPresensiList(){
  const area = safeGet('presensiArea');
  if(!area) return;
  const tanggal = safeGet('tanggalPresensi')?.value;
  const kelas = safeGet('kelasSelect')?.value;
  if(!tanggal || !kelas){
    area.innerHTML = '<p class="text-sm text-gray-500">Pilih tanggal dan kelas untuk melihat/mengisi presensi.</p>';
    return;
  }
  // ensure list exists
  const students = siswaData[kelas] || [];
  // load existing presensi for date+kelas
  const dayKey = tanggal;
  presensiData[dayKey] = presensiData[dayKey] || {};
  presensiData[dayKey][kelas] = presensiData[dayKey][kelas] || students.map(s=>({ nis: s.nis, nama: s.nama, status: 'Hadir' }));
  // build table
  let html = `<table class="w-full text-sm"><thead><tr class="text-left"><th>No</th><th>NIS</th><th>Nama</th><th>Status</th></tr></thead><tbody>`;
  presensiData[dayKey][kelas].forEach((row, idx)=>{
    html += `<tr class="${idx%2===0?'bg-gray-50':''}"><td>${idx+1}</td><td>${row.nis}</td><td>${row.nama}</td><td>
      <select data-idx="${idx}" onchange="onPresensiStatusChange('${dayKey}','${kelas}', this)" class="p-1 border rounded">
        <option ${row.status==='Hadir'?'selected':''}>Hadir</option>
        <option ${row.status==='Izin'?'selected':''}>Izin</option>
        <option ${row.status==='Sakit'?'selected':''}>Sakit</option>
        <option ${row.status==='Alpha'?'selected':''}>Alpha</option>
      </select>
    </td></tr>`;
  });
  html += `</tbody></table>`;
  area.innerHTML = html;
  saveToStorage(STORAGE_KEYS.presensi, presensiData);
}

function onPresensiStatusChange(tanggal, kelas, selectEl){
  const idx = parseInt(selectEl.dataset.idx);
  const value = selectEl.value;
  if(!presensiData[tanggal] || !presensiData[tanggal][kelas]) return;
  presensiData[tanggal][kelas][idx].status = value;
  saveToStorage(STORAGE_KEYS.presensi, presensiData);
}

function savePresensi(){
  saveToStorage(STORAGE_KEYS.presensi, presensiData);
  alert('✅ Presensi disimpan di localStorage');
}

function downloadPresensiCSV(){
  const tanggal = safeGet('tanggalPresensi')?.value;
  const kelas = safeGet('kelasSelect')?.value;
  if(!tanggal || !kelas) return alert('Pilih tanggal dan kelas');
  const rows = presensiData[tanggal]?.[kelas];
  if(!rows) return alert('Belum ada data presensi untuk tanggal/kelas ini');
  let csv = 'No,NIS,Nama,Status\n';
  rows.forEach((r,i)=> csv += `${i+1},${r.nis},"${r.nama}",${r.status}\n`);
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `presensi_${kelas}_${tanggal}.csv`; a.click(); URL.revokeObjectURL(url);
}

// ========== Jadwal =========
function renderJadwalUI(){
  const container = safeGet('content-jadwal');
  if(!container) return;
  container.innerHTML = `
    <div class="bg-white p-4 rounded shadow">
      <h2 class="text-lg font-semibold mb-2">Jadwal Mengajar</h2>
      <form id="jadwalForm" class="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3" onsubmit="addJadwal(event)">
        <input id="jadwalHari" placeholder="Hari (Senin...)" class="p-2 border rounded" required/>
        <input id="jadwalJam" placeholder="Jam (07:00-08:30)" class="p-2 border rounded" required/>
        <select id="jadwalKelas" class="p-2 border rounded"></select>
        <button class="px-3 py-2 bg-blue-600 text-white rounded">Tambah</button>
      </form>
      <div id="jadwalList"></div>
    </div>
  `;
  updateAllKelasDropdowns();
  renderJadwalList();
}

function addJadwal(e){
  if(e && e.preventDefault) e.preventDefault();
  const hari = safeGet('jadwalHari')?.value.trim();
  const jam = safeGet('jadwalJam')?.value.trim();
  const kelas = safeGet('jadwalKelas')?.value;
  if(!hari||!jam||!kelas) return alert('Lengkapi form jadwal');
  jadwalData.push({ id: Date.now(), hari, jam, kelas });
  saveToStorage(STORAGE_KEYS.jadwal, jadwalData);
  renderJadwalList();
  safeGet('jadwalForm')?.reset();
}

function renderJadwalList(){
  const el = safeGet('jadwalList');
  if(!el) return;
  if(jadwalData.length===0){ el.innerHTML = '<p class="text-sm text-gray-500">Belum ada jadwal</p>'; return; }
  let html = '<ul class="space-y-2">';
  jadwalData.forEach(item=>{
    html += `<li class="p-2 bg-gray-50 rounded flex justify-between items-center">
      <div><strong>${item.hari} ${item.jam}</strong><div class="text-sm text-gray-600">${item.kelas}</div></div>
      <div><button class="text-red-500" onclick="deleteJadwal(${item.id})">Hapus</button></div>
    </li>`;
  });
  html += '</ul>';
  el.innerHTML = html;
}

function deleteJadwal(id){
  jadwalData = jadwalData.filter(j=>j.id!==id);
  saveToStorage(STORAGE_KEYS.jadwal, jadwalData);
  renderJadwalList();
}

// ========== Agenda =========
function renderAgendaUI(){
  const container = safeGet('content-agenda');
  if(!container) return;
  container.innerHTML = `
    <div class="bg-white p-4 rounded shadow">
      <h2 class="text-lg font-semibold mb-2">Agenda Mengajar</h2>
      <form id="agendaForm" class="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3" onsubmit="addAgenda(event)">
        <input id="agendaTanggal" type="date" class="p-2 border rounded" required/>
        <input id="agendaJudul" placeholder="Judul Agenda" class="p-2 border rounded" required/>
        <select id="agendaKelas" class="p-2 border rounded"></select>
        <button class="px-3 py-2 bg-blue-600 text-white rounded">Tambah</button>
      </form>
      <div id="agendaList"></div>
    </div>
  `;
  updateAllKelasDropdowns();
  const dateEl = safeGet('agendaTanggal');
  if(dateEl) dateEl.valueAsDate = new Date();
  renderAgendaList();
}

function addAgenda(e){
  if(e && e.preventDefault) e.preventDefault();
  const tgl = safeGet('agendaTanggal')?.value;
  const judul = safeGet('agendaJudul')?.value.trim();
  const kelas = safeGet('agendaKelas')?.value;
  if(!tgl||!judul||!kelas) return alert('Lengkapi form agenda');
  agendaData.push({id: Date.now(), tanggal: tgl, judul, kelas});
  saveToStorage(STORAGE_KEYS.agenda, agendaData);
  renderAgendaList();
  safeGet('agendaForm')?.reset();
}

function renderAgendaList(){
  const el = safeGet('agendaList');
  if(!el) return;
  if(agendaData.length===0){ el.innerHTML = '<p class="text-sm text-gray-500">Belum ada agenda</p>'; return; }
  let html = '<ul class="space-y-2">';
  agendaData.forEach(a=>{
    html += `<li class="p-2 bg-gray-50 rounded flex justify-between items-center">
      <div><strong>${a.tanggal}</strong><div class="text-sm text-gray-600">${a.judul} - ${a.kelas}</div></div>
      <div><button class="text-red-500" onclick="deleteAgenda(${a.id})">Hapus</button></div>
    </li>`;
  });
  html += '</ul>';
  el.innerHTML = html;
}

function deleteAgenda(id){
  agendaData = agendaData.filter(a=>a.id!==id);
  saveToStorage(STORAGE_KEYS.agenda, agendaData);
  renderAgendaList();
}

// ========== Tugas =========
function renderTugasUI(){
  const container = safeGet('content-tugas');
  if(!container) return;
  container.innerHTML = `
    <div class="bg-white p-4 rounded shadow">
      <h2 class="text-lg font-semibold mb-2">Tugas & Deadline</h2>
      <form id="tugasForm" class="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3" onsubmit="addTugas(event)">
        <input id="tugasJudul" placeholder="Judul Tugas" class="p-2 border rounded" required/>
        <input id="tugasDeadline" type="date" class="p-2 border rounded" required/>
        <select id="tugasKelas" class="p-2 border rounded"></select>
        <button class="px-3 py-2 bg-blue-600 text-white rounded">Tambah</button>
      </form>
      <div id="tugasList"></div>
    </div>
  `;
  updateAllKelasDropdowns();
  renderTugasList();
}

function addTugas(e){
  if(e && e.preventDefault) e.preventDefault();
  const judul = safeGet('tugasJudul')?.value.trim();
  const deadline = safeGet('tugasDeadline')?.value;
  const kelas = safeGet('tugasKelas')?.value;
  if(!judul||!deadline||!kelas) return alert('Lengkapi form tugas');
  tugasData.push({id: Date.now(), judul, deadline, kelas, done:false});
  saveToStorage(STORAGE_KEYS.tugas, tugasData);
  renderTugasList();
  safeGet('tugasForm')?.reset();
}

function renderTugasList(){
  const el = safeGet('tugasList');
  if(!el) return;
  if(tugasData.length===0){ el.innerHTML = '<p class="text-sm text-gray-500">Belum ada tugas</p>'; return; }
  let html = '<ul class="space-y-2">';
  tugasData.forEach(t=>{
    html += `<li class="p-2 bg-gray-50 rounded flex justify-between items-center">
      <div><strong>${t.judul}</strong><div class="text-sm text-gray-600">Deadline: ${t.deadline} · ${t.kelas}</div></div>
      <div class="flex gap-2"><button onclick="toggleTugasDone(${t.id})" class="px-2 py-1 border rounded">${t.done?'Undo':'Selesai'}</button><button class="text-red-500" onclick="deleteTugas(${t.id})">Hapus</button></div>
    </li>`;
  });
  html += '</ul>';
  el.innerHTML = html;
}

function toggleTugasDone(id){
  tugasData = tugasData.map(t=> t.id===id? {...t, done:!t.done} : t);
  saveToStorage(STORAGE_KEYS.tugas, tugasData);
  renderTugasList();
}

function deleteTugas(id){
  tugasData = tugasData.filter(t=>t.id!==id);
  saveToStorage(STORAGE_KEYS.tugas, tugasData);
  renderTugasList();
}

// ========== Materi =========
function renderMateriUI(){
  const container = safeGet('content-materi');
  if(!container) return;
  container.innerHTML = `
    <div class="bg-white p-4 rounded shadow">
      <h2 class="text-lg font-semibold mb-2">Materi Mengajar</h2>
      <form id="materiForm" class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3" onsubmit="addMateri(event)">
        <input id="materiJudul" placeholder="Judul Materi" class="p-2 border rounded" required/>
        <select id="materiKelas" class="p-2 border rounded"></select>
        <button class="px-3 py-2 bg-blue-600 text-white rounded">Tambah</button>
      </form>
      <div id="materiList"></div>
    </div>
  `;
  updateAllKelasDropdowns();
  renderMateriList();
}

function addMateri(e){
  if(e && e.preventDefault) e.preventDefault();
  const judul = safeGet('materiJudul')?.value.trim();
  const kelas = safeGet('materiKelas')?.value;
  if(!judul||!kelas) return alert('Lengkapi form materi');
  materiData.push({id: Date.now(), judul, kelas});
  saveToStorage(STORAGE_KEYS.materi, materiData);
  renderMateriList();
  safeGet('materiForm')?.reset();
}

function renderMateriList(){
  const el = safeGet('materiList');
  if(!el) return;
  if(materiData.length===0){ el.innerHTML = '<p class="text-sm text-gray-500">Belum ada materi</p>'; return; }
  let html = '<ul class="space-y-2">';
  materiData.forEach(m=>{
    html += `<li class="p-2 bg-gray-50 rounded flex justify-between items-center">
      <div><strong>${m.judul}</strong><div class="text-sm text-gray-600">${m.kelas}</div></div>
      <div><button class="text-red-500" onclick="deleteMateri(${m.id})">Hapus</button></div>
    </li>`;
  });
  html += '</ul>';
  el.innerHTML = html;
}

function deleteMateri(id){
  materiData = materiData.filter(m=>m.id!==id);
  saveToStorage(STORAGE_KEYS.materi, materiData);
  renderMateriList();
}

// ========== Nilai =========
function renderNilaiUI(){
  const container = safeGet('content-nilai');
  if(!container) return;
  container.innerHTML = `
    <div class="bg-white p-4 rounded shadow">
      <h2 class="text-lg font-semibold mb-2">Input Nilai Siswa</h2>
      <div class="grid md:grid-cols-3 gap-2 mb-3">
        <select id="nilaiKelasSelect" class="p-2 border rounded"></select>
        <button class="px-3 py-2 bg-blue-600 text-white rounded" onclick="populateNilaiSiswa()">Muat Siswa</button>
        <button class="px-3 py-2 bg-green-600 text-white rounded" onclick="downloadNilaiCSV()">⬇️ Download Nilai CSV</button>
      </div>
      <div id="nilaiArea"></div>
    </div>
  `;
  updateAllKelasDropdowns();
  renderNilaiArea();
}

function populateNilaiSiswa(){
  const kelas = safeGet('nilaiKelasSelect')?.value;
  if(!kelas) return alert('Pilih kelas');
  const students = siswaData[kelas] || [];
  if(students.length===0) return alert('Belum ada data siswa untuk kelas ini. Gunakan Generate Siswa di Presensi.');
  // prepare nilaiData structure
  nilaiData[kelas] = nilaiData[kelas] || {};
  students.forEach(s=>{
    nilaiData[kelas][s.nis] = nilaiData[kelas][s.nis] || {nama:s.nama, uts:'', uas:'', tugas:''};
  });
  saveToStorage(STORAGE_KEYS.nilai, nilaiData);
  renderNilaiArea();
}

function renderNilaiArea(){
  const area = safeGet('nilaiArea');
  if(!area) return;
  const kelas = safeGet('nilaiKelasSelect')?.value;
  if(!kelas){ area.innerHTML = '<p class="text-sm text-gray-500">Pilih kelas lalu muat siswa.</p>'; return; }
  const klasData = nilaiData[kelas] || {};
  const rows = Object.keys(klasData);
  if(rows.length===0){ area.innerHTML = '<p class="text-sm text-gray-500">Belum ada nilai. Muat siswa dulu.</p>'; return; }
  let html = `<table class="w-full text-sm"><thead><tr><th>No</th><th>NIS</th><th>Nama</th><th>Tugas</th><th>UTS</th><th>UAS</th><th>Rata</th></tr></thead><tbody>`;
  rows.forEach((nis, idx)=>{
    const r = klasData[nis];
    const rata = calcAverage([Number(r.tugas||0), Number(r.uts||0), Number(r.uas||0)]);
    html += `<tr class="${idx%2===0?'bg-gray-50':''}"><td>${idx+1}</td><td>${nis}</td><td>${r.nama}</td>
      <td><input data-nis="${nis}" data-kelas="${kelas}" data-field="tugas" value="${r.tugas||''}" oninput="onNilaiChange(event)" class="p-1 border rounded w-20"/></td>
      <td><input data-nis="${nis}" data-kelas="${kelas}" data-field="uts" value="${r.uts||''}" oninput="onNilaiChange(event)" class="p-1 border rounded w-20"/></td>
      <td><input data-nis="${nis}" data-kelas="${kelas}" data-field="uas" value="${r.uas||''}" oninput="onNilaiChange(event)" class="p-1 border rounded w-20"/></td>
      <td>${isNaN(rata)?'':rata}</td></tr>`;
  });
  html += `</tbody></table>`;
  area.innerHTML = html;
}

function onNilaiChange(e){
  const el = e.target;
  const nis = el.dataset.nis;
  const kelas = el.dataset.kelas;
  const field = el.dataset.field;
  const val = el.value;
  if(!nilaiData[kelas]) nilaiData[kelas]={};
  if(!nilaiData[kelas][nis]) nilaiData[kelas][nis]={nama:'', tugas:'', uts:'', uas:''};
  nilaiData[kelas][nis][field] = val;
  saveToStorage(STORAGE_KEYS.nilai, nilaiData);
  renderNilaiArea(); // re-render to update averages (simple approach)
}

function calcAverage(arr){
  const nums = arr.map(x=>Number(x)||0);
  const avg = nums.reduce((a,b)=>a+b,0)/nums.length;
  return Math.round(avg*100)/100;
}

function downloadNilaiCSV(){
  const kelas = safeGet('nilaiKelasSelect')?.value;
  if(!kelas) return alert('Pilih kelas');
  const klas = nilaiData[kelas];
  if(!klas) return alert('Belum ada data nilai untuk kelas ini');
  let csv = 'NIS,Nama,Tugas,UTS,UAS,Rata\n';
  Object.keys(klas).forEach(nis=>{
    const r = klas[nis];
    const rata = calcAverage([Number(r.tugas||0), Number(r.uts||0), Number(r.uas||0)]) || 0;
    csv += `${nis},"${r.nama}",${r.tugas||0},${r.uts||0},${r.uas||0},${rata}\n`;
  });
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `nilai_${kelas}.csv`; a.click(); URL.revokeObjectURL(url);
}

// ========== Render Helpers =========
function renderAllTabs(){
  renderPresensiUI();
  renderJadwalUI();
  renderAgendaUI();
  renderTugasUI();
  renderMateriUI();
  renderNilaiUI();
}

// ========== Export / Import Project (ZIP-ish via JSON) =========
function exportProjectJSON(){
  const payload = {
    jadwal: jadwalData, agenda: agendaData, tugas: tugasData, materi: materiData,
    presensi: presensiData, nilai: nilaiData, siswa: siswaData, profile: profileData, kelas: kelasData
  };
  const dataStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([dataStr], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'dekguru_export.json'; a.click(); URL.revokeObjectURL(url);
}

function importProjectJSON(file){
  if(!file) return alert('Pilih file JSON yang valid');
  const reader = new FileReader();
  reader.onload = function(e){
    try{
      const obj = JSON.parse(e.target.result);
      jadwalData = obj.jadwal || [];
      agendaData = obj.agenda || [];
      tugasData = obj.tugas || [];
      materiData = obj.materi || [];
      presensiData = obj.presensi || {};
      nilaiData = obj.nilai || {};
      siswaData = obj.siswa || {};
      profileData = obj.profile || profileData;
      kelasData = obj.kelas || kelasData;
      // save all
      saveToStorage(STORAGE_KEYS.jadwal, jadwalData);
      saveToStorage(STORAGE_KEYS.agenda, agendaData);
      saveToStorage(STORAGE_KEYS.tugas, tugasData);
      saveToStorage(STORAGE_KEYS.materi, materiData);
      saveToStorage(STORAGE_KEYS.presensi, presensiData);
      saveToStorage(STORAGE_KEYS.nilai, nilaiData);
      saveToStorage(STORAGE_KEYS.siswa, siswaData);
      saveToStorage(STORAGE_KEYS.profile, profileData);
      saveToStorage(STORAGE_KEYS.kelas, kelasData);
      updateProfileDisplay();
      renderAllTabs();
      alert('✅ Data berhasil diimpor');
    }catch(err){
      alert('File tidak valid: '+err.message);
    }
  };
  reader.readAsText(file);
}

// ========== Utility: Manual Sync (simulated) =========
function manualSync(){
  const btn = safeGet('syncButton');
  if(btn){ btn.textContent = '🔄 Menyinkronkan...'; btn.disabled = true; }
  setTimeout(()=>{
    if(btn){ btn.textContent = '🌐 Sync Cloud'; btn.disabled = false; }
    const s = safeGet('syncStatus'); if(s){ s.style.display='block'; s.textContent='✅ Tersinkron'; setTimeout(()=>s.style.display='none', 2000); }
  }, 1200);
}

// ========== Expose import function to input file element if needed =========
window.exportProjectJSON = exportProjectJSON;
window.importProjectJSON = function(evt){
  const file = evt?.target?.files?.[0];
  importProjectJSON(file);
};
