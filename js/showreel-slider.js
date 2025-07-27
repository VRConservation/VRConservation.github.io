// Showreel Slider Component
// Optimized and self-contained showreel functionality

class ShowreelSlider {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.slide');
        this.totalSlides = this.slides.length;
        this.isAnimating = false;
        this.autoplayInterval = null;
        this.autoplayDelay = 6000; // 6 seconds
        this.isVisible = true;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.mouseStartX = 0;
        this.mouseEndX = 0;
        this.isDragging = false;
        
        // Cache DOM elements
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.currentSlideElement = document.getElementById('currentSlide');
        this.totalSlidesElement = document.getElementById('totalSlides');
        this.progressFill = document.getElementById('progressFill');
        this.slider = document.querySelector('.showreel-container');

        this.init();
    }

    init() {
        // Check if required elements exist
        if (this.totalSlides === 0) {
            console.warn('No slides found. Showreel slider cannot initialize.');
            return;
        }

        this.setupEventListeners();
        this.updateSlideCounter();
        this.updateProgressBar();
        this.startAutoplay();
        
        // Set first slide as active if none are active
        if (!document.querySelector('.slide.active')) {
            this.slides[0].classList.add('active');
        }
    }

    setupEventListeners() {
        // Navigation buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevSlide());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextSlide());

        // Slide dots with event delegation as backup
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            // Remove any existing event listeners
            dot.replaceWith(dot.cloneNode(true));
        });
        
        // Re-select dots after cloning
        const freshDots = document.querySelectorAll('.dot');
        freshDots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.pauseAutoplay(); // Stop autoplay when user interacts
                this.goToSlide(index);
            });
        });
        
        // Additional event delegation as backup
        document.querySelector('.slide-dots').addEventListener('click', (e) => {
            if (e.target.classList.contains('dot')) {
                e.preventDefault();
                e.stopPropagation();
                const index = Array.from(e.target.parentNode.children).indexOf(e.target);
                this.pauseAutoplay();
                this.goToSlide(index);
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });

        // Touch/swipe support
        let startX = 0;
        let endX = 0;

        const slider = document.querySelector('.showreel-container');
        
        if (slider) {
            slider.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            });

            slider.addEventListener('touchend', (e) => {
                endX = e.changedTouches[0].clientX;
                this.handleSwipe(startX, endX);
            });

            // Mouse drag support
            let mouseStartX = 0;
            let mouseEndX = 0;
            let isDragging = false;

            slider.addEventListener('mousedown', (e) => {
                mouseStartX = e.clientX;
                isDragging = true;
            });

            slider.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    mouseEndX = e.clientX;
                }
            });

            slider.addEventListener('mouseup', () => {
                if (isDragging) {
                    this.handleMouseDrag(mouseStartX, mouseEndX);
                    isDragging = false;
                }
            });

            // Pause autoplay on hover
            slider.addEventListener('mouseenter', () => this.pauseAutoplay());
            slider.addEventListener('mouseleave', () => this.startAutoplay());
        }

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoplay();
            } else {
                this.startAutoplay();
            }
        });
    }

    handleSwipe(startX, endX) {
        const threshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    }

    handleMouseDrag(mouseStartX, mouseEndX) {
        const threshold = 50;
        const diff = mouseStartX - mouseEndX;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    }

    nextSlide() {
        if (this.isAnimating) return;
        
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.changeSlide();
    }

    prevSlide() {
        if (this.isAnimating) return;
        
        this.currentSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
        this.changeSlide();
    }

    goToSlide(index) {
        if (this.isAnimating || index === this.currentSlide) return;
        
        this.currentSlide = index;
        this.changeSlide();
    }

    changeSlide() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.restartAutoplay();

        // Remove active class from all slides and dots
        this.slides.forEach(slide => slide.classList.remove('active'));
        const dots = document.querySelectorAll('.dot'); // Get fresh dots
        dots.forEach(dot => dot.classList.remove('active'));

        // Add active class to current slide and dot
        this.slides[this.currentSlide].classList.add('active');
        if (dots[this.currentSlide]) {
            dots[this.currentSlide].classList.add('active');
        }

        // Update UI
        this.updateSlideCounter();
        this.updateProgressBar();
        
        // Handle video playback
        this.updateVideoPlayback();

        // Reset animation flag after transition
        setTimeout(() => {
            this.isAnimating = false;
        }, 1200);
    }

    updateSlideCounter() {
        if (this.currentSlideElement) {
            this.currentSlideElement.textContent = String(this.currentSlide + 1).padStart(2, '0');
        }
        if (this.totalSlidesElement) {
            this.totalSlidesElement.textContent = String(this.totalSlides).padStart(2, '0');
        }
    }

    updateProgressBar() {
        if (this.progressFill) {
            const progress = ((this.currentSlide + 1) / this.totalSlides) * 100;
            this.progressFill.style.width = `${progress}%`;
        }
    }

    startAutoplay() {
        this.pauseAutoplay(); // Clear any existing interval
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoplayDelay);
    }

    pauseAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }

    restartAutoplay() {
        this.startAutoplay();
    }

    // Method to handle video loading and playing
    handleVideoSlides() {
        const videos = document.querySelectorAll('.slide video');
        
        videos.forEach((video, index) => {
            // Add error handling
            video.addEventListener('error', () => {
                console.log(`Video ${index + 1} failed to load`);
                // Hide video and show fallback image
                video.style.display = 'none';
                const fallbackImg = video.querySelector('img');
                if (fallbackImg) {
                    fallbackImg.style.display = 'block';
                }
            });

            video.addEventListener('loadeddata', () => {
                console.log(`Video ${index + 1} loaded successfully`);
                if (index === this.currentSlide) {
                    video.play().catch(e => {
                        console.log(`Video ${index + 1} autoplay failed:`, e);
                    });
                }
            });

            // Try to load the video
            video.load();
        });

        // Play/pause videos based on active slide
        this.updateVideoPlayback();
    }

    updateVideoPlayback() {
        this.slides.forEach((slide, index) => {
            const video = slide.querySelector('video');
            if (video) {
                if (index === this.currentSlide) {
                    video.play().catch(e => {
                        console.log(`Video ${index + 1} play failed:`, e);
                    });
                } else {
                    video.pause();
                }
            }
        });
    }

    // Preload next slide media
    preloadNextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.totalSlides;
        const nextSlide = this.slides[nextIndex];
        const nextVideo = nextSlide.querySelector('video');
        const nextImage = nextSlide.querySelector('img');

        if (nextVideo && nextVideo.readyState < 2) {
            nextVideo.load();
        }

        if (nextImage && !nextImage.complete) {
            nextImage.loading = 'eager';
        }
    }
}

// Enhanced loading with better error handling
document.addEventListener('DOMContentLoaded', () => {
    // Add loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    // Wait for fonts and initial resources
    Promise.all([
        document.fonts.ready,
        new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        })
    ]).then(() => {
        // Initialize slider
        const slider = new ShowreelSlider();
        
        // Handle video slides
        slider.handleVideoSlides();
        
        // Preload next slide
        slider.preloadNextSlide();
        
        // Show the page
        document.body.style.opacity = '1';
        
        // Add smooth scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';
        
        console.log('Showreel slider initialized successfully');
    }).catch(error => {
        console.error('Error initializing showreel slider:', error);
        // Still show the page even if there's an error
        document.body.style.opacity = '1';
    });
});

// Handle resize events
window.addEventListener('resize', () => {
    // Recalculate dimensions if needed
    const slides = document.querySelectorAll('.slide');
    slides.forEach(slide => {
        const video = slide.querySelector('video');
        if (video) {
            // Force video to maintain aspect ratio
            video.style.width = '100%';
            video.style.height = '100%';
        }
    });
});

// Export for potential external use
window.ShowreelSlider = ShowreelSlider;
