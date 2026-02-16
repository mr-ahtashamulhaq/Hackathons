// Flashcards module with flip animations and custom deck creation
export class FlashcardManager {
    constructor(storage) {
        this.storage = storage;
        this.defaultDecks = [
            {
                id: 'vocabulary',
                title: 'Vocabulary Builder',
                description: 'Expand your vocabulary',
                cards: [
                    { id: 'v1', front: 'Loquacious', back: 'Talkative, especially excessively' },
                    { id: 'v2', front: 'Ubiquitous', back: 'Present, appearing, or found everywhere' },
                    { id: 'v3', front: 'Ephemeral', back: 'Lasting for a very short time' },
                    { id: 'v4', front: 'Serendipity', back: 'The occurrence of events by chance in a happy way' },
                    { id: 'v5', front: 'Mellifluous', back: 'Sweet or musical; pleasant to hear' }
                ]
            },
            {
                id: 'spanish',
                title: 'Spanish Basics',
                description: 'Learn basic Spanish words',
                cards: [
                    { id: 's1', front: 'Hola', back: 'Hello' },
                    { id: 's2', front: 'Gracias', back: 'Thank you' },
                    { id: 's3', front: 'Por favor', back: 'Please' },
                    { id: 's4', front: 'Lo siento', back: 'I\'m sorry' },
                    { id: 's5', front: 'De nada', back: 'You\'re welcome' }
                ]
            },
            {
                id: 'science',
                title: 'Science Facts',
                description: 'Interesting science facts',
                cards: [
                    { id: 'sc1', front: 'What is the chemical formula for water?', back: 'H₂O (two hydrogen atoms and one oxygen atom)' },
                    { id: 'sc2', front: 'What is the speed of light?', back: '299,792,458 meters per second in vacuum' },
                    { id: 'sc3', front: 'What is photosynthesis?', back: 'The process by which plants convert sunlight into energy' },
                    { id: 'sc4', front: 'What is DNA?', back: 'Deoxyribonucleic acid - carries genetic information' },
                    { id: 'sc5', front: 'What is gravity?', back: 'The force that attracts objects toward each other' }
                ]
            }
        ];
        
        this.currentDeck = null;
        this.currentCardIndex = 0;
        this.isFlipped = false;
        this.isEditing = false;
        this.editingDeckId = null;
    }

    init() {
        this.setupEventListeners();
        this.displayDecks();
        this.setupKeyboardControls();
    }

