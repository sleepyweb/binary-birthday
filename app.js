class BirthdayGuesser {
    constructor() {
        this.months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        this.daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        
        this.currentPhase = null;
        this.monthRange = [0, 11];
        this.dayRange = [1, 31];
        this.foundMonth = null;
        this.questionsAsked = 0;
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('yes-btn').addEventListener('click', () => this.handleAnswer(true));
        document.getElementById('no-btn').addEventListener('click', () => this.handleAnswer(false));
    }
    
    startGame() {
        this.resetGame();
        document.getElementById('start-btn').classList.add('hidden');
        document.getElementById('question-container').classList.remove('hidden');
        this.startMonthPhase();
    }
    
    resetGame() {
        this.currentPhase = 'month';
        this.monthRange = [0, 11];
        this.dayRange = [1, 31];
        this.foundMonth = null;
        this.questionsAsked = 0;
        document.getElementById('result').classList.add('hidden');
        this.updateProgress();
    }
    
    startMonthPhase() {
        this.currentPhase = 'month';
        this.askMonthQuestion();
    }
    
    askMonthQuestion() {
        this.questionsAsked++;
        const [low, high] = this.monthRange;
        
        if (low === high) {
            this.foundMonth = low;
            this.startDayPhase();
            return;
        }
        
        const mid = Math.floor((low + high) / 2);
        const secondHalfStart = mid + 1;
        
        const question = `Is your birth month in the second half of ${this.months[low]} to ${this.months[high]}?`;
        const clarification = `(${this.months[secondHalfStart]} to ${this.months[high]})`;
        
        this.showQuestion(question, clarification);
    }
    
    startDayPhase() {
        this.currentPhase = 'day';
        this.dayRange = [1, this.daysInMonth[this.foundMonth]];
        this.askDayQuestion();
    }
    
    askDayQuestion() {
        this.questionsAsked++;
        const [low, high] = this.dayRange;
        
        if (low === high) {
            this.showResult();
            return;
        }
        
        if (low === high - 1) {
            this.showQuestion(`Is your birth day ${low}?`);
            return;
        }
        
        const mid = Math.floor((low + high) / 2);
        this.showQuestion(`Is your birth day greater than ${mid}?`);
    }
    
    handleAnswer(isYes) {
        if (this.currentPhase === 'month') {
            this.handleMonthAnswer(isYes);
        } else {
            this.handleDayAnswer(isYes);
        }
        this.updateProgress();
    }
    
    handleMonthAnswer(isYes) {
        let [low, high] = this.monthRange;
        
        if (isYes) {
            this.monthRange = [Math.floor((low + high) / 2) + 1, high];
        } else {
            this.monthRange = [low, Math.floor((low + high) / 2)];
        }
        
        this.askMonthQuestion();
    }
    
    handleDayAnswer(isYes) {
        let [low, high] = this.dayRange;
        
        if (low === high - 1) {
            // Final question between two days
            this.dayRange = [isYes ? low : high, isYes ? low : high];
            this.askDayQuestion();
        } else {
            const mid = Math.floor((low + high) / 2);
            if (isYes) {
                this.dayRange = [mid + 1, high];
            } else {
                this.dayRange = [low, mid];
            }
            this.askDayQuestion();
        }
    }
    
    showQuestion(question, clarification = '') {
        const questionText = document.getElementById('question-text');
        questionText.textContent = question + (clarification ? ` ${clarification}` : '');
    }
    
    showResult() {
        const resultElement = document.getElementById('result');
        resultElement.textContent = `🎉 Your birthday is ${this.months[this.foundMonth]} ${this.dayRange[0]}!`;
        resultElement.classList.remove('hidden');
        
        document.getElementById('start-btn').textContent = 'Play Again';
        document.getElementById('start-btn').classList.remove('hidden');
        document.getElementById('question-container').classList.add('hidden');
    }
    
    updateProgress() {
        const progressElement = document.getElementById('progress');
        progressElement.textContent = `Questions asked: ${this.questionsAsked}`;
    }
}

// Create app manifest for PWA
const manifest = {
    "name": "Birthday Guesser",
    "short_name": "BdayGuesser",
    "description": "Guess your birthday with binary search",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#667eea",
    "theme_color": "#764ba2",
    "icons": [
        {
            "src": "icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
};

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', () => {
    new BirthdayGuesser();
    
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('Service Worker Registered'))
            .catch(err => console.log('Service Worker registration failed'));
    }
});