// --- LẤY USER HIỆN TẠI (dùng email làm userId) ---
const getCurrentUserId = () => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    return user ? user.email : null;
};

const userKey = (key) => {
    const uid = getCurrentUserId();
    return uid ? `${uid}_${key}` : key;
};

// --- FORMAT TIỀN VIỆT NAM ---
const formatVND = (amount) => {
    return Number(amount).toLocaleString('vi', { style: 'currency', currency: 'VND' }).replace('₫', 'VND');
};

// --- KHỞI TẠO DỮ LIỆU TỪ LOCALSTORAGE (theo userId) ---
let monthlyBudgets = JSON.parse(localStorage.getItem(userKey("monthlyBudgets"))) || {};
let monthlyCategories = JSON.parse(localStorage.getItem(userKey("monthlyCategories"))) || {};
let transactions = JSON.parse(localStorage.getItem(userKey("transactions"))) || [];

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
const categoryInput = document.querySelector(".categoryInput");
const noteInput = document.querySelector(".noteInput");
const addTransactionBtn = document.querySelector(".addTransactionBtn");

const historyList = document.querySelector(".historyList");
const searchInput = document.querySelector(".searchInput");
const statTable = document.querySelector(".statTable");

// Element cho Đăng xuất
const accountWrapper = document.getElementById("accountWrapper");
const dropdownMenu = document.getElementById("dropdownMenu");
const logoutBtn = document.getElementById("logoutBtn");

// --- HÀM LƯU DỮ LIỆU (theo userId) ---
const saveData = () => {
    localStorage.setItem(userKey("monthlyBudgets"), JSON.stringify(monthlyBudgets));
    localStorage.setItem(userKey("monthlyCategories"), JSON.stringify(monthlyCategories));
    localStorage.setItem(userKey("transactions"), JSON.stringify(transactions));
};

// --- HIỂN THỊ NGÂN SÁCH ĐÃ LƯU VÀO INPUT ---
const loadBudgetInput = () => {
    const m = monthInput.value;
    if (m && monthlyBudgets[m]) {
        budgetInput.value = formatVND(monthlyBudgets[m]);
    } else {
        budgetInput.value = "";
    }
};

// --- LOGIC ĐĂNG XUẤT & ACCOUNT ---
const handleAccountLogic = () => {
    if (accountWrapper) {
        accountWrapper.addEventListener("click", (e) => {
            e.stopPropagation();
            const isShow = dropdownMenu.style.display === "block";
            dropdownMenu.style.display = isShow ? "none" : "block";
        });
    }

    window.addEventListener("click", () => {
        if (dropdownMenu) dropdownMenu.style.display = "none";
    });

    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            Swal.fire({
                title: "Xác nhận đăng xuất?",
                text: "Bạn sẽ được đưa trở lại trang đăng nhập.",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#ef4444",
                cancelButtonColor: "#6b7280",
                confirmButtonText: "Đăng xuất",
                cancelButtonText: "Ở lại",
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem("currentUser");
                    Swal.fire({
                        title: "Đã đăng xuất!",
                        icon: "success",
                        timer: 1000,
                        showConfirmButton: false
                    });
                    setTimeout(() => {
                        window.location.replace("login.html");
                    }, 1000);
                }
            });
        });
    }
};

// --- HIỂN THỊ DANH MỤC ---
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
                    Giới hạn: ${formatVND(cat.limit)}
                </div>
            </div>
            <div class="category-actions">
                <button class="editCat" data-id="${index}" style="color:#ef4444; cursor:pointer; border:none; background:none; font-weight:bold; margin-right:10px;">Sửa</button>
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
    const spendings = transactions.reduce((acc, t) => {
        acc[t.month] = (acc[t.month] || 0) + t.amount;
        return acc;
    }, {});

    const allMonths = [...new Set([...Object.keys(monthlyBudgets), ...Object.keys(spendings)])]
        .filter(Boolean).sort().reverse();

    statTable.innerHTML = `
        <tr><th>Tháng</th><th>Chi tiêu</th><th>Ngân sách</th><th>Trạng thái</th></tr>
        ${allMonths.map(m => {
            const b = monthlyBudgets[m] || 0;
            const s = spendings[m] || 0;
            const isOver = s > b;
            return `
                <tr>
                    <td>${m}</td>
                    <td>${formatVND(s)}</td>
                    <td>${formatVND(b)}</td>
                    <td style="color: ${isOver ? '#ef4444' : '#22c55e'}; font-weight: bold;">
                        ${isOver ? 'Vượt mức' : '✓ Đạt'}
                    </td>
                </tr>`;
        }).join('')}
    `;
};

