// Local storage management for user data persistence
export class StorageManager {
    constructor() {
        this.keys = {
            THEME: 'learnify_theme',
            TYPING_SCORES: 'learnify_typing_scores',
            QUIZ_SCORES: 'learnify_quiz_scores',
            CUSTOM_DECKS: 'learnify_custom_decks',
            BADGES: 'learnify_badges',
            STREAK: 'learnify_streak',
            LAST_ACTIVITY: 'learnify_last_activity'
        };
        
        this.initializeDefaults();
    }

    initializeDefaults() {
        // Initialize badges if not exists
        if (!this.getBadges()) {
            const defaultBadges = [
                { id: 'fast_typer', name: 'Fast Typer', icon: '⚡', description: 'Type 60+ WPM', earned: false },
                { id: 'quiz_master', name: 'Quiz Master', icon: '🧠', description: 'Score 100% on a quiz', earned: false },
                { id: 'streak_master', name: 'Streak Master', icon: '🔥', description: 'Maintain 7-day streak', earned: false },
                { id: 'dedicated_learner', name: 'Dedicated Learner', icon: '📚', description: 'Complete 10+ activities', earned: false }
            ];
            this.setBadges(defaultBadges);
        }

        // Initialize streak if not exists
        if (this.getStreak() === null) {
            this.setStreak(0);
        }
    }

    // Generic storage methods
    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    getItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Storage error:', error);
            return null;
        }
    }

    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    // Theme management
    getTheme() {
        return this.getItem(this.keys.THEME) || 'light';
    }

    setTheme(theme) {
        return this.setItem(this.keys.THEME, theme);
    }

    // Typing scores management
    getTypingScores() {
        return this.getItem(this.keys.TYPING_SCORES) || [];
    }

    addTypingScore(score) {
        const scores = this.getTypingScores();
        scores.push({
            ...score,
            date: new Date().toISOString(),
            id: Date.now()
        });
        
        // Keep only top 10 scores
        scores.sort((a, b) => b.wpm - a.wpm);
        const topScores = scores.slice(0, 10);
        
        return this.setItem(this.keys.TYPING_SCORES, topScores);
    }

    // Quiz scores management
    getQuizScores() {
        return this.getItem(this.keys.QUIZ_SCORES) || [];
    }

    addQuizScore(score) {
        const scores = this.getQuizScores();
        scores.push({
            ...score,
            date: new Date().toISOString(),
            id: Date.now()
        });
        
        // Keep only top 10 scores
        scores.sort((a, b) => b.percentage - a.percentage);
        const topScores = scores.slice(0, 10);
        
        return this.setItem(this.keys.QUIZ_SCORES, topScores);
    }

    // Custom flashcard decks management
    getCustomDecks() {
        return this.getItem(this.keys.CUSTOM_DECKS) || [];
    }

    addCustomDeck(deck) {
        const decks = this.getCustomDecks();
        const newDeck = {
            ...deck,
            id: `custom_${Date.now()}`,
            created: new Date().toISOString()
        };
        decks.push(newDeck);
        this.setItem(this.keys.CUSTOM_DECKS, decks);
        return newDeck;
    }

    updateCustomDeck(deckId, updatedDeck) {
        const decks = this.getCustomDecks();
        const index = decks.findIndex(deck => deck.id === deckId);
        if (index !== -1) {
            decks[index] = { ...decks[index], ...updatedDeck };
            return this.setItem(this.keys.CUSTOM_DECKS, decks);
        }
        return false;
    }

    deleteCustomDeck(deckId) {
        const decks = this.getCustomDecks();
        const filteredDecks = decks.filter(deck => deck.id !== deckId);
        return this.setItem(this.keys.CUSTOM_DECKS, filteredDecks);
    }

    // Badges management
    getBadges() {
        return this.getItem(this.keys.BADGES);
    }

    setBadges(badges) {
        return this.setItem(this.keys.BADGES, badges);
    }

    // Streak management
    getStreak() {
        return this.getItem(this.keys.STREAK);
    }

    setStreak(streak) {
        return this.setItem(this.keys.STREAK, streak);
    }

    incrementStreak() {
        const currentStreak = this.getStreak() || 0;
        return this.setStreak(currentStreak + 1);
    }

    resetStreak() {
        return this.setStreak(0);
    }

    // Last activity tracking
    getLastActivity() {
        return this.getItem(this.keys.LAST_ACTIVITY);
    }

    setLastActivity(date) {
        return this.setItem(this.keys.LAST_ACTIVITY, date);
    }

    // Leaderboard data (unified view)
    getLeaderboard(type) {
        if (type === 'typing') {
            return this.getTypingScores().map(score => ({
                name: score.name,
                score: score.wpm,
                metric: 'WPM',
                date: score.date
            }));
        } else if (type === 'quiz') {
            return this.getQuizScores().map(score => ({
                name: score.name,
                score: `${score.correct}/${score.total} (${score.percentage}%)`,
                metric: '',
                date: score.date
            }));
        }
        return [];
    }

    // Clear all data
    clearAll() {
        Object.values(this.keys).forEach(key => {
            this.removeItem(key);
        });
        this.initializeDefaults();
    }

    // Export data (bonus feature)
    exportData() {
        const data = {};
        Object.entries(this.keys).forEach(([name, key]) => {
            data[name] = this.getItem(key);
        });
        return JSON.stringify(data, null, 2);
    }

    // Import data (bonus feature)
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            Object.entries(data).forEach(([name, value]) => {
                if (this.keys[name]) {
                    this.setItem(this.keys[name], value);
                }
            });
            return true;
        } catch (error) {
            console.error('Import error:', error);
            return false;
        }
    }
}