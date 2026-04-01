let budget = Number(localStorage.getItem("budget")) || 0;
let categories = JSON.parse(localStorage.getItem("categories")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success",
    cancelButton: "btn btn-danger"
  },
  buttonsStyling: true
});

const budgetInput = document.querySelectorAll(".card input")[1];
const saveBudgetBtn = document.querySelector(".card-btn");
const remainingMoneyEl = document.querySelectorAll(".card p")[1];

const categoryNameInput = document.querySelector(".category-form input:nth-child(1)");
const categoryLimitInput = document.querySelector(".category-form input:nth-child(2)");
const addCategoryBtn = document.querySelector(".category-form button");
const categoryList = document.querySelector(".category-list");

const amountInput = document.querySelector(".amountInput");
const categoryInput = document.querySelector(".categoryInput");
const noteInput = document.querySelector(".noteInput");
const addTransactionBtn = document.querySelector(".addTransactionBtn");

const historyList = document.querySelector(".historyList");
const searchInput = document.querySelector(".searchInput");
const searchBtn = document.querySelector(".searchBtn");
const sortBtn = document.querySelector(".sortBtn");
const alertBox = document.querySelector(".alertBox");

const saveData = () => {
  localStorage.setItem("budget", budget);
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("transactions", JSON.stringify(transactions));
};

saveBudgetBtn.addEventListener("click", () => {
  const value = Number(budgetInput.value);
  if (isNaN(value) || value <= 0) {
    Swal.fire("Lỗi!", "Vui lòng nhập số tiền ngân sách hợp lệ.", "error");
    return;
  }
  budget = value;
  saveData();
  updateRemaining();
  budgetInput.value = ""; 
  Swal.fire("Thành công!", "Đã cập nhật ngân sách tháng.", "success");
});

const updateRemaining = () => {
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const remain = budget - totalSpent;
  remainingMoneyEl.innerText = remain.toLocaleString() + " VND";
  remainingMoneyEl.style.color = remain < 0 ? "#ef4444" : "#22c55e";
};

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

addCategoryBtn.addEventListener("click", () => {
  const name = categoryNameInput.value.trim();
  const limit = Number(categoryLimitInput.value);

  if (!name || isNaN(limit) || limit <= 0) {
    Swal.fire("Thông báo", "Vui lòng nhập đầy đủ tên và giới hạn danh mục!", "warning");
    return;
  }

  categories.push({ name, limit });
  saveData();
  renderCategories();
  categoryNameInput.value = "";
  categoryLimitInput.value = "";
  Swal.fire("Thành công", "Đã thêm danh mục mới.", "success");
});

categoryList.addEventListener("click", (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains("deleteCat")) {
    swalWithBootstrapButtons.fire({
      title: "Xác nhận xóa?",
      text: "Danh mục này và các cảnh báo liên quan sẽ bị gỡ bỏ!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đúng, xóa nó!",
      cancelButtonText: "Không, giữ lại!",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        categories.splice(id, 1);
        saveData();
        renderCategories();
        checkLimit();
        Swal.fire("Đã xóa!", "Danh mục đã được xóa thành công.", "success");
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
          if (resLimit.value) {
            categories[id] = { name: resName.value, limit: Number(resLimit.value) };
            saveData();
            renderCategories();
            checkLimit();
            Swal.fire("Cập nhật!", "Danh mục đã được thay đổi.", "success");
          }
        });
      }
    });
  }
});

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

addTransactionBtn.addEventListener("click", () => {
  const amount = Number(amountInput.value);
  const category = categoryInput.value.trim();
  const note = noteInput.value.trim();

  if (!amount || !category) {
    Swal.fire("Thiếu thông tin", "Vui lòng nhập số tiền và danh mục chi tiêu.", "info");
    return;
  }

  transactions.push({ amount, category, note });
  saveData();
  renderTransactions();

  amountInput.value = "";
  categoryInput.value = "";
  noteInput.value = "";
});

historyList.addEventListener("click", (e) => {
  if (e.target.classList.contains("deleteBtn")) {
    const id = e.target.dataset.id;
    swalWithBootstrapButtons.fire({
      title: "Xóa giao dịch?",
      text: "Bạn không thể hoàn tác hành động này!",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Hủy bỏ"
    }).then((result) => {
      if (result.isConfirmed) {
        transactions.splice(id, 1);
        saveData();
        renderTransactions();
        Swal.fire("Xong!", "Giao dịch đã được loại bỏ.", "success");
      }
    });
  }
});

searchBtn.addEventListener("click", () => {
  const keyword = searchInput.value.toLowerCase();
  const filtered = transactions.filter(t => 
    t.note.toLowerCase().includes(keyword) || 
    t.category.toLowerCase().includes(keyword)
  );
  renderTransactions(filtered);
});

let isAsc = true;
sortBtn.addEventListener("click", () => {
  const sorted = [...transactions].sort((a, b) => isAsc ? a.amount - b.amount : b.amount - a.amount);
  isAsc = !isAsc;
  renderTransactions(sorted);
});

const checkLimit = () => {
  alertBox.innerHTML = "";
  alertBox.style.display = "none";
  let warnings = [];

  categories.forEach((cat) => {
    const total = transactions
      .filter((t) => t.category.toLowerCase() === cat.name.toLowerCase())
      .reduce((sum, t) => sum + t.amount, 0);

    if (total > cat.limit) {
      warnings.push(`Danh mục "<b>${cat.name}</b>" đã vượt giới hạn!`);
    }
  });

  if (warnings.length > 0) {
    alertBox.style.display = "block";
    alertBox.innerHTML = warnings.join("<br>");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const accountWrapper = document.getElementById("accountWrapper");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const logoutBtn = document.getElementById("logoutBtn");

  accountWrapper.addEventListener("click", (e) => {
    e.stopPropagation(); 
    dropdownMenu.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    dropdownMenu.classList.remove("show");
  });

  logoutBtn.addEventListener("click", () => {
    Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Bạn sẽ được đăng xuất khỏi hệ thống!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy"
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("userLogin"); 
        window.location.href = "login.html"; 
      }
    });
  });
});

renderCategories();
renderTransactions();
updateRemaining();