// --- CẢNH BÁO VƯỢT GIỚI HẠN DANH MỤC ---
const renderCategoryWarnings = () => {
    const existing = document.querySelector(".category-warnings");
    if (existing) existing.remove();

    const selectedMonth = monthInput.value;
    const categories = monthlyCategories[selectedMonth] || [];
    const monthData = transactions.filter(t => t.month === selectedMonth);

    const spendingByCategory = monthData.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {});

    const warnings = categories.filter(cat => {
        const spent = spendingByCategory[cat.name] || 0;
        return spent > cat.limit;
    });

    if (warnings.length === 0) return;

    const alertBox = document.querySelector(".alertBox");
    if (!alertBox) return;

    alertBox.style.display = "block";
    alertBox.innerHTML = "";

    const container = document.createElement("div");
    container.className = "category-warnings";

    warnings.forEach(cat => {
        const spent = spendingByCategory[cat.name] || 0;
        const div = document.createElement("div");
        div.className = "category-warning-item";
        div.innerHTML = `Danh mục "${cat.name}" đã vượt giới hạn: ${formatVND(spent)} / ${formatVND(cat.limit)}`;
        container.appendChild(div);
    });

    alertBox.appendChild(container);
};

// --- PHÂN TRANG ---
const ITEMS_PER_PAGE = 5;
let currentPage = 1;
let sortOrder = null;

const renderPagination = (totalItems) => {
    const pagination = document.querySelector(".pagination");
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    pagination.innerHTML = "";

    if (totalPages <= 1) return;

    const prevBtn = document.createElement("button");
    prevBtn.className = "pageBtn";
    prevBtn.textContent = "Previous";
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) { currentPage--; renderTransactions(); }
    });
    pagination.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.className = "pageBtn" + (i === currentPage ? " activePage" : "");
        btn.textContent = i;
        btn.addEventListener("click", () => {
            currentPage = i;
            renderTransactions();
        });
        pagination.appendChild(btn);
    }

    const nextBtn = document.createElement("button");
    nextBtn.className = "pageBtn";
    nextBtn.textContent = "Next";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) { currentPage++; renderTransactions(); }
    });
    pagination.appendChild(nextBtn);
};

// --- HIỂN THỊ GIAO DỊCH ---
const renderTransactions = () => {
    const selectedMonth = monthInput.value;
    const keyword = (searchInput.value || "").toLowerCase();

    const monthData = transactions.filter(t => t.month === selectedMonth);
    historyList.innerHTML = "";

    const alertBox = document.querySelector(".alertBox");
    if (alertBox) alertBox.style.display = "none";

    let filtered = transactions
        .map((t, index) => ({ ...t, originalIndex: index }))
        .filter(t => t.month === selectedMonth && (
            t.note.toLowerCase().includes(keyword) ||
            t.category.toLowerCase().includes(keyword)
        ));

    if (sortOrder === 'asc') filtered.sort((a, b) => a.amount - b.amount);
    if (sortOrder === 'desc') filtered.sort((a, b) => b.amount - a.amount);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    if (currentPage > totalPages) currentPage = 1;

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);

    paginated.forEach(t => {
        const li = document.createElement("li");
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        li.style.padding = "8px 0";
        li.style.borderBottom = "1px solid #f3f4f6";

        li.innerHTML = `
            <span>${t.category} - ${t.note}: <b>${formatVND(t.amount)}</b></span>
            <button class="deleteTransactionBtn" data-id="${t.originalIndex}"
                style="color:#ef4444; cursor:pointer; border:none; background:none; font-weight:bold; font-size:1.2em;">
                Xoá
            </button>
        `;
        historyList.appendChild(li);
    });

    const budget = monthlyBudgets[selectedMonth] || 0;
    const totalSpent = monthData.reduce((sum, t) => sum + t.amount, 0);
    const remain = budget - totalSpent;

    remainingMoneyEl.innerText = formatVND(remain);
    remainingMoneyEl.style.color = remain < 0 ? "#ef4444" : "#22c55e";

    renderPagination(filtered.length);
    renderFullStats();
    renderCategoryWarnings();
};

// --- CÁC SỰ KIỆN LẮNG NGHE (EVENTS) ---

// Xoá giao dịch
historyList.addEventListener("click", (e) => {
    if (e.target.classList.contains("deleteTransactionBtn")) {
        const index = e.target.dataset.id;
        Swal.fire({
            title: "Xóa giao dịch?",
            text: "Bạn có chắc muốn xoá lịch sử giao dịch này không?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy"
        }).then((result) => {
            if (result.isConfirmed) {
                transactions.splice(index, 1);
                saveData();
                renderTransactions();
            }
        });
    }
});

