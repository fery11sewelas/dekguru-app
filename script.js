
        // Global variables
        let jadwalData = [];
        let agendaData = [];
        let tugasData = [];
        let materiData = [];
        let presensiData = {};
        let nilaiData = {};
        let siswaData = {};
        let profileData = {
            namaGuru: 'Fery Yanto Yudhi Saputro, S.Pd',
            mapel: 'Bahasa Jawa',
            sekolah: 'SMA N 3 Magelang'
        };
        
        let kelasData = [
            'X E1', 'X E2', 'X E3', 'X E4', 'X E5', 'X E6', 'X E7', 'X E8', 'X E9',
            'XI F6', 'XI F7', 'XI F8', 'XI F9'
        ];

        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            loadAllData();
            updateAllKelasDropdowns();
            displayJadwal();
            displayAgenda();
            displayTugas();
            displayMateri();
            
            // Set today's date
            document.getElementById('tanggalPresensi').valueAsDate = new Date();
            document.getElementById('agendaTanggal').valueAsDate = new Date();
            
            // Hide sync status after 3 seconds
            setTimeout(() => {
                const syncStatus = document.getElementById('syncStatus');
                if (syncStatus) {
                    syncStatus.style.opacity = '0';
                    setTimeout(() => {
                        syncStatus.style.display = 'none';
                    }, 500);
                }
            }, 3000);
        });

        // Load all data from localStorage
        function loadAllData() {
            try {
                const savedJadwal = localStorage.getItem('jadwalData');
                if (savedJadwal) jadwalData = JSON.parse(savedJadwal);

                const savedAgenda = localStorage.getItem('agendaData');
                if (savedAgenda) agendaData = JSON.parse(savedAgenda);

                const savedTugas = localStorage.getItem('tugasData');
                if (savedTugas) tugasData = JSON.parse(savedTugas);

                const savedMateri = localStorage.getItem('materiData');
                if (savedMateri) materiData = JSON.parse(savedMateri);

                const savedPresensi = localStorage.getItem('presensiData');
                if (savedPresensi) presensiData = JSON.parse(savedPresensi);

                const savedNilai = localStorage.getItem('nilaiData');
                if (savedNilai) nilaiData = JSON.parse(savedNilai);

                const savedSiswa = localStorage.getItem('siswaData');
                if (savedSiswa) siswaData = JSON.parse(savedSiswa);

                const savedProfile = localStorage.getItem('profileData');
                if (savedProfile) {
                    profileData = JSON.parse(savedProfile);
                    updateProfileDisplay();
                }

                const savedKelas = localStorage.getItem('kelasData');
                if (savedKelas) kelasData = JSON.parse(savedKelas);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        }

        // Save data to localStorage
        function saveData(key, data) {
            try {
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (error) {
                console.error('Error saving data:', error);
                return false;
            }
        }

        // Manual sync function (placeholder for cloud sync)
        function manualSync() {
            const syncBtn = document.getElementById('syncButton');
            const originalText = syncBtn.textContent;
            
            syncBtn.textContent = '🔄 Menyinkronkan...';
            syncBtn.disabled = true;
            
            // Simulate sync process
            setTimeout(() => {
                syncBtn.textContent = '✅ Tersinkron';
                setTimeout(() => {
                    syncBtn.textContent = originalText;
                    syncBtn.disabled = false;
                }, 2000);
            }, 1500);
        }

        // Tab functionality
        function showTab(tabName) {
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active-tab');
                btn.classList.add('bg-gray-100', 'text-gray-700');
            });
            
            document.getElementById(`content-${tabName}`).classList.remove('hidden');
            
            const activeTab = document.getElementById(`tab-${tabName}`);
            activeTab.classList.add('active-tab');
            activeTab.classList.remove('bg-gray-100', 'text-gray-700');
        }

        // Profile management
        function toggleProfileEdit() {
            const form = document.getElementById('profileEditForm');
            const btn = document.getElementById('editProfileBtn');
            
            if (form.classList.contains('hidden')) {
                form.classList.remove('hidden');
                document.getElementById('editNamaGuru').value = profileData.namaGuru;
                document.getElementById('editMapel').value = profileData.mapel;
                document.getElementById('editSekolah').value = profileData.sekolah;
                btn.textContent = '❌ Tutup';
            } else {
                form.classList.add('hidden');
                btn.innerHTML = '✏️ Edit Profil';
            }
        }

        function saveProfile(event) {
            event.preventDefault();
            
            profileData.namaGuru = document.getElementById('editNamaGuru').value;
            profileData.mapel = document.getElementById('editMapel').value;
            profileData.sekolah = document.getElementById('editSekolah').value;
            
            updateProfileDisplay();
            saveData('profileData', profileData);
            
            document.getElementById('profileEditForm').classList.add('hidden');
            document.getElementById('editProfileBtn').innerHTML = '✏️ Edit Profil';
            
            alert('✅ Profil berhasil diperbarui!');
        }

        function cancelProfileEdit() {
            document.getElementById('profileEditForm').classList.add('hidden');
            document.getElementById('editProfileBtn').innerHTML = '✏️ Edit Profil';
        }

        function updateProfileDisplay() {
            document.getElementById('displayNamaGuru').textContent = profileData.namaGuru;
            document.getElementById('displayMapelSekolah').textContent = `Guru ${profileData.mapel} - ${profileData.sekolah}`;
        }

        // Class management
        function toggleKelasManagement() {
            const panel = document.getElementById('kelasManagementPanel');
            const btn = document.getElementById('kelasManagementBtn');
            
            if (panel.classList.contains('hidden')) {
                panel.classList.remove('hidden');
                btn.innerHTML = '❌ Tutup';
                displayCurrentKelas();
            } else {
                panel.classList.add('hidden');
                btn.innerHTML = '⚙️ Kelola Kelas';
            }
        }

        function addKelas(event) {
            event.preventDefault();
            const newKelasName = document.getElementById('newKelasName').value.trim();
            
            if (newKelasName && !kelasData.includes(newKelasName)) {
                kelasData.push(newKelasName);
                saveData('kelasData', kelasData);
                displayCurrentKelas();
                updateAllKelasDropdowns();
                document.getElementById('newKelasName').value = '';
                alert(`✅ Kelas "${newKelasName}" berhasil ditambahkan!`);
            } else if (kelasData.includes(newKelasName)) {
                alert('❌ Kelas sudah ada dalam daftar!');
            }
        }

        function deleteKelas(kelasName) {
            if (confirm(`Yakin ingin menghapus kelas "${kelasName}"?`)) {
                kelasData = kelasData.filter(kelas => kelas !== kelasName);
                saveData('kelasData', kelasData);
                displayCurrentKelas();
                updateAllKelasDropdowns();
                alert(`✅ Kelas "${kelasName}" berhasil dihapus!`);
            }
        }

        function displayCurrentKelas() {
            const currentKelasList = document.getElementById('currentKelasList');
            currentKelasList.innerHTML = '';
            
            if (kelasData.length === 0) {
                currentKelasList.innerHTML = '<p class="text-gray-500 text-sm">Belum ada kelas yang ditambahkan</p>';
                return;
            }
            
            kelasData.forEach(kelas => {
                const kelasDiv = document.createElement('div');
                kelasDiv.className = 'flex justify-between items-center bg-gray-50 p-2 rounded text-sm';
                kelasDiv.innerHTML = `
                    <span class="font-medium">${kelas}</span>
                    <button onclick="deleteKelas('${kelas}')" class="text-red-500 hover:text-red-700 p-1" title="Hapus Kelas">
                        🗑️
                    </button>
                `;
                currentKelasList.appendChild(kelasDiv);
            });
        }

        function saveKelasSettings() {
            saveData('kelasData', kelasData);
            updateAllKelasDropdowns();
            alert('✅ Pengaturan kelas berhasil disimpan!');
        }

        function resetKelasSettings() {
            if (confirm('Yakin ingin reset ke daftar kelas default?')) {
                kelasData = [
                    'X E1', 'X E2', 'X E3', 'X E4', 'X E5', 'X E6', 'X E7', 'X E8', 'X E9',
                    'XI F6', 'XI F7', 'XI F8', 'XI F9'
                ];
                saveData('kelasData', kelasData);
                displayCurrentKelas();
                updateAllKelasDropdowns();
                alert('✅ Daftar kelas berhasil direset!');
            }
        }

        function updateAllKelasDropdowns() {
            const dropdowns = [
                'kelasSelect',
                'jadwalKelas', 
                'agendaKelas',
                'tugasKelas',
                'nilaiKelasSelect'
            ];
            
            dropdowns.forEach(dropdownId => {
                const dropdown = document.getElementById(dropdownId);
                if (dropdown) {
                    const currentValue = dropdown.value;
                    const firstOption = dropdown.querySelector('option[value=""]');
                    dropdown.innerHTML = '';
                    if (firstOption) {
                        dropdown.appendChild(firstOption);
                    }
                    
                    kelasData.forEach(kelas => {
                        const option = document.createElement('option');
                        option.value = kelas;
                        option.textContent = kelas;
                        dropdown.appendChild(option);
                    });
                    
                    if (kelasData.includes(currentValue)) {
                        dropdown.value = currentValue;
                    }
                }
            });
        }

        // Presensi functions
        document.getElementById('kelasSelect').addEventListener('change', function() {
            const selectedKelas = this.value;
            if (selectedKelas) {
                generateStudentList(selectedKelas);
            } else {
                document.getElementById('studentList').classList.add('hidden');
            }
        });

        function generateStudentList(kelas) {
            const studentGrid = document.getElementById('studentGrid');
            const selectedClass = document.getElementById('selectedClass');
            
            selectedClass.textContent = kelas;
            studentGrid.innerHTML = '';
            
            const students = siswaData[kelas] || generateDefaultStudents();
            
            students.forEach((student, index) => {
                const studentDiv = document.createElement('div');
                studentDiv.className = 'flex items-center justify-between bg-white border rounded-lg p-3 hover:bg-gray-50 transition-colors';
                studentDiv.innerHTML = `
                    <div class="flex items-center space-x-3">
                        <span class="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">
                            ${(index + 1).toString().padStart(2, '0')}
                        </span>
                        <div>
                            <span class="font-medium text-gray-800">${student.nama}</span>
                            ${student.nis ? `<p class="text-xs text-gray-500">NIS: ${student.nis}</p>` : ''}
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span id="status-${index + 1}" class="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 cursor-pointer" onclick="toggleStatus(${index + 1})">
                            ✅ Hadir
                        </span>
                        <input type="hidden" id="student-${index + 1}" value="hadir">
                    </div>
                `;
                studentGrid.appendChild(studentDiv);
            });
            
            document.getElementById('studentList').classList.remove('hidden');
        }

        function generateDefaultStudents() {
            const students = [];
            for (let i = 1; i <= 36; i++) {
                students.push({
                    nama: `Siswa ${i.toString().padStart(2, '0')}`,
                    nis: null
                });
            }
            return students;
        }

        function toggleStatus(studentNumber) {
            const statusElement = document.getElementById(`status-${studentNumber}`);
            const hiddenInput = document.getElementById(`student-${studentNumber}`);
            const currentStatus = hiddenInput.value;
            
            const statuses = [
                { value: 'hadir', text: '✅ Hadir', class: 'bg-green-100 text-green-800' },
                { value: 'sakit', text: '🤒 Sakit', class: 'bg-yellow-100 text-yellow-800' },
                { value: 'izin', text: '📝 Izin', class: 'bg-blue-100 text-blue-800' },
                { value: 'alpha', text: '❌ Alpha', class: 'bg-red-100 text-red-800' }
            ];
            
            const currentIndex = statuses.findIndex(s => s.value === currentStatus);
            const nextIndex = (currentIndex + 1) % statuses.length;
            const nextStatus = statuses[nextIndex];
            
            statusElement.textContent = nextStatus.text;
            statusElement.className = `px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${nextStatus.class}`;
            hiddenInput.value = nextStatus.value;
        }

        function setAllHadir() {
            const kelas = document.getElementById('kelasSelect').value;
            const students = siswaData[kelas] || generateDefaultStudents();
            
            students.forEach((student, index) => {
                const statusElement = document.getElementById(`status-${index + 1}`);
                const hiddenInput = document.getElementById(`student-${index + 1}`);
                
                if (statusElement && hiddenInput) {
                    statusElement.textContent = '✅ Hadir';
                    statusElement.className = 'px-3 py-1 rounded-full text-sm font-medium cursor-pointer bg-green-100 text-green-800';
                    hiddenInput.value = 'hadir';
                }
            });
        }

        function resetPresensi() {
            setAllHadir();
        }

        function savePresensi() {
            const kelas = document.getElementById('kelasSelect').value;
            const tanggal = document.getElementById('tanggalPresensi').value;
            const jamKe = document.getElementById('presensiJamKe').value;
            
            if (!kelas || !tanggal || !jamKe) {
                alert('Pilih kelas, tanggal, dan jam pelajaran terlebih dahulu!');
                return;
            }

            const students = siswaData[kelas] || generateDefaultStudents();
            const presensiResult = {};
            
            students.forEach((student, index) => {
                const hiddenInput = document.getElementById(`student-${index + 1}`);
                const status = hiddenInput ? hiddenInput.value : 'hadir';
                presensiResult[`siswa-${index + 1}`] = {
                    nama: student.nama,
                    nis: student.nis,
                    status: status
                };
            });

            const key = `${kelas}-${tanggal}-${jamKe}`;
            presensiData[key] = presensiResult;
            
            saveData('presensiData', presensiData);
            alert('✅ Presensi berhasil disimpan!');
        }

        // Upload Excel function
        function uploadExcel() {
            const fileInput = document.getElementById('excelFile');
            const file = fileInput.files[0];
            
            if (!file) {
                alert('❌ Pilih file Excel/CSV terlebih dahulu!');
                return;
            }

            const kelas = document.getElementById('kelasSelect').value;
            if (!kelas) {
                alert('❌ Pilih kelas terlebih dahulu!');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const content = e.target.result;
                    const lines = content.split('\n').filter(line => line.trim());
                    const students = [];
                    
                    // Skip header row, start from index 1
                    for (let i = 1; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (!line) continue;
                        
                        const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
                        
                        if (columns.length >= 2) {
                            const nama = columns[1];
                            const nis = columns[2] || null;
                            
                            if (nama && nama.length > 0) {
                                students.push({
                                    nama: nama,
                                    nis: nis
                                });
                            }
                        }
                    }
                    
                    if (students.length > 0) {
                        siswaData[kelas] = students;
                        saveData('siswaData', siswaData);
                        generateStudentList(kelas);
                        fileInput.value = '';
                        alert(`✅ Berhasil upload ${students.length} data siswa untuk kelas ${kelas}!`);
                    } else {
                        alert('❌ Tidak ada data siswa yang valid dalam file!');
                    }
                } catch (error) {
                    alert('❌ Error membaca file. Pastikan format CSV yang benar!');
                }
            };
            
            reader.readAsText(file);
        }

        function downloadTemplate() {
            const csvContent = "No,Nama Siswa,NIS\n1,Contoh Siswa 01,12345\n2,Contoh Siswa 02,12346\n3,Contoh Siswa 03,12347";
            downloadCSV(csvContent, 'Template_Data_Siswa.csv');
        }

        function downloadPresensiHarian() {
            const kelas = document.getElementById('kelasSelect').value;
            const tanggal = document.getElementById('tanggalPresensi').value;
            const jamKe = document.getElementById('presensiJamKe').value;
            
            if (!kelas || !tanggal || !jamKe) {
                alert('Pilih kelas, tanggal, dan jam pelajaran terlebih dahulu!');
                return;
            }

            const key = `${kelas}-${tanggal}-${jamKe}`;
            const data = presensiData[key];
            
            if (!data) {
                alert('Belum ada data presensi untuk tanggal dan jam ini!');
                return;
            }

            let csvContent = "No,Nama Siswa,NIS,Status Kehadiran\n";
            let index = 1;
            Object.keys(data).forEach((key) => {
                if (key.startsWith('siswa-')) {
                    const siswa = data[key];
                    const nis = siswa.nis || '-';
                    csvContent += `${index},${siswa.nama},${nis},${siswa.status}\n`;
                    index++;
                }
            });

            downloadCSV(csvContent, `Presensi_Harian_${kelas}_${tanggal}_Jam${jamKe}.csv`);
        }

        // Jadwal functions
        function addJadwal(event) {
            event.preventDefault();
            const kelas = document.getElementById('jadwalKelas').value;
            const hari = document.getElementById('jadwalHari').value;
            const jamKe = document.getElementById('jadwalJamKe').value;

            const jadwal = {
                id: Date.now(),
                kelas,
                hari,
                jamKe,
                created: new Date().toLocaleDateString('id-ID')
            };

            jadwalData.push(jadwal);
            saveData('jadwalData', jadwalData);
            displayJadwal();
            event.target.reset();
            alert('✅ Jadwal berhasil ditambahkan!');
        }

        function displayJadwal() {
            const jadwalList = document.getElementById('jadwalList');
            jadwalList.innerHTML = '';

            if (jadwalData.length === 0) {
                jadwalList.innerHTML = '<p class="text-gray-500 text-sm">Belum ada jadwal yang ditambahkan</p>';
                return;
            }

            jadwalData.forEach(jadwal => {
                const jadwalDiv = document.createElement('div');
                jadwalDiv.className = 'bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500';
                jadwalDiv.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-semibold text-blue-800">${jadwal.kelas}</h4>
                            <p class="text-sm text-gray-600">${jadwal.hari}</p>
                            <p class="text-xs text-blue-600 font-medium">Jam ke-${jadwal.jamKe}</p>
                        </div>
                        <button onclick="deleteJadwal(${jadwal.id})" class="text-red-500 hover:text-red-700 p-1" title="Hapus Jadwal">
                            🗑️
                        </button>
                    </div>
                `;
                jadwalList.appendChild(jadwalDiv);
            });
        }

        function deleteJadwal(id) {
            if (confirm('Yakin ingin menghapus jadwal ini?')) {
                jadwalData = jadwalData.filter(item => item.id !== id);
                saveData('jadwalData', jadwalData);
                displayJadwal();
            }
        }

        // Agenda functions
        function addAgenda(event) {
            event.preventDefault();
            const tanggal = document.getElementById('agendaTanggal').value;
            const kelas = document.getElementById('agendaKelas').value;
            const jamKe = document.getElementById('agendaJamKe').value;
            const topik = document.getElementById('agendaTopik').value;
            const keterangan = document.getElementById('agendaKeterangan').value;

            const agenda = {
                id: Date.now(),
                tanggal,
                kelas,
                jamKe,
                topik,
                keterangan,
                created: new Date().toLocaleDateString('id-ID')
            };

            agendaData.push(agenda);
            saveData('agendaData', agendaData);
            displayAgenda();
            event.target.reset();
            alert('✅ Agenda berhasil ditambahkan!');
        }

        function displayAgenda() {
            const agendaList = document.getElementById('agendaList');
            agendaList.innerHTML = '';

            if (agendaData.length === 0) {
                agendaList.innerHTML = '<p class="text-gray-500 text-sm">Belum ada agenda yang ditambahkan</p>';
                return;
            }

            agendaData.forEach(agenda => {
                const agendaDiv = document.createElement('div');
                agendaDiv.className = 'bg-green-50 p-3 rounded-lg border-l-4 border-green-500';
                agendaDiv.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-semibold text-green-800">${agenda.topik}</h4>
                            <p class="text-sm text-gray-600">${agenda.kelas} - ${new Date(agenda.tanggal).toLocaleDateString('id-ID')}</p>
                            <p class="text-xs text-green-600 font-medium">Jam ke-${agenda.jamKe}</p>
                            ${agenda.keterangan ? `<p class="text-xs text-gray-500 mt-1">${agenda.keterangan}</p>` : ''}
                        </div>
                        <button onclick="deleteAgenda(${agenda.id})" class="text-red-500 hover:text-red-700">
                            🗑️
                        </button>
                    </div>
                `;
                agendaList.appendChild(agendaDiv);
            });
        }

        function deleteAgenda(id) {
            agendaData = agendaData.filter(item => item.id !== id);
            saveData('agendaData', agendaData);
            displayAgenda();
        }

        // Tugas functions
        function addTugas(event) {
            event.preventDefault();
            const judul = document.getElementById('tugasJudul').value;
            const kelas = document.getElementById('tugasKelas').value;
            const deskripsi = document.getElementById('tugasDeskripsi').value;
            const deadline = document.getElementById('tugasDeadline').value;

            const tugas = {
                id: Date.now(),
                judul,
                kelas,
                deskripsi,
                deadline,
                created: new Date().toLocaleDateString('id-ID')
            };

            tugasData.push(tugas);
            saveData('tugasData', tugasData);
            displayTugas();
            event.target.reset();
            alert('✅ Tugas berhasil ditambahkan!');
        }

        function displayTugas() {
            const tugasList = document.getElementById('tugasList');
            tugasList.innerHTML = '';

            if (tugasData.length === 0) {
                tugasList.innerHTML = '<p class="text-gray-500 text-sm">Belum ada tugas yang ditambahkan</p>';
                return;
            }

            tugasData.forEach(tugas => {
                const deadlineDate = new Date(tugas.deadline);
                const now = new Date();
                const isOverdue = deadlineDate < now;
                
                const tugasDiv = document.createElement('div');
                tugasDiv.className = `${isOverdue ? 'bg-red-50 border-red-500' : 'bg-orange-50 border-orange-500'} p-3 rounded-lg border-l-4`;
                tugasDiv.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-semibold ${isOverdue ? 'text-red-800' : 'text-orange-800'}">${tugas.judul}</h4>
                            <p class="text-sm text-gray-600">${tugas.kelas}</p>
                            <p class="text-xs text-gray-500 mt-1">${tugas.deskripsi}</p>
                            <p class="text-xs ${isOverdue ? 'text-red-600' : 'text-orange-600'} mt-1">
                                Deadline: ${deadlineDate.toLocaleDateString('id-ID')} ${deadlineDate.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}
                                ${isOverdue ? '(Terlambat)' : ''}
                            </p>
                        </div>
                        <button onclick="deleteTugas(${tugas.id})" class="text-red-500 hover:text-red-700">
                            🗑️
                        </button>
                    </div>
                `;
                tugasList.appendChild(tugasDiv);
            });
        }

        function deleteTugas(id) {
            tugasData = tugasData.filter(item => item.id !== id);
            saveData('tugasData', tugasData);
            displayTugas();
        }

        // Materi functions
        function addMateri(event) {
            event.preventDefault();
            const judul = document.getElementById('materiJudul').value;
            const kelas = document.getElementById('materiKelas').value;
            const konten = document.getElementById('materiKonten').value;
            const link = document.getElementById('materiLink').value;

            const materi = {
                id: Date.now(),
                judul,
                kelas,
                konten,
                link,
                created: new Date().toLocaleDateString('id-ID')
            };

            materiData.push(materi);
            saveData('materiData', materiData);
            displayMateri();
            event.target.reset();
            alert('✅ Materi berhasil ditambahkan!');
        }

        function displayMateri() {
            const materiList = document.getElementById('materiList');
            materiList.innerHTML = '';

            if (materiData.length === 0) {
                materiList.innerHTML = '<p class="text-gray-500 text-sm">Belum ada materi yang ditambahkan</p>';
                return;
            }

            materiData.forEach(materi => {
                const materiDiv = document.createElement('div');
                materiDiv.className = 'bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500';
                materiDiv.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-semibold text-purple-800">${materi.judul}</h4>
                            <p class="text-sm text-gray-600">Kelas ${materi.kelas} (Semua Kelas)</p>
                            <p class="text-xs text-gray-500 mt-1">${materi.konten.substring(0, 100)}${materi.konten.length > 100 ? '...' : ''}</p>
                            ${materi.link ? `<a href="${materi.link}" target="_blank" rel="noopener noreferrer" class="text-xs text-purple-600 hover:underline mt-1 block">🔗 Lihat Materi</a>` : ''}
                        </div>
                        <button onclick="deleteMateri(${materi.id})" class="text-red-500 hover:text-red-700">
                            🗑️
                        </button>
                    </div>
                `;
                materiList.appendChild(materiDiv);
            });
        }

        function deleteMateri(id) {
            materiData = materiData.filter(item => item.id !== id);
            saveData('materiData', materiData);
            displayMateri();
        }

        // Nilai functions
        document.getElementById('nilaiKelasSelect').addEventListener('change', function() {
            const selectedKelas = this.value;
            if (selectedKelas) {
                document.getElementById('nilaiSection').classList.remove('hidden');
                document.getElementById('selectedNilaiClass').textContent = selectedKelas;
                loadNilaiForKelas(selectedKelas);
                populateNilaiSiswa(selectedKelas);
            } else {
                document.getElementById('nilaiSection').classList.add('hidden');
            }
        });

        function populateNilaiSiswa(kelas) {
            const nilaiSiswa = document.getElementById('nilaiSiswa');
            nilaiSiswa.innerHTML = '<option value="">Pilih Siswa</option>';
            
            const students = siswaData[kelas] || generateDefaultStudents();
            students.forEach((student, index) => {
                const option = document.createElement('option');
                option.value = index + 1;
                option.textContent = student.nama;
                nilaiSiswa.appendChild(option);
            });
        }

        function addNilai(event) {
            event.preventDefault();
            const kelas = document.getElementById('nilaiKelasSelect').value;
            const siswaIndex = document.getElementById('nilaiSiswa').value;
            const jenisNilai = document.getElementById('jenisNilai').value;
            const keterangan = document.getElementById('keteranganNilai').value;
            const nilai = parseFloat(document.getElementById('inputNilai').value);

            if (!nilaiData[kelas]) {
                nilaiData[kelas] = {};
            }
            if (!nilaiData[kelas][siswaIndex]) {
                nilaiData[kelas][siswaIndex] = {};
            }
            if (!nilaiData[kelas][siswaIndex][jenisNilai]) {
                nilaiData[kelas][siswaIndex][jenisNilai] = [];
            }

            nilaiData[kelas][siswaIndex][jenisNilai].push({
                nilai: nilai,
                keterangan: keterangan,
                tanggal: new Date().toLocaleDateString('id-ID')
            });

            saveData('nilaiData', nilaiData);
            loadNilaiForKelas(kelas);
            event.target.reset();
            alert('✅ Nilai berhasil ditambahkan!');
        }

        function loadNilaiForKelas(kelas) {
            const students = siswaData[kelas] || generateDefaultStudents();
            const tableBody = document.getElementById('nilaiTableBody');
            tableBody.innerHTML = '';
            
            students.forEach((student, index) => {
                const row = document.createElement('tr');
                row.className = 'border-b hover:bg-gray-50';
                
                const studentNilai = nilaiData[kelas] && nilaiData[kelas][index + 1] ? nilaiData[kelas][index + 1] : {};
                
                const tugasAvg = calculateAverage(studentNilai.tugas);
                const ulanganAvg = calculateAverage(studentNilai.ulangan);
                const uasNilai = calculateAverage(studentNilai.uas);
                const rataRata = calculateFinalAverage(tugasAvg, ulanganAvg, uasNilai);
                
                row.innerHTML = `
                    <td class="px-2 py-2 text-sm">${index + 1}</td>
                    <td class="px-2 py-2 text-sm font-medium">${student.nama}</td>
                    <td class="px-2 py-2 text-center text-sm">${tugasAvg || '-'}</td>
                    <td class="px-2 py-2 text-center text-sm">${ulanganAvg || '-'}</td>
                    <td class="px-2 py-2 text-center text-sm">${uasNilai || '-'}</td>
                    <td class="px-2 py-2 text-center text-sm font-semibold">${rataRata || '-'}</td>
                    <td class="px-2 py-2 text-center text-sm">${getGrade(rataRata)}</td>
                `;
                tableBody.appendChild(row);
            });
            
            updateStatistik(kelas);
        }

        function calculateAverage(nilaiArray) {
            if (!nilaiArray || nilaiArray.length === 0) return null;
            const sum = nilaiArray.reduce((total, item) => total + item.nilai, 0);
            return Math.round(sum / nilaiArray.length);
        }

        function calculateFinalAverage(tugas, ulangan, uas) {
            const values = [tugas, ulangan, uas].filter(v => v !== null);
            if (values.length === 0) return null;
            const sum = values.reduce((total, val) => total + val, 0);
            return Math.round(sum / values.length);
        }

        function getGrade(nilai) {
            if (!nilai) return '-';
            if (nilai >= 90) return 'A';
            if (nilai >= 80) return 'B';
            if (nilai >= 70) return 'C';
            if (nilai >= 60) return 'D';
            return 'E';
        }

        function updateStatistik(kelas) {
            const students = siswaData[kelas] || generateDefaultStudents();
            const allNilai = [];
            
            students.forEach((student, index) => {
                const studentNilai = nilaiData[kelas] && nilaiData[kelas][index + 1] ? nilaiData[kelas][index + 1] : {};
                const tugasAvg = calculateAverage(studentNilai.tugas);
                const ulanganAvg = calculateAverage(studentNilai.ulangan);
                const uasNilai = calculateAverage(studentNilai.uas);
                const rataRata = calculateFinalAverage(tugasAvg, ulanganAvg, uasNilai);
                
                if (rataRata) {
                    allNilai.push(rataRata);
                }
            });
            
            if (allNilai.length > 0) {
                const rataKelas = Math.round(allNilai.reduce((sum, val) => sum + val, 0) / allNilai.length);
                const nilaiTertinggi = Math.max(...allNilai);
                const nilaiTerendah = Math.min(...allNilai);
                const siswaTuntas = allNilai.filter(nilai => nilai >= 75).length;
                const siswaBelumTuntas = allNilai.length - siswaTuntas;
                
                document.getElementById('rataKelas').textContent = rataKelas;
                document.getElementById('nilaiTertinggi').textContent = nilaiTertinggi;
                document.getElementById('nilaiTerendah').textContent = nilaiTerendah;
                document.getElementById('siswaTuntas').textContent = siswaTuntas;
                document.getElementById('siswaBelumTuntas').textContent = siswaBelumTuntas;
            } else {
                document.getElementById('rataKelas').textContent = '-';
                document.getElementById('nilaiTertinggi').textContent = '-';
                document.getElementById('nilaiTerendah').textContent = '-';
                document.getElementById('siswaTuntas').textContent = '-';
                document.getElementById('siswaBelumTuntas').textContent = '-';
            }
        }

        function downloadNilai() {
            const kelas = document.getElementById('nilaiKelasSelect').value;
            if (!kelas) {
                alert('Pilih kelas terlebih dahulu!');
                return;
            }

            const students = siswaData[kelas] || generateDefaultStudents();
            let csvContent = "No,Nama Siswa,Tugas,Ulangan,UAS,Rata-rata,Grade\n";
            
            students.forEach((student, index) => {
                const studentNilai = nilaiData[kelas] && nilaiData[kelas][index + 1] ? nilaiData[kelas][index + 1] : {};
                const tugasAvg = calculateAverage(studentNilai.tugas) || '-';
                const ulanganAvg = calculateAverage(studentNilai.ulangan) || '-';
                const uasNilai = calculateAverage(studentNilai.uas) || '-';
                const rataRata = calculateFinalAverage(tugasAvg === '-' ? null : tugasAvg, ulanganAvg === '-' ? null : ulanganAvg, uasNilai === '-' ? null : uasNilai) || '-';
                const grade = getGrade(rataRata === '-' ? null : rataRata);
                
                csvContent += `${index + 1},${student.nama},${tugasAvg},${ulanganAvg},${uasNilai},${rataRata},${grade}\n`;
            });

            downloadCSV(csvContent, `Nilai_${kelas}_${new Date().toISOString().split('T')[0]}.csv`);
        }

        // Utility function to download CSV
        function downloadCSV(content, filename) {
            const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    

(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'9820665633c4fdaf',t:'MTc1ODM2MTYyOS4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();