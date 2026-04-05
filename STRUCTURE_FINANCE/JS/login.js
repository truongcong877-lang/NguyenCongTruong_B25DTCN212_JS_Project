document.addEventListener('DOMContentLoaded', () => {
    // ✅ Nếu đã đăng nhập rồi thì không cho vào trang login nữa
    const loggedIn = localStorage.getItem("currentUser");
    if (loggedIn) {
        window.location.replace("index.html");
        return;
    }
 
    const loginForm = document.querySelector('.form-register'); 
 
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
 
            const emailLogin = loginForm.querySelector('input[placeholder="Email"]')?.value.trim();
            const passwordLogin = loginForm.querySelector('input[placeholder="Mật khẩu"]')?.value;
 
            const storedData = localStorage.getItem('userList');
 
            const showError = (message) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Đăng nhập thất bại',
                    text: message,
                    confirmButtonColor: '#ef4444'
                });
            };
 
            if (!storedData) {
                showError("Không tìm thấy dữ liệu người dùng. Vui lòng đăng ký trước!");
                return;
            }
 
            const userList = JSON.parse(storedData);
 
            if (!emailLogin || !passwordLogin) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Chú ý',
                    text: 'Vui lòng nhập đầy đủ Email và Mật khẩu!',
                });
                return;
            }
 
            const foundUser = userList.find(user => user.email === emailLogin);
 
            if (!foundUser) {
                showError("Email này chưa được đăng ký!");
            } 
            else if (foundUser.password !== passwordLogin) {
                showError("Mật khẩu không chính xác!");
            } 
            else {
                // Đăng nhập thành công
                Swal.fire({
                    icon: 'success',
                    title: 'Đăng nhập thành công!',
                    text: `Chào mừng quay trở lại!`,
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    localStorage.setItem('currentUser', JSON.stringify(foundUser));
                    // ✅ Dùng replace để login.html không còn trong history
                    window.location.replace("index.html");
                });
            }
        });
    }
});