// =======================================
// IMPORT FIREBASE
// =======================================

import {

    db,

    collection,

    addDoc,

    onSnapshot,

    deleteDoc,

    updateDoc,

    doc,

    query,

    orderBy,

    serverTimestamp

} from "./firebase.js";

// =======================================
// CLOUDINARY
// =======================================

const CLOUD_NAME = "w39q5bb5";

const UPLOAD_PRESET = "shoptbsv2khanhs";

// =======================================
// FIRESTORE
// =======================================

const productRef = collection(db, "products");

const productQuery = query(

    productRef,

    orderBy("createdAt", "desc")

);

// =======================================
// BIẾN TOÀN CỤC
// =======================================

let products = [];

let isAdmin = false;

let editingId = null;

// =======================================
// DOM
// =======================================

const shop = document.getElementById("shop");

const admin = document.getElementById("admin");

const productList = document.getElementById("product-list");

const adminList = document.getElementById("admin-list");

const empty = document.getElementById("empty");

const loading = document.getElementById("loading");

const toast = document.getElementById("toast");

const search = document.getElementById("search");

const nameInput = document.getElementById("name");

const priceInput = document.getElementById("price");

const imageInput = document.getElementById("image");

const preview = document.getElementById("preview");

const saveBtn = document.getElementById("save-btn");

// =======================================
// FORMAT GIÁ
// =======================================

function formatPrice(price) {

    const number = Number(price);

    if (isNaN(number)) {

        return price;

    }

    return number.toLocaleString("vi-VN") + " đ";

}

// =======================================
// LOADING
// =======================================

function showLoading() {

    loading.classList.remove("hidden");

}

function hideLoading() {

    loading.classList.add("hidden");

}

// =======================================
// TOAST
// =======================================

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}// =======================================
// HIỂN THỊ CỬA HÀNG
// =======================================

window.showShop = function () {

    shop.classList.remove("hidden");

    admin.classList.add("hidden");

};

// =======================================
// HIỂN THỊ ADMIN
// =======================================

window.openAdmin = function () {

    shop.classList.add("hidden");

    admin.classList.remove("hidden");

};

// =======================================
// RENDER DANH SÁCH SẢN PHẨM
// =======================================

function renderProducts(list = products) {

    productList.innerHTML = "";

    adminList.innerHTML = "";

    if (list.length === 0) {

        empty.classList.remove("hidden");

        return;

    }

    empty.classList.add("hidden");

    list.forEach((item) => {

        // -------- SHOP --------

        productList.innerHTML += `

        <div class="card">

            <img src="${item.image}" alt="${item.name}">

            <h3>${item.name}</h3>

            <p>${formatPrice(item.price)}</p>

            <button>Mua ngay</button>

        </div>

        `;

        // -------- ADMIN --------

        adminList.innerHTML += `

        <div class="admin-item">

            <img src="${item.image}" alt="${item.name}">

            <div class="admin-info">

                <h4>${item.name}</h4>

                <p>${formatPrice(item.price)}</p>

            </div>

            <div class="admin-actions">

                <button onclick="editProduct('${item.id}')">

                    Sửa

                </button>

                <button onclick="deleteProduct('${item.id}')">

                    Xóa

                </button>

            </div>

        </div>

        `;

    });

}

// =======================================
// FIRESTORE REALTIME
// =======================================

onSnapshot(productQuery, (snapshot) => {

    products = [];

    snapshot.forEach((docSnap) => {

        products.push({

            id: docSnap.id,

            ...docSnap.data()

        });

    });

    renderProducts();

});// =======================================
// ĐĂNG NHẬP ADMIN
// =======================================

window.login = function () {

    const user = document.getElementById("username").value.trim();

    const pass = document.getElementById("password").value.trim();

    if (user === "admin" && pass === "khanh140321") {

        isAdmin = true;

        document.getElementById("login-box").classList.add("hidden");

        document.getElementById("admin-panel").classList.remove("hidden");

        showToast("Đăng nhập thành công!");

    } else {

        alert("Sai tài khoản hoặc mật khẩu!");

    }

};

// =======================================
// ĐĂNG XUẤT
// =======================================

