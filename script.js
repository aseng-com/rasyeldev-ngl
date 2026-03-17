// file: script.js
// Inisialisasi database dari localStorage atau gunakan default
let users = [];

// Load users dari localStorage atau gunakan data default
function loadUsers() {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
        users = JSON.parse(storedUsers);
    } else {
        // Data default
        users = [
            { username: 'admin', token: 'admin123', role: 'admin' },
            { username: 'user1', token: 'user123', role: 'user' }
        ];
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Simpan users ke localStorage
function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

// Handle login form
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const token = document.getElementById('token').value.trim();
    const errorMessage = document.getElementById('errorMessage');
    
    // Load users terbaru
    loadUsers();
    
    // Cari user
    const user = users.find(u => u.username === username && u.token === token);
    
    if (user) {
        // Simpan session
        localStorage.setItem('session', JSON.stringify({
            username: user.username,
            token: user.token,
            role: user.role
        }));
        
        // Redirect berdasarkan role
        if (user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'user.html';
        }
    } else {
        errorMessage.textContent = 'Username atau token salah!';
    }
});

// Load users saat halaman dimuat
loadUsers();

// Jika sudah login, redirect otomatis (untuk halaman login)
(function() {
    const session = JSON.parse(localStorage.getItem('session'));
    if (session) {
        if (session.role === 'admin') {
            window.location.href = 'admin.html';
        } else if (session.role === 'user') {
            window.location.href = 'user.html';
        }
    }
})();