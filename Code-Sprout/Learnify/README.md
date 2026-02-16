# Learnify - Learning that doesn't feel like learning

A single-page learning web application built with vanilla HTML, CSS, and JavaScript. No frameworks, no build tools, no server required - just open `index.html` and start learning!
[![Live Demo](https://img.shields.io/badge/Live-Demo-000000?style=for-the-badge&logo=vercel&logoColor=blue)](https://learnify-ivory-omega.vercel.app)

## 🚀 Quick Start

1. Download or clone this repository
2. Open `index.html` in any modern web browser
3. Start learning with typing tests, quizzes, and flashcards!

## ✨ Features Implemented

### Core Modules ✅
- **Typing Speed Test**: Real-time WPM and accuracy calculation with character highlighting
- **Quiz Mode**: Multiple-choice questions with immediate feedback option
- **Flashcards**: Interactive cards with flip animations and custom deck creation

### Gamification & Profile ✅
- **Local Leaderboard**: Top scores saved per module
- **Badge System**: Achievements for Fast Typer, Quiz Master, Streak Master, and Dedicated Learner
- **Study Streak**: Tracks consecutive days of activity
- **Profile Panel**: View stats, badges, and leaderboard

### UI & Accessibility ✅
- **Dark/Light Mode**: Toggle with persistence
- **Responsive Design**: Mobile-first approach
- **Keyboard Navigation**: Full keyboard accessibility
- **Semantic HTML**: Proper ARIA labels and roles
- **Smooth Animations**: CSS transitions and card flip effects

### Data Persistence ✅
- **localStorage**: All user data persists locally
- **Custom Flashcards**: Create, edit, and delete custom decks
- **Score History**: Leaderboards with name, score, and date
- **Settings**: Theme and preferences saved

## 🎮 How to Use

### Typing Speed Test
1. Select time limit (15s, 30s, or 60s)
2. Start typing the displayed passage
3. Watch real-time WPM and accuracy updates
4. Save your score to the leaderboard

**Keyboard Shortcuts:**
- `Esc` - End current test
- `F5` - Reset test

### Quiz Mode
1. Choose a category (General Knowledge or Science & Technology)
2. Optionally enable immediate feedback
3. Answer multiple-choice questions
4. View results and save your score

**Keyboard Shortcuts:**
- `1-4` - Select answer choice
- `Enter` - Next question
- `Esc` - Exit quiz

### Flashcards
1. Select a deck or create a custom one
2. Study cards with flip animations
3. Navigate with controls or keyboard
4. Edit or delete custom decks

**Keyboard Shortcuts:**
- `Space/Enter` - Flip card
- `←/→` - Navigate cards
- `Ctrl+S` - Shuffle deck
- `Esc` - Back to deck selection

## 🏆 Achievements

Earn badges by completing various activities:
- **⚡ Fast Typer**: Type 60+ WPM
- **🧠 Quiz Master**: Score 100% on any quiz
- **🔥 Streak Master**: Maintain a 7-day learning streak
- **📚 Dedicated Learner**: Complete 10+ activities

## 🔧 Technical Details

### Architecture
- **Modular JavaScript**: ES6 modules for clean code organization
- **Storage Manager**: Centralized localStorage handling
- **UI Manager**: Theme and interaction management
- **No Dependencies**: Pure vanilla JavaScript, HTML, and CSS

### Browser Compatibility
- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers supported

### File Structure
```
Learnify/
├── index.html              # Main application file
├── styles.css              # All styles with CSS variables
├── js/
│   ├── app.js              # Main application controller
│   ├── storage.js          # localStorage management
│   ├── ui.js               # UI utilities and theme handling
│   ├── typing.js           # Typing speed test module
│   ├── quiz.js             # Quiz module
│   └── flashcards.js       # Flashcards module
├── assets/                 # (Empty - ready for images/icons)
├── README.md               # This file
└── demo-instructions.txt   # Demo walkthrough
```

## 🧪 Testing Completed

Manual acceptance tests performed:
- ✅ All modules accessible from dashboard
- ✅ Typing WPM/accuracy calculations correct
- ✅ Backspace and caret behavior working
- ✅ Quiz answers and scoring functional
- ✅ Flashcard flip animations working
- ✅ Custom cards persist in localStorage
- ✅ Leaderboard saves and clears properly
- ✅ Streak updates with daily activity
- ✅ Dark mode persists across sessions
- ✅ Keyboard navigation fully functional
- ✅ No console errors when running locally

## 💾 Data Management

### Reset All Data
Use the "Reset All Data" button in the profile panel to clear all stored information.

### Manual Reset
If needed, you can manually clear data by opening browser developer tools and running:
```javascript
localStorage.clear();
```

## 🎯 Sample Data Included

- **5+ Typing Passages**: Literature excerpts and pangrams
- **10 Quiz Questions**: Across General Knowledge and Science categories
- **3 Sample Flashcard Decks**: Vocabulary, Spanish Basics, and Science Facts

## 🌟 Optional Features Added

- **Smooth Animations**: Card flips, progress bars, and transitions
- **Notification System**: Success/error messages
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Responsive Design**: Works on all screen sizes
- **Accessibility**: ARIA labels, focus management, screen reader support

## 🔒 Privacy & Security

- **No External Dependencies**: Runs completely offline
- **Local Storage Only**: No data sent to external servers
- **No eval() Usage**: Secure JavaScript implementation
- **XSS Prevention**: Proper content sanitization

## 📱 Mobile Support

Fully responsive design with:
- Touch-friendly interface
- Mobile-optimized layouts
- Swipe gestures for flashcards
- Adaptive font sizes

---

**Ready for hackathon demo!** 🎉

Open `index.html` and explore all features. Check `demo-instructions.txt` for a guided walkthrough of key features.