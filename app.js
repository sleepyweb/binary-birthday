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
        if (this.questionsAsked >= this.maxQuestions) {
            this.forceResult();
            return;
        }
        
        this.questionsAsked++;
        const [low, high] = this.monthRange;
        
        if (low === high) {
            this.foundMonth = low;
            this.startDayPhase();
            return;
        }
        
        // Optimized: Use ceiling instead of floor to balance the search
        const mid = Math.ceil((low + high) / 2);
        
        const question = `Is your birth month in ${this.months[mid]} to ${this.months[high]}?`;
        const clarification = `(Months ${mid + 1}-${high + 1})`;
        
        this.showQuestion(question, clarification);
    }
    
    startDayPhase() {
        this.currentPhase = 'day';
        this.dayRange = [1, this.daysInMonth[this.foundMonth]];
        this.askDayQuestion();
    }
    
    askDayQuestion() {
        if (this.questionsAsked >= this.maxQuestions) {
            this.forceResult();
            return;
        }
        
        this.questionsAsked++;
        const [low, high] = this.dayRange;
        
        if (low === high) {
            this.showResult();
            return;
        }
        
        // For the last 2 questions, use direct comparison instead of binary search
        const remainingQuestions = this.maxQuestions - this.questionsAsked;
        if (remainingQuestions <= 1 && (high - low) > 1) {
            // Use linear search for the final questions to guarantee completion
            this.dayRange = [low, low];
            this.showQuestion(`Is your birth day ${low}?`);
            return;
        }
        
        const mid = Math.ceil((low + high) / 2);
        this.showQuestion(`Is your birth day greater than ${mid - 1}?`);
    }
    
    handleAnswer(isYes) {
        if (this.questionsAsked >= this.maxQuestions) {
            this.forceResult();
            return;
        }
        
        if (this.currentPhase === 'month') {
            this.handleMonthAnswer(isYes);
        } else {
            this.handleDayAnswer(isYes);
        }
        this.updateProgress();
    }
    
    handleMonthAnswer(isYes) {
        let [low, high] = this.monthRange;
        const mid = Math.ceil((low + high) / 2);
        
        if (isYes) {
            this.monthRange = [mid, high];
        } else {
            this.monthRange = [low, mid - 1];
        }
        
        this.askMonthQuestion();
    }
    
    handleDayAnswer(isYes) {
        let [low, high] = this.dayRange;
        
        // Check if we're in linear search mode for final questions
        if (low === high) {
            if (isYes) {
                this.showResult();
            } else {
                this.dayRange = [low + 1, high + 1];
                this.askDayQuestion();
            }
            return;
        }
        
        const mid = Math.ceil((low + high) / 2);
        
        if (isYes) {
            this.dayRange = [mid, high];
        } else {
            this.dayRange = [low, mid - 1];
        }
        
        this.askDayQuestion();
    }
    
    showQuestion(question, clarification = '') {
        const questionText = document.getElementById('question-text');
        questionText.textContent = question + (clarification ? ` ${clarification}` : '');
    }
    
    showResult() {
        const resultElement = document.getElementById('result');
        if (this.foundMonth !== null && this.dayRange[0] <= this.daysInMonth[this.foundMonth]) {
            resultElement.textContent = `🎉 Your birthday is ${this.months[this.foundMonth]} ${this.dayRange[0]}!`;
        } else {
            resultElement.textContent = `🎉 I've narrowed it down! Your birthday is around ${this.months[this.foundMonth || 0]}`;
        }
        resultElement.textContent += ` (used ${this.questionsAsked} questions)`;
        resultElement.classList.remove('hidden');
        
        document.getElementById('start-btn').textContent = 'Play Again';
        document.getElementById('start-btn').classList.remove('hidden');
        document.getElementById('question-container').classList.add('hidden');
    }
    
    forceResult() {
        // When we hit the question limit, show the best guess
        const resultElement = document.getElementById('result');
        if (this.foundMonth !== null) {
            const approximateDay = Math.ceil((this.dayRange[0] + this.dayRange[1]) / 2);
            resultElement.textContent = `🔍 I believe your birthday is around ${this.months[this.foundMonth]} ${approximateDay} (used all ${this.questionsAsked} questions)`;
        } else {
            const approximateMonth = Math.ceil((this.monthRange[0] + this.monthRange[1]) / 2);
            resultElement.textContent = `🔍 I believe your birthday is around ${this.months[approximateMonth]} (used all ${this.questionsAsked} questions)`;
        }
        resultElement.classList.remove('hidden');
        
        document.getElementById('start-btn').textContent = 'Play Again';
        document.getElementById('start-btn').classList.remove('hidden');
        document.getElementById('question-container').classList.add('hidden');
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