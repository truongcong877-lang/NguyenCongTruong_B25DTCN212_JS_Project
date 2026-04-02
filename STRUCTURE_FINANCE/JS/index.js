// --- KHỞI TẠO DỮ LIỆU TỪ LOCALSTORAGE ---
let monthlyBudgets = JSON.parse(localStorage.getItem("monthlyBudgets")) || {};
let monthlyCategories = JSON.parse(localStorage.getItem("monthlyCategories")) || {};
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let isAsc = true;

// --- TRUY XUẤT DOM ---
const monthInput = document.querySelector('input[type="month"]');
const budgetInput = document.querySelector('.card input[placeholder*="5000000"]');
const saveBudgetBtn = document.querySelector(".card-btn");
const remainingMoneyEl = document.querySelectorAll(".card p")[1];

const categoryNameInput = document.querySelector(".category-name-input");
const categoryLimitInput = document.querySelector(".category-limit-input");
const addCategoryBtn = document.querySelector(".category-form button");
const categoryList = document.querySelector(".category-list");

const amountInput = document.querySelector(".amountInput");
const categoryInput = document.querySelector(".categoryInput"); // Thẻ SELECT trong HTML
const noteInput = document.querySelector(".noteInput");
const addTransactionBtn = document.querySelector(".addTransactionBtn");

const historyList = document.querySelector(".historyList");
const searchInput = document.querySelector(".searchInput");
const searchBtn = document.querySelector(".searchBtn");
const statTable = document.querySelector(".statTable");

// --- HÀM LƯU DỮ LIỆU ---
const saveData = () => {
    localStorage.setItem("monthlyBudgets", JSON.stringify(monthlyBudgets));
    localStorage.setItem("monthlyCategories", JSON.stringify(monthlyCategories));
    localStorage.setItem("transactions", JSON.stringify(transactions));
};

// --- HIỂN THỊ DANH MỤC (CÓ NÚT SỬA & XÓA) ---
const renderCategories = () => {
    const selectedMonth = monthInput.value;
    const categories = monthlyCategories[selectedMonth] || [];
    
    categoryList.innerHTML = "";
    categoryInput.innerHTML = '<option value="">-- Chọn danh mục --</option>';

    categories.forEach((cat, index) => {
        const li = document.createElement("li");
        li.className = "category-item";
        li.innerHTML = `
            <div class="category-info">
                <div class="category-name" style="font-weight: bold; color: #374151;">${cat.name}</div>
                <div class="category-limit" style="font-size: 0.85em; color: #6b7280; margin-top: 2px;">
                    Giới hạn: ${Number(cat.limit).toLocaleString()} VND
                </div>
            </div>
            <div class="category-actions">
                <button class="editCat" data-id="${index}" style="color:#3b82f6; cursor:pointer; border:none; background:none; font-weight:bold; margin-right:10px;">Sửa</button>
                <button class="deleteCat" data-id="${index}" style="color:#ef4444; cursor:pointer; border:none; background:none; font-weight:bold;">Xóa</button>
            </div>
        `;
        categoryList.appendChild(li);

        const opt = document.createElement("option");
        opt.value = cat.name;
        opt.innerText = cat.name;
        categoryInput.appendChild(opt);
    });
};

// --- THỐNG KÊ TỔNG HỢP ---
const renderFullStats = () => {
    const allMonths = new Set([
        ...Object.keys(monthlyBudgets),
        ...Object.keys(monthlyCategories),
        ...transactions.map(t => t.month)
    ]);

    const sortedMonths = Array.from(allMonths).filter(m => m).sort().reverse();
    let html = `<tr><th>Tháng</th><th>Chi tiêu</th><th>Ngân sách</th><th>Trạng thái</th></tr>`;

    sortedMonths.forEach(m => {
        const b = monthlyBudgets[m] || 0;
        const s = transactions.filter(t => t.month === m).reduce((sum, t) => sum + t.amount, 0);
        const isOver = s > b;
        html += `
            <tr>
                <td>${m}</td>
                <td>${s.toLocaleString()}</td>
                <td>${b.toLocaleString()}</td>
                <td style="color: ${isOver ? '#ef4444' : '#22c55e'}; font-weight: bold;">${isOver ? 'Vượt mức' : 'Đạt'}</td>
            </tr>`;
    });
    statTable.innerHTML = html;
};

