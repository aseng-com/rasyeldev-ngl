// file: admin.js
// Admin Panel Logic - Sistem Login dengan Token

// Variabel global untuk menyimpan data users
let users = [];

// Fungsi untuk mendapatkan base URL
function getBaseUrl() {
    const currentUrl = window.location.href;
    const pathArray = currentUrl.split('/');
    return pathArray.slice(0, -1).join('/') + '/';
}

// Fungsi untuk validasi session dengan database
function validateSession(session) {
    if (!session) return false;
    
    try {
        // Ambil users dari localStorage
        const storedUsers = localStorage.getItem('users');
        const users = storedUsers ? JSON.parse(storedUsers) : [];
        
        // Cari user yang sesuai dengan session
        const user = users.find(u => 
            u.username === session.username && 
            u.token === session.token && 
            u.role === session.role
        );
        
        return user !== undefined;
    } catch (e) {
        console.error('Error validating session:', e);
        return false;
    }
}

// Cek localStorage availability
function isLocalStorageAvailable() {
    try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        console.error('localStorage not available:', e);
        return false;
    }
}

// Proteksi halaman admin dengan validasi ketat
(function() {
    console.log('Admin page loaded');
    
    if (!isLocalStorageAvailable()) {
        alert('Browser Anda tidak mendukung localStorage. Silakan gunakan browser lain.');
        window.location.href = getBaseUrl() + 'index.html';
        return;
    }
    
    try {
        const session = JSON.parse(localStorage.getItem('session'));
        console.log('Session:', session);
        
        // Validasi session
        if (!session || session.role !== 'admin' || !validateSession(session)) {
            console.log('Invalid session, redirecting to login');
            // Hapus session yang tidak valid
            localStorage.removeItem('session');
            window.location.href = getBaseUrl() + 'index.html';
            return;
        }
        
        console.log('Session valid, loading data...');
        // Load data dan tampilkan
        loadUsers();
        displayUserList();
    } catch (e) {
        console.error('Error in admin protection:', e);
        window.location.href = getBaseUrl() + 'index.html';
    }
})();

// Load users dari localStorage
function loadUsers() {
    try {
        const storedUsers = localStorage.getItem('users');
        if (storedUsers) {
            users = JSON.parse(storedUsers);
        } else {
            // Data default jika belum ada
            users = [
                { username: 'admin', token: 'admin123', role: 'admin' },
                { username: 'user1', token: 'user123', role: 'user' }
            ];
            saveUsers();
        }
    } catch (e) {
        console.error('Error loading users:', e);
        users = [];
    }
    return users;
}

// Simpan users ke localStorage
function saveUsers() {
    try {
        localStorage.setItem('users', JSON.stringify(users));
    } catch (e) {
        console.error('Error saving users:', e);
        showToast('Gagal menyimpan data', 'error');
    }
}

// Generate token random (huruf + angka)
function generateToken(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

// Tampilkan daftar user di tabel
function displayUserList() {
    const userList = document.getElementById('userList');
    if (!userList) return;
    
    userList.innerHTML = '';
    
    if (users.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="3" style="text-align: center; color: #7f8fa6; padding: 30px;">Belum ada user</td>`;
        userList.appendChild(row);
        return;
    }
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(user.username)}</td>
            <td>${escapeHtml(user.token)}</td>
            <td>${escapeHtml(user.role)}</td>
        `;
        userList.appendChild(row);
    });
}

// Escape HTML untuk keamanan
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Fungsi untuk menampilkan toast notification
function showToast(message, type = 'success', duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = 'toast ' + (type === 'error' ? 'error' : '');
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Fungsi untuk menampilkan modal sukses
function showSuccessModal(username, token) {
    const modal = document.getElementById('successModal');
    const modalUsername = document.getElementById('modalUsername');
    const modalTokenText = document.getElementById('modalTokenText');
    
    if (!modal || !modalUsername || !modalTokenText) return;
    
    modalUsername.textContent = username;
    modalTokenText.textContent = token;
    modal.style.display = 'flex';
}

// Fungsi untuk menutup modal
function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Handle DOM ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM ready, initializing event listeners...');
    
    const createBtn = document.getElementById('createAccountBtn');
    const copyBtn = document.getElementById('copyTokenBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalCopyBtn = document.getElementById('modalCopyBtn');
    const modalCopyAllBtn = document.getElementById('modalCopyAllBtn');
    
    if (createBtn) {
        createBtn.addEventListener('click', function() {
            const newUsername = document.getElementById('newUsername').value.trim();
            
            if (!newUsername) {
                showToast('Username tidak boleh kosong!', 'error');
                return;
            }
            
            // Load users terbaru
            loadUsers();
            
            // Cek apakah username sudah ada
            if (users.some(u => u.username === newUsername)) {
                showToast('Username sudah digunakan!', 'error');
                return;
            }
            
            // Generate token
            const token = generateToken();
            
            // Tambah user baru (role default = user)
            users.push({
                username: newUsername,
                token: token,
                role: 'user'
            });
            
            // Simpan ke localStorage
            saveUsers();
            
            // Tampilkan token di result box
            const tokenResult = document.getElementById('tokenResult');
            const generatedToken = document.getElementById('generatedToken');
            
            if (tokenResult && generatedToken) {
                generatedToken.textContent = token;
                tokenResult.style.display = 'block';
            }
            
            // Reset input
            document.getElementById('newUsername').value = '';
            
            // Update daftar user
            displayUserList();
            
            // Tampilkan modal sukses
            showSuccessModal(newUsername, token);
            
            // Tampilkan toast
            showToast(`Akun ${newUsername} berhasil dibuat!`);
        });
    }
    
    // Handle copy token dari result box
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            const token = document.getElementById('generatedToken').textContent;
            navigator.clipboard.writeText(token).then(() => {
                showToast('Token berhasil disalin!');
            }).catch(() => {
                showToast('Gagal menyalin token', 'error');
            });
        });
    }
    
    // Handle copy token dari modal
    if (modalCopyBtn) {
        modalCopyBtn.addEventListener('click', function() {
            const token = document.getElementById('modalTokenText').textContent;
            navigator.clipboard.writeText(token).then(() => {
                showToast('Token berhasil disalin!');
            }).catch(() => {
                showToast('Gagal menyalin token', 'error');
            });
        });
    }
    
    // Handle copy semua (username dan token)
    if (modalCopyAllBtn) {
        modalCopyAllBtn.addEventListener('click', function() {
            const username = document.getElementById('modalUsername').textContent;
            const token = document.getElementById('modalTokenText').textContent;
            const textToCopy = `Username: ${username}\nToken: ${token}`;
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast('Username dan token berhasil disalin!');
            }).catch(() => {
                showToast('Gagal menyalin', 'error');
            });
        });
    }
    
    // Handle close modal
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }
    
    // Close modal ketika klik di luar modal
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('successModal');
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('session');
            window.location.href = getBaseUrl() + 'index.html';
        });
    }
});

// Validasi session secara periodik (setiap 30 detik)
setInterval(function() {
    try {
        const currentSession = JSON.parse(localStorage.getItem('session'));
        if (!validateSession(currentSession)) {
            console.log('Session expired, redirecting...');
            localStorage.removeItem('session');
            window.location.href = getBaseUrl() + 'index.html';
        }
    } catch (e) {
        console.error('Error in session validation interval:', e);
    }
}, 30000);
