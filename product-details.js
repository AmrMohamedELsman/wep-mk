// Product Details JavaScript
let currentProduct = null;
let currentImageIndex = 0;

// Get product ID from URL parameters
function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id'));
}

// Load product details
function loadProductDetails() {
    const productId = getProductIdFromUrl();
    
    // Load products from localStorage
    const savedProducts = localStorage.getItem('mkProducts');
    let products = [];
    
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    } else {
        products = []; // Start with empty array if no saved data
    }
    
    currentProduct = products.find(product => product.id === productId);
    
    if (currentProduct) {
        displayProductDetails();
        loadRelatedProducts(products);
    } else {
        // Show message if product not found
        document.body.innerHTML = `
            <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
                <h2>المنتج غير موجود</h2>
                <p>لم يتم العثور على هذا المنتج أو تم حذفه</p>
                <a href="index.html" style="color: #007bff; text-decoration: none; padding: 10px 20px; border: 1px solid #007bff; border-radius: 5px;">العودة للصفحة الرئيسية</a>
            </div>
        `;
    }
}

// Display product details
// تحديث وظيفة عرض تفاصيل المنتج
function displayProductDetails() {
    if (!currentProduct) return;
    
    // تحديث عنوان الصفحة
    document.title = `${currentProduct.name} - MK Local Brand`;
    
    // تحديث معلومات المنتج
    document.getElementById('productName').textContent = currentProduct.name;
    document.getElementById('productPrice').textContent = `${currentProduct.price} EGP`;
    document.getElementById('productDescription').textContent = currentProduct.description;
    document.getElementById('productCategory').textContent = getCategoryName(currentProduct.category);
    document.getElementById('productId').textContent = `#${currentProduct.id.toString().padStart(3, '0')}`;
    
    // عرض حالة التوفر
    const availabilityElement = document.getElementById('productAvailability');
    if (availabilityElement) {
        const availabilityText = {
            'available': 'متاح ✅',
            'unavailable': 'غير متاح ❌',
            'out-of-stock': 'نفد من المخزون ⚠️'
        };
        const availability = currentProduct.availability || 'available';
        availabilityElement.textContent = availabilityText[availability];
        availabilityElement.className = `detail-value availability-${availability}`;
    }
    
    // عرض المقاسات
    const sizesContainer = document.getElementById('productSizesContainer');
    const sizesElement = document.getElementById('productSizes');
    if (currentProduct.sizes && currentProduct.sizes.length > 0) {
        sizesContainer.style.display = 'block';
        sizesElement.innerHTML = currentProduct.sizes.map(size => 
            `<span class="size-badge">${size}</span>`
        ).join('');
    } else {
        sizesContainer.style.display = 'none';
    }
    
    // عرض شارة الأكثر مبيعاً
    if (currentProduct.bestseller) {
        document.getElementById('bestsellerBadge').style.display = 'block';
    }
    
    // إعداد معرض الصور
    setupImageGallery();
}

// Setup image gallery
function setupImageGallery() {
    const mainImage = document.getElementById('mainProductImage');
    const thumbnailGallery = document.getElementById('thumbnailGallery');
    const imageZoom = document.getElementById('imageZoom');
    
    // Prepare images array
    let images = [];
    if (currentProduct.images && currentProduct.images.length > 0) {
        // التحقق من أن كل عنصر في المصفوفة هو نص قبل استدعاء trim
        images = currentProduct.images.filter(img => {
            return img && typeof img === 'string' && img.trim() !== '';
        });
    }
    
    // If no images in the images array, use the main image
    if (images.length === 0 && currentProduct.image && typeof currentProduct.image === 'string' && currentProduct.image.trim() !== '') {
        images = [currentProduct.image];
    }
    
    // If still no images, use placeholder
    if (images.length === 0) {
        if (mainImage) {
            mainImage.src = '';
            mainImage.alt = 'لا توجد صورة متاحة';
            mainImage.style.display = 'none';
            
            // Show placeholder
            const placeholder = document.createElement('div');
            placeholder.className = 'image-placeholder';
            placeholder.innerHTML = '<i class="fas fa-image"></i><p>لا توجد صورة متاحة</p>';
            mainImage.parentNode.appendChild(placeholder);
        }
        
        if (thumbnailGallery) {
            thumbnailGallery.innerHTML = '';
        }
        return;
    }
    
    // Set main image
    if (mainImage) {
        mainImage.src = images[0];
        mainImage.alt = currentProduct.name;
        mainImage.style.display = 'block';
        
        // Setup zoom functionality
        if (imageZoom) {
            setupImageZoom(mainImage, imageZoom);
        }
    }
    
    // Create thumbnails if multiple images
    if (thumbnailGallery) {
        if (images.length > 1) {
            thumbnailGallery.innerHTML = images.map((image, index) => `
                <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMainImage(${index})">
                    <img src="${image}" alt="${currentProduct.name} - صورة ${index + 1}">
                </div>
            `).join('');
        } else {
            thumbnailGallery.innerHTML = '';
        }
    }
    
    // Store images for later use
    currentProduct.displayImages = images;
}