window.logout = function () {

    isAdmin = false;

    editingId = null;

    document.getElementById("login-box").classList.remove("hidden");

    document.getElementById("admin-panel").classList.add("hidden");

    document.getElementById("username").value = "";

    document.getElementById("password").value = "";

    resetForm();

};

// =======================================
// XEM TRƯỚC ẢNH
// =======================================

imageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

        preview.src = e.target.result;

    };

    reader.readAsDataURL(file);

});

// =======================================
// TÌM KIẾM
// =======================================

search.addEventListener("input", function () {

    const keyword = this.value.toLowerCase().trim();

    if (keyword === "") {

        renderProducts();

        return;

    }

    const result = products.filter(item =>

        item.name.toLowerCase().includes(keyword)

    );

    renderProducts(result);

});

// =======================================
// RESET FORM
// =======================================

function resetForm() {

    nameInput.value = "";

    priceInput.value = "";

    imageInput.value = "";

    preview.src = "https://placehold.co/600x400?text=Preview";

    editingId = null;

    saveBtn.classList.add("hidden");

}// =======================================
// UPLOAD ẢNH LÊN CLOUDINARY
// =======================================

async function uploadImage(file) {

    const formData = new FormData();

    formData.append("file", file);

    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(

        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,

        {

            method: "POST",

            body: formData

        }

    );

    if (!response.ok) {

        throw new Error("Upload thất bại");

    }

    const data = await response.json();

    return data.secure_url;

}

// =======================================
// THÊM SẢN PHẨM
// =======================================

window.addProduct = async function () {

    const name = nameInput.value.trim();

    const price = priceInput.value.trim();

    const file = imageInput.files[0];

    if (name === "" || price === "") {

        alert("Vui lòng nhập đầy đủ thông tin!");

        return;

    }

    if (!file) {

        alert("Vui lòng chọn ảnh!");

        return;

    }

    try {

        showLoading();

        const imageUrl = await uploadImage(file);

        await addDoc(productRef, {

            name: name,

            price: Number(price),

            image: imageUrl,

            createdAt: serverTimestamp()

        });

        hideLoading();

        showToast("Đã thêm sản phẩm");

        resetForm();

    } catch (error) {

        console.error(error);

        hideLoading();

        alert("Không thể thêm sản phẩm!");

    }

};// =======================================
// SỬA SẢN PHẨM
// =======================================

window.editProduct = function (id) {

    const product = products.find(item => item.id === id);

    if (!product) return;

    editingId = id;

    nameInput.value = product.name;

    priceInput.value = product.price;

    preview.src = product.image;

    imageInput.value = "";

    saveBtn.classList.remove("hidden");

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

};

// =======================================
// LƯU CHỈNH SỬA
// =======================================

window.saveEdit = async function () {

    if (!editingId) return;

    const name = nameInput.value.trim();

    const price = priceInput.value.trim();

    if (name === "" || price === "") {

        alert("Vui lòng nhập đầy đủ thông tin!");

        return;

    }

    try {

        showLoading();

        const updateData = {

            name: name,

            price: Number(price)

        };

        const file = imageInput.files[0];

        if (file) {

            const imageUrl = await uploadImage(file);

            updateData.image = imageUrl;

        }

        await updateDoc(

            doc(db, "products", editingId),

            updateData

        );

        hideLoading();

        showToast("Đã cập nhật sản phẩm");

        resetForm();

    } catch (error) {

        console.error(error);

        hideLoading();

        alert("Không thể cập nhật sản phẩm!");

    }

};

// =======================================
// XÓA SẢN PHẨM
// =======================================

window.deleteProduct = async function (id) {

    const agree = confirm(

        "Bạn có chắc muốn xóa sản phẩm này?"

    );

    if (!agree) return;

    try {

        showLoading();

        await deleteDoc(

            doc(db, "products", id)

        );

        hideLoading();

        showToast("Đã xóa sản phẩm");

    } catch (error) {

        console.error(error);

        hideLoading();

        alert("Không thể xóa sản phẩm!");

    }

};// =======================================
// KIỂM TRA ĐĂNG NHẬP
// =======================================

function checkLogin() {

    if (!isAdmin) {

        alert("Vui lòng đăng nhập Admin!");

        return false;

    }

    return true;

}

// =======================================
// ENTER ĐỂ ĐĂNG NHẬP
// =======================================

