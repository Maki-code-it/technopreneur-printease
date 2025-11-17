/* ============================================
   FILE: JS_Files/slider.js
   PrintEase Digital Printing - Hero Slider
============================================ */

document.addEventListener('DOMContentLoaded', function() {
    initSlider();
});

function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.getElementById('sliderDots');
    
    if (!slides.length || !dotsContainer) return;
    
    let currentSlide = 0;
    let slideInterval;
    
    // Create dots
    slides.forEach((slide, index) => {
        const dot = document.createElement('div');
        dot.className = 'dot';
        if (index === 0) dot.classList.add('active');
        
        dot.addEventListener('click', function() {
            goToSlide(index);
            resetInterval();
        });
        
        dotsContainer.appendChild(dot);
    });
    
    const dots = document.querySelectorAll('.dot');
    
    // Go to specific slide
    function goToSlide(n) {
        // Remove active class from all slides and dots
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Add active class to current slide and dot
        slides[n].classList.add('active');
        dots[n].classList.add('active');
        
        currentSlide = n;
    }
    
    // Next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        goToSlide(currentSlide);
    }
    
    // Previous slide
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        goToSlide(currentSlide);
    }
    
    // Auto advance slides
    function startInterval() {
        slideInterval = setInterval(nextSlide, 5000);
    }
    
    // Reset interval when user interacts
    function resetInterval() {
        clearInterval(slideInterval);
        startInterval();
    }
    
    // Start automatic sliding
    startInterval();
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            resetInterval();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            resetInterval();
        }
    });
    
    // Pause on hover
    const sliderContainer = document.querySelector('.slider-container');
    
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', function() {
            clearInterval(slideInterval);
        });
        
        sliderContainer.addEventListener('mouseleave', function() {
            startInterval();
        });
    }
}
