// Admin authentication
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'mk2024'
};

// Products management
let products = [];
let editingProductId = null;

// إضافة متغير لحفظ الفئات المخصصة
let customCategories = [];

// Check if user is logged in
function checkAuth() {
    const isLoggedIn = localStorage.getItem('mkAdminLoggedIn');
    if (isLoggedIn === 'true') {
        showDashboard();
    } else {
        showLogin();
    }
}

// Login function
function login(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('mkAdminLoggedIn', 'true');
        showDashboard();
    } else {
        alert('بيانات تسجيل الدخول غير صحيحة!');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('mkAdminLoggedIn');
    showLogin();
}

// Show login form
function showLogin() {
    document.getElementById('loginForm').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
}

// Show dashboard
function showDashboard() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    loadProducts();
    displayProducts();
    updateStats();
    initSidebar();
}

// Initialize sidebar navigation
function initSidebar() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links and sections
            sidebarLinks.forEach(l => l.classList.remove('active'));
            contentSections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Show corresponding section
            const sectionId = link.dataset.section + '-section';
            document.getElementById(sectionId).classList.add('active');
            
            // Update stats if stats section is selected
            if (link.dataset.section === 'stats') {
                updateStats();
            }
        });
    });
}

// Load products from localStorage
function loadProducts() {
    const savedProducts = localStorage.getItem('mkProducts');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    } else {
        // Default products
        products = [
            {
                id: 1,
                name: "قميص كاجوال أنيق",
                price: "299 جنيه",
                category: "shirts",
                description: "قميص كاجوال مريح مصنوع من أجود أنواع القطن",
                image: ""
            },
            {
                id: 2,
                name: "بنطلون جينز كلاسيكي",
                price: "450 جنيه",
                category: "pants",
                description: "بنطلون جينز عالي الجودة بتصميم كلاسيكي",
                image: ""
            },
            {
                id: 3,
                name: "حزام جلدي فاخر",
                price: "150 جنيه",
                category: "accessories",
                description: "حزام جلدي طبيعي بتصميم أنيق",
                image: ""
            }
        ];
        saveProducts();
    }
    
    // تحميل الفئات المخصصة
    const savedCategories = localStorage.getItem('mkCustomCategories');
    if (savedCategories) {
        customCategories = JSON.parse(savedCategories);
    }
    
    // تحديث قائمة الفئات في السليكت
    updateCategorySelect();
}

// Save products to localStorage
// إضافة دالة لتحديث الفئات في الصفحة الرئيسية
function updateMainPageCategories() {
    // إذا كان window.productManager متوفراً (في حالة فتح الصفحة الرئيسية في تبويب آخر)
    if (window.productManager && typeof window.productManager.updateCategoryFilters === 'function') {
        window.productManager.updateCategoryFilters();
    }
    
    // إرسال رسالة للتبويبات الأخرى لتحديث الفئات
    if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('mk-categories-update');
        channel.postMessage({ type: 'categories-updated' });
    }
}

// تحديث دالة saveProducts لتحديث الفئات
function saveProducts() {
    localStorage.setItem('mkProducts', JSON.stringify(products));
    updateMainPageCategories(); // تحديث الفئات في الصفحة الرئيسية
}

// دالة جديدة لحفظ الفئات المخصصة
function saveCustomCategories() {
    localStorage.setItem('mkCustomCategories', JSON.stringify(customCategories));
}

