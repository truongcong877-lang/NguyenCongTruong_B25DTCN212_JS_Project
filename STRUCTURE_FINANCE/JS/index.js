// --- Cấu hình giới hạn tiền ---
const MAX_BUDGET = 1000000000000;

// --- Khởi tạo dữ liệu từ LocalStorage ---
let budget = Number(localStorage.getItem("budget")) || 0;
let categories = JSON.parse(localStorage.getItem("categories")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// --- Cấu hình giao diện thông báo Swal ---
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success",
    cancelButton: "btn btn-danger"
  },
  buttonsStyling: true
});

// --- Truy xuất DOM: Phần Ngân sách ---
const budgetInput = document.querySelectorAll(".card input")[1];
const saveBudgetBtn = document.querySelector(".card-btn");
const remainingMoneyEl = document.querySelectorAll(".card p")[1];

// --- Truy xuất DOM: Phần Danh mục ---
const categoryNameInput = document.querySelector(".category-name-input");
const categoryLimitInput = document.querySelector(".category-limit-input");
const addCategoryBtn = document.querySelector(".category-form button");
const categoryList = document.querySelector(".category-list");

// --- Truy xuất DOM: Phần Giao dịch ---
const amountInput = document.querySelector(".amountInput");
const categoryInput = document.querySelector(".categoryInput");
const noteInput = document.querySelector(".noteInput");
const addTransactionBtn = document.querySelector(".addTransactionBtn");

// --- Truy xuất DOM: Tìm kiếm & Sắp xếp ---
const historyList = document.querySelector(".historyList");
const searchInput = document.querySelector(".searchInput");
const searchBtn = document.querySelector(".searchBtn");
const sortBtn = document.querySelector(".sortBtn");
const alertBox = document.querySelector(".alertBox");

// --- Hàm lưu dữ liệu vào LocalStorage ---
const saveData = () => {
  localStorage.setItem("budget", budget);
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("transactions", JSON.stringify(transactions));
};

// --- Hàm tính toán và hiển thị số tiền còn lại ---
const updateRemaining = () => {
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const safeBudget = (Number.isFinite(budget) && budget > 0) ? budget : 0;
  const remain = safeBudget - totalSpent;
  
  remainingMoneyEl.innerText = remain.toLocaleString() + " VND";
  remainingMoneyEl.style.color = remain < 0 ? "#ef4444" : "#22c55e";
};

// --- Xử lý sự kiện lưu ngân sách tháng ---
saveBudgetBtn.addEventListener("click", () => {
  const value = Number(budgetInput.value);
  
  // Validate ngân sách
  if (isNaN(value) || value <= 0) {
    Swal.fire("Lỗi!", "Vui lòng nhập số tiền ngân sách hợp lệ.", "error");
    return;
  }
  
  if (!Number.isFinite(value) || value > MAX_BUDGET) {
    Swal.fire("Lỗi!", "Số tiền quá lớn, vui lòng nhập con số thực tế.", "warning");
    return;
  }

  budget = value;
  saveData();
  updateRemaining();
  budgetInput.value = ""; 
  Swal.fire("Thành công!", "Đã cập nhật ngân sách tháng.", "success");
});

// --- Hàm hiển thị danh sách danh mục ---
const renderCategories = () => {
  categoryList.innerHTML = "";
  categories.forEach((cat, index) => {
    const li = document.createElement("li");
    li.className = "category-item";
    li.innerHTML = `
      <div>
        <div class="category-name">${cat.name}</div>
        <div class="category-limit">Giới hạn: ${cat.limit.toLocaleString()} VND</div>
      </div>
      <div class="category-actions">
        <button class="btn-category editCat" data-id="${index}">Sửa</button>
        <button class="btn-category deleteCat" data-id="${index}">Xóa</button>
      </div>
    `;
    categoryList.appendChild(li);
  });
};

// --- Xử lý thêm danh mục mới ---
addCategoryBtn.addEventListener("click", () => {
  const name = categoryNameInput.value.trim();
  const limit = Number(categoryLimitInput.value);

  if (!name || isNaN(limit) || limit <= 0 || limit > MAX_BUDGET) {
    Swal.fire("Thông báo", "Vui lòng nhập tên và giới hạn hợp lệ!", "warning");
    return;
  }

  categories.push({ name, limit });
  saveData();
  renderCategories();
  categoryNameInput.value = "";
  categoryLimitInput.value = "";
  Swal.fire("Thành công", "Đã thêm danh mục mới.", "success");
});

