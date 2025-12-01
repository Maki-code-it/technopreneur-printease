/* ===========================================
   FILE: JS_Files/main.js
   PrintEase Digital Printing - Main JavaScript
   WITH CHATBOT & FLOATING STICKERS
============================================ */

// Cart System - Using localStorage to persist cart data
let cart = JSON.parse(localStorage.getItem('printease_cart')) || [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    initMobileMenu();
    initAddToCart();
    initDesignModal();
    initChatbot(); // Initialize chatbot on all pages
    initFloatingStickers(); // Initialize floating stickers
    
    // Initialize cart page if on cart.html
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
        initCheckout();
    }
});

// ============================================
// FLOATING STICKERS - HOMEPAGE ONLY
// ============================================
function initFloatingStickers() {
    const floatingContainer = document.getElementById('floatingStickers');
    
    // Only run on index.html or root path
    const isHomepage = window.location.pathname.includes('index.html') || 
                       window.location.pathname === '/' ||
                       window.location.pathname === '/index.html';
    
    if (!floatingContainer || !isHomepage) {
        if (floatingContainer) {
            floatingContainer.style.display = 'none';
        }
        return;
    }

    floatingContainer.style.display = 'block';
    const stickers = floatingContainer.querySelectorAll('.floating-sticker');
    
    // Store initial positions
    const stickerData = [];
    stickers.forEach((sticker, index) => {
        const rect = sticker.getBoundingClientRect();
        stickerData.push({
            element: sticker,
            initialTop: rect.top + window.scrollY,
            speed: 0.15 + (index * 0.03) // Slower speeds for smoother effect
        });
    });

    // Scroll effect
    let ticking = false;
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                updateStickerPositions();
                ticking = false;
            });
            ticking = true;
        }
    });

    function updateStickerPositions() {
        const scrollY = window.scrollY;
        
        stickerData.forEach(data => {
            // Calculate parallax effect - moves with scroll
            const offset = scrollY * data.speed;
            data.element.style.transform = `translateY(${offset}px)`;
        });
    }

    // Mouse move effect for extra interactivity
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', function(e) {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        
        stickerData.forEach((data, index) => {
            const scrollY = window.scrollY;
            const scrollOffset = scrollY * data.speed;
            
            // Add subtle mouse parallax
            const mouseOffsetX = mouseX * (8 + index * 3);
            const mouseOffsetY = mouseY * (8 + index * 3);
            
            data.element.style.transform = `
                translateY(${scrollOffset}px) 
                translateX(${mouseOffsetX}px)
            `;
        });
    });
}