// Thêm danh mục
addCategoryBtn.addEventListener("click", () => {
    const m = monthInput.value;
    if (!m) return Swal.fire("Lỗi", "Vui lòng chọn tháng!", "error");

    const name = categoryNameInput.value.trim();
    const limit = Number(categoryLimitInput.value.replace(/[^\d]/g, ''));

    if (!name || limit <= 0) return Swal.fire("Lỗi", "Nhập tên và hạn mức hợp lệ!", "warning");

    if (!monthlyCategories[m]) monthlyCategories[m] = [];
    monthlyCategories[m].push({ name, limit });

    saveData();
    renderCategories();
    categoryNameInput.value = "";
    categoryLimitInput.value = "";
});

// Sửa & Xóa danh mục
categoryList.addEventListener("click", (e) => {
    const id = e.target.dataset.id;
    const m = monthInput.value;
    if (!id) return;

    if (e.target.classList.contains("deleteCat")) {
        Swal.fire({
            title: "Xóa danh mục?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xóa"
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
            preConfirm: () => {
                return {
                    name: document.getElementById('swal-name').value.trim(),
                    limit: Number(document.getElementById('swal-limit').value)
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const oldName = monthlyCategories[m][id].name;
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

// Lưu ngân sách — KHÔNG reset input, hiển thị lại giá trị đã lưu
saveBudgetBtn.addEventListener("click", () => {
    const m = monthInput.value;
    const val = Number(budgetInput.value.replace(/[^\d]/g, ''));

    if (!m || val < 1000) return Swal.fire("Lỗi", "Ngân sách không hợp lệ!", "warning");
    if (val > 5000000000) return Swal.fire("Lỗi", "Ngân sách không được vượt quá 5.000.000.000 VND!", "warning");

    monthlyBudgets[m] = val;
    saveData();
    renderTransactions();
    // ✅ Hiển thị lại giá trị đã lưu (có format dấu phẩy), KHÔNG xóa input
    budgetInput.value = formatVND(val);
    Swal.fire("Thành công", `Đã lưu ngân sách tháng ${m}`, "success");
});

// Thêm giao dịch
addTransactionBtn.addEventListener("click", () => {
    const m = monthInput.value;
    const amt = Number(amountInput.value.replace(/[^\d]/g, ''));
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

// Sắp xếp theo giá
const sortBtn = document.querySelector(".sortBtn");
if (sortBtn) {
    sortBtn.addEventListener("click", () => {
        if (sortOrder === null || sortOrder === 'desc') {
            sortOrder = 'asc';
            sortBtn.textContent = "Giá tăng dần ↑";
        } else {
            sortOrder = 'desc';
            sortBtn.textContent = "Giá giảm dần ↓";
        }
        currentPage = 1;
        renderTransactions();
    });
}

// Tìm kiếm & Đổi tháng
if (searchInput) searchInput.addEventListener("input", () => {
    currentPage = 1;
    renderTransactions();
});

monthInput.addEventListener("change", () => {
    renderCategories();
    renderTransactions();
    // ✅ Khi đổi tháng, load lại ngân sách đã lưu của tháng đó vào input
    loadBudgetInput();
});

// --- KHỞI CHẠY ---
document.addEventListener("DOMContentLoaded", () => {
    // ✅ Kiểm tra đăng nhập — chưa login thì về login.html
    const user = localStorage.getItem("currentUser");
    if (!user) {
        window.location.replace("login.html");
        return;
    }

    // ✅ Chặn nút Back quay lại trang login
    history.pushState(null, "", location.href);
    window.addEventListener("popstate", () => {
        history.pushState(null, "", location.href);
    });

    // ✅ Reload dữ liệu đúng theo userId (đảm bảo lấy đúng sau khi xác định user)
    monthlyBudgets = JSON.parse(localStorage.getItem(userKey("monthlyBudgets"))) || {};
    monthlyCategories = JSON.parse(localStorage.getItem(userKey("monthlyCategories"))) || {};
    transactions = JSON.parse(localStorage.getItem(userKey("transactions"))) || [];

    // Thiết lập tháng hiện tại nếu chưa có
    if (!monthInput.value) {
        const now = new Date();
        monthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    // ✅ Load ngân sách tháng hiện tại vào input
    loadBudgetInput();

    // Chạy các hàm khởi tạo
    handleAccountLogic();
    renderCategories();
    renderTransactions();
});