document.addEventListener('DOMContentLoaded', () => {
    // ✅ Nếu đã đăng nhập rồi thì không cho vào trang đăng ký nữa
    const loggedIn = localStorage.getItem("currentUser");
    if (loggedIn) {
        window.location.replace("index.html");
        return;
    }
 
    const registerForm = document.querySelector('.register-form');
 
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
 
            const username = registerForm.querySelector('input[name="username"]').value.trim();
            const email = registerForm.querySelector('input[name="email"]').value.trim();
            const password = registerForm.querySelector('input[name="password"]').value;
            const confirmPassword = registerForm.querySelector('input[name="confirmPassword"]').value;
 
            const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
 
            const showError = (message) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi nhập liệu',
                    text: message,
                    confirmButtonColor: '#ef4444'
                });
            };
 
            const userList = JSON.parse(localStorage.getItem('userList')) || [];
            const isEmailExist = userList.some(user => user.email === email);
 
            if (username === "") {
                showError("Tên tài khoản không được để trống!");
            } 
            else if (email === "") {
                showError("Email không được để trống!");
            } 
            else if (!gmailRegex.test(email)) {
                showError("Email phải đúng định dạng @gmail.com!");
            } 
            else if (isEmailExist) {
                showError("Email này đã được đăng ký tài khoản khác!");
            }
            else if (password === "") {
                showError("Mật khẩu không được để trống!");
            } 
            else if (password.length < 6) {
                showError("Mật khẩu phải từ 6 ký tự trở lên!");
            } 
            else if (confirmPassword === "") {
                showError("Vui lòng nhập xác nhận mật khẩu!");
            } 
            else if (password !== confirmPassword) {
                showError("Mật khẩu xác nhận không khớp!");
            } 
            else {
                const userData = {
                    username: username,
                    email: email,
                    password: password
                };
 
                userList.push(userData);
                localStorage.setItem('userList', JSON.stringify(userList));
 
                Swal.fire({
                    icon: 'success',
                    title: 'Đăng ký thành công!',
                    text: 'Hệ thống đang chuyển sang trang đăng nhập...',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    // ✅ Dùng replace để register.html không còn trong history
                    window.location.replace("login.html");
                });
            }
        });
    }
});