document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.form-register'); 

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const usernameLogin = loginForm.querySelector('input[placeholder="Tên đăng nhập"]')?.value.trim();
            const emailLogin = loginForm.querySelector('input[placeholder="Email"]')?.value.trim();
            const passwordLogin = loginForm.querySelector('input[placeholder="Mật khẩu"]')?.value;

            const storedData = localStorage.getItem('userList');

            const showError = (message) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Đăng nhập thất bại',
                    text: message,
                    confirmButtonColor: '#d33'
                });
            };

            if (!storedData) {
                showError("Không tìm thấy dữ liệu người dùng. Vui lòng đăng ký trước!");
                return;
            }

            const userList = JSON.parse(storedData);

            if (!usernameLogin || !emailLogin || !passwordLogin) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Chú ý',
                    text: 'Vui lòng điền đầy đủ tất cả các trường thông tin!',
                });
                return;
            }

            const foundUser = userList.find(user => user.username === usernameLogin && user.email === emailLogin);

            if (!foundUser) {
                showError("Tên đăng nhập hoặc Email không tồn tại!");
            } 
            else if (foundUser.password !== passwordLogin) {
                showError("Mật khẩu không chính xác!");
            } 
            else {
                Swal.fire({
                    icon: 'success',
                    title: 'Đăng nhập thành công!',
                    text: `Chào mừng ${foundUser.username} đã quay trở lại.`,
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    sessionStorage.setItem('currentUser', JSON.stringify(foundUser));
                    window.location.href = "index.html";
                });
            }
        });
    }
});