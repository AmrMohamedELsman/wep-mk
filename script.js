


// Initialize empty products array
let products = [];
// إضافة متغير للفئات المخصصة
let customCategories = [];

// Load products from localStorage if available
function loadProducts() {
    const savedProducts = localStorage.getItem('mkProducts');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    } else {
        products = []; // Start with empty array if no saved data
    }
    
    // تحميل الفئات المخصصة
    const savedCategories = localStorage.getItem('mkCustomCategories');
    if (savedCategories) {
        customCategories = JSON.parse(savedCategories);
    }
}

// Save products to localStorage
function saveProducts() {
    localStorage.setItem('mkProducts', JSON.stringify(products));
}

// Get unique categories from products with Arabic names
function getUniqueCategories() {
    const categoryMap = {
        'shirts': 'قمصان',
        'pants': 'بناطيل', 
        'accessories': 'إكسسوارات'
    };
    
    // دمج الفئات المخصصة مع الفئات الافتراضية
    const customCategoryMap = {};
    customCategories.forEach(category => {
        customCategoryMap[category.value] = category.text;
    });
    
    const allCategoryMap = { ...categoryMap, ...customCategoryMap };
    
    const uniqueCategories = [...new Set(products.map(product => product.category))];
    
    return uniqueCategories.map(category => ({
        value: category,
        name: allCategoryMap[category] || category // استخدام الاسم العربي إذا كان متوفراً، وإلا استخدام القيمة الأصلية
    }));
}

// Create dynamic category filters
function createCategoryFilters() {
    const filterContainer = document.getElementById('productsFilter');
    if (!filterContainer) return;
    
    const categories = getUniqueCategories();
    
    // إنشاء زر "الكل" دائماً
    let filtersHTML = '<button class="filter-btn active" data-filter="all">الكل</button>';
    
    // إضافة أزرار الفئات الموجودة
    categories.forEach(category => {
        filtersHTML += `<button class="filter-btn" data-filter="${category.value}">${category.name}</button>`;
    });
    
    filterContainer.innerHTML = filtersHTML;
    
    // إضافة event listeners للأزرار الجديدة
    initCategoryFilters();
}

