/* ===========================================
   FILE: JS_Files/main.js
   PrintEase Digital Printing - Main JavaScript
   FIXED: Cart images now display properly
============================================ */

// Cart System - Using localStorage to persist cart data
let cart = JSON.parse(localStorage.getItem('printease_cart')) || [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    initMobileMenu();
    initAddToCart();
    initDesignModal();
    
    // Initialize cart page if on cart.html
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
        initCheckout();
    }
});

// Mobile Menu Toggle
function initMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
}

// Add to Cart Functionality
function initAddToCart() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productCard = this.closest('.product-card');
            
            const product = {
                id: productCard.getAttribute('data-id'),
                name: productCard.getAttribute('data-name'),
                price: parseFloat(productCard.getAttribute('data-price')),
                image: productCard.getAttribute('data-image'),
                quantity: 1
            };
            
            console.log('Adding product to cart:', product); // Debug log
            addToCart(product);
        });
    });
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showNotification(`${product.name} quantity updated in cart.`, 'info');
    } else {
        cart.push(product);
        showNotification(`${product.name} added to cart!`, 'success');
    }
    
    saveCart();
    updateCartCount();
    
    // If on the cart page, update the display immediately
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    }
}

function saveCart() {
    localStorage.setItem('printease_cart', JSON.stringify(cart));
    console.log('Cart saved:', cart); // Debug log
}

function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cartCount');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElements.forEach(element => {
        if (element) {
            element.textContent = totalItems;
        }
    });
}

// ============================================
// CART PAGE FUNCTIONS (for cart.html) - FIXED
// ============================================

function displayCart() {
    const itemsContainer = document.getElementById('cartItems');
    const cartContent = document.getElementById('cartContent');
    const emptyMessage = document.getElementById('emptyCart');

    if (!itemsContainer || !cartContent) return;

    itemsContainer.innerHTML = '';
    
    console.log('Displaying cart:', cart); // Debug log
    
    if (cart.length === 0) {
        emptyMessage.style.display = 'flex';
        cartContent.style.display = 'none';
        return;
    }

    emptyMessage.style.display = 'none';
    cartContent.style.display = 'grid';

    cart.forEach(item => {
        console.log('Rendering cart item:', item); // Debug log
        
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        
        // Create image element programmatically for better error handling
        const imageDiv = document.createElement('div');
        imageDiv.className = 'cart-item-image';
        
        const img = document.createElement('img');
        img.alt = item.name;
        
        // Log the image path for debugging
        console.log('Loading image from path:', item.image);
        
        img.onload = function() {
            console.log('✓ Image loaded successfully:', item.image);
        };
        
        img.onerror = function() {
            console.error('✗ Image failed to load:', item.image);
            console.log('Current page location:', window.location.pathname);
            this.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.style.cssText = 'width: 100%; height: 100%; background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 8px; color: #6b7280;';
            placeholder.innerHTML = '<i class="fas fa-image" style="font-size: 40px; margin-bottom: 8px;"></i><span style="font-size: 12px;">Image not found</span>';
            this.parentElement.appendChild(placeholder);
        };
        
        // Set the image source
        img.src = item.image;
        img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border-radius: 8px; display: block;';
        imageDiv.appendChild(img);
        
        // Create details section
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'cart-item-details';
        detailsDiv.innerHTML = `
            <h3>${item.name}</h3>
            <p class="price">₱${item.price.toFixed(2)}</p>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)"><i class="fas fa-minus"></i></button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)"><i class="fas fa-plus"></i></button>
            </div>
        `;
        
        // Create total section
        const totalDiv = document.createElement('div');
        totalDiv.className = 'cart-item-total';
        totalDiv.innerHTML = `
            <p class="total-label">Subtotal</p>
            <p class="total-price">₱${(item.price * item.quantity).toFixed(2)}</p>
        `;
        
        // Create remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        removeBtn.onclick = () => removeItem(item.id);
        
        // Append all elements
        itemElement.appendChild(imageDiv);
        itemElement.appendChild(detailsDiv);
        itemElement.appendChild(totalDiv);
        itemElement.appendChild(removeBtn);
        
        itemsContainer.appendChild(itemElement);
    });

    updateSummary();
}

// Update Quantity Function
function updateQuantity(productId, change) {
    const product = cart.find(item => item.id === productId);
    
    if (product) {
        product.quantity += change;
        
        if (product.quantity <= 0) {
            removeItem(productId);
        } else {
            saveCart();
            updateCartCount();
            displayCart();
        }
    }
}

// Remove Item Function
function removeItem(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    displayCart();
    showNotification('Item removed from cart', 'success');
}

function updateSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 50.00 : 0.00;
    const total = subtotal + shipping;

    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    
    if (subtotalElement) subtotalElement.textContent = `₱${subtotal.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `₱${total.toFixed(2)}`;
    
    // Update Checkout Modal Summary
    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutTotal = document.getElementById('checkoutTotal');
    
    if (checkoutSubtotal) checkoutSubtotal.textContent = `₱${subtotal.toFixed(2)}`;
    if (checkoutTotal) checkoutTotal.textContent = `₱${total.toFixed(2)}`;
    
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }
}

// Initialize Checkout
function initCheckout() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutModal = document.getElementById('checkoutModal');
    const closeModal = document.getElementById('closeModal');
    const checkoutForm = document.getElementById('checkoutForm');
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length > 0) {
                updateSummary();
                checkoutModal.classList.add('active');
            }
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', function() {
            checkoutModal.classList.remove('active');
        });
    }
    
    window.addEventListener('click', function(event) {
        if (event.target === checkoutModal) {
            checkoutModal.classList.remove('active');
        }
    });

    // Form Submission
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const selectedPayment = document.querySelector('input[name="payment"]:checked');
            
            if (!selectedPayment) {
                showNotification('Please select a payment method.', 'error');
                return;
            }
            
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('emailCheckout').value;
            const phone = document.getElementById('phone').value;
            const address = document.getElementById('address').value;
            
            console.log('Order Details:', {
                customer: { fullName, email, phone, address },
                payment: selectedPayment.value,
                items: cart,
                total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 50
            });
            
            // Hide form and show success message
            checkoutForm.style.display = 'none';
            const orderSuccess = document.getElementById('orderSuccess');
            orderSuccess.style.display = 'block';
            
            // Clear cart after 3 seconds and redirect
            setTimeout(function() {
                cart = [];
                saveCart();
                updateCartCount();
                checkoutModal.classList.remove('active');
                window.location.href = 'index.html';
            }, 3000);
        });
    }
}

// ============================================
// DESIGN SUBMISSION MODAL FUNCTIONS (for shop.html)
// ============================================
function initDesignModal() {
    const modal = document.getElementById('designModal');
    const openBtn = document.getElementById('openDesignModalBtn');
    const closeBtn = modal ? modal.querySelector('.close-button') : null;
    const form = document.getElementById('designForm');
    const fileInput = document.getElementById('designFile');
    const formMessage = document.getElementById('designFormMessage');

    if (!modal || !openBtn || !form) return;

    openBtn.addEventListener('click', () => {
        modal.classList.add('active');
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });

    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            const previewContainer = document.getElementById('filePreview');
            if (!previewContainer) return;
            
            previewContainer.innerHTML = '';
            
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    showDesignFormMessage('File is too large (max 5MB). Please choose a smaller image.', 'error');
                    fileInput.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.maxWidth = '100%';
                    img.style.maxHeight = '150px';
                    img.style.marginTop = '10px';
                    
                    const fileName = document.createElement('p');
                    fileName.textContent = `File Ready: ${file.name}`;
                    fileName.style.fontSize = '12px';
                    fileName.style.color = '#10b981';

                    previewContainer.appendChild(img);
                    previewContainer.appendChild(fileName);
                    if (formMessage) formMessage.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const itemType = document.getElementById('designItemType').value;
        const quantity = document.getElementById('designQuantity').value;
        const notes = document.getElementById('designNotes').value;
        const email = document.getElementById('designEmail').value;
        const file = document.getElementById('designFile').files[0];
        
        if (!itemType || !quantity || !email || !file) {
            showDesignFormMessage('Please fill in all required fields and upload your design.', 'error');
            return;
        }

        showDesignFormMessage('Processing your design request...', 'info');

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        setTimeout(() => {
            console.log('--- Custom Design Request Submission ---');
            console.log(`Item Type: ${itemType}`);
            console.log(`Quantity: ${quantity}`);
            console.log(`Customer Email: ${email}`);
            console.log(`Notes: ${notes}`);
            console.log(`File: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);

            showDesignFormMessage('Your design request has been sent! We will contact you via email soon.', 'success');
            
            setTimeout(() => {
                form.reset();
                const previewContainer = document.getElementById('filePreview');
                if (previewContainer) previewContainer.innerHTML = '';
                modal.classList.remove('active');
                if (formMessage) formMessage.style.display = 'none';
                submitBtn.disabled = false;
            }, 3000);

        }, 1500);
    });

    function showDesignFormMessage(message, type) {
        if (!formMessage) return;
        
        formMessage.textContent = message;
        formMessage.className = 'form-message';
        formMessage.classList.add(type);
        formMessage.style.display = 'block';

        if (type === 'info') {
            formMessage.style.backgroundColor = '#bfdbfe';
            formMessage.style.color = '#1e3a8a';
        }
    }
}

// ============================================
// UTILITY/NOTIFICATION
// ============================================

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: ${type === 'success' ? '#10b981' : type === 'info' ? '#3b82f6' : '#ef4444'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(function() {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(function() {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
