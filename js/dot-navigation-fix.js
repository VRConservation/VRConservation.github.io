// Simple direct dot navigation fix
// Add this script after the main showreel script

document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for the main script to initialize
    setTimeout(() => {
        console.log('Setting up dot navigation fix...');
        
        // Remove all existing event listeners from dots
        const dots = document.querySelectorAll('.dot');
        
        // Clone each dot to remove all event listeners
        dots.forEach((dot, index) => {
            const newDot = dot.cloneNode(true);
            dot.parentNode.replaceChild(newDot, dot);
        });
        
        // Get fresh dots and add simple click handlers
        const freshDots = document.querySelectorAll('.dot');
        const slides = document.querySelectorAll('.slide');
        
        freshDots.forEach((dot, index) => {
            dot.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log(`Dot ${index} clicked, going to slide ${index}`);
                
                // Remove active from all slides and dots
                slides.forEach(slide => slide.classList.remove('active'));
                freshDots.forEach(d => d.classList.remove('active'));
                
                // Add active to target slide and dot
                if (slides[index]) {
                    slides[index].classList.add('active');
                }
                dot.classList.add('active');
                
                // Update counter
                const currentSlideElement = document.getElementById('currentSlide');
                if (currentSlideElement) {
                    currentSlideElement.textContent = String(index + 1).padStart(2, '0');
                }
                
                // Update progress bar
                const progressFill = document.getElementById('progressFill');
                if (progressFill) {
                    const progress = ((index + 1) / slides.length) * 100;
                    progressFill.style.width = progress + '%';
                }
            });
        });
        
        console.log('Dot navigation fix applied');
    }, 1000);
});
