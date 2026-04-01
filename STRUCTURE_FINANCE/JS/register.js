document.addEventListener('DOMContentLoaded', () => {
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
                    confirmButtonColor: '#d33'
                });
            };

            const userList = JSON.parse(localStorage.getItem('userList')) || [];
            const isUsernameExist = userList.some(user => user.username === username);

            if (username === "") {
                showError("Tên tài khoản không được để trống!");
            } 
            else if (isUsernameExist) {
                showError("Tên tài khoản đã tồn tại!");
            }
            else if (email === "") {
                showError("Email không được để trống!");
            } 
            else if (!gmailRegex.test(email)) {
                showError("Email phải đúng định dạng @gmail.com!");
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
                    text: 'Chuyển sang đăng nhập...',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = "login.html";
                });
            }
        });
    }
});