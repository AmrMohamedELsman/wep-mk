// وظيفة التعامل مع تغيير الفئة
function handleCategoryChange() {
    const categorySelect = document.getElementById('productCategory');
    const newCategoryGroup = document.getElementById('newCategoryGroup');
    
    if (categorySelect.value === 'new-category') {
        newCategoryGroup.style.display = 'block';
        document.getElementById('newCategoryName').required = true;
    } else {
        newCategoryGroup.style.display = 'none';
        document.getElementById('newCategoryName').required = false;
        document.getElementById('newCategoryName').value = '';
    }
}

// وظيفة الحصول على المقاسات المحددة
function getSelectedSizes() {
    const sizeCheckboxes = document.querySelectorAll('.size-checkbox input[type="checkbox"]:checked');
    return Array.from(sizeCheckboxes).map(checkbox => checkbox.value);
}

// تحديث وظيفة حفظ المنتج
function saveProduct(event) {
    event.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    let category = document.getElementById('productCategory').value;
    const availability = document.getElementById('productAvailability').value;
    const sizes = getSelectedSizes();
    const bestseller = document.getElementById('productBestseller').checked;
    const description = document.getElementById('productDescription').value;
    
    // التعامل مع الفئة الجديدة
    if (category === 'new-category') {
        const newCategoryName = document.getElementById('newCategoryName').value.trim();
        if (!newCategoryName) {
            alert('يرجى إدخال اسم الفئة الجديدة');
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
        
        // إخفاء حقل الفئة الجديدة
        document.getElementById('newCategoryGroup').style.display = 'none';
    }
    
    // التحقق من المقاسات
    if (sizes.length === 0) {
        const confirmNoSizes = confirm('لم تحدد أي مقاسات. هل تريد المتابعة؟');
        if (!confirmNoSizes) {
            return;
        }
    }
    
    const product = {
        id: productId || Date.now().toString(),
        name,
        price,
        category,
        availability,
        sizes,
        bestseller,
        description,
        images: currentProductImages || []
    };
    
    let products = JSON.parse(localStorage.getItem('mkProducts')) || []; // تغيير من 'products' إلى 'mkProducts'
    
    if (productId) {
        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            products[index] = product;
        }
    } else {
        products.push(product);
    }
    
    localStorage.setItem('mkProducts', JSON.stringify(products)); // تغيير من 'products' إلى 'mkProducts'
    
    loadProducts();
    hideProductForm();
    
    showSuccessMessage(productId ? 'تم تحديث المنتج بنجاح!' : 'تم إضافة المنتج بنجاح!');
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
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);

}

// حماية صفحة الإدارة
function checkAdminAuth() {
    const adminPassword = 'MK2024Admin'; // غير كلمة المرور هذه
    const isAuthenticated = sessionStorage.getItem('adminAuth');
    
    if (!isAuthenticated) {
        const enteredPassword = prompt('أدخل كلمة مرور الإدارة:');
        if (enteredPassword === adminPassword) {
            sessionStorage.setItem('adminAuth', 'true');
        } else {
            alert('كلمة مرور خاطئة!');
            window.location.href = 'index.html';
            return false;
        }
    }
    return true;
}

// تشغيل الحماية عند تحميل الصفحة
if (!checkAdminAuth()) {
    throw new Error('غير مصرح بالدخول');
}
