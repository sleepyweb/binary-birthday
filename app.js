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
        this.maxQuestions = 9;
        
        this.initializeEventListeners();
        this.initializeTheme(); // Add theme initialization
    }
    
    initializeEventListeners() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('yes-btn').addEventListener('click', () => this.handleAnswer(true));
        document.getElementById('no-btn').addEventListener('click', () => this.handleAnswer(false));
        
        // Add theme toggle listener
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
    }
    
    initializeTheme() {
        // Check for saved theme preference or default to light
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }
    
    toggleTheme() {
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
    
    setTheme(theme) {
        const themeToggle = document.getElementById('theme-toggle');
        
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.textContent = '☀️'; // Sun icon for light mode
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            themeToggle.textContent = '🌙'; // Moon icon for dark mode
            localStorage.setItem('theme', 'light');
        }
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
        const [low, high] = this.monthRange;
        
        if (low === high) {
            this.foundMonth = low;
            this.startDayPhase();
            return;
        }
        
        const mid = Math.floor((low + high) / 2);
        
        const question = `Is your birth month in the second half of ${this.months[low]} to ${this.months[high]}?`;
        const clarification = `(${this.months[mid + 1]} to ${this.months[high]})`;
        
        this.showQuestion(question, clarification);
    }
    
    startDayPhase() {
        this.currentPhase = 'day';
        this.dayRange = [1, this.daysInMonth[this.foundMonth]];
        this.askDayQuestion();
    }
    
    askDayQuestion() {
        const [low, high] = this.dayRange;
        
        // If we're down to one day, we're done
        if (low === high) {
            this.showResult();
            return;
        }
        
        // If we're down to two days, ask about the first one directly
        if (high - low === 1) {
            this.showQuestion(`Is your birth day ${low}?`);
            return;
        }
        
        // Otherwise, use binary search
        const mid = Math.floor((low + high) / 2);
        this.showQuestion(`Is your birth day greater than ${mid}?`);
    }
    
    handleAnswer(isYes) {
        // INCREMENT THE COUNTER HERE - only once per answer
        this.questionsAsked++;
        this.updateProgress();
        
        if (this.currentPhase === 'month') {
            this.handleMonthAnswer(isYes);
        } else {
            this.handleDayAnswer(isYes);
        }
    }
    
    handleMonthAnswer(isYes) {
        let [low, high] = this.monthRange;
        const mid = Math.floor((low + high) / 2);
        
        if (isYes) {
            this.monthRange = [mid + 1, high];
        } else {
            this.monthRange = [low, mid];
        }
        
        this.askMonthQuestion();
    }
    
    handleDayAnswer(isYes) {
        let [low, high] = this.dayRange;
        
        const questionText = document.getElementById('question-text').textContent;
        
        // Handle direct "Is it X?" questions
        if (questionText.includes('Is your birth day') && questionText.includes('?')) {
            const dayMatch = questionText.match(/Is your birth day (\d+)\?/);
            if (dayMatch) {
                const askedDay = parseInt(dayMatch[1]);
                if (isYes) {
                    this.dayRange = [askedDay, askedDay];
                    this.showResult();
                } else {
                    this.dayRange = [askedDay + 1, high];
                    this.askDayQuestion();
                }
                return;
            }
        }
        
        // Handle "greater than" questions
        if (questionText.includes('greater than')) {
            const gtMatch = questionText.match(/greater than (\d+)\?/);
            if (gtMatch) {
                const threshold = parseInt(gtMatch[1]);
                if (isYes) {
                    this.dayRange = [threshold + 1, high];
                } else {
                    this.dayRange = [low, threshold];
                }
                this.askDayQuestion();
                return;
            }
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
    
    // Add confetti celebration
    this.celebrate();
    
    document.getElementById('start-btn').textContent = 'Play Again';
    document.getElementById('start-btn').classList.remove('hidden');
    document.getElementById('question-container').classList.add('hidden');
}

celebrate() {
    // Simple confetti effect using canvas-confetti library
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
        });
        
        // Additional burst after short delay
        setTimeout(() => {
            confetti({
                particleCount: 100,
                angle: 60,
                spread: 55,
                origin: { x: 0 }
            });
        }, 250);
        
        setTimeout(() => {
            confetti({
                particleCount: 100,
                angle: 120,
                spread: 55,
                origin: { x: 1 }
            });
        }, 400);
    }
}
    
    updateProgress() {
        const progressElement = document.getElementById('progress');
        progressElement.textContent = `Questions: ${this.questionsAsked}/${this.maxQuestions}`;
    }
}

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', () => {
    new BirthdayGuesser();
});