    setupEventListeners() {
        // Deck creation
        document.getElementById('create-deck').addEventListener('click', () => this.showDeckEditor());
        
        // Study controls
        document.getElementById('back-to-decks').addEventListener('click', () => this.showDeckSelection());
        document.getElementById('flip-card').addEventListener('click', () => this.flipCard());
        document.getElementById('prev-card').addEventListener('click', () => this.previousCard());
        document.getElementById('next-card').addEventListener('click', () => this.nextCard());
        document.getElementById('shuffle-deck').addEventListener('click', () => this.shuffleDeck());
        document.getElementById('edit-deck').addEventListener('click', () => this.editCurrentDeck());
        
        // Flashcard click to flip
        document.getElementById('flashcard').addEventListener('click', () => this.flipCard());
        
        // Modal controls
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.hideDeckEditor());
        });
        
        document.getElementById('save-deck').addEventListener('click', () => this.saveDeck());
        document.getElementById('add-card').addEventListener('click', () => this.addCardEditor());
        
        // Click outside modal to close
        document.getElementById('deck-editor').addEventListener('click', (e) => {
            if (e.target.id === 'deck-editor') {
                this.hideDeckEditor();
            }
        });
    }

    displayDecks() {
        const decksGrid = document.getElementById('decks-grid');
        const customDecks = this.storage.getCustomDecks();
        const allDecks = [...this.defaultDecks, ...customDecks];
        
        decksGrid.innerHTML = allDecks.map(deck => `
            <div class="deck-card" data-deck-id="${deck.id}">
                <div class="deck-actions">
                    ${deck.id.startsWith('custom_') ? `
                        <button class="btn btn-icon edit-deck-btn" data-deck-id="${deck.id}" aria-label="Edit deck">✏️</button>
                        <button class="btn btn-icon delete-deck-btn" data-deck-id="${deck.id}" aria-label="Delete deck">🗑️</button>
                    ` : ''}
                </div>
                <h3>${deck.title}</h3>
                <p>${deck.description || 'Custom flashcard deck'}</p>
                <p class="deck-count">${deck.cards.length} cards</p>
            </div>
        `).join('');
        
        // Add event listeners
        decksGrid.querySelectorAll('.deck-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking on action buttons
                if (e.target.classList.contains('btn') || e.target.closest('.btn')) {
                    return;
                }
                this.startStudying(card.dataset.deckId);
            });
        });
        
        // Edit deck buttons
        decksGrid.querySelectorAll('.edit-deck-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editDeck(btn.dataset.deckId);
            });
        });
        
        // Delete deck buttons
        decksGrid.querySelectorAll('.delete-deck-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteDeck(btn.dataset.deckId);
            });
        });
    }

    startStudying(deckId) {
        // Find deck
        const customDecks = this.storage.getCustomDecks();
        const allDecks = [...this.defaultDecks, ...customDecks];
        this.currentDeck = allDecks.find(deck => deck.id === deckId);
        
        if (!this.currentDeck || this.currentDeck.cards.length === 0) {
            alert('This deck has no cards to study.');
            return;
        }
        
        // Reset state
        this.currentCardIndex = 0;
        this.isFlipped = false;
        
        // Show study interface
        document.getElementById('deck-selection').classList.add('hidden');
        document.getElementById('flashcard-study').classList.remove('hidden');
        
        // Update deck title
        document.getElementById('deck-title').textContent = this.currentDeck.title;
        
        // Display first card
        this.displayCard();
        
        // Record activity
        if (window.learnifyApp) {
            window.learnifyApp.recordActivity();
        }
    }

    displayCard() {
        if (!this.currentDeck || this.currentDeck.cards.length === 0) return;
        
        const card = this.currentDeck.cards[this.currentCardIndex];
        const flashcard = document.getElementById('flashcard');
        
        // Update card content
        document.getElementById('card-front').textContent = card.front;
        document.getElementById('card-back').textContent = card.back;
        
        // Reset flip state
        this.isFlipped = false;
        flashcard.classList.remove('flipped');
        
        // Update counter
        document.getElementById('card-counter').textContent = 
            `${this.currentCardIndex + 1} / ${this.currentDeck.cards.length}`;
        
        // Update navigation buttons
        document.getElementById('prev-card').disabled = this.currentCardIndex === 0;
        document.getElementById('next-card').disabled = this.currentCardIndex === this.currentDeck.cards.length - 1;
    }

    flipCard() {
        const flashcard = document.getElementById('flashcard');
        this.isFlipped = !this.isFlipped;
        
        if (this.isFlipped) {
            flashcard.classList.add('flipped');
        } else {
            flashcard.classList.remove('flipped');
        }
    }

    previousCard() {
        if (this.currentCardIndex > 0) {
            this.currentCardIndex--;
            this.displayCard();
        }
    }

    nextCard() {
        if (this.currentCardIndex < this.currentDeck.cards.length - 1) {
            this.currentCardIndex++;
            this.displayCard();
        }
    }

    shuffleDeck() {
        if (!this.currentDeck) return;
        
        // Fisher-Yates shuffle
        const cards = [...this.currentDeck.cards];
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        
        this.currentDeck.cards = cards;
        this.currentCardIndex = 0;
        this.displayCard();
    }

    showDeckSelection() {
        document.getElementById('flashcard-study').classList.add('hidden');
        document.getElementById('deck-selection').classList.remove('hidden');
        this.displayDecks(); // Refresh in case of changes
    }

    showDeckEditor(deckToEdit = null) {
        this.isEditing = !!deckToEdit;
        this.editingDeckId = deckToEdit ? deckToEdit.id : null;
        
        const modal = document.getElementById('deck-editor');
        const title = document.getElementById('editor-title');
        const nameInput = document.getElementById('deck-name');
        
        if (this.isEditing) {
            title.textContent = 'Edit Deck';
            nameInput.value = deckToEdit.title;
            this.populateCardEditors(deckToEdit.cards);
        } else {
            title.textContent = 'Create New Deck';
            nameInput.value = '';
            this.populateCardEditors([]);
        }
        
        modal.classList.remove('hidden');
        nameInput.focus();
    }

    hideDeckEditor() {
        document.getElementById('deck-editor').classList.add('hidden');
        this.isEditing = false;
        this.editingDeckId = null;
    }

    populateCardEditors(cards) {
        const cardsList = document.getElementById('cards-list');
        cardsList.innerHTML = '';
        
        if (cards.length === 0) {
            this.addCardEditor();
        } else {
            cards.forEach(card => {
                this.addCardEditor(card.front, card.back);
            });
        }
    }

    addCardEditor(front = '', back = '') {
        const cardsList = document.getElementById('cards-list');
        const cardEditor = document.createElement('div');
        cardEditor.className = 'card-editor';
        cardEditor.innerHTML = `
            <input type="text" placeholder="Front" value="${front}" class="card-front-input">
            <input type="text" placeholder="Back" value="${back}" class="card-back-input">
            <button type="button" class="btn btn-icon remove-card-btn" aria-label="Remove card">×</button>
        `;
        
        // Add remove functionality
        cardEditor.querySelector('.remove-card-btn').addEventListener('click', () => {
            cardEditor.remove();
        });
        
        cardsList.appendChild(cardEditor);
        
        // Focus the front input if it's empty
        if (!front) {
            cardEditor.querySelector('.card-front-input').focus();
        }
    }

    saveDeck() {
        const nameInput = document.getElementById('deck-name');
        const name = nameInput.value.trim();
        
        if (!name) {
            alert('Please enter a deck name.');
            nameInput.focus();
            return;
        }
        
        // Collect cards
        const cardEditors = document.querySelectorAll('.card-editor');
        const cards = [];
        
        cardEditors.forEach((editor, index) => {
            const front = editor.querySelector('.card-front-input').value.trim();
            const back = editor.querySelector('.card-back-input').value.trim();
            
            if (front && back) {
                cards.push({
                    id: `card_${Date.now()}_${index}`,
                    front,
                    back
                });
            }
        });
        
        if (cards.length === 0) {
            alert('Please add at least one card with both front and back content.');
            return;
        }
        
        // Save deck
        if (this.isEditing) {
            this.storage.updateCustomDeck(this.editingDeckId, {
                title: name,
                cards: cards
            });
        } else {
            this.storage.addCustomDeck({
                title: name,
                cards: cards
            });
        }
        
        // Close modal and refresh
        this.hideDeckEditor();
        this.displayDecks();
        
        alert(`Deck "${name}" saved successfully!`);
    }

    editDeck(deckId) {
        const customDecks = this.storage.getCustomDecks();
        const deck = customDecks.find(d => d.id === deckId);
        
        if (deck) {
            this.showDeckEditor(deck);
        }
    }

    editCurrentDeck() {
        if (this.currentDeck && this.currentDeck.id.startsWith('custom_')) {
            this.editDeck(this.currentDeck.id);
        } else {
            alert('Only custom decks can be edited.');
        }
    }

    deleteDeck(deckId) {
        const customDecks = this.storage.getCustomDecks();
        const deck = customDecks.find(d => d.id === deckId);
        
        if (deck && confirm(`Are you sure you want to delete "${deck.title}"?`)) {
            this.storage.deleteCustomDeck(deckId);
            this.displayDecks();
        }
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            // Only handle if flashcards module is active
            if (!document.getElementById('flashcards-module').classList.contains('active')) {
                return;
            }
            
            // Only handle if studying (not in deck selection)
            const studyActive = !document.getElementById('flashcard-study').classList.contains('hidden');
            if (!studyActive) return;
            
            switch (e.key) {
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    this.flipCard();
                    break;
                    
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousCard();
                    break;
                    
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextCard();
                    break;
                    
                case 's':
                case 'S':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.shuffleDeck();
                    }
                    break;
                    
                case 'Escape':
                    this.showDeckSelection();
                    break;
            }
        });
        
        // Make flashcard focusable for keyboard navigation
        const flashcard = document.getElementById('flashcard');
        flashcard.setAttribute('tabindex', '0');
        
        flashcard.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                this.flipCard();
            }
        });
    }
}