// --- HIỂN THỊ GIAO DỊCH ---
const renderTransactions = () => {
    const selectedMonth = monthInput.value;
    const keyword = searchInput.value.toLowerCase();
    
    let monthData = transactions.filter(t => t.month === selectedMonth);
    let displayData = monthData.filter(t => 
        t.note.toLowerCase().includes(keyword) || t.category.toLowerCase().includes(keyword)
    );

    historyList.innerHTML = "";
    displayData.forEach((t) => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${t.category} - ${t.note}: <b>${t.amount.toLocaleString()} VND</b></span>`;
        historyList.appendChild(li);
    });

    const budget = monthlyBudgets[selectedMonth] || 0;
    const totalSpent = monthData.reduce((sum, t) => sum + t.amount, 0);
    const remain = budget - totalSpent;
    
    remainingMoneyEl.innerText = remain.toLocaleString() + " VND";
    remainingMoneyEl.style.color = remain < 0 ? "#ef4444" : "#22c55e";

    renderFullStats();
};

// --- SỰ KIỆN: THÊM DANH MỤC & RESET ---
addCategoryBtn.addEventListener("click", () => {
    const m = monthInput.value;
    if (!m) return Swal.fire("Lỗi", "Vui lòng chọn tháng trước!", "error");

    const name = categoryNameInput.value.trim();
    const limit = Number(categoryLimitInput.value.replace(/,/g, ''));

    if (!name || isNaN(limit) || limit <= 0) {
        return Swal.fire("Lỗi", "Nhập tên và hạn mức hợp lệ!", "warning");
    }

    if (!monthlyCategories[m]) monthlyCategories[m] = [];
    monthlyCategories[m].push({ name, limit });

    saveData();
    renderCategories();

    categoryNameInput.value = "";
    categoryLimitInput.value = "";
    categoryNameInput.focus();
});

// --- SỰ KIỆN: SỬA & XÓA DANH MỤC ---
categoryList.addEventListener("click", (e) => {
    const id = e.target.dataset.id;
    const m = monthInput.value;

    if (e.target.classList.contains("deleteCat")) {
        Swal.fire({
            title: "Xóa danh mục này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy"
        }).then((res) => {
            if (res.isConfirmed) {
                monthlyCategories[m].splice(id, 1);
                saveData();
                renderCategories();
                renderTransactions();
            }
        });
    }

    if (e.target.classList.contains("editCat")) {
        const cat = monthlyCategories[m][id];
        Swal.fire({
            title: 'Chỉnh sửa danh mục',
            html: `
                <input id="swal-name" class="swal2-input" placeholder="Tên" value="${cat.name}">
                <input id="swal-limit" type="number" class="swal2-input" placeholder="Hạn mức" value="${cat.limit}">
            `,
            showCancelButton: true,
            confirmButtonText: 'Lưu',
            preConfirm: () => {
                const newName = document.getElementById('swal-name').value.trim();
                const newLimit = Number(document.getElementById('swal-limit').value);
                if (!newName || newLimit <= 0) {
                    Swal.showValidationMessage(`Vui lòng nhập đúng thông tin!`);
                }
                return { name: newName, limit: newLimit };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const oldName = monthlyCategories[m][id].name;
                // Cập nhật tên trong lịch sử giao dịch tháng đó
                transactions.forEach(t => {
                    if (t.month === m && t.category === oldName) t.category = result.value.name;
                });
                monthlyCategories[m][id] = result.value;
                saveData();
                renderCategories();
                renderTransactions();
            }
        });
    }
});

// --- SỰ KIỆN: LƯU NGÂN SÁCH (VALIDATE) ---
saveBudgetBtn.addEventListener("click", () => {
    const m = monthInput.value;
    const rawVal = budgetInput.value.replace(/,/g, '').trim();
    const val = Number(rawVal);

    if (!m) return Swal.fire("Lỗi", "Chọn tháng trước!", "error");
    if (isNaN(val) || rawVal === "" || val <= 0) return Swal.fire("Lỗi", "Ngân sách không hợp lệ!", "warning");
    if (val > 10000000000) return Swal.fire("Lỗi", "Tối đa 10 tỷ!", "warning");

    monthlyBudgets[m] = val;
    saveData();
    renderTransactions();
    budgetInput.value = "";
    Swal.fire("Thành công", `Đã lưu ngân sách tháng ${m}`, "success");
});

// --- SỰ KIỆN: THÊM GIAO DỊCH ---
addTransactionBtn.addEventListener("click", () => {
    const m = monthInput.value;
    const amt = Number(amountInput.value.replace(/,/g, ''));
    const cat = categoryInput.value;
    const note = noteInput.value.trim();

    if (!m || !cat || amt <= 0) return Swal.fire("Lỗi", "Thiếu thông tin chi tiêu!", "warning");

    transactions.push({ month: m, amount: amt, category: cat, note: note });
    saveData();
    amountInput.value = "";
    noteInput.value = "";
    categoryInput.selectedIndex = 0;
    renderTransactions();
});

// --- ĐỔI THÁNG ---
monthInput.addEventListener("change", () => {
    renderCategories();
    renderTransactions();
});

// --- KHỞI CHẠY ---
document.addEventListener("DOMContentLoaded", () => {
    const now = new Date();
    monthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    renderCategories();
    renderTransactions();
});