// ============================================
// AI CHATBOT SYSTEM
// ============================================
function initChatbot() {
    const chatbotButton = document.getElementById('chatbotButton');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSend = document.getElementById('chatbotSend');
    const chatbotMessages = document.getElementById('chatbotMessages');

    if (!chatbotButton || !chatbotWindow) return;

    // Toggle chatbot window
    chatbotButton.addEventListener('click', function() {
        chatbotWindow.classList.toggle('active');
        if (chatbotWindow.classList.contains('active')) {
            chatbotInput.focus();
            // Remove badge when opened
            const badge = document.querySelector('.chatbot-badge');
            if (badge) badge.style.display = 'none';
        }
    });

    // Close chatbot
    chatbotClose.addEventListener('click', function() {
        chatbotWindow.classList.remove('active');
    });

    // Send message function
    function sendMessage() {
        const message = chatbotInput.value.trim();
        if (!message) return;

        // Add user message
        addMessage(message, 'user');
        chatbotInput.value = '';

        // Show typing indicator
        showTypingIndicator();

        // Simulate bot response after delay
        setTimeout(() => {
            removeTypingIndicator();
            const response = getBotResponse(message);
            addMessage(response, 'bot');
        }, 1500 + Math.random() * 1000);
    }

    // Send button click
    chatbotSend.addEventListener('click', sendMessage);

    // Enter key to send
    chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Add message to chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
        
        const time = new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <p>${text}</p>
                    <span class="message-time">${time}</span>
                </div>
                <div class="message-avatar">
                    <i class="fas fa-user"></i>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <p>${text}</p>
                    <span class="message-time">${time}</span>
                </div>
            `;
        }

        chatbotMessages.appendChild(messageDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'bot-message typing-message';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatbotMessages.appendChild(typingDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const typing = chatbotMessages.querySelector('.typing-message');
        if (typing) typing.remove();
    }

    // Bot responses based on keywords
    function getBotResponse(message) {
        const msg = message.toLowerCase();
        
        // Greetings
        if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
            return "Hello! 👋 Welcome to PrintEase! I'm here to help you with your printing needs. What would you like to know about our products?";
        }
        
        // Price inquiries
        if (msg.includes('price') || msg.includes('cost') || msg.includes('how much')) {
            return "Our prices are very affordable! 💰 Custom stickers start at ₱10, button pins at ₱50, keychains at ₱100, and more! Would you like to see our full catalog?";
        }
        
        // Products
        if (msg.includes('product') || msg.includes('what do you sell') || msg.includes('items')) {
            return "We offer a variety of custom printed products! 🎨 Including: Custom Stickers, Button Pins, Ballpens, Keychains, and Name Tags/IDs. Which one interests you?";
        }
        
        // Stickers
        if (msg.includes('sticker')) {
            return "Our custom stickers are high-quality and fully customizable! ✨ Perfect for personal use, events, or business branding. Starting at just ₱10! Want to place an order?";
        }
        
        // Pins
        if (msg.includes('pin') || msg.includes('button')) {
            return "Button pins are perfect for expressing yourself! 📌 Great for collections, events, or gifts. Starting at ₱50. Would you like to see designs?";
        }
        
        // Orders
        if (msg.includes('order') || msg.includes('buy') || msg.includes('purchase')) {
            return "To place an order, simply browse our shop and add items to your cart! 🛒 You can also submit custom designs through our design submission form. Need help navigating?";
        }
        
        // Custom design
        if (msg.includes('custom') || msg.includes('design') || msg.includes('personalize')) {
            return "We love custom designs! 🎨 You can upload your own designs through our 'Submit Your Design' feature in the shop page. Our team will review and contact you within 24 hours!";
        }
        
        // Delivery
        if (msg.includes('deliver') || msg.includes('shipping') || msg.includes('ship')) {
            return "We offer reliable delivery services! 🚚 Shipping fee is ₱50 flat rate. Orders are typically processed within 2-3 business days. Where would you like to ship to?";
        }
        
        // Payment
        if (msg.includes('payment') || msg.includes('pay') || msg.includes('cash')) {
            return "We accept multiple payment methods! 💳 Cash on Delivery, GCash, PayMaya, and Bank Transfer. Choose what's most convenient for you at checkout!";
        }
        
        // Contact
        if (msg.includes('contact') || msg.includes('reach') || msg.includes('talk')) {
            return "You can reach us at: 📞 +63 912 345 6789 or 📧 printease@example.com. We're located at #21 Lt. Tiamsic St. Brgy. Tabacalera, Pateros. How else can I assist you?";
        }
        
        // Agent/human
        if (msg.includes('agent') || msg.includes('human') || msg.includes('person') || msg.includes('representative')) {
            return "I'm connecting you to our customer service team... 👤 Meanwhile, you can also reach us directly at +63 912 345 6789 or printease@example.com for immediate assistance!";
        }
        
        // Thanks
        if (msg.includes('thank') || msg.includes('thanks')) {
            return "You're welcome! 😊 Is there anything else I can help you with today?";
        }
        
        // Bye
        if (msg.includes('bye') || msg.includes('goodbye')) {
            return "Thank you for chatting with PrintEase! 👋 Feel free to reach out anytime. Have a great day!";
        }
        
        // Default response
        return "I'm here to help! 🤖 You can ask me about our products, prices, ordering process, delivery, or anything else. What would you like to know?";
    }
}

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
    
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    }
}

function saveCart() {
    localStorage.setItem('printease_cart', JSON.stringify(cart));
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
// CART PAGE FUNCTIONS
// ============================================
function displayCart() {
    const itemsContainer = document.getElementById('cartItems');
    const cartContent = document.getElementById('cartContent');
    const emptyMessage = document.getElementById('emptyCart');

    if (!itemsContainer || !cartContent) return;

    itemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        emptyMessage.style.display = 'flex';
        cartContent.style.display = 'none';
        return;
    }

    emptyMessage.style.display = 'none';
    cartContent.style.display = 'grid';

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        
        const imageDiv = document.createElement('div');
        imageDiv.className = 'cart-item-image';
        
        const img = document.createElement('img');
        img.alt = item.name;
        img.src = item.image;
        img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border-radius: 8px; display: block;';
        
        img.onerror = function() {
            this.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.style.cssText = 'width: 100%; height: 100%; background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 8px; color: #6b7280;';
            placeholder.innerHTML = '<i class="fas fa-image" style="font-size: 40px; margin-bottom: 8px;"></i><span style="font-size: 12px;">Image not found</span>';
            this.parentElement.appendChild(placeholder);
        };
        
        imageDiv.appendChild(img);
        
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
        
        const totalDiv = document.createElement('div');
        totalDiv.className = 'cart-item-total';
        totalDiv.innerHTML = `
            <p class="total-label">Subtotal</p>
            <p class="total-price">₱${(item.price * item.quantity).toFixed(2)}</p>
        `;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        removeBtn.onclick = () => removeItem(item.id);
        
        itemElement.appendChild(imageDiv);
        itemElement.appendChild(detailsDiv);
        itemElement.appendChild(totalDiv);
        itemElement.appendChild(removeBtn);
        
        itemsContainer.appendChild(itemElement);
    });

    updateSummary();
}

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
    
    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutTotal = document.getElementById('checkoutTotal');
    
    if (checkoutSubtotal) checkoutSubtotal.textContent = `₱${subtotal.toFixed(2)}`;
    if (checkoutTotal) checkoutTotal.textContent = `₱${total.toFixed(2)}`;
    
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }
}

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

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const selectedPayment = document.querySelector('input[name="payment"]:checked');
            
            if (!selectedPayment) {
                showNotification('Please select a payment method.', 'error');
                return;
            }
            
            checkoutForm.style.display = 'none';
            const orderSuccess = document.getElementById('orderSuccess');
            orderSuccess.style.display = 'block';
            
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
// DESIGN SUBMISSION MODAL
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

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);