// دالة جديدة لتحديث قائمة الفئات في السليكت
function updateCategorySelect() {
    const categorySelect = document.getElementById('productCategory');
    if (!categorySelect) return;
    
    // الحصول على الفئات الافتراضية
    const defaultOptions = [
        { value: "", text: "اختر الفئة" },
        { value: "shirts", text: "قمصان" },
        { value: "pants", text: "بناطيل" },
        { value: "accessories", text: "إكسسوارات" }
    ];
    
    // مسح جميع الخيارات الحالية
    categorySelect.innerHTML = '';
    
    // إضافة الفئات الافتراضية
    defaultOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        categorySelect.appendChild(optionElement);
    });
    
    // إضافة الفئات المخصصة
    customCategories.forEach(category => {
        const optionElement = document.createElement('option');
        optionElement.value = category.value;
        optionElement.textContent = category.text;
        categorySelect.appendChild(optionElement);
    });
    
    // إضافة خيار "إضافة فئة جديدة" في النهاية
    const newCategoryOption = document.createElement('option');
    newCategoryOption.value = 'new-category';
    newCategoryOption.textContent = 'إضافة فئة جديدة...';
    categorySelect.appendChild(newCategoryOption);
}

// Display products in table
// تحديث دالة displayProducts
function displayProducts() {
    const tbody = document.getElementById('productsTableBody');
    const container = document.querySelector('.products-table-container');
    
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>لا توجد منتجات</h3>
                    <p>ابدأ بإضافة منتج جديد</p>
                </td>
            </tr>
        `;
        
        // إضافة عرض فارغ للكاردات أيضاً
        let cardsContainer = container.querySelector('.products-cards');
        if (!cardsContainer) {
            cardsContainer = document.createElement('div');
            cardsContainer.className = 'products-cards';
            container.appendChild(cardsContainer);
        }
        cardsContainer.innerHTML = `
            <div class="empty-state-mobile">
                <i class="fas fa-box-open"></i>
                <h3>لا توجد منتجات</h3>
                <p>ابدأ بإضافة منتج جديد</p>
            </div>
        `;
        return;
    }
    
    // عرض الجدول العادي
    // تحديث عرض الجدول
    tbody.innerHTML = products.map(product => {
        const hasDiscount = product.discount && product.discount > 0;
        const originalPrice = parseFloat(product.price);
        const discountedPrice = hasDiscount ? originalPrice * (1 - product.discount / 100) : originalPrice;
        
        return `
            <tr>
                <td>
                    <div class="product-image-cell">
                        ${product.image ? 
                            `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : 
                            `<i class="fas fa-image"></i>`
                        }
                    </div>
                </td>
                <td class="product-name">
                    ${product.bestseller ? '<span class="bestseller-badge">الأكثر مبيعاً</span>' : ''}
                    ${hasDiscount ? `<span class="discount-badge-small">${product.discount}% خصم</span>` : ''}
                    ${product.name}
                </td>
                <td class="product-price">
                    ${hasDiscount ? 
                        `<div class="price-container">
                            <span class="original-price-small">${originalPrice.toFixed(2)}</span>
                            <span class="discounted-price-small">${discountedPrice.toFixed(2)}</span>
                        </div>` :
                        `${originalPrice.toFixed(2)}`
                    }
                </td>
                <td>
                    <span class="product-category">${getCategoryName(product.category)}</span>
                </td>
                <td class="product-description" title="${product.description}">${product.description}</td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-btn" onclick="editProduct(${product.id})">
                            <i class="fas fa-edit"></i> تعديل
                        </button>
                        <button class="delete-btn" onclick="deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // إضافة أو تحديث عرض الكاردات للشاشات الصغيرة
    let cardsContainer = container.querySelector('.products-cards');
    if (!cardsContainer) {
        cardsContainer = document.createElement('div');
        cardsContainer.className = 'products-cards';
        container.appendChild(cardsContainer);
    }
    
    cardsContainer.innerHTML = products.map(product => `
        <div class="product-card-mobile">
            <div class="product-card-header">
                <div class="product-card-image">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : 
                        `<i class="fas fa-image"></i>`
                    }
                </div>
                <div class="product-card-info">
                    <div class="product-card-name">
                        ${product.bestseller ? '⭐ ' : ''}${product.name}
                    </div>
                    <div class="product-card-price">${product.price}</div>
                </div>
            </div>
            <div class="product-card-details">
                <div class="product-card-detail">
                    <strong>الفئة:</strong>
                    ${getCategoryName(product.category)}
                </div>
                <div class="product-card-detail">
                    <strong>الوصف:</strong>
                    ${product.description}
                </div>
                <div class="product-card-actions">
                    <button class="edit-btn" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                    <button class="delete-btn" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Updated edit product function
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    editingProductId = id;
    // تحميل الصور الحالية
    currentProductImages = product.images || [];
    
    document.getElementById('formTitle').textContent = 'تعديل المنتج';
    document.getElementById('productId').value = id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productDiscount').value = product.discount || 0;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productDescription').value = product.description;
    
    // تحميل الصورة في حقل URL
    const imageUrlInput = document.getElementById('productImageUrl');
    if (imageUrlInput && product.image) {
        imageUrlInput.value = product.image;
    }
    
    document.getElementById('productBestseller').checked = product.bestseller || false;
    
    // إضافة حالة التوفر
    if (document.getElementById('productAvailability')) {
        document.getElementById('productAvailability').value = product.availability || 'available';
    }
    
    // إضافة المقاسات
    if (product.sizes && Array.isArray(product.sizes)) {
        const sizeCheckboxes = document.querySelectorAll('.size-checkbox input[type="checkbox"]');
        sizeCheckboxes.forEach(checkbox => {
            checkbox.checked = product.sizes.includes(checkbox.value);
        });
    }
    
    // عرض معاينة الصورة إذا كانت موجودة
    if (product.image) {
        showImagePreview(product.image);
    }
    
    document.getElementById('productForm').style.display = 'block';
    document.getElementById('productName').focus();
}

