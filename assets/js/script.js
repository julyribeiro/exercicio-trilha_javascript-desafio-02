let gameState = {
    playerScore: 0,
    computerScore: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    isPlaying: false
};

const choices = {
    rock: { emoji: '✊', name: 'PEDRA' },
    paper: { emoji: '✋', name: 'PAPEL' },
    scissors: { emoji: '✌️', name: 'TESOURA' }
};

const rules = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper'
};

const descriptions = {
    'rock-scissors': 'Pedra quebra tesoura',
    'paper-rock': 'Papel embrulha pedra',
    'scissors-paper': 'Tesoura corta papel'
};

const elements = {
    cards: document.querySelectorAll('.card'),
    battleArea: document.getElementById('battle-area'),
    resultArea: document.getElementById('result-area'),
    gameStatus: document.getElementById('game-status'),
    playAgainBtn: document.getElementById('play-again-btn'),
    playerScore: document.getElementById('player-score'),
    computerScore: document.getElementById('computer-score'),
    wins: document.getElementById('wins'),
    draws: document.getElementById('draws'),
    losses: document.getElementById('losses'),
    playerChoiceEmoji: document.getElementById('player-choice-emoji'),
    computerChoiceEmoji: document.getElementById('computer-choice-emoji'),
    resultText: document.getElementById('result-text'),
    resultDescription: document.getElementById('result-description')
};

function initGame() {
    elements.cards.forEach(card => {
        card.addEventListener('click', () => {
            if (!gameState.isPlaying) {
                const choice = card.dataset.choice;
                playRound(choice);
            }
        });
    });
    elements.playAgainBtn.addEventListener('click', startNewRound);

    updateDisplay();
    updateGameStatus('Escolha uma carta para começar o duelo!');
}

function playRound(playerChoice) {
    if (gameState.isPlaying) return;

    gameState.isPlaying = true;
    updateGameStatus('Processando...');
    elements.cards.forEach(card => {
        card.style.pointerEvents = 'none';
        card.style.opacity = '0.6';
    });

    const choiceKeys = Object.keys(choices);
    const computerChoice = choiceKeys[Math.floor(Math.random() * choiceKeys.length)];

    const result = determineWinner(playerChoice, computerChoice);

    updateGameState(result);

    showBattle(playerChoice, computerChoice, result);
}

function determineWinner(playerChoice, computerChoice) {
    if (playerChoice === computerChoice) {
        return 'draw';
    }
    
    return rules[playerChoice] === computerChoice ? 'win' : 'lose';
}

function updateGameState(result) {
    switch (result) {
        case 'win':
            gameState.playerScore++;
            gameState.wins++;
            break;
        case 'lose':
            gameState.computerScore++;
            gameState.losses++;
            break;
        case 'draw':
            gameState.draws++;
            break;
    }
}

function showBattle(playerChoice, computerChoice, result) {
    elements.playerChoiceEmoji.textContent = choices[playerChoice].emoji;
    elements.computerChoiceEmoji.textContent = choices[computerChoice].emoji;
    elements.battleArea.style.display = 'flex';
    elements.gameStatus.style.display = 'none';
    setTimeout(() => {
        showResult(playerChoice, computerChoice, result);
    }, 2000);
}

function showResult(playerChoice, computerChoice, result) {
    const resultTexts = {
        win: 'VITÓRIA!',
        lose: 'DERROTA!',
        draw: 'EMPATE!'
    };

    elements.resultText.textContent = resultTexts[result];
    elements.resultText.className = `result-text ${result}`;

    if (result === 'draw') {
        elements.resultDescription.textContent = 'Ambos escolheram a mesma opção';
    } else {
        const winner = result === 'win' ? playerChoice : computerChoice;
        const loser = result === 'win' ? computerChoice : playerChoice;
        const key = `${winner}-${loser}`;
        elements.resultDescription.textContent = descriptions[key] || '';
    }

    elements.resultArea.style.display = 'block';
    updateDisplay();

    if (result !== 'draw') {
        document.body.style.animation = 'none';
        document.body.offsetHeight;
        document.body.style.animation = result === 'win' ? 'victoryShake 0.6s ease-out' : 'defeatShake 0.6s ease-out';
    }
}

function startNewRound() {
    gameState.isPlaying = false;

    elements.battleArea.style.display = 'none';
    elements.resultArea.style.display = 'none';
    elements.gameStatus.style.display = 'block';
    elements.cards.forEach(card => {
        card.style.pointerEvents = 'auto';
        card.style.opacity = '1';
    });

    updateGameStatus('Escolha uma carta para o próximo duelo!');
    document.body.style.animation = 'none';
}

function updateDisplay() {
    elements.playerScore.textContent = gameState.playerScore;
    elements.computerScore.textContent = gameState.computerScore;
    elements.wins.textContent = gameState.wins;
    elements.draws.textContent = gameState.draws;
    elements.losses.textContent = gameState.losses;

    // Add animation to updated scores
    animateScoreUpdate();
}

// Animate score update
function animateScoreUpdate() {
    const scoreElements = [elements.playerScore, elements.computerScore];
    scoreElements.forEach(element => {
        element.style.transform = 'scale(1.2)';
        element.style.transition = 'transform 0.3s ease';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 300);
    });
}

// Update game status
function updateGameStatus(message) {
    elements.gameStatus.textContent = message;
}

// Add dynamic CSS animations
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes victoryShake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
            20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        @keyframes defeatShake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
            20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
    `;
    document.head.appendChild(style);
}

// Add sound effects (optional - using Web Audio API)
function playSound(type) {
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Sound frequencies for different events
    const frequencies = {
        click: 800,
        win: [523, 659, 784], // C-E-G chord
        lose: [293, 220], // D-A
        draw: [440] // A
    };

    const freq = frequencies[type];
    
    if (Array.isArray(freq)) {
        // Play chord
        freq.forEach((f, index) => {
            setTimeout(() => playTone(audioContext, f, 0.3), index * 100);
        });
    } else {
        // Play single tone
        playTone(audioContext, freq, 0.2);
    }
}

function playTone(audioContext, frequency, duration) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Add click sound to cards
function addSoundEffects() {
    elements.cards.forEach(card => {
        card.addEventListener('click', () => {
            if (!gameState.isPlaying) {
                try {
                    playSound('click');
                } catch (e) {
                    // Silently fail if audio context is not supported
                }
            }
        });
    });

    // Add result sounds
    const originalShowResult = showResult;
    window.showResult = function(playerChoice, computerChoice, result) {
        originalShowResult(playerChoice, computerChoice, result);
        try {
            setTimeout(() => playSound(result), 500);
        } catch (e) {
            // Silently fail if audio context is not supported
        }
    };
}

// Easter egg: Konami code
function addKonamiCode() {
    const konamiCode = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
        if (e.code === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                // Easter egg activated!
                document.body.style.filter = 'hue-rotate(180deg) saturate(2)';
                elements.gameStatus.textContent = ' ATIVADO! ';
                setTimeout(() => {
                    document.body.style.filter = '';
                    updateGameStatus('Escolha uma carta para começar o duelo!');
                }, 3000);
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    addDynamicStyles();
    addSoundEffects();
    addKonamiCode();
    
    // Add a welcome message
    setTimeout(() => {
        updateGameStatus('');
    }, 1000);
});

// Export functions for testing (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        determineWinner,
        updateGameState,
        gameState,
        choices,
        rules
    };
}