document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Lenis for Smooth Scrolling
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Integrate Lenis with GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0, 0);

    // 2. Custom Cursor Logic
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        // Dot follows instantly
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        // Outline trails slightly using GSAP for smoothness
        gsap.to(cursorOutline, {
            x: posX,
            y: posY,
            duration: 0.15,
            ease: "power2.out"
        });
    });

    // Cursor hover effects on links/buttons
    const interactiveElements = document.querySelectorAll('a, button, .bento-item');
    interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-hover');
        });
    });

    // 3. Header Scrolled State
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 4. GSAP Animations

    // Hero Section Reveal
    const heroTl = gsap.timeline();
    
    heroTl.from('.badge-neon', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
    })
    .from('.reveal-text', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    }, "-=0.6")
    .from('.reveal-fade', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out"
    }, "-=0.6")
    .from('.reveal-scale', {
        scale: 0.8,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out"
    }, "-=1.2");

    // Scroll Animations for Bento Items (Fade up)
    gsap.utils.toArray('.reveal-fade-up').forEach(element => {
        gsap.from(element, {
            scrollTrigger: {
                trigger: element,
                start: "top 85%", // Trigger when top of element hits 85% down viewport
                toggleActions: "play none none reverse"
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        });
    });


    // 5. Image Parallax Effects
    gsap.to('.parallax-img', {
        scrollTrigger: {
            trigger: '.hero',
            start: "top top",
            end: "bottom top",
            scrub: true
        },
        y: 100, // Move down slightly as you scroll down
        ease: "none"
    });


    // 6. Dynamic Hero Text Marquee
    const dynamicText = document.querySelector('.dynamic-text');
    if (dynamicText) {
        const words = [
            "Robotics",
            "IOTs",
            "Innovative Learning",
            "Technology",
            "AI",
            "Automation",
            "Coding"
        ];
        let wordIndex = 0;

        setInterval(() => {
            const nextIndex = (wordIndex + 1) % words.length;
            const nextWord = words[nextIndex];

            gsap.to(dynamicText, {
                y: 20,
                opacity: 0,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                    dynamicText.innerText = nextWord;
                    gsap.fromTo(dynamicText,
                        { y: -20, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
                    );
                }
            });
            wordIndex = nextIndex;
        }, 2000);
    }

    // 7. Contact Modal Logic
    const getStartedBtn = document.getElementById('getStartedBtn');
    const bookDemoBtn = document.getElementById('bookDemoBtn');
    const contactModal = document.getElementById('contactModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    if (contactModal) {
        const openModal = (e) => {
            e.preventDefault();
            contactModal.classList.add('active');
            if (lenis) lenis.stop(); // Pause smooth scroll
            document.body.style.overflow = 'hidden';
        };

        if (getStartedBtn) getStartedBtn.addEventListener('click', openModal);
        if (bookDemoBtn) bookDemoBtn.addEventListener('click', openModal);

        const closeModal = () => {
            contactModal.classList.remove('active');
            if (lenis) lenis.start(); // Resume smooth scroll
            document.body.style.overflow = '';
        };

        if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
        contactModal.addEventListener('click', (e) => {
            if (e.target === contactModal) {
                closeModal();
            }
        });
    }

    // 8. Gallery Carousel Logic
    const track = document.getElementById('galleryTrack');
    const prevBtn = document.getElementById('carouselPrevBtn');
    const nextBtn = document.getElementById('carouselNextBtn');
    const indicatorsContainer = document.getElementById('carouselIndicators');

    if (track) {
        const slides = Array.from(track.children);
        let currentIndex = 0;
        let slideInterval;

        // Generate indicators
        slides.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.classList.add('indicator-dot');
            if(idx === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                const max = slides.length - getVisibleSlides();
                goToSlide(Math.min(idx, max));
            });
            indicatorsContainer.appendChild(dot);
        });
        const dots = Array.from(indicatorsContainer.children);

        function getVisibleSlides() {
            return window.innerWidth <= 768 ? 1 : 3;
        }

        function updateCarousel() {
            const visible = getVisibleSlides();
            const max = slides.length - visible;
            // safeguard index
            if(currentIndex > max) currentIndex = max;
            
            const slideWidth = slides[0].getBoundingClientRect().width;
            track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
            
            let centerIndex = currentIndex;
            if (visible === 3) centerIndex = currentIndex + 1;
            
            slides.forEach((s, i) => {
                s.classList.toggle('active', i === centerIndex);
            });
            dots.forEach((d, i) => {
                if(d) d.classList.toggle('active', i === currentIndex);
            });
        }
        
        window.addEventListener('resize', updateCarousel);

        function nextSlide() {
            const maxIndex = slides.length - getVisibleSlides();
            currentIndex = (currentIndex >= maxIndex) ? 0 : currentIndex + 1;
            updateCarousel();
        }

        function prevSlide() {
            const maxIndex = slides.length - getVisibleSlides();
            currentIndex = (currentIndex === 0) ? maxIndex : currentIndex - 1;
            updateCarousel();
        }

        function goToSlide(idx) {
            currentIndex = idx;
            updateCarousel();
            resetInterval();
        }

        function resetInterval() {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000);
        }

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => { prevSlide(); resetInterval(); });
            nextBtn.addEventListener('click', () => { nextSlide(); resetInterval(); });
        }
        
        resetInterval(); // Start auto-scroll at 5s standard
    }
});
