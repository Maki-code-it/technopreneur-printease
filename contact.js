/* ============================================
   FILE: JS_Files/contact.js
   PrintEase Digital Printing - Contact Form
============================================ */

document.addEventListener('DOMContentLoaded', function() {
    initContactForm();
});

function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;
        
        // Validate form
        if (!name || !email || !subject || !message) {
            showFormMessage('Please fill in all fields.', 'error');
            return;
        }
        
        // Validate email format
        if (!isValidEmail(email)) {
            showFormMessage('Please enter a valid email address.', 'error');
            return;
        }
        
        // Simulate form submission
        submitContactForm(name, email, subject, message);
    });
}

function submitContactForm(name, email, subject, message) {
    const formMessage = document.getElementById('formMessage');
    const contactForm = document.getElementById('contactForm');
    
    // Show loading state
    showFormMessage('Sending message...', 'info');
    
    // Simulate API call delay
    setTimeout(function() {
        // In a real application, you would send this data to a server
        console.log('Contact Form Submission:', {
            name: name,
            email: email,
            subject: subject,
            message: message,
            timestamp: new Date().toISOString()
        });
        
        // Show success message
        showFormMessage('Thank you for your message! We will get back to you soon.', 'success');
        
        // Reset form
        contactForm.reset();
        
        // Hide message after 5 seconds
        setTimeout(function() {
            formMessage.style.display = 'none';
        }, 5000);
        
    }, 1500);
}

function showFormMessage(message, type) {
    const formMessage = document.getElementById('formMessage');
    
    if (!formMessage) return;
    
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = 'block';
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Add CSS for info state
const style = document.createElement('style');
style.textContent = `
    .form-message.info {
        background-color: #dbeafe;
        color: #1e40af;
        display: block;
    }
`;
document.head.appendChild(style);