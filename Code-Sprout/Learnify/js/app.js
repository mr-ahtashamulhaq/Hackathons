// Main application entry point
import { StorageManager } from './storage.js';
import { UIManager } from './ui.js';
import { TypingTest } from './typing.js';
import { QuizManager } from './quiz.js';
import { FlashcardManager } from './flashcards.js';

class LearnifyApp {
    constructor() {
        this.storage = new StorageManager();
        this.ui = new UIManager();
        this.typing = new TypingTest(this.storage);
        this.quiz = new QuizManager(this.storage);
        this.flashcards = new FlashcardManager(this.storage);
        
        this.init();
    }

    init() {
        // Initialize UI theme
        this.ui.initTheme();
        
        // Set up navigation
        this.setupNavigation();
        
        // Initialize modules
        this.typing.init();
        this.quiz.init();
        this.flashcards.init();
        
        // Update dashboard stats
        this.updateDashboard();
        
        // Set up profile panel
        this.setupProfile();
        
        // Update streak on app load
        this.updateStreak();
    }

    setupNavigation() {
        // Module navigation
        document.querySelectorAll('.module-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const module = card.dataset.module;
                this.showModule(module);
            });
        });

        // Back buttons
        document.querySelectorAll('.btn-back').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = btn.dataset.back;
                if (target === 'dashboard') {
                    this.showDashboard();
                } else {
                    this.showModule(target);
                }
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.ui.toggleTheme();
        });

        // Profile toggle
        document.getElementById('profile-toggle').addEventListener('click', () => {
            this.ui.toggleProfile();
        });

        document.getElementById('close-profile').addEventListener('click', () => {
            this.ui.toggleProfile();
        });

        // Data reset
        document.getElementById('reset-data').addEventListener('click', () => {
            this.resetAllData();
        });
    }

    showModule(moduleName) {
        // Hide all sections
        document.querySelectorAll('.module-section, .dashboard').forEach(section => {
            section.classList.remove('active');
        });

        // Show target module
        const targetModule = document.getElementById(`${moduleName}-module`);
        if (targetModule) {
            targetModule.classList.add('active');
        }
    }

    showDashboard() {
        // Hide all sections
        document.querySelectorAll('.module-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show dashboard
        document.getElementById('dashboard').classList.add('active');
        
        // Update dashboard stats
        this.updateDashboard();
    }

    updateDashboard() {
        // Update streak display
        const streak = this.storage.getStreak();
        document.getElementById('streak-display').textContent = streak;

        // Update badges count
        const badges = this.storage.getBadges();
        const earnedBadges = badges.filter(badge => badge.earned).length;
        document.getElementById('badges-count').textContent = earnedBadges;
    }

    updateStreak() {
        const today = new Date().toDateString();
        const lastActivity = this.storage.getLastActivity();
        
        if (lastActivity !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastActivity === yesterday.toDateString()) {
                // Continue streak
                this.storage.incrementStreak();
            } else if (lastActivity !== today) {
                // Reset streak if more than a day has passed
                this.storage.resetStreak();
            }
        }
    }

    recordActivity() {
        const today = new Date().toDateString();
        this.storage.setLastActivity(today);
        this.updateStreak();
        this.updateDashboard();
    }

    setupProfile() {
        // Leaderboard tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all tabs
                document.querySelectorAll('.tab-btn').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // Add active class to clicked tab
                btn.classList.add('active');
                
                // Show corresponding leaderboard
                this.showLeaderboard(btn.dataset.tab);
            });
        });

        // Initialize with typing leaderboard
        this.showLeaderboard('typing');
        this.showBadges();
    }

    showLeaderboard(type) {
        const container = document.getElementById('leaderboard-content');
        const scores = this.storage.getLeaderboard(type);
        
        if (scores.length === 0) {
            container.innerHTML = '<p class="text-center" style="color: var(--text-secondary); padding: 1rem;">No scores yet</p>';
            return;
        }

        container.innerHTML = scores.map((score, index) => `
            <div class="leaderboard-entry">
                <span class="leaderboard-rank">#${index + 1}</span>
                <span class="leaderboard-name">${score.name}</span>
                <span class="leaderboard-score">${score.score} ${score.metric}</span>
            </div>
        `).join('');
    }

    showBadges() {
        const container = document.getElementById('badges-container');
        const badges = this.storage.getBadges();
        
        container.innerHTML = badges.map(badge => `
            <div class="badge ${badge.earned ? 'earned' : ''}">
                <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">${badge.icon}</div>
                <div style="font-size: 0.75rem;">${badge.name}</div>
            </div>
        `).join('');
    }

    checkAndAwardBadges() {
        const badges = this.storage.getBadges();
        const typingScores = this.storage.getLeaderboard('typing');
        const quizScores = this.storage.getLeaderboard('quiz');
        const streak = this.storage.getStreak();
        
        let newBadges = false;

        // Fast Typer badge (WPM >= 60)
        if (!badges[0].earned && typingScores.some(score => score.score >= 60)) {
            badges[0].earned = true;
            newBadges = true;
        }

        // Quiz Master badge (100% on any quiz)
        if (!badges[1].earned && quizScores.some(score => score.score.includes('100%'))) {
            badges[1].earned = true;
            newBadges = true;
        }

        // Streak Master badge (7+ day streak)
        if (!badges[2].earned && streak >= 7) {
            badges[2].earned = true;
            newBadges = true;
        }

        // Dedicated Learner badge (10+ activities)
        const totalActivities = typingScores.length + quizScores.length;
        if (!badges[3].earned && totalActivities >= 10) {
            badges[3].earned = true;
            newBadges = true;
        }

        if (newBadges) {
            this.storage.setBadges(badges);
            this.showBadges();
            this.updateDashboard();
        }
    }

    resetAllData() {
        if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
            this.storage.clearAll();
            this.updateDashboard();
            this.showLeaderboard('typing');
            this.showBadges();
            alert('All data has been reset.');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.learnifyApp = new LearnifyApp();
});

export { LearnifyApp };