// Updated hide product form function
function hideProductForm() {
    document.getElementById('productForm').style.display = 'none';
    document.getElementById('productFormElement').reset();
    currentProductImages = []; // إعادة تعيين مصفوفة الصور
    editingProductId = null;
    
    // إخفاء معاينة الصور
    const preview = document.getElementById('imagePreview');
    if (preview) {
        preview.style.display = 'none';
    }
    
    // إخفاء حقل الفئة الجديدة
    const newCategoryGroup = document.getElementById('newCategoryGroup');
    if (newCategoryGroup) {
        newCategoryGroup.style.display = 'none';
    }
}

// Delete product
function deleteProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    if (confirm(`هل أنت متأكد من حذف المنتج "${product.name}"؟`)) {
        products = products.filter(p => p.id !== id);
        saveProducts();
        displayProducts();
        updateStats();
        alert('تم حذف المنتج بنجاح!');
    }
}

// Update statistics
function updateStats() {
    const totalProducts = products.length;
    const totalShirts = products.filter(p => p.category === 'shirts').length;
    const totalPants = products.filter(p => p.category === 'pants').length;
    const totalAccessories = products.filter(p => p.category === 'accessories').length;
    
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalShirts').textContent = totalShirts;
    document.getElementById('totalPants').textContent = totalPants;
    document.getElementById('totalAccessories').textContent = totalAccessories;
}

