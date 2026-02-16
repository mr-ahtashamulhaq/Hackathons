// Quiz module with multiple categories and immediate feedback option
export class QuizManager {
    constructor(storage) {
        this.storage = storage;
        this.quizDecks = [
            {
                id: 'general',
                title: 'General Knowledge',
                description: 'Test your general knowledge',
                questions: [
                    {
                        id: 1,
                        question: "What is the capital of France?",
                        choices: ["London", "Berlin", "Paris", "Madrid"],
                        answerIndex: 2
                    },
                    {
                        id: 2,
                        question: "Which planet is known as the Red Planet?",
                        choices: ["Venus", "Mars", "Jupiter", "Saturn"],
                        answerIndex: 1
                    },
                    {
                        id: 3,
                        question: "What is the largest mammal in the world?",
                        choices: ["African Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
                        answerIndex: 1
                    },
                    {
                        id: 4,
                        question: "In which year did World War II end?",
                        choices: ["1944", "1945", "1946", "1947"],
                        answerIndex: 1
                    },
                    {
                        id: 5,
                        question: "What is the chemical symbol for gold?",
                        choices: ["Go", "Gd", "Au", "Ag"],
                        answerIndex: 2
                    },
                    {
                        id: 11,
                        question: "Which continent is the largest by area?",
                        choices: ["Africa", "Asia", "North America", "Europe"],
                        answerIndex: 1
                    },
                    {
                        id: 12,
                        question: "What is the longest river in the world?",
                        choices: ["Amazon", "Nile", "Mississippi", "Yangtze"],
                        answerIndex: 1
                    },
                    {
                        id: 13,
                        question: "Who painted the Mona Lisa?",
                        choices: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
                        answerIndex: 2
                    },
                    {
                        id: 14,
                        question: "What is the smallest country in the world?",
                        choices: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
                        answerIndex: 1
                    },
                    {
                        id: 15,
                        question: "Which ocean is the largest?",
                        choices: ["Atlantic", "Indian", "Arctic", "Pacific"],
                        answerIndex: 3
                    }
                ]
            },
            {
                id: 'science',
                title: 'Science & Technology',
                description: 'Challenge your scientific knowledge',
                questions: [
                    {
                        id: 6,
                        question: "What does DNA stand for?",
                        choices: ["Deoxyribonucleic Acid", "Dynamic Nuclear Acid", "Dual Nucleic Acid", "Deoxyribose Nucleic Acid"],
                        answerIndex: 0
                    },
                    {
                        id: 7,
                        question: "Which programming language was created by Guido van Rossum?",
                        choices: ["Java", "Python", "C++", "JavaScript"],
                        answerIndex: 1
                    },
                    {
                        id: 8,
                        question: "What is the speed of light in vacuum?",
                        choices: ["299,792,458 m/s", "300,000,000 m/s", "299,000,000 m/s", "301,000,000 m/s"],
                        answerIndex: 0
                    },
                    {
                        id: 9,
                        question: "Which element has the atomic number 1?",
                        choices: ["Helium", "Hydrogen", "Lithium", "Carbon"],
                        answerIndex: 1
                    },
                    {
                        id: 10,
                        question: "What does HTTP stand for?",
                        choices: ["HyperText Transfer Protocol", "High Transfer Text Protocol", "HyperText Transport Protocol", "High Text Transfer Protocol"],
                        answerIndex: 0
                    },
                    {
                        id: 16,
                        question: "What is the hardest natural substance on Earth?",
                        choices: ["Gold", "Iron", "Diamond", "Platinum"],
                        answerIndex: 2
                    },
                    {
                        id: 17,
                        question: "How many bones are in the adult human body?",
                        choices: ["206", "208", "210", "204"],
                        answerIndex: 0
                    },
                    {
                        id: 18,
                        question: "What gas makes up about 78% of Earth's atmosphere?",
                        choices: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
                        answerIndex: 2
                    },
                    {
                        id: 19,
                        question: "What is the powerhouse of the cell?",
                        choices: ["Nucleus", "Mitochondria", "Ribosome", "Cytoplasm"],
                        answerIndex: 1
                    },
                    {
                        id: 20,
                        question: "Which planet has the most moons?",
                        choices: ["Jupiter", "Saturn", "Neptune", "Uranus"],
                        answerIndex: 1
                    }
                ]
            }
        ];
        
        this.currentDeck = null;
        this.currentQuestions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.immediateFeedback = false;
        this.quizStartTime = null;
    }

    init() {
        this.setupEventListeners();
        this.displayCategories();
    }

    setupEventListeners() {
        // Quiz setup listeners will be added when categories are displayed
        document.getElementById('quiz-next').addEventListener('click', () => this.nextQuestion());
        document.getElementById('save-quiz-score').addEventListener('click', () => this.saveScore());
        document.getElementById('retry-quiz').addEventListener('click', () => this.resetQuiz());
    }

    displayCategories() {
        const categoryGrid = document.getElementById('category-grid');
        categoryGrid.innerHTML = this.quizDecks.map(deck => `
            <div class="category-card" data-deck-id="${deck.id}">
                <h3>${deck.title}</h3>
                <p>${deck.description}</p>
                <p class="category-count">${deck.questions.length} questions</p>
            </div>
        `).join('');

        // Add click listeners to category cards
        categoryGrid.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                // Remove previous selection
                categoryGrid.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
                
                // Select current card
                card.classList.add('selected');
                
                // Enable start button
                this.enableStartButton(card.dataset.deckId);
            });
        });
    }

    enableStartButton(deckId) {
        const categoryGrid = document.getElementById('category-grid');
        
        // Remove existing start button
        const existingButton = categoryGrid.querySelector('.start-quiz-btn');
        if (existingButton) {
            existingButton.remove();
        }
        
        // Add start button
        const startButton = document.createElement('button');
        startButton.className = 'btn btn-primary start-quiz-btn';
        startButton.textContent = 'Start Quiz';
        startButton.style.marginTop = '1rem';
        
        startButton.addEventListener('click', () => {
            this.immediateFeedback = document.getElementById('immediate-feedback').checked;
            this.startQuiz(deckId);
        });
        
        categoryGrid.appendChild(startButton);
    }

    startQuiz(deckId) {
        this.currentDeck = this.quizDecks.find(deck => deck.id === deckId);
        if (!this.currentDeck) return;
        
        // Shuffle questions and select random 5 for variety
        const shuffled = [...this.currentDeck.questions].sort(() => Math.random() - 0.5);
        this.currentQuestions = shuffled.slice(0, Math.min(5, shuffled.length));
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.quizStartTime = Date.now();
        
        // Hide setup, show game
        document.getElementById('quiz-setup').classList.add('hidden');
        document.getElementById('quiz-game').classList.remove('hidden');
        
        // Display first question
        this.displayQuestion();
        
        // Record activity
        if (window.learnifyApp) {
            window.learnifyApp.recordActivity();
        }
    }

    displayQuestion() {
        const question = this.currentQuestions[this.currentQuestionIndex];
        if (!question) return;
        
        // Update progress
        const progress = ((this.currentQuestionIndex + 1) / this.currentQuestions.length) * 100;
        document.getElementById('quiz-progress-fill').style.width = `${progress}%`;
        document.getElementById('quiz-progress-text').textContent = 
            `${this.currentQuestionIndex + 1} / ${this.currentQuestions.length}`;
        
        // Display question
        document.getElementById('question-text').textContent = question.question;
        
        // Display choices
        const choicesContainer = document.getElementById('choices-container');
        choicesContainer.innerHTML = question.choices.map((choice, index) => `
            <button class="choice-btn" data-choice-index="${index}">
                ${choice}
            </button>
        `).join('');
        
        // Add choice listeners
        choicesContainer.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectAnswer(parseInt(btn.dataset.choiceIndex)));
        });
        
        // Reset next button
        const nextBtn = document.getElementById('quiz-next');
        nextBtn.disabled = true;
        nextBtn.textContent = this.currentQuestionIndex === this.currentQuestions.length - 1 ? 'Finish Quiz' : 'Next';
        
        // Focus first choice for keyboard navigation
        choicesContainer.querySelector('.choice-btn').focus();
    }

    selectAnswer(choiceIndex) {
        const question = this.currentQuestions[this.currentQuestionIndex];
        const choicesContainer = document.getElementById('choices-container');
        const choiceBtns = choicesContainer.querySelectorAll('.choice-btn');
        
        // Clear previous selections
        choiceBtns.forEach(btn => {
            btn.classList.remove('selected', 'correct', 'incorrect');
        });
        
        // Mark selected choice
        choiceBtns[choiceIndex].classList.add('selected');
        
        // Store answer
        this.userAnswers[this.currentQuestionIndex] = choiceIndex;
        
        // Show immediate feedback if enabled
        if (this.immediateFeedback) {
            const correctIndex = question.answerIndex;
            
            // Show correct answer
            choiceBtns[correctIndex].classList.add('correct');
            
            // Show incorrect if wrong choice
            if (choiceIndex !== correctIndex) {
                choiceBtns[choiceIndex].classList.add('incorrect');
            }
            
            // Disable all choices
            choiceBtns.forEach(btn => btn.disabled = true);
        }
        
        // Enable next button
        document.getElementById('quiz-next').disabled = false;
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex >= this.currentQuestions.length) {
            this.finishQuiz();
        } else {
            this.displayQuestion();
        }
    }

    finishQuiz() {
        // Calculate results
        const results = this.calculateResults();
        
        // Hide game, show results
        document.getElementById('quiz-game').classList.add('hidden');
        document.getElementById('quiz-results').classList.remove('hidden');
        
        // Display results
        document.getElementById('quiz-score').textContent = `${results.correct}/${results.total}`;
        document.getElementById('quiz-percentage').textContent = `${results.percentage}%`;
        
        // Focus name input
        document.getElementById('quiz-player-name').focus();
    }

    calculateResults() {
        let correct = 0;
        
        this.currentQuestions.forEach((question, index) => {
            if (this.userAnswers[index] === question.answerIndex) {
                correct++;
            }
        });
        
        const total = this.currentQuestions.length;
        const percentage = Math.round((correct / total) * 100);
        
        return { correct, total, percentage };
    }

    saveScore() {
        const nameInput = document.getElementById('quiz-player-name');
        const name = nameInput.value.trim();
        
        if (!name) {
            alert('Please enter your name to save the score.');
            nameInput.focus();
            return;
        }
        
        const results = this.calculateResults();
        const timeElapsed = Date.now() - this.quizStartTime;
        
        // Save to storage
        this.storage.addQuizScore({
            name: name,
            category: this.currentDeck.title,
            correct: results.correct,
            total: results.total,
            percentage: results.percentage,
            timeElapsed: Math.round(timeElapsed / 1000), // seconds
            immediateFeedback: this.immediateFeedback
        });
        
        // Check for badges
        if (window.learnifyApp) {
            window.learnifyApp.checkAndAwardBadges();
        }
        
        // Show success message
        alert(`Score saved! ${results.correct}/${results.total} (${results.percentage}%)`);
        
        // Reset quiz
        this.resetQuiz();
    }

    resetQuiz() {
        // Reset state
        this.currentDeck = null;
        this.currentQuestions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.quizStartTime = null;
        
        // Clear name input
        document.getElementById('quiz-player-name').value = '';
        
        // Hide results and game, show setup
        document.getElementById('quiz-results').classList.add('hidden');
        document.getElementById('quiz-game').classList.add('hidden');
        document.getElementById('quiz-setup').classList.remove('hidden');
        
        // Clear category selection
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Remove start button
        const startButton = document.querySelector('.start-quiz-btn');
        if (startButton) {
            startButton.remove();
        }
        
        // Reset immediate feedback checkbox
        document.getElementById('immediate-feedback').checked = false;
    }

    // Keyboard navigation for quiz
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            // Only handle if quiz module is active
            if (!document.getElementById('quiz-module').classList.contains('active')) {
                return;
            }
            
            const gameActive = !document.getElementById('quiz-game').classList.contains('hidden');
            if (!gameActive) return;
            
            const choicesContainer = document.getElementById('choices-container');
            const choices = choicesContainer.querySelectorAll('.choice-btn');
            
            switch (e.key) {
                case '1':
                case '2':
                case '3':
                case '4':
                    e.preventDefault();
                    const index = parseInt(e.key) - 1;
                    if (index < choices.length && !choices[index].disabled) {
                        this.selectAnswer(index);
                    }
                    break;
                    
                case 'Enter':
                    const nextBtn = document.getElementById('quiz-next');
                    if (!nextBtn.disabled) {
                        this.nextQuestion();
                    }
                    break;
                    
                case 'Escape':
                    this.resetQuiz();
                    break;
            }
        });
    }
}