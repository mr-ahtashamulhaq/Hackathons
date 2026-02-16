// UI management for theme, responsive behavior, and common interactions
export class UIManager {
    constructor() {
        this.currentTheme = 'light';
        this.profileOpen = false;
    }

    initTheme() {
        // Get saved theme or default to light
        const savedTheme = localStorage.getItem('learnify_theme') || 'light';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update theme toggle icon
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
        
        // Save theme preference
        localStorage.setItem('learnify_theme', theme);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    toggleProfile() {
        const profilePanel = document.getElementById('profile-panel');
        this.profileOpen = !this.profileOpen;
        
        if (this.profileOpen) {
            profilePanel.classList.add('active');
            profilePanel.classList.remove('hidden');
        } else {
            profilePanel.classList.remove('active');
            // Add small delay before hiding to allow animation
            setTimeout(() => {
                if (!this.profileOpen) {
                    profilePanel.classList.add('hidden');
                }
            }, 300);
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            // Focus first input in modal
            const firstInput = modal.querySelector('input, textarea, button');
            if (firstInput) {
                firstInput.focus();
            }
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('hidden');
        }
    }

    hideElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('hidden');
        }
    }

    updateProgress(progressId, percentage) {
        const progressFill = document.getElementById(progressId);
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '9999',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        // Set background color based on type
        const colors = {
            info: '#3b82f6',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        // Add to DOM
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after duration
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : secs.toString();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Keyboard navigation helpers
    setupKeyboardNavigation(container, itemSelector, onSelect) {
        let currentIndex = 0;
        const items = container.querySelectorAll(itemSelector);
        
        if (items.length === 0) return;

        // Highlight first item
        items[0].classList.add('keyboard-focus');

        container.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    items[currentIndex].classList.remove('keyboard-focus');
                    currentIndex = (currentIndex + 1) % items.length;
                    items[currentIndex].classList.add('keyboard-focus');
                    items[currentIndex].scrollIntoView({ block: 'nearest' });
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    items[currentIndex].classList.remove('keyboard-focus');
                    currentIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
                    items[currentIndex].classList.add('keyboard-focus');
                    items[currentIndex].scrollIntoView({ block: 'nearest' });
                    break;
                    
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (onSelect) {
                        onSelect(items[currentIndex], currentIndex);
                    }
                    break;
            }
        });

        return {
            getCurrentItem: () => items[currentIndex],
            getCurrentIndex: () => currentIndex,
            setIndex: (index) => {
                if (index >= 0 && index < items.length) {
                    items[currentIndex].classList.remove('keyboard-focus');
                    currentIndex = index;
                    items[currentIndex].classList.add('keyboard-focus');
                }
            }
        };
    }

    // Animation helpers
    animateValue(element, start, end, duration = 1000) {
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = start + (end - start) * easeOut;
            
            element.textContent = Math.round(current);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    // Responsive helpers
    isMobile() {
        return window.innerWidth <= 768;
    }

    isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    }

    isDesktop() {
        return window.innerWidth > 1024;
    }

    // Accessibility helpers
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        // Add screen reader only styles
        Object.assign(announcement.style, {
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: '0',
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: '0'
        });
        
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            if (announcement.parentNode) {
                announcement.parentNode.removeChild(announcement);
            }
        }, 1000);
    }

    // Focus management
    trapFocus(container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        container.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
        
        // Focus first element
        firstElement.focus();
    }
}