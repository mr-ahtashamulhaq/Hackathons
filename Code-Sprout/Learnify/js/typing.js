// Typing speed test module with real-time WPM and accuracy calculation
export class TypingTest {
    constructor(storage) {
        this.storage = storage;
        this.passages = [
            "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet and is commonly used for typing practice.",
            "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat.",
            "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity.",
            "To be or not to be, that is the question. Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles.",
            "All happy families are alike; each unhappy family is unhappy in its own way. Everything was in confusion in the Oblonskys' house. The wife had discovered that the husband was carrying on an intrigue with a French girl.",
            "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.",
            "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood."
        ];
        
        this.currentPassage = '';
        this.currentIndex = 0;
        this.startTime = null;
        this.endTime = null;
        this.isActive = false;
        this.timeLimit = 15; // seconds
        this.timer = null;
        this.timeRemaining = 0;
        
        this.correctChars = 0;
        this.totalChars = 0;
        this.errors = 0;
    }

    init() {
        this.setupEventListeners();
        this.loadNewPassage();
    }

    setupEventListeners() {
        // Time selector buttons
        document.querySelectorAll('.btn-time').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active button
                document.querySelectorAll('.btn-time').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Set time limit
                this.timeLimit = parseInt(btn.dataset.time);
                this.resetTest();
            });
        });

        // Typing input
        const typingInput = document.getElementById('typing-input');
        typingInput.addEventListener('input', (e) => this.handleInput(e));
        typingInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        typingInput.addEventListener('paste', (e) => e.preventDefault()); // Prevent paste

        // Results actions
        document.getElementById('save-score').addEventListener('click', () => this.saveScore());
        document.getElementById('retry-typing').addEventListener('click', () => this.resetTest());
    }

    loadNewPassage() {
        // Select random passage
        const randomIndex = Math.floor(Math.random() * this.passages.length);
        this.currentPassage = this.passages[randomIndex];
        
        // Display passage
        this.displayPassage();
        
        // Reset state
        this.currentIndex = 0;
        this.correctChars = 0;
        this.totalChars = 0;
        this.errors = 0;
        this.isActive = false;
        this.startTime = null;
        this.endTime = null;
        this.timeRemaining = this.timeLimit;
        
        // Update display
        this.updateStats();
        
        // Clear and focus input
        const typingInput = document.getElementById('typing-input');
        typingInput.value = '';
        typingInput.disabled = false;
        typingInput.focus();
    }

    displayPassage() {
        const passageDisplay = document.getElementById('passage-display');
        passageDisplay.innerHTML = this.currentPassage
            .split('')
            .map((char, index) => `<span class="char" data-index="${index}">${char === ' ' ? '&nbsp;' : char}</span>`)
            .join('');
    }

    handleInput(e) {
        if (!this.isActive) {
            this.startTest();
        }

        const input = e.target.value;
        this.updatePassageDisplay(input);
        this.updateStats();
    }

    handleKeyDown(e) {
        // Prevent certain keys that could interfere
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'v' || e.key === 'c' || e.key === 'x') {
                e.preventDefault();
            }
        }
    }

    startTest() {
        this.isActive = true;
        this.startTime = Date.now();
        this.timeRemaining = this.timeLimit;
        
        // Start countdown timer
        this.timer = setInterval(() => {
            this.timeRemaining--;
            document.getElementById('time-display').textContent = this.timeRemaining;
            
            if (this.timeRemaining <= 0) {
                this.endTest();
            }
        }, 1000);

        // Record activity
        if (window.learnifyApp) {
            window.learnifyApp.recordActivity();
        }
    }

    endTest() {
        this.isActive = false;
        this.endTime = Date.now();
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Disable input
        document.getElementById('typing-input').disabled = true;
        
        // Show results
        this.showResults();
    }

    updatePassageDisplay(input) {
        const chars = document.querySelectorAll('.char');
        this.currentIndex = input.length;
        this.totalChars = input.length;
        this.correctChars = 0;
        this.errors = 0;
        
        chars.forEach((char, index) => {
            char.className = 'char';
            
            if (index < input.length) {
                const inputChar = input[index];
                const passageChar = this.currentPassage[index];
                
                if (inputChar === passageChar) {
                    char.classList.add('char-correct');
                    this.correctChars++;
                } else {
                    char.classList.add('char-incorrect');
                    this.errors++;
                }
            } else if (index === input.length) {
                char.classList.add('char-current');
            }
        });
    }

    calculateWPM() {
        if (!this.startTime) return 0;
        
        const timeElapsed = this.isActive 
            ? (Date.now() - this.startTime) / 1000 / 60 // minutes
            : (this.endTime - this.startTime) / 1000 / 60;
        
        if (timeElapsed === 0) return 0;
        
        // Standard WPM calculation: (characters typed / 5) / minutes
        const wordsTyped = this.correctChars / 5;
        return Math.round(wordsTyped / timeElapsed);
    }

    calculateAccuracy() {
        if (this.totalChars === 0) return 100;
        return Math.round((this.correctChars / this.totalChars) * 100);
    }

    updateStats() {
        const wpm = this.calculateWPM();
        const accuracy = this.calculateAccuracy();
        
        document.getElementById('wpm-display').textContent = wpm;
        document.getElementById('accuracy-display').textContent = `${accuracy}%`;
        document.getElementById('time-display').textContent = this.timeRemaining;
    }

    showResults() {
        const wpm = this.calculateWPM();
        const accuracy = this.calculateAccuracy();
        
        // Update results display
        document.getElementById('final-wpm').textContent = wpm;
        document.getElementById('final-accuracy').textContent = `${accuracy}%`;
        
        // Show results panel
        document.getElementById('typing-results').classList.remove('hidden');
        
        // Focus name input
        document.getElementById('player-name').focus();
    }

    saveScore() {
        const nameInput = document.getElementById('player-name');
        const name = nameInput.value.trim();
        
        if (!name) {
            alert('Please enter your name to save the score.');
            nameInput.focus();
            return;
        }
        
        const wpm = this.calculateWPM();
        const accuracy = this.calculateAccuracy();
        
        // Save to storage
        this.storage.addTypingScore({
            name: name,
            wpm: wpm,
            accuracy: accuracy,
            timeLimit: this.timeLimit,
            errors: this.errors,
            totalChars: this.totalChars
        });
        
        // Check for badges
        if (window.learnifyApp) {
            window.learnifyApp.checkAndAwardBadges();
        }
        
        // Show success message
        alert(`Score saved! ${wpm} WPM with ${accuracy}% accuracy.`);
        
        // Reset for next test
        this.resetTest();
    }

    resetTest() {
        // Clear timer
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Hide results
        document.getElementById('typing-results').classList.add('hidden');
        
        // Clear name input
        document.getElementById('player-name').value = '';
        
        // Load new passage
        this.loadNewPassage();
    }

    // Keyboard accessibility
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            // Only handle if typing module is active
            if (!document.getElementById('typing-module').classList.contains('active')) {
                return;
            }
            
            switch (e.key) {
                case 'Escape':
                    if (this.isActive) {
                        this.endTest();
                    } else {
                        this.resetTest();
                    }
                    break;
                    
                case 'F5':
                    e.preventDefault();
                    this.resetTest();
                    break;
            }
        });
    }
}