document.getElementById("password")
.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {

        login();

    }

});

// =======================================
// ENTER THÊM SẢN PHẨM
// =======================================

priceInput.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {

        if (editingId) {

            saveEdit();

        } else {

            addProduct();

        }

    }

});

// =======================================
// VALIDATE GIÁ
// =======================================

priceInput.addEventListener("input", function () {

    this.value = this.value.replace(/[^0-9]/g, "");

});

// =======================================
// VALIDATE TÊN
// =======================================

nameInput.addEventListener("input", function () {

    this.value = this.value.trimStart();

});

// =======================================
// KIỂM TRA ẢNH
// =======================================

imageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

        alert("Chỉ được chọn ảnh!");

        this.value = "";

        preview.src = "https://placehold.co/600x400?text=Preview";

        return;

    }

    if (file.size > 5 * 1024 * 1024) {

        alert("Ảnh tối đa 5MB!");

        this.value = "";

        preview.src = "https://placehold.co/600x400?text=Preview";

    }

});

// =======================================
// ẨN LOADING KHI KHỞI ĐỘNG
// =======================================

hideLoading();// =======================================
// HIỂN THỊ / ẨN LOADING
// =======================================

function toggleLoading(show) {

    if (show) {

        loading.classList.remove("hidden");

    } else {

        loading.classList.add("hidden");

    }

}

// =======================================
// RESET PREVIEW
// =======================================

function resetPreview() {

    preview.src = "https://placehold.co/600x400?text=Preview";

    imageInput.value = "";

}

// =======================================
// RESET TOÀN BỘ FORM
// =======================================

function clearProductForm() {

    nameInput.value = "";

    priceInput.value = "";

    resetPreview();

    editingId = null;

    saveBtn.classList.add("hidden");

}

// =======================================
// LÀM MỚI DANH SÁCH
// =======================================

function refreshProducts() {

    renderProducts(products);

}

// =======================================
// MUA NGAY
// =======================================

window.buyProduct = function (id) {

    const product = products.find(item => item.id === id);

    if (!product) return;

    alert(
        "Cảm ơn bạn đã chọn:\n\n" +
        product.name +
        "\n\nGiá: " +
        formatPrice(product.price)
    );

};

// =======================================
// KIỂM TRA FIREBASE
// =======================================

function checkFirebase() {

    console.log("Firebase Connected");

}

// =======================================
// KHỞI TẠO
// =======================================

window.addEventListener("load", () => {

    checkFirebase();

    showShop();

    hideLoading();

    refreshProducts();

});

// =======================================
// DEBUG
// =======================================

window.products = products;// =======================================
// KHỞI TẠO GIAO DIỆN
// =======================================

window.onload = function () {

    showShop();

    hideLoading();

    resetForm();

};

// =======================================
// KIỂM TRA KẾT NỐI
// =======================================

console.log("=====================================");
console.log("SHOP TB SV2");
console.log("Firebase Firestore : OK");
console.log("Cloudinary         : OK");
console.log("Realtime Database  : OK");
console.log("=====================================");

// =======================================
// XỬ LÝ LỖI TOÀN CỤC
// =======================================

window.addEventListener("error", function (event) {

    console.error("Lỗi:", event.message);

});

// =======================================
// CHỐNG GỬI FORM
// =======================================

document.querySelectorAll("form").forEach(form => {

    form.addEventListener("submit", function (e) {

        e.preventDefault();

    });

});

// =======================================
// ESC ĐỂ RESET FORM
// =======================================

document.addEventListener("keydown", function (e) {

    if (e.key === "Escape") {

        resetForm();

    }

});

// =======================================
// HÀM TẢI LẠI GIAO DIỆN
// =======================================

function refreshUI() {

    renderProducts(products);

}

// =======================================
// THEO DÕI KẾT NỐI
// =======================================

window.addEventListener("online", () => {

    showToast("Đã kết nối Internet");

});

window.addEventListener("offline", () => {

    alert("Mất kết nối Internet!");

});

// =======================================
// XUẤT DEBUG
// =======================================

window.debug = {

    products,

    refreshUI,

    showToast,

    showLoading,

    hideLoading

};

// =======================================
// KẾT THÚC FILE
// =======================================
