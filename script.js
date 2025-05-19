document.addEventListener('DOMContentLoaded', function() {
    // Initialize FAQ accordion functionality
    const faqItems = document.querySelectorAll('.faq-item');
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    if (faqQuestions.length > 0) {
        faqQuestions.forEach((question, index) => {
            question.addEventListener('click', () => {
                // Toggle clicked FAQ
                const faqItem = question.parentElement;
                const isActive = faqItem.classList.contains('active');
                
                // Close all FAQs
                faqItems.forEach(item => {
                    item.classList.remove('active');
                });
                
                // If the clicked FAQ wasn't active, open it
                if (!isActive) {
                    faqItem.classList.add('active');
                }
            });
        });
    }
    
    // Success Popup Functionality
    const successPopup = document.getElementById('success-popup');
    const closePopupBtn = document.getElementById('close-popup');
    
    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', function() {
            successPopup.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Close when clicking outside the popup content
    if (successPopup) {
        successPopup.addEventListener('click', function(e) {
            if (e.target === successPopup) {
                successPopup.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Function to show popup
    function showSuccessPopup() {
        if (successPopup) {
            successPopup.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Show quota exhaustion modal
    function showQuotaExhaustionModal() {
        // Create quota exhaustion popup
        const quotaPopup = document.createElement('div');
        quotaPopup.classList.add('quota-popup');
        
        quotaPopup.innerHTML = `
            <div class="quota-popup-content">
                <span class="close-popup">&times;</span>
                <div class="quota-popup-body">
                    <div class="quota-icon">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <h3>Report Limit Reached</h3>
                    <p>You have already generated a report in the last 6 months. To get another report now, please purchase a full report.</p>
                    <a href="https://ai.soulfulevolution.com" target="_blank" class="purchase-btn">
                        <i class="fas fa-shopping-cart"></i> Purchase Full Report
                    </a>
                    <p class="quota-notice">Or wait until the 6-month period is over to generate another free report.</p>
                </div>
            </div>
        `;
        
        // Append popup to body
        document.body.appendChild(quotaPopup);
        
        // Show popup with animation
        setTimeout(() => {
            quotaPopup.classList.add('show');
        }, 10);
        
        // Close button functionality
        const closeBtn = quotaPopup.querySelector('.close-popup');
        closeBtn.addEventListener('click', () => {
            quotaPopup.classList.remove('show');
            setTimeout(() => {
                quotaPopup.remove();
            }, 300);
        });
    }
    
    // Function to get coordinates from address using Nominatim
    async function getCoordinates(address) {
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data && data.length > 0) {
                return {
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon)
                };
            }
            return null;
        } catch (error) {
            console.error('Error fetching coordinates:', error);
            return null;
        }
    }
    
    // Function to send data to GoHighLevel
    async function sendToGoHighLevel(data) {
        try {
            // This is a placeholder - in production you would send to GoHighLevel API
            console.log('Sending to GoHighLevel:', data);
            // In a real implementation, you'd make a fetch call to GoHighLevel API
        } catch (error) {
            console.error('Error sending to GoHighLevel:', error);
        }
    }
    
    // Handle form submission
    const form = document.getElementById('report-form');
    const birthPlaceInput = document.getElementById('birthplace');
    const birthStateInput = document.getElementById('birth-state');
    const birthCountryInput = document.getElementById('birth-country');
    const placeSuggestions = document.getElementById('placeSuggestions');
    
    // Set up place search with Nominatim API
    if (birthPlaceInput) {
        let debounceTimeout;
        
        birthPlaceInput.addEventListener('input', function() {
            clearTimeout(debounceTimeout);
            
            const loaderElement = document.getElementById('birthplaceLoader');
            
            if (this.value.length < 3) {
                placeSuggestions.style.display = 'none';
                if (loaderElement) loaderElement.classList.remove('active');
                return;
            }
            
            debounceTimeout = setTimeout(() => {
                searchPlaces(this.value);
            }, 500);
        });
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', function(e) {
            if (e.target !== birthPlaceInput && e.target !== placeSuggestions) {
                placeSuggestions.style.display = 'none';
            }
        });
    }
    
    // Function to search for places using Nominatim API
    async function searchPlaces(query) {
        const loader = document.getElementById('birthplaceLoader');
        const suggestionsContainer = document.getElementById('placeSuggestions');
        
        if (!query || query.length < 3) {
            suggestionsContainer.style.display = 'none';
            if (loader) loader.classList.remove('active');
            return;
        }
        
        // Show loader
        if (loader) loader.classList.add('active');
        
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`);
            const data = await response.json();
            
            // Hide loader
            if (loader) loader.classList.remove('active');
            
            if (data.length === 0) {
                suggestionsContainer.style.display = 'none';
                return;
            }
            
            // Clear previous suggestions
            suggestionsContainer.innerHTML = '';
            
            // Create suggestion items
            data.forEach(place => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                
                // Create a simplified display name that's shorter
                let displayName = place.display_name;
                // Trim very long names on mobile
                if (window.innerWidth < 768 && displayName.length > 60) {
                    const parts = displayName.split(',');
                    if (parts.length > 3) {
                        // Keep only the city, state/region, and country
                        displayName = parts.slice(0, 1).concat(parts.slice(-2)).join(', ');
                    }
                }
                
                item.textContent = displayName;
                
                item.addEventListener('click', () => {
                    birthPlaceInput.value = place.display_name;
                    
                    // Extract state and country if available
                    if (place.address) {
                        if (place.address.state) {
                            birthStateInput.value = place.address.state;
                        } else if (place.address.county) {
                            // Fallback to county if state is not available
                            birthStateInput.value = place.address.county;
                        }
                        
                        if (place.address.country) {
                            birthCountryInput.value = place.address.country;
                        }
                    }
                    
                    // Store coordinates for later use
                    if (!document.getElementById('birth_latitude')) {
                        // Create hidden fields if they don't exist
                        const latField = document.createElement('input');
                        latField.type = 'hidden';
                        latField.id = 'birth_latitude';
                        latField.name = 'birth_latitude';
                        
                        const lonField = document.createElement('input');
                        lonField.type = 'hidden';
                        lonField.id = 'birth_longitude';
                        lonField.name = 'birth_longitude';
                        
                        form.appendChild(latField);
                        form.appendChild(lonField);
                    }
                    
                    document.getElementById('birth_latitude').value = place.lat || '';
                    document.getElementById('birth_longitude').value = place.lon || '';
                    
                    // Hide suggestions
                    suggestionsContainer.style.display = 'none';
                });
                
                suggestionsContainer.appendChild(item);
            });
            
            // Show suggestions
            suggestionsContainer.style.display = 'block';
            
        } catch (error) {
            console.error('Error searching places:', error);
            if (loader) loader.classList.remove('active');
            suggestionsContainer.style.display = 'none';
        }
    }
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const countryCode = document.getElementById('country-code').value;
            const phone = document.getElementById('phone').value;
            const dob = document.getElementById('dob').value;
            const birthTime = document.getElementById('birth-time').value;
            const gender = document.getElementById('gender').value;
            const birthPlace = birthPlaceInput.value;
            const birthState = birthStateInput.value;
            const birthCountry = birthCountryInput.value;
            const marketingConsent = document.getElementById('marketing-consent').checked;
            
            // Form validation
            if (!name || !email || !phone || !dob || !birthTime || !gender || !birthPlace) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Validate consent checkbox
            if (!marketingConsent) {
                alert('Please agree to the marketing consent to continue.');
                return;
            }
            
            // Show loading state
            const submitButton = form.querySelector('.btn-primary');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating Report...';
            submitButton.disabled = true;
            
            try {
                // Get coordinates from address
                const coordinates = await getCoordinates(birthPlace);
                
                if (!coordinates) {
                    throw new Error('Could not get coordinates for the provided location');
                }
                
                // Prepare API request data
                const apiData = {
                    full_name: name,
                    email: email,
                    date_of_birth: dob,
                    time_of_birth: birthTime,
                    state: birthState,
                    country: birthCountry,
                    gender: gender,
                    address: birthPlace,
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                    reportType: 'Short'
                };
                
                // Make API call to generate report
                const response = await fetch('https://admin.soulfulevolution.com/api/webhook', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(apiData)
                });
                
                const result = await response.json();
                
                if (!response.ok) {
                    if (response.status === 400 && result.message && result.message.includes('already generated a report in the last 6 months')) {
                        showQuotaExhaustionModal();
                        return;
                    }
                    throw new Error(result.message || 'Failed to generate report');
                }
                
                // Send to GoHighLevel in parallel
                sendToGoHighLevel({
                    firstName: name.split(' ')[0] || '', 
                    lastName: name.split(' ').slice(1).join(' ') || '',
                    email: email,
                    phone: countryCode + phone,
                    dateOfBirth: dob,
                    source: "coldpagesoulful",
                    tags: ["psychic-reading-lead", "website-form-submission", "soulsync-lead"],
                    customField: {
                        "Time of Birth": birthTime || '',
                        "Place of Birth": birthPlace || '',
                        "Gender": gender || ''
                    }
                });
                
                // Show success popup
                showSuccessPopup();
                
            } catch (error) {
                // Show error message
                alert('Error: ' + error.message);
            } finally {
                // Restore button state
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
                
                // Reset form
                form.reset();
                birthStateInput.value = '';
                birthCountryInput.value = '';
            }
        });
    }
    
    // Enhanced Video player functionality
    const video = document.getElementById('hero-video');
    const playButton = document.getElementById('play-button');
    const soundButton = document.getElementById('sound-button');
    
    if (video && playButton && soundButton) {
        // Remove default controls initially
        video.controls = false;
        
        // Always start muted and autoplay visually
        video.muted = true;
        video.loop = true;
        video.playsInline = true; // Important for iOS
        
        // Force video to play muted immediately after load 
        video.addEventListener('loadedmetadata', function() {
            playVideoBackground();
        });
        
        // Also try on canplay event
        video.addEventListener('canplay', function() {
            playVideoBackground();
        });
        
        // Function to attempt background playback
        function playVideoBackground() {
            const playPromise = video.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Autoplay prevented, trying again...");
                    // Try again after a short delay
                    setTimeout(() => {
                        video.play().catch(e => console.log("Still couldn't autoplay"));
                    }, 300);
                });
            }
        }
        
        // Attempt immediate play as well
        playVideoBackground();
        
        // Handle play button click - restart with sound
        playButton.addEventListener('click', function() {
            video.muted = false;
            video.currentTime = 0;
            video.controls = true;
            video.play();
            
            // Hide overlays once video is playing with sound
            playButton.style.display = 'none';
            soundButton.style.display = 'none';
        });
        
        // Handle sound button click - same as play button
        soundButton.addEventListener('click', function() {
            video.muted = false;
            video.currentTime = 0;
            video.controls = true;
            video.play();
            
            // Hide overlays once video is playing with sound
            playButton.style.display = 'none';
            soundButton.style.display = 'none';
        });
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Add special animation to the CTA button
    const ctaButton = document.querySelector('.btn-primary');
    if (ctaButton) {
        // Add pulse animation
        setInterval(() => {
            ctaButton.classList.add('pulse');
            setTimeout(() => {
                ctaButton.classList.remove('pulse');
            }, 1000);
        }, 6000);
        
        // Add hover effect handling
        ctaButton.addEventListener('mouseover', function() {
            this.classList.add('hover');
        });
        
        ctaButton.addEventListener('mouseout', function() {
            this.classList.remove('hover');
        });
    }
    
    // Add rating stars functionality
    const ratingStars = document.querySelectorAll('.ratings .star');
    if (ratingStars.length > 0) {
        ratingStars.forEach((star, index) => {
            star.addEventListener('mouseover', () => {
                // Fill stars up to and including the hovered star
                for (let i = 0; i <= index; i++) {
                    ratingStars[i].classList.add('star-filled');
                }
            });
            
            star.addEventListener('mouseout', () => {
                // Remove filled state from all stars
                ratingStars.forEach(s => s.classList.remove('star-filled'));
            });
            
            star.addEventListener('click', () => {
                // Set the rating
                const ratingValue = index + 1;
                console.log('Rating set to:', ratingValue);
                
                // You could send this to your backend or store it locally
                localStorage.setItem('userRating', ratingValue);
                
                // Visual feedback
                for (let i = 0; i <= index; i++) {
                    ratingStars[i].classList.add('star-filled');
                    ratingStars[i].classList.add('star-selected');
                }
                
                for (let i = index + 1; i < ratingStars.length; i++) {
                    ratingStars[i].classList.remove('star-filled');
                    ratingStars[i].classList.remove('star-selected');
                }
            });
        });
    }
    
    // Mobile menu handling
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            mobileMenuButton.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
                mobileMenu.classList.remove('active');
                mobileMenuButton.classList.remove('active');
            }
        });
    }
    
    // Add additional form validation for email
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const email = this.value;
            if (email && !isValidEmail(email)) {
                this.classList.add('error');
                const errorMsg = document.createElement('p');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'Please enter a valid email address';
                
                // Remove any existing error message
                const existingError = this.parentNode.querySelector('.error-message');
                if (existingError) {
                    existingError.remove();
                }
                
                this.parentNode.appendChild(errorMsg);
            } else {
                this.classList.remove('error');
                const existingError = this.parentNode.querySelector('.error-message');
                if (existingError) {
                    existingError.remove();
                }
            }
        });
    }
    
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    // Handle phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Remove all non-numeric characters
            let phoneNumber = this.value.replace(/\D/g, '');
            
            // Format the phone number
            if (phoneNumber.length > 0) {
                // Different formats based on length
                if (phoneNumber.length <= 3) {
                    this.value = phoneNumber;
                } else if (phoneNumber.length <= 6) {
                    this.value = phoneNumber.slice(0, 3) + '-' + phoneNumber.slice(3);
                } else {
                    this.value = phoneNumber.slice(0, 3) + '-' + phoneNumber.slice(3, 6) + '-' + phoneNumber.slice(6, 10);
                }
            }
        });
    }
    
    // Countdown Timer for specific date (June 7th, 2025 at 8 AM EST)
    function updateCountdown() {
        const eventDate = new Date('June 7, 2025 08:00:00 EST');
        
        const now = new Date().getTime();
        const distance = eventDate - now;
        
        // If past the event date
        if (distance < 0) {
            document.getElementById("days").innerHTML = '00';
            document.getElementById("hours").innerHTML = '00';
            document.getElementById("minutes").innerHTML = '00';
            document.getElementById("seconds").innerHTML = '00';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        const daysElement = document.getElementById("days");
        const hoursElement = document.getElementById("hours");
        const minutesElement = document.getElementById("minutes");
        const secondsElement = document.getElementById("seconds");
        
        if (daysElement && hoursElement && minutesElement && secondsElement) {
            daysElement.innerHTML = days.toString().padStart(2, '0');
            hoursElement.innerHTML = hours.toString().padStart(2, '0');
            minutesElement.innerHTML = minutes.toString().padStart(2, '0');
            secondsElement.innerHTML = seconds.toString().padStart(2, '0');
            
            // Add pulse animation to highlight urgency when less than 7 days
            if (days < 7) {
                document.querySelectorAll('.countdown-number').forEach(el => {
                    el.classList.add('pulse-animation');
                });
            }
        }
    }
    
    // Start countdown if elements exist
    if (document.getElementById("days")) {
        setInterval(updateCountdown, 1000);
        updateCountdown();
    }
    
    // Testimonial Carousel
    const testimonials = document.querySelectorAll('.testimonial');
    const dots = document.querySelectorAll('.carousel-dot');
    const container = document.querySelector('.testimonial-container');
    const prevButton = document.getElementById('prev-testimonial');
    const nextButton = document.getElementById('next-testimonial');
    
    if (container && testimonials.length > 0) {
        let currentSlide = 0;
        let autoplayInterval;
        
        function showSlide(index) {
            if (index >= testimonials.length) {
                currentSlide = 0;
            } else if (index < 0) {
                currentSlide = testimonials.length - 1;
            } else {
                currentSlide = index;
            }
            
            container.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            // Update dots
            if (dots.length > 0) {
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === currentSlide);
                });
            }
        }
        
        // Set up event listeners if elements exist
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                showSlide(currentSlide + 1);
                
                // Reset autoplay timer when user interacts
                clearInterval(autoplayInterval);
                startAutoplay();
            });
        }
        
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                showSlide(currentSlide - 1);
                
                // Reset autoplay timer when user interacts
                clearInterval(autoplayInterval);
                startAutoplay();
            });
        }
        
        // Allow clicking on dots to navigate
        if (dots.length > 0) {
            dots.forEach((dot, i) => {
                dot.addEventListener('click', () => {
                    showSlide(i);
                    
                    // Reset autoplay timer when user interacts
                    clearInterval(autoplayInterval);
                    startAutoplay();
                });
            });
        }
        
        // Start autoplay function
        function startAutoplay() {
            autoplayInterval = setInterval(() => {
                showSlide(currentSlide + 1);
            }, 5000);
        }
        
        // Initialize autoplay
        startAutoplay();
        
        // Pause autoplay when hovering over the carousel
        container.addEventListener('mouseenter', () => {
            clearInterval(autoplayInterval);
        });
        
        // Resume autoplay when mouse leaves
        container.addEventListener('mouseleave', () => {
            startAutoplay();
        });
    }
    
    // Sticky CTA on scroll with improved behavior
    const stickyCta = document.getElementById('sticky-cta');
    const registrationSection = document.getElementById('registration');
    
    if (stickyCta && registrationSection) {
        let lastScrollTop = 0;
        let scrollingDown = true;
        
        window.addEventListener('scroll', () => {
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;
            const registrationPosition = registrationSection.offsetTop;
            
            // Determine scroll direction
            scrollingDown = scrollPosition > lastScrollTop;
            lastScrollTop = scrollPosition;
            
            // Show sticky CTA when scrolled past hero section, hide when near registration form
            // Also show when scrolling up from any position except near the top
            if ((scrollPosition > windowHeight && scrollPosition < (registrationPosition - 200)) || 
                (!scrollingDown && scrollPosition > windowHeight * 0.5)) {
                stickyCta.classList.add('visible');
            } else {
                stickyCta.classList.remove('visible');
            }
        });
    }
    
    // Animation on scroll
    const animateElements = document.querySelectorAll('.icon-item, .timeline-item');
    
    function checkIfInView() {
        animateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('fade-in');
            }
        });
    }
    
    window.addEventListener('scroll', checkIfInView);
    checkIfInView();
    
    // Chat functionality
    const chatButton = document.getElementById('chat-button');
    const chatModal = document.getElementById('chat-modal');
    const closeChat = document.getElementById('close-chat');
    const chatInput = document.getElementById('chat-input-field');
    const sendMessage = document.getElementById('send-message');
    const chatMessages = document.getElementById('chat-messages');
    
    if (chatButton && chatModal) {
        // Toggle chat modal
        chatButton.addEventListener('click', () => {
            chatModal.classList.toggle('active');
            chatButton.classList.toggle('hidden');
            
            // Focus on input field when opening
            if (chatModal.classList.contains('active')) {
                chatInput.focus();
            }
        });
        
        // Close chat
        closeChat.addEventListener('click', () => {
            chatModal.classList.remove('active');
            chatButton.classList.remove('hidden');
        });
        
        // Send message function
        function sendChatMessage() {
            const message = chatInput.value.trim();
            
            if (message) {
                // Add user message
                const userMsg = document.createElement('div');
                userMsg.className = 'message sent';
                userMsg.innerHTML = `<p>${message}</p>`;
                chatMessages.appendChild(userMsg);
                
                // Clear input
                chatInput.value = '';
                
                // Scroll to bottom
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
                // Simulate agent response after delay
                setTimeout(() => {
                    // Show typing indicator
                    const typingIndicator = document.createElement('div');
                    typingIndicator.className = 'typing-indicator';
                    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
                    chatMessages.appendChild(typingIndicator);
                    
                    // Scroll to see typing indicator
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                    
                    // Remove typing indicator and add response after delay
                    setTimeout(() => {
                        typingIndicator.remove();
                        
                        // Add automated response based on message content
                        let response = '';
                        if (message.toLowerCase().includes('register') || message.toLowerCase().includes('sign up')) {
                            response = 'You can register by filling out the form at the bottom of the page. It only takes a minute!';
                        } else if (message.toLowerCase().includes('time') || message.toLowerCase().includes('date')) {
                            response = 'The Live On Purpose event is on June 7th, 2025 at 8:00 AM EST. Make sure to mark your calendar!';
                        } else if (message.toLowerCase().includes('cost') || message.toLowerCase().includes('price') || message.toLowerCase().includes('fee')) {
                            response = 'The event is completely free! We believe in giving value first.';
                        } else if (message.toLowerCase().includes('recording') || message.toLowerCase().includes('replay')) {
                            response = 'This is a live-only experience. The SoulSync AI™ report is only unlocked for live attendees.';
                        } else if (message.toLowerCase().includes('soulsync') || message.toLowerCase().includes('report')) {
                            response = 'The SoulSync AI™ report is a personalized soul map based on 2,000+ years of astrological wisdom and 1.5M+ planetary calculations. Everyone who attends the full event gets access for free!';
                        } else {
                            response = 'Thanks for reaching out! If you have any specific questions about the event, please let me know. Otherwise, we hope to see you on June 7th!';
                        }
                        
                        const botMsg = document.createElement('div');
                        botMsg.className = 'message received';
                        botMsg.innerHTML = `<p>${response}</p>`;
                        chatMessages.appendChild(botMsg);
                        
                        // Scroll to bottom again
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }, 1500);
                }, 500);
            }
        }
        
        // Send message on button click
        sendMessage.addEventListener('click', sendChatMessage);
        
        // Send message on Enter key
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
    
    // Button pulse animation
    const pulseButtons = document.querySelectorAll('.pulse-animation');
    
    if (pulseButtons.length > 0) {
        pulseButtons.forEach(button => {
            // Apply pulse animation every 3 seconds
            setInterval(() => {
                button.classList.add('pulse');
                
                // Remove class after animation completes
                setTimeout(() => {
                    button.classList.remove('pulse');
                }, 1000);
            }, 5000);
        });
    }
}); 