// Export data
function exportData() {
    const data = {
        products: products,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `mk-products-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    alert('تم تصدير البيانات بنجاح!');
}

// Import data
function importData() {
    document.getElementById('importFile').click();
}

// Handle file import
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.products && Array.isArray(data.products)) {
                if (confirm('هل أنت متأكد من استيراد البيانات؟ سيتم استبدال البيانات الحالية.')) {
                    products = data.products;
                    saveProducts();
                    displayProducts();
                    updateStats();
                    alert('تم استيراد البيانات بنجاح!');
                }
            } else {
                alert('ملف البيانات غير صالح!');
            }
        } catch (error) {
            alert('خطأ في قراءة الملف!');
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// Reset data
function resetData() {
    if (confirm('هل أنت متأكد من إعادة تعيين جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
        if (confirm('تأكيد أخير: سيتم حذف جميع المنتجات نهائياً!')) {
            products = [];
            saveProducts();
            displayProducts();
            updateStats();
            alert('تم إعادة تعيين البيانات بنجاح!');
        }
    }
}

// Show add product form function
function showAddProductForm() {
    // Reset form for new product
    document.getElementById('productFormElement').reset();
    document.getElementById('formTitle').textContent = 'إضافة منتج جديد';
    document.getElementById('productId').value = '';
    
    // Reset editing state
    editingProductId = null;
    currentProductImages = [];
    
    // Hide image preview
    const preview = document.getElementById('imagePreview');
    if (preview) {
        preview.style.display = 'none';
    }
    
    // Hide new category group
    const newCategoryGroup = document.getElementById('newCategoryGroup');
    if (newCategoryGroup) {
        newCategoryGroup.style.display = 'none';
    }
    
    // تحديث قائمة الفئات للتأكد من ظهور جميع الفئات المحفوظة
    updateCategorySelect();
    
    // Show the form and focus on product name
    document.getElementById('productForm').style.display = 'block';
    document.getElementById('productName').focus();
}

// Handle image upload function
function handleImageUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    if (files.length > 5) {
        alert('يمكنك اختيار 5 صور كحد أقصى');
        event.target.value = '';
        return;
    }
    
    // مسح الصور السابقة
    currentProductImages = [];
    
    let processedFiles = 0;
    const totalFiles = files.length;
    
    Array.from(files).forEach((file, index) => {
        if (!file.type.startsWith('image/')) {
            alert(`الملف ${file.name} ليس صورة صحيحة`);
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) {
            alert(`حجم الصورة ${file.name} كبير جداً. يرجى اختيار صورة أصغر من 2 ميجابايت`);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            // حفظ الصورة كـ data URL مباشرة
            currentProductImages.push(e.target.result);
            
            processedFiles++;
            
            // عرض أول صورة كمعاينة
            if (index === 0) {
                const imagePreview = document.getElementById('imagePreview');
                const previewContainer = document.getElementById('imagePreviewContainer');
                const previewImg = document.getElementById('previewImg');
                
                if (imagePreview && previewContainer && previewImg) {
                    previewImg.src = e.target.result;
                    previewContainer.style.display = 'block';
                }
            }
            
            if (processedFiles === totalFiles) {
                console.log(`تم تحميل ${processedFiles} صورة بنجاح`);
            }
        };
        
        reader.readAsDataURL(file);
    });
}

// Initialize admin panel
function initAdmin() {
    checkAuth();
    
    // Close form when clicking outside
    document.addEventListener('click', function(event) {
        const productForm = document.getElementById('productForm');
        if (event.target === productForm) {
            hideProductForm();
        }
    });
    
    // Handle escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            hideProductForm();
        }
    });
}

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', initAdmin);

// Export functions for external use
window.adminManager = {
    products,
    loadProducts,
    saveProducts,
    displayProducts,
    updateStats
};

// وظيفة للحصول على اسم الفئة
function getCategoryName(category) {
    const categoryNames = {
        'shirts': 'قمصان',
        'pants': 'بناطيل',
        'accessories': 'إكسسوارات'
    };
    return categoryNames[category] || category;
}

// وظيفة لعرض معاينة الصورة
function showImagePreview(imageSrc) {
    const preview = document.getElementById('imagePreview');
    if (preview) {
        preview.innerHTML = `<img src="${imageSrc}" alt="معاينة الصورة" style="max-width: 200px; max-height: 200px;">`;
        preview.style.display = 'block';
    }
}

// متغير لتخزين الصور الحالية
let currentProductImages = [];

// وظيفة التعامل مع تغيير الفئة
function handleCategoryChange() {
    const categorySelect = document.getElementById('productCategory');
    const newCategoryGroup = document.getElementById('newCategoryGroup');
    const newCategoryInput = document.getElementById('newCategoryName');
    
    if (categorySelect && newCategoryGroup && newCategoryInput) {
        if (categorySelect.value === 'new-category') {
            newCategoryGroup.style.display = 'block';
            newCategoryInput.required = true;
            // التأكد من أن الحقل مرئي قبل التركيز عليه
            setTimeout(() => {
                newCategoryInput.focus();
            }, 100);
        } else {
            newCategoryGroup.style.display = 'none';
            newCategoryInput.required = false;
            newCategoryInput.value = '';
        }
    }
}

// وظيفة الحصول على المقاسات المحددة
function getSelectedSizes() {
    const sizeCheckboxes = document.querySelectorAll('.size-checkbox input[type="checkbox"]:checked');
    return Array.from(sizeCheckboxes).map(checkbox => checkbox.value);
}

// تحديث وظيفة حفظ المنتج الموجودة
function saveProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById('productName').value.trim();
    const price = document.getElementById('productPrice').value.trim();
    const discount = parseInt(document.getElementById('productDiscount').value) || 0;
    let category = document.getElementById('productCategory').value;
    const description = document.getElementById('productDescription').value.trim();
    const bestseller = document.getElementById('productBestseller').checked;
    const availability = document.getElementById('productAvailability') ? document.getElementById('productAvailability').value : 'available';
    const sizes = getSelectedSizes();
    
    // التعامل مع الفئة الجديدة
    if (category === 'new-category') {
        const newCategoryName = document.getElementById('newCategoryName').value.trim();
        if (!newCategoryName) {
            alert('يرجى إدخال اسم الفئة الجديدة');
            document.getElementById('newCategoryName').focus();
            return;
        }
        
        // إضافة الفئة الجديدة إلى القائمة
        const categorySelect = document.getElementById('productCategory');
        const newOption = document.createElement('option');
        newOption.value = newCategoryName.toLowerCase().replace(/\s+/g, '-');
        newOption.textContent = newCategoryName;
        
        // إدراج الخيار الجديد قبل "إضافة فئة جديدة"
        const newCategoryOption = categorySelect.querySelector('option[value="new-category"]');
        categorySelect.insertBefore(newOption, newCategoryOption);
        
        category = newOption.value;
        categorySelect.value = category;
        
        // إخفاء حقل الفئة الجديدة وإزالة خاصية required
        const newCategoryGroup = document.getElementById('newCategoryGroup');
        const newCategoryInput = document.getElementById('newCategoryName');
        if (newCategoryGroup && newCategoryInput) {
            newCategoryGroup.style.display = 'none';
            newCategoryInput.required = false;
        }
    }
    
    if (!name || !price || !category || !description) {
        alert('يرجى ملء جميع الحقول المطلوبة!');
        return;
    }
    
    // استخدام الصور من currentProductImages مباشرة
    const images = currentProductImages.length > 0 ? [...currentProductImages] : 
                  (editingProductId ? (products.find(p => p.id === editingProductId)?.images || []) : []);
    
    saveProductWithImages(name, price, category, description, images, bestseller, discount, availability, sizes);
}

// دالة محدثة لحفظ المنتج مع الصور
function saveProductWithImages(name, price, category, description, images, bestseller, discount, availability, sizes) {
    const selectedSizes = sizes || getSelectedSizes();
    const productAvailability = availability || 'available';
    
    const originalPrice = parseFloat(price);
    const discountedPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;
    
    const product = {
        id: editingProductId || Date.now(),
        name,
        price: originalPrice,
        originalPrice: originalPrice,
        discount: discount || 0,
        discountedPrice: discountedPrice.toFixed(2),
        category,
        description,
        bestseller,
        availability: productAvailability,
        sizes: selectedSizes,
        image: images.length > 0 ? images[0] : '', // أول صورة كصورة رئيسية
        images: images // جميع الصور
    };
    
    if (editingProductId) {
        const index = products.findIndex(p => p.id === editingProductId);
        if (index !== -1) {
            product.id = editingProductId;
            products[index] = product;
        }
        editingProductId = null;
    } else {
        product.id = Date.now();
        products.push(product);
    }
    
    saveProducts();
    displayProducts();
    hideProductForm();
    updateStats();
    
    // مسح الصور المؤقتة
    currentProductImages = [];
    
    alert('تم حفظ المنتج بنجاح!');
}



// وظيفة التعامل مع تغيير الفئة
function handleCategoryChange() {
    const categorySelect = document.getElementById('productCategory');
    const newCategoryGroup = document.getElementById('newCategoryGroup');
    
    if (categorySelect && newCategoryGroup) {
        if (categorySelect.value === 'new-category') {
            newCategoryGroup.style.display = 'block';
            document.getElementById('newCategoryName').required = true;
        } else {
            newCategoryGroup.style.display = 'none';
            document.getElementById('newCategoryName').required = false;
            document.getElementById('newCategoryName').value = '';
        }
    }
}

// وظيفة الحصول على المقاسات المحددة
function getSelectedSizes() {
    const sizeCheckboxes = document.querySelectorAll('.size-checkbox input[type="checkbox"]:checked');
    return Array.from(sizeCheckboxes).map(checkbox => checkbox.value);
}

// تحديث وظيفة حفظ المنتج الموجودة
function saveProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById('productName').value.trim();
    const price = document.getElementById('productPrice').value.trim();
    const discount = parseInt(document.getElementById('productDiscount').value) || 0;
    let category = document.getElementById('productCategory').value;
    const description = document.getElementById('productDescription').value.trim();
    const bestseller = document.getElementById('productBestseller').checked;
    const availability = document.getElementById('productAvailability') ? document.getElementById('productAvailability').value : 'available';
    const sizes = getSelectedSizes();
    
    // التعامل مع الفئة الجديدة
    if (category === 'new-category') {
        const newCategoryName = document.getElementById('newCategoryName').value.trim();
        if (!newCategoryName) {
            alert('يرجى إدخال اسم الفئة الجديدة');
            return;
        }
        
        // إنشاء قيمة فريدة للفئة الجديدة
        const newCategoryValue = `custom-${Date.now()}`; // إنشاء قيمة فريدة بدلاً من النص العربي
        
        // التحقق من عدم وجود الفئة مسبقاً
        const existingCategory = customCategories.find(cat => cat.value === newCategoryValue);
        if (!existingCategory) {
            // إضافة الفئة الجديدة إلى المصفوفة
            customCategories.push({
                value: newCategoryValue,
                text: newCategoryName
            });
            
            // حفظ الفئات المخصصة
            saveCustomCategories();
            
            // تحديث قائمة الفئات في السليكت
            updateCategorySelect();
            
            // تحديث الفئات في الصفحة الرئيسية
            updateMainPageCategories();
        }
        
        category = newCategoryValue;
        
        // تحديد الفئة الجديدة في السليكت
        const categorySelect = document.getElementById('productCategory');
        categorySelect.value = category;
        
        // إخفاء حقل الفئة الجديدة
        const newCategoryGroup = document.getElementById('newCategoryGroup');
        const newCategoryInput = document.getElementById('newCategoryName');
        if (newCategoryGroup && newCategoryInput) {
            newCategoryGroup.style.display = 'none';
            newCategoryInput.required = false;
            newCategoryInput.value = '';
        }
    }
    
    // التحقق من المقاسات
    if (sizes.length === 0) {
        const confirmNoSizes = confirm('لم تحدد أي مقاسات. هل تريد المتابعة؟');
        if (!confirmNoSizes) {
            return;
        }
    }
    
    // إنشاء كائن المنتج مع البيانات الجديدة
    const productData = {
        name,
        price,
        category,
        availability,
        sizes,
        description,
        bestseller,
        discount: discount || 0
    };
    
    // استدعاء الوظيفة الأصلية مع البيانات المحدثة
    if (editingProductId) {
        // تحديث منتج موجود
        const productIndex = products.findIndex(p => p.id === editingProductId);
        if (productIndex !== -1) {
            const originalPrice = parseFloat(price);
            const discountedPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;
            
            products[productIndex] = {
                ...products[productIndex],
                ...productData,
                id: editingProductId,
                originalPrice: originalPrice,
                discountedPrice: discountedPrice.toFixed(2),
                images: currentProductImages.length > 0 ? currentProductImages : (products[productIndex].images || []),
                image: currentProductImages.length > 0 ? currentProductImages[0] : (products[productIndex].image || '')
            };
        }
        editingProductId = null;
    } else {
        // إضافة منتج جديد
        const originalPrice = parseFloat(price);
        const discountedPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;
        
        const newProduct = {
            id: Date.now(),
            ...productData,
            images: currentProductImages || [],
            image: currentProductImages.length > 0 ? currentProductImages[0] : '',
            originalPrice: originalPrice,
            discountedPrice: discountedPrice.toFixed(2)
        };
        products.push(newProduct);
    }
    
    saveProducts();
    displayProducts();
    updateStats();
    hideProductForm();
    
    // تحديث الفئات في الصفحة الرئيسية
    updateMainPageCategories();
    
    // مسح الصور المؤقتة بعد الحفظ
    currentProductImages = [];
    
    // رسالة نجاح
    showSuccessMessage(editingProductId ? 'تم تحديث المنتج بنجاح!' : 'تم إضافة المنتج بنجاح!');
}

// وظيفة عرض رسالة النجاح
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 6px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        font-family: 'Cairo', sans-serif;
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// متغيرات الفلترة
let filteredProducts = [];
let currentFilters = {
    name: '',
    category: '',
    minPrice: null,
    maxPrice: null,
    color: ''
};

// وظيفة فلترة المنتجات
function filterProducts() {
    // الحصول على قيم الفلاتر
    currentFilters.name = document.getElementById('searchName')?.value.toLowerCase().trim() || '';
    currentFilters.category = document.getElementById('searchCategory')?.value || '';
    currentFilters.minPrice = parseFloat(document.getElementById('minPrice')?.value) || null;
    currentFilters.maxPrice = parseFloat(document.getElementById('maxPrice')?.value) || null;
    currentFilters.color = document.getElementById('searchColor')?.value.toLowerCase().trim() || '';
    
    // تطبيق الفلاتر
    filteredProducts = products.filter(product => {
        // فلتر الاسم
        if (currentFilters.name && !product.name.toLowerCase().includes(currentFilters.name)) {
            return false;
        }
        
        // فلتر الفئة
        if (currentFilters.category && product.category !== currentFilters.category) {
            return false;
        }
        
        // فلتر السعر
        const productPrice = parseFloat(product.price) || 0;
        if (currentFilters.minPrice !== null && productPrice < currentFilters.minPrice) {
            return false;
        }
        if (currentFilters.maxPrice !== null && productPrice > currentFilters.maxPrice) {
            return false;
        }
        
        // فلتر اللون (البحث في الوصف أو خصائص المنتج)
        if (currentFilters.color) {
            const searchText = (product.description + ' ' + product.name).toLowerCase();
            if (!searchText.includes(currentFilters.color)) {
                return false;
            }
        }
        
        return true;
    });
    
    // عرض النتائج المفلترة
    displayFilteredProducts();
    showFilterResults();
}

// وظيفة عرض المنتجات المفلترة
function displayFilteredProducts() {
    const tableBody = document.getElementById('productsTableBody');
    const mobileContainer = document.getElementById('mobileProductsContainer');
    
    if (!tableBody) return;
    
    if (filteredProducts.length === 0 && hasActiveFilters()) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="no-products">
                    <div class="no-products-message">
                        <i class="fas fa-search"></i>
                        <h3>لا توجد منتجات تطابق معايير البحث</h3>
                        <p>جرب تعديل الفلاتر أو مسحها للعثور على منتجات</p>
                    </div>
                </td>
            </tr>
        `;
        
        if (mobileContainer) {
            mobileContainer.innerHTML = `
                <div class="no-products-message">
                    <i class="fas fa-search"></i>
                    <h3>لا توجد منتجات تطابق معايير البحث</h3>
                    <p>جرب تعديل الفلاتر أو مسحها للعثور على منتجات</p>
                </div>
            `;
        }
        return;
    }
    
    // عرض المنتجات المفلترة
    const productsToShow = hasActiveFilters() ? filteredProducts : products;
    
    // Desktop table
    tableBody.innerHTML = productsToShow.map(product => {
        const imageUrl = Array.isArray(product.images) && product.images.length > 0 
            ? product.images[0] 
            : (product.image || 'images/placeholder.jpg');
        
        return `
            <tr>
                <td>
                    <img src="${imageUrl}" alt="${product.name}" class="product-image" 
                         onerror="this.src='images/placeholder.jpg'">
                </td>
                <td>${product.name}</td>
                <td>${product.price} ريال</td>
                <td>${getCategoryName(product.category)}</td>
                <td class="description-cell">${product.description}</td>
                <td class="actions-cell">
                    <button class="edit-btn" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Mobile cards
    if (mobileContainer) {
        mobileContainer.innerHTML = productsToShow.map(product => {
            const imageUrl = Array.isArray(product.images) && product.images.length > 0 
                ? product.images[0] 
                : (product.image || 'images/placeholder.jpg');
            
            return `
                <div class="mobile-product-card">
                    <img src="${imageUrl}" alt="${product.name}" class="mobile-product-image" 
                         onerror="this.src='images/placeholder.jpg'">
                    <div class="mobile-product-info">
                        <h4>${product.name}</h4>
                        <p class="mobile-product-price">${product.price} ريال</p>
                        <p class="mobile-product-category">${getCategoryName(product.category)}</p>
                        <p class="mobile-product-description">${product.description}</p>
                        <div class="mobile-product-actions">
                            <button class="edit-btn" onclick="editProduct(${product.id})">
                                <i class="fas fa-edit"></i> تعديل
                            </button>
                            <button class="delete-btn" onclick="deleteProduct(${product.id})">
                                <i class="fas fa-trash"></i> حذف
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// وظيفة عرض معلومات نتائج الفلترة
function showFilterResults() {
    const existingInfo = document.querySelector('.filter-results-info');
    if (existingInfo) {
        existingInfo.remove();
    }
    
    if (!hasActiveFilters()) return;
    
    const tableContainer = document.querySelector('.products-table-container');
    if (!tableContainer) return;
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'filter-results-info';
    
    if (filteredProducts.length === 0) {
        infoDiv.className += ' no-results';
        infoDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            لا توجد منتجات تطابق معايير البحث المحددة
        `;
    } else {
        infoDiv.innerHTML = `
            <i class="fas fa-info-circle"></i>
            تم العثور على ${filteredProducts.length} منتج من أصل ${products.length} منتج
        `;
    }
    
    tableContainer.insertBefore(infoDiv, tableContainer.firstChild);
}

// وظيفة للتحقق من وجود فلاتر نشطة
function hasActiveFilters() {
    return currentFilters.name || 
           currentFilters.category || 
           currentFilters.minPrice !== null || 
           currentFilters.maxPrice !== null || 
           currentFilters.color;
}

// وظيفة مسح جميع الفلاتر
function clearFilters() {
    const searchName = document.getElementById('searchName');
    const searchCategory = document.getElementById('searchCategory');
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    const searchColor = document.getElementById('searchColor');
    
    if (searchName) searchName.value = '';
    if (searchCategory) searchCategory.value = '';
    if (minPrice) minPrice.value = '';
    if (maxPrice) maxPrice.value = '';
    if (searchColor) searchColor.value = '';
    
    currentFilters = {
        name: '',
        category: '',
        minPrice: null,
        maxPrice: null,
        color: ''
    };
    
    filteredProducts = [];
    displayProducts();
    
    // إزالة معلومات النتائج
    const infoDiv = document.querySelector('.filter-results-info');
    if (infoDiv) {
        infoDiv.remove();
    }
}