// --- Xử lý sửa hoặc xóa danh mục ---
categoryList.addEventListener("click", (e) => {
  const id = e.target.dataset.id;
  if (id === undefined) return;

  if (e.target.classList.contains("deleteCat")) {
    swalWithBootstrapButtons.fire({
      title: "Xác nhận xóa?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy"
    }).then((result) => {
      if (result.isConfirmed) {
        categories.splice(id, 1);
        saveData();
        renderCategories();
        checkLimit();
      }
    });
  }

  if (e.target.classList.contains("editCat")) {
    Swal.fire({
      title: 'Sửa tên danh mục',
      input: 'text',
      inputValue: categories[id].name,
      showCancelButton: true,
    }).then((resName) => {
      if (resName.value) {
        Swal.fire({
          title: 'Sửa giới hạn (VND)',
          input: 'number',
          inputValue: categories[id].limit,
          showCancelButton: true,
        }).then((resLimit) => {
          const newLimit = Number(resLimit.value);
          if (resLimit.value && newLimit > 0 && newLimit <= MAX_BUDGET) {
            categories[id] = { name: resName.value, limit: newLimit };
            saveData();
            renderCategories();
            checkLimit();
          }
        });
      }
    });
  }
});

// --- Hàm hiển thị danh sách giao dịch ---
const renderTransactions = (data = transactions) => {
  historyList.innerHTML = "";
  data.forEach((t, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span><b>${t.category}</b> - ${t.note}: ${t.amount.toLocaleString()} VND</span>
      <button class="deleteBtn" data-id="${index}">Xóa</button>
    `;
    historyList.appendChild(li);
  });
  updateRemaining();
  checkLimit();
};

// --- Xử lý thêm giao dịch mới ---
addTransactionBtn.addEventListener("click", () => {
  const amount = Number(amountInput.value);
  const category = categoryInput.value.trim();
  const note = noteInput.value.trim();

  if (!amount || !category || amount <= 0 || amount > MAX_BUDGET) {
    Swal.fire("Thiếu thông tin", "Vui lòng nhập tiền và danh mục hợp lệ.", "info");
    return;
  }

  transactions.push({ amount, category, note });
  saveData();
  renderTransactions();

  amountInput.value = "";
  categoryInput.value = "";
  noteInput.value = "";
});

// --- Xử lý xóa giao dịch ---
historyList.addEventListener("click", (e) => {
  if (e.target.classList.contains("deleteBtn")) {
    const id = e.target.dataset.id;
    swalWithBootstrapButtons.fire({
      title: "Xóa giao dịch?",
      icon: "question",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        transactions.splice(id, 1);
        saveData();
        renderTransactions();
      }
    });
  }
});

// --- Xử lý tìm kiếm ---
searchBtn.addEventListener("click", () => {
  const keyword = searchInput.value.toLowerCase();
  const filtered = transactions.filter(t => 
    t.note.toLowerCase().includes(keyword) || 
    t.category.toLowerCase().includes(keyword)
  );
  renderTransactions(filtered);
});

// --- Xử lý sắp xếp ---
let isAsc = true;
sortBtn.addEventListener("click", () => {
  const sorted = [...transactions].sort((a, b) => isAsc ? a.amount - b.amount : b.amount - a.amount);
  isAsc = !isAsc;
  renderTransactions(sorted);
});

// --- Hàm kiểm tra vượt giới hạn danh mục ---
const checkLimit = () => {
  alertBox.innerHTML = "";
  alertBox.style.display = "none";
  let warnings = [];

  categories.forEach((cat) => {
    // Tính tổng tiền đã tiêu cho danh mục hiện tại
    const total = transactions
      .filter((t) => t.category.toLowerCase() === cat.name.toLowerCase())
      .reduce((sum, t) => sum + t.amount, 0);

    // Nếu vượt quá giới hạn thì thêm thông báo chi tiết
    if (total > cat.limit) {
      warnings.push(
        `Danh mục "<b>${cat.name}</b>" đã vượt giới hạn: ` + 
        `${total.toLocaleString()} / ${cat.limit.toLocaleString()} VND`
      );
    }
  });

  // Hiển thị hộp cảnh báo nếu có danh mục vượt hạn
  if (warnings.length > 0) {
    alertBox.style.display = "block";
    alertBox.innerHTML = warnings.join("<br>");
  }
};

// --- Xử lý khi trang web đã tải xong (DOM Content Loaded) ---
document.addEventListener("DOMContentLoaded", () => {
  const accountWrapper = document.getElementById("accountWrapper");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const logoutBtn = document.getElementById("logoutBtn");

  // Đóng/mở menu tài khoản
  if(accountWrapper) {
    accountWrapper.addEventListener("click", (e) => {
      e.stopPropagation(); 
      dropdownMenu.classList.toggle("show");
    });
  }

  // Click ra ngoài để đóng menu
  document.addEventListener("click", () => {
    if(dropdownMenu) dropdownMenu.classList.remove("show");
  });

  // Sự kiện nút đăng xuất
  if(logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      Swal.fire({
        title: "Xác nhận đăng xuất?",
        icon: "warning",
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem("userLogin"); 
          window.location.href = "login.html"; 
        }
      });
    });
  }
});

// --- Chạy khởi tạo giao diện lần đầu ---
renderCategories();
renderTransactions();
updateRemaining();