// Setup image zoom functionality
function setupImageZoom(mainImage, imageZoom) {
    mainImage.addEventListener('mousemove', function(e) {
        const rect = mainImage.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        imageZoom.style.backgroundImage = `url(${mainImage.src})`;
        imageZoom.style.backgroundPosition = `${x}% ${y}%`;
    });
    
    mainImage.addEventListener('mouseleave', function() {
        imageZoom.style.opacity = '0';
    });
}

// Change main image
function changeMainImage(index) {
    if (!currentProduct.displayImages || index >= currentProduct.displayImages.length) return;
    
    const mainImage = document.getElementById('mainProductImage');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    // Update main image
    mainImage.src = currentProduct.displayImages[index];
    
    // Update active thumbnail
    thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
    
    currentImageIndex = index;
}

// Get category name in Arabic
function getCategoryName(category) {
    const categories = {
        'shirts': 'قمصان',
        'pants': 'بناطيل',
        'accessories': 'إكسسوارات',
        'shoes': 'أحذية',
        'jackets': 'جاكيتات'
    };
    return categories[category] || category;
}

// Load related products
function loadRelatedProducts(allProducts) {
    const relatedProducts = allProducts
        .filter(product => 
            product.id !== currentProduct.id && 
            product.category === currentProduct.category
        )
        .slice(0, 4);
    
    const relatedGrid = document.getElementById('relatedProductsGrid');
    
    if (relatedProducts.length === 0) {
        relatedGrid.innerHTML = '<p style="text-align: center; color: #666;">لا توجد منتجات مشابهة</p>';
        return;
    }
    
    relatedGrid.innerHTML = relatedProducts.map(product => {
        // تحديد الصورة المناسبة
        let productImage = '';
        if (product.images && product.images.length > 0 && product.images[0]) {
            productImage = product.images[0];
        } else if (product.image) {
            productImage = product.image;
        }
        
        return `
            <div class="product-card" onclick="viewProduct(${product.id})">
                ${product.bestseller ? '<div class="bestseller-badge">الأكثر مبيعاً ⭐</div>' : ''}
                <div class="product-image">
                    ${productImage ? 
                        `<img src="${productImage}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><i class="fas fa-image" style="display:none;"></i>` : 
                        `<i class="fas fa-image"></i>`
                    }
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">${product.price} EGP</p>
                    <p class="product-description">${product.description ? product.description.substring(0, 80) + '...' : 'لا يوجد وصف متاح'}</p>
                </div>
            </div>
        `;
    }).join('');
}

// View product (navigate to product details)
function viewProduct(productId) {
    window.location.href = `product-details.html?id=${productId}`;
}

// Contact via WhatsApp
function contactWhatsApp() {
    const phoneNumber = '201040180521'; // ضع رقم هاتفك هنا
    const message = `مرحباً، أريد الاستفسار عن المنتج: ${currentProduct.name} (${currentProduct.price})`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Share product
function shareProduct() {
    const shareData = {
        title: `${currentProduct.name} - MK Local Brand`,
        text: `تحقق من هذا المنتج الرائع: ${currentProduct.name} بسعر ${currentProduct.price}`,
        url: window.location.href
    };
    
    if (navigator.share) {
        navigator.share(shareData);
    } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('تم نسخ رابط المنتج!');
        }).catch(() => {
            alert('لا يمكن نسخ الرابط');
        });
    }
}

// Mobile menu toggle (reuse from main script)
function toggleMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
}

// Initialize page
function initProductDetails() {
    loadProductDetails();
    
    // Setup mobile menu
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    // Close mobile menu when clicking on links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const hamburger = document.querySelector('.hamburger');
            const navMenu = document.querySelector('.nav-menu');
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initProductDetails);