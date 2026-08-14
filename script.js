const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 320;
canvas.height = 480;

let score = 0;
let coins = 0;
let gameOver = false;

// Koptok
let ball = {
    x: canvas.width / 2,
    y: canvas.height - 80,
    radius: 12,
    dx: 3
};

// To'siqlar
let obstacles = [];
let obstacleInterval = 90;
let frameCount = 0;

// Tangalar
let coinItem = {
    x: Math.random() * (canvas.width - 40) + 20,
    y: -20,
    radius: 8,
    dy: 2
};

// Boshqaruv
window.addEventListener('touchstart', changeDirection);
canvas.addEventListener('click', changeDirection);

function changeDirection() {
    if (gameOver) {
        resetGame();
        return;
    }
    ball.dx = -ball.dx;
}

function resetGame() {
    score = 0;
    ball.x = canvas.width / 2;
    ball.dx = 3;
    obstacles = [];
    coinItem.y = -20;
    gameOver = false;
    update();
}

function update() {
    if (gameOver) return;
    frameCount++;
    ball.x += ball.dx;
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.dx = -ball.dx;
    }
    if (frameCount % obstacleInterval === 0) {
        let width = Math.random() * 100 + 50;
        let x = Math.random() * (canvas.width - width);
        obstacles.push({ x: x, y: -20, width: width, height: 15, dy: 3 });
    }
    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.y += obs.dy;
        if (ball.x + ball.radius > obs.x && ball.x - ball.radius < obs.x + obs.width && ball.y + ball.radius > obs.y && ball.y - ball.radius < obs.y + obs.height) {
            gameOver = true;
        }
        if (obs.y > canvas.height) {
            score += 10;
            obstacles.splice(i, 1);
            i--;
        }
    }
    coinItem.y += coinItem.dy;
    let dist = Math.hypot(ball.x - coinItem.x, ball.y - coinItem.y);
    if (dist < ball.radius + coinItem.radius) {
        coins += 1;
        coinItem.y = -100;
        coinItem.x = Math.random() * (canvas.width - 40) + 20;
    }
    if (coinItem.y > canvas.height) {
        coinItem.y = -100;
        coinItem.x = Math.random() * (canvas.width - 40) + 20;
    }
    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#00fff5';
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = '#ff2e63';
    obstacles.forEach(obs => { ctx.fillRect(obs.x, obs.y, obs.width, obs.height); });
    ctx.beginPath();
    ctx.arc(coinItem.x, coinItem.y, coinItem.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffe227';
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Score: ' + score, 15, 30);
    ctx.fillText('Coins: ' + coins, 220, 30);
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff2e63';
        ctx.font = 'bold 26px Arial';
        ctx.fillText('GAME OVER', 80, 220);
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.fillText('Tap to Restart', 105, 260);
    }
}
update();