// Display products
function displayProducts(productsToShow = products) {
    const grid = document.getElementById('products-grid');
    
    // التحقق من وجود العنصر قبل محاولة تعديله
    if (!grid) {
        console.error('Element with ID "products-grid" not found');
        return;
    }
    
    if (productsToShow.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1 / -1;">لا توجد منتجات متاحة</p>';
        return;
    }
    
    grid.innerHTML = productsToShow.map(product => {
        // تحديد الصورة المناسبة
        let productImage = '';
        if (product.images && product.images.length > 0 && product.images[0]) {
            productImage = product.images[0];
        } else if (product.image) {
            productImage = product.image;
        }
        
        // حساب السعر والخصم - إصلاح المشكلة
        const discount = parseFloat(product.discount) || 0;
        const hasDiscount = discount > 0;
        const originalPrice = parseFloat(product.price);
        const discountedPrice = hasDiscount ? originalPrice * (1 - discount / 100) : originalPrice;
        
        // التحقق من وجود الوصف قبل استخدام substring
        const description = product.description || 'لا يوجد وصف متاح';
        
        return `
            <div class="product-card" onclick="viewProductDetails(${product.id})">
                ${product.bestseller ? '<div class="bestseller-badge">الأكثر مبيعاً ⭐</div>' : ''}
                ${hasDiscount ? `<div class="discount-badge">${discount}% خصم</div>` : ''}
                <div class="product-image">
                    ${productImage ? 
                        `<img src="${productImage}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><i class="fas fa-image" style="display:none;"></i>` : 
                        `<i class="fas fa-image"></i>`
                    }
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-pricing">
                        ${hasDiscount ? 
                            `<span class="original-price">${originalPrice.toFixed(2)} EGP</span>
                             <span class="discounted-price">${discountedPrice.toFixed(2)} EGP</span>` :
                            `<span class="product-price">${originalPrice.toFixed(2)} EGP</span>`
                        }
                    </div>
                    <p class="product-description">${description.substring(0, 100)}...</p>
                </div>
            </div>
        `;
    }).join('');
}

// View product details function
function viewProductDetails(productId) {
    console.log('Product ID clicked:', productId);
    console.log('All products:', products);
    
    // التحقق من وجود المنتج - مقارنة كـ string
    const product = products.find(p => p.id.toString() === productId.toString());
    if (!product) {
        console.error('Product not found with ID:', productId);
        alert('المنتج غير موجود!');
        return;
    }
    
    console.log('Found product:', product);
    window.location.href = `product-details.html?id=${productId}`;
}

// Filter products
// متغيرات الفلاتر
let currentFilters = {
    category: 'all',
    search: '',
    minPrice: null,
    maxPrice: null,
    discountOnly: false,
    bestsellerOnly: false
};

// دالة الفلترة المحدثة
function filterProducts(filterType = null, filterValue = null) {
    // تحديث الفلتر المحدد
    if (filterType && filterValue !== null) {
        currentFilters[filterType] = filterValue;
    }
    
    let filteredProducts = [...products];
    
    // فلتر الفئة
    if (currentFilters.category !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
            product.category === currentFilters.category
        );
    }
    
    // فلتر البحث بالاسم
    if (currentFilters.search) {
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
            product.description.toLowerCase().includes(currentFilters.search.toLowerCase())
        );
    }
    
    // فلتر السعر
    if (currentFilters.minPrice !== null) {
        filteredProducts = filteredProducts.filter(product => {
            const price = parseFloat(product.price);
            return price >= currentFilters.minPrice;
        });
    }
    
    if (currentFilters.maxPrice !== null) {
        filteredProducts = filteredProducts.filter(product => {
            const price = parseFloat(product.price);
            return price <= currentFilters.maxPrice;
        });
    }
    
    // فلتر المنتجات المخفضة
    if (currentFilters.discountOnly) {
        filteredProducts = filteredProducts.filter(product => {
            const discount = parseFloat(product.discount) || 0;
            return discount > 0;
        });
    }
    
    // فلتر الأكثر مبيعاً
    if (currentFilters.bestsellerOnly) {
        filteredProducts = filteredProducts.filter(product => product.bestseller);
    }
    
    displayProducts(filteredProducts);
}

// دالة مسح جميع الفلاتر - مع التحقق من وجود العناصر
function clearAllFilters() {
    currentFilters = {
        category: 'all',
        search: '',
        minPrice: null,
        maxPrice: null,
        discountOnly: false,
        bestsellerOnly: false
    };
    
    // مسح قيم الحقول مع التحقق من وجودها
    const searchInput = document.getElementById('searchInput');
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    const discountFilter = document.getElementById('discountFilter');
    const bestsellerFilter = document.getElementById('bestsellerFilter');
    
    if (searchInput) searchInput.value = '';
    if (minPrice) minPrice.value = '';
    if (maxPrice) maxPrice.value = '';
    if (discountFilter) discountFilter.checked = false;
    if (bestsellerFilter) bestsellerFilter.checked = false;
    
    // إعادة تعيين فلتر الفئات
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const allFilterBtn = document.querySelector('.filter-btn[data-filter="all"]');
    if (allFilterBtn) {
        allFilterBtn.classList.add('active');
    }
    
    // عرض جميع المنتجات
    displayProducts(products);
}

// تحديث دالة تهيئة الفلاتر
function initializeFilters() {
    // فلتر البحث
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterProducts('search', e.target.value);
        });
    }
    
    // فلاتر السعر
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    
    if (minPriceInput) {
        minPriceInput.addEventListener('input', (e) => {
            const value = e.target.value ? parseFloat(e.target.value) : null;
            filterProducts('minPrice', value);
        });
    }
    
    if (maxPriceInput) {
        maxPriceInput.addEventListener('input', (e) => {
            const value = e.target.value ? parseFloat(e.target.value) : null;
            filterProducts('maxPrice', value);
        });
    }
    
    // فلتر المنتجات المخفضة
    const discountFilter = document.getElementById('discountFilter');
    if (discountFilter) {
        discountFilter.addEventListener('change', (e) => {
            filterProducts('discountOnly', e.target.checked);
        });
    }
    
    // فلتر الأكثر مبيعاً
    const bestsellerFilter = document.getElementById('bestsellerFilter');
    if (bestsellerFilter) {
        bestsellerFilter.addEventListener('change', (e) => {
            filterProducts('bestsellerOnly', e.target.checked);
        });
    }
    
    // زر مسح الفلاتر
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
}

// تحديث دالة تهيئة فلاتر الفئات
// حذف هذه الدالة المكررة (السطور 439-450)
// function initCategoryFilters() {
//     document.querySelectorAll('.filter-btn').forEach(btn => {
//         btn.addEventListener('click', () => {
//             // Remove active class from all buttons
//             document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
//             // Add active class to clicked button
//             btn.classList.add('active');
//             // Filter products
//             filterProducts(btn.dataset.filter); // هذا السطر خاطئ
//         });
//     });
// }

// Mobile menu toggle function
function toggleMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
}

// Smooth scrolling function
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Function to update existing products with missing discount property
function updateExistingProducts() {
    let updated = false;
    products.forEach(product => {
        if (product.discount === undefined || product.discount === null) {
            product.discount = 0;
            updated = true;
        }
    });
    
    if (updated) {
        saveProducts();
        console.log('Updated existing products with default discount values');
    }
}

// Back to Top Button Functionality
function initBackToTopButton() {
    const backToTopBtn = document.getElementById('backToTopBtn');
    
    if (!backToTopBtn) return;
    
    // Show/Hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
            
            // Add pulse effect when first shown
            if (!backToTopBtn.classList.contains('pulse')) {
                backToTopBtn.classList.add('pulse');
                setTimeout(() => {
                    backToTopBtn.classList.remove('pulse');
                }, 4000);
            }
        } else {
            backToTopBtn.classList.remove('show');
            backToTopBtn.classList.remove('pulse');
        }
    });
}

// Smooth scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// تحديث دالة التهيئة الرئيسية
function init() {
    console.log('Initializing website...');
    loadProducts(); // هذا سيحمل المنتجات والفئات المخصصة
    updateExistingProducts();
    console.log('Products loaded:', products);
    console.log('Custom categories loaded:', customCategories);
    createCategoryFilters();
    displayProducts();
    initializeFilters();
    initSmoothScrolling();
    initBackToTopButton();
    
    // Setup mobile menu
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    // Close mobile menu when clicking on nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const hamburger = document.querySelector('.hamburger');
            const navMenu = document.querySelector('.nav-menu');
            if (hamburger && navMenu) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });
}

// Remove the standalone toggleMobileMenu() call
// toggleMobileMenu(); // Remove this line
    // Filter buttons event listeners
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Filter products
            filterProducts(btn.dataset.filter);
        });
    });
// Initialize category filters
function initCategoryFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Filter products - إصلاح الاستدعاء
            filterProducts('category', btn.dataset.filter);
        });
    });
}

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Export functions for admin panel
// دالة لتحديث الفئات عند إضافة أو حذف منتجات
function updateCategoryFilters() {
    // إعادة تحميل الفئات المخصصة من localStorage
    const savedCategories = localStorage.getItem('mkCustomCategories');
    if (savedCategories) {
        customCategories = JSON.parse(savedCategories);
    }
    
    createCategoryFilters();
    // إعادة تعيين الفلتر إلى "الكل"
    const allButton = document.querySelector('.filter-btn[data-filter="all"]');
    if (allButton) {
        allButton.classList.add('active');
    }
    displayProducts();
}

// تحديث window.productManager لتشمل الدالة الجديدة
window.productManager = {
    products,
    loadProducts,
    saveProducts,
    displayProducts,
    updateCategoryFilters,
    customCategories // إضافة الفئات المخصصة للتصدير
};

// Dark Mode Functionality
class DarkModeManager {
    constructor() {
        this.darkModeToggle = document.getElementById('darkModeToggle');
        this.body = document.body;
        this.init();
    }

    init() {
        // Load saved theme preference or default to light mode
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);

        // Add event listener to toggle button
        if (this.darkModeToggle) {
            this.darkModeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateToggleIcon(theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    updateToggleIcon(theme) {
        if (this.darkModeToggle) {
            const icon = this.darkModeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }
}

// Initialize Dark Mode when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DarkModeManager();
});

// إضافة هذا الكود في نهاية ملف script.js

// مستمع للأحداث من التبويبات الأخرى
if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel('mk-categories-update');
    channel.addEventListener('message', (event) => {
        if (event.data.type === 'categories-updated') {
            // إعادة تحميل المنتجات والفئات
            loadProducts();
            updateCategoryFilters();
        }
    });
}

// إضافة مستمع لأحداث تغيير localStorage
window.addEventListener('storage', (event) => {
    if (event.key === 'mkProducts' || event.key === 'mkCustomCategories') {
        // إعادة تحميل البيانات عند تغييرها في تبويب آخر
        loadProducts();
        updateCategoryFilters();
    }
});