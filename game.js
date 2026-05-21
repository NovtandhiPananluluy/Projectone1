// Canvas setup
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 8;
const PADDLE_SPEED = 6;
const BALL_SPEED = 4;
const WINNING_SCORE = 11;

// Player paddle (left side - controlled by player)
const playerPaddle = {
    x: 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

// Computer paddle (right side - controlled by AI)
const computerPaddle = {
    x: canvas.width - PADDLE_WIDTH - 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: BALL_SIZE,
    dx: BALL_SPEED,
    dy: BALL_SPEED * 0.7,
    speed: BALL_SPEED
};

// Scores
let playerScore = 0;
let computerScore = 0;

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Update player paddle position
function updatePlayerPaddle() {
    // Arrow key control
    if (keys['ArrowUp']) {
        playerPaddle.y = Math.max(0, playerPaddle.y - PADDLE_SPEED);
    }
    if (keys['ArrowDown']) {
        playerPaddle.y = Math.min(canvas.height - PADDLE_HEIGHT, playerPaddle.y + PADDLE_SPEED);
    }

    // Mouse control (smooth following)
    const targetY = mouseY - PADDLE_HEIGHT / 2;
    const distance = targetY - playerPaddle.y;
    if (Math.abs(distance) > 2) {
        playerPaddle.y += distance * 0.1;
    }

    // Keep paddle in bounds
    playerPaddle.y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerPaddle.y));
}

// Update computer paddle (AI)
function updateComputerPaddle() {
    const computerCenter = computerPaddle.y + PADDLE_HEIGHT / 2;
    const ballCenter = ball.y;
    const difficulty = 0.085; // AI difficulty (higher = harder)

    if (computerCenter < ballCenter - 35) {
        computerPaddle.y = Math.min(canvas.height - PADDLE_HEIGHT, computerPaddle.y + PADDLE_SPEED);
    } else if (computerCenter > ballCenter + 35) {
        computerPaddle.y = Math.max(0, computerPaddle.y - PADDLE_SPEED);
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.size <= 0 || ball.y + ball.size >= canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.size, Math.min(canvas.height - ball.size, ball.y));
    }

    // Ball collision with paddles
    if (
        ball.x - ball.size <= playerPaddle.x + playerPaddle.width &&
        ball.y >= playerPaddle.y &&
        ball.y <= playerPaddle.y + playerPaddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = playerPaddle.x + playerPaddle.width + ball.size;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - playerPaddle.y) / playerPaddle.height - 0.5;
        ball.dy += hitPos * 3;
    }

    if (
        ball.x + ball.size >= computerPaddle.x &&
        ball.y >= computerPaddle.y &&
        ball.y <= computerPaddle.y + computerPaddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computerPaddle.x - ball.size;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - computerPaddle.y) / computerPaddle.height - 0.5;
        ball.dy += hitPos * 3;
    }

    // Ball out of bounds (left side)
    if (ball.x < 0) {
        computerScore++;
        updateScore();
        resetBall();
    }

    // Ball out of bounds (right side)
    if (ball.x > canvas.width) {
        playerScore++;
        updateScore();
        resetBall();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * BALL_SPEED;
    ball.dy = (Math.random() - 0.5) * BALL_SPEED;
}

// Update scoreboard
function updateScore() {
    document.querySelector('.player-score').textContent = playerScore;
    document.querySelector('.computer-score').textContent = computerScore;

    if (playerScore >= WINNING_SCORE || computerScore >= WINNING_SCORE) {
        endGame();
    }
}

// End game
function endGame() {
    const winner = playerScore >= WINNING_SCORE ? 'You Win!' : 'Game Over!';
    alert(`${winner}\nPlayer: ${playerScore} | Computer: ${computerScore}\n\nReloading game...`);
    playerScore = 0;
    computerScore = 0;
    updateScore();
    resetBall();
}

// Draw functions
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawLine(x1, y1, x2, y2, color, dash = false) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    if (dash) {
        ctx.setLineDash([5, 5]);
    }
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, '#0a0e27');

    // Draw center line
    drawLine(canvas.width / 2, 0, canvas.width / 2, canvas.height, '#00ff88', true);

    // Draw paddles
    drawRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height, '#00ff88');
    drawRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height, '#ff00ff');

    // Draw ball with glow effect
    drawCircle(ball.x, ball.y, ball.size, '#ffff00');

    // Draw ball glow
    ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size + 5, 0, Math.PI * 2);
    ctx.fill();
}

// Game loop
function gameLoop() {
    updatePlayerPaddle();
    updateComputerPaddle();
    updateBall();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
