/* ============================================
   FILE: JS_Files/main.js
   PrintEase Digital Printing - Main JavaScript
============================================ */

// Cart System - Using localStorage to persist cart data
let cart = JSON.parse(localStorage.getItem('printease_cart')) || [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    initMobileMenu();
    initAddToCart();
    
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
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            
            const product = {
                id: productCard.getAttribute('data-id'),
                name: productCard.getAttribute('data-name'),
                price: parseFloat(productCard.getAttribute('data-price')),
                image: productCard.getAttribute('data-image'),
                quantity: 1
            };
            
            addToCart(product);
        });
    });
}

// Add product to cart
function addToCart(product) {
    const existingProduct = cart.find(item => item.id === product.id);
    
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push(product);
    }
    
    saveCart();
    updateCartCount();
    showNotification('Product added to cart!');
}

// Remove product from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    displayCart();
}

// Update product quantity
function updateQuantity(productId, change) {
    const product = cart.find(item => item.id === productId);
    
    if (product) {
        product.quantity += change;
        
        if (product.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            displayCart();
        }
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('printease_cart', JSON.stringify(cart));
}

// Update cart count in navbar
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

// Calculate cart totals
function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 50;
    const total = subtotal + deliveryFee;
    
    return { subtotal, deliveryFee, total };
}

// Display cart items on cart.html
function displayCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartContent = document.getElementById('cartContent');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        cartContent.style.display = 'none';
        return;
    }
    
    emptyCart.style.display = 'none';
    cartContent.style.display = 'grid';
    
    cartItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const cartItemHTML = `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p class="price">₱${item.price}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="cart-item-total">
                    <p class="total-label">Total</p>
                    <p class="total-price">₱${item.price * item.quantity}</p>
                </div>
                <button class="remove-btn" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        cartItemsContainer.innerHTML += cartItemHTML;
    });
    
    updateCartSummary();
}

// Update cart summary
function updateCartSummary() {
    const totals = calculateTotals();
    
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    
    if (subtotalElement) subtotalElement.textContent = `₱${totals.subtotal}`;
    if (totalElement) totalElement.textContent = `₱${totals.total}`;
}

// Initialize checkout functionality
function initCheckout() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutModal = document.getElementById('checkoutModal');
    const closeModal = document.getElementById('closeModal');
    const checkoutForm = document.getElementById('checkoutForm');
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                showNotification('Your cart is empty!', 'error');
                return;
            }
            
            checkoutModal.classList.add('active');
            updateCheckoutSummary();
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            checkoutModal.classList.remove('active');
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === checkoutModal) {
            checkoutModal.classList.remove('active');
        }
    });
    
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            processOrder();
        });
    }
}

// Update checkout summary
function updateCheckoutSummary() {
    const totals = calculateTotals();
    
    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutTotal = document.getElementById('checkoutTotal');
    
    if (checkoutSubtotal) checkoutSubtotal.textContent = `₱${totals.subtotal}`;
    if (checkoutTotal) checkoutTotal.textContent = `₱${totals.total}`;
}

// Process order
function processOrder() {
    const checkoutForm = document.getElementById('checkoutForm');
    const orderSuccess = document.getElementById('orderSuccess');
    
    // Hide form and show success message
    checkoutForm.style.display = 'none';
    orderSuccess.style.display = 'block';
    
    // Clear cart after 3 seconds and redirect
    setTimeout(function() {
        cart = [];
        saveCart();
        updateCartCount();
        window.location.href = 'index.html';
    }, 3000);
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(function() {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(function() {
            document.body.removeChild(notification);
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