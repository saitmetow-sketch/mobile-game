const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 360;
canvas.height = 640;

// O'yin o'zgaruvchilari
let score = 0;
let stars = 0;
let gameOver = false;
let cameraY = 0;
let targetCameraY = 0;

// Koptok
let ball = {
    x: 180,
    y: 520,
    radius: 12,
    vx: 0,
    vy: 0,
    isAiming: false,
    inHoop: true,
    currentHoopIndex: 0
};

// Sichqoncha / Barmog'ni tortish nuqtalari
let dragStart = { x: 0, y: 0 };
let dragCurrent = { x: 0, y: 0 };

// Savatlar ro'yxati
let hoops = [
    { x: 180, y: 520, radius: 35 }
];

// Birinchi qo'shimcha savatni yaratish
addHoop(180, 360);

function addHoop(prevX, prevY) {
    let nextX = Math.random() * (canvas.width - 120) + 60;
    let nextY = prevY - 180;
    hoops.push({
        x: nextX,
        y: nextY,
        radius: 35,
        star: Math.random() > 0.4 ? { x: nextX, y: nextY - 50, collected: false } : null
    });
}

// Event Listeners (Boshqaruv)
canvas.addEventListener('touchstart', handleStart);
canvas.addEventListener('touchmove', handleMove);
canvas.addEventListener('touchend', handleEnd);

canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('mouseup', handleEnd);

function getPos(e) {
    let rect = canvas.getBoundingClientRect();
    let clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height) + cameraY
    };
}

function handleStart(e) {
    if (gameOver) {
        resetGame();
        return;
    }
    if (ball.inHoop) {
        let pos = getPos(e);
        ball.isAiming = true;
        dragStart = pos;
        dragCurrent = pos;
    }
}

function handleMove(e) {
    if (ball.isAiming) {
        dragCurrent = getPos(e);
    }
}

function handleEnd() {
    if (ball.isAiming) {
        ball.isAiming = false;
        ball.inHoop = false;
        
        // Katapulta kuchi (otish)
        let dx = dragStart.x - dragCurrent.x;
        let dy = dragStart.y - dragCurrent.y;
        
        ball.vx = dx * 0.12;
        ball.vy = dy * 0.12;
    }
}

function resetGame() {
    score = 0;
    gameOver = false;
    cameraY = 0;
    targetCameraY = 0;
    hoops = [{ x: 180, y: 520, radius: 35 }];
    addHoop(180, 360);
    ball.x = 180;
    ball.y = 520;
    ball.vx = 0;
    ball.vy = 0;
    ball.inHoop = true;
    ball.currentHoopIndex = 0;
    update();
}

function update() {
    if (gameOver) return;

    // Kamera silliq ko'tarilishi
    cameraY += (targetCameraY - cameraY) * 0.1;

    if (!ball.inHoop) {
        // Gravitatsiya (Tushish kuchi)
        ball.vy += 0.4;
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Devorlardan qaytish (Bounce)
        if (ball.x - ball.radius < 0) {
            ball.x = ball.radius;
            ball.vx = -ball.vx * 0.7;
        }
        if (ball.x + ball.radius > canvas.width) {
            ball.x = canvas.width - ball.radius;
            ball.vx = -ball.vx * 0.7;
        }

        // Savatga tushishni tekshirish
        for (let i = ball.currentHoopIndex + 1; i < hoops.length; i++) {
            let h = hoops[i];
            let dist = Math.hypot(ball.x - h.x, ball.y - h.y);

            if (dist < h.radius && ball.vy > 0) {
                ball.inHoop = true;
                ball.x = h.x;
                ball.y = h.y;
                ball.vx = 0;
                ball.vy = 0;
                ball.currentHoopIndex = i;
                score++;

                // Kamerani tepaga surish
                targetCameraY = h.y - 450;

                // Yangi savat qo'shish
                addHoop(h.x, h.y);
                break;
            }

            // Yulduzni yig'ish
            if (h.star && !h.star.collected) {
                let sDist = Math.hypot(ball.x - h.star.x, ball.y - h.star.y);
                if (sDist < ball.radius + 12) {
                    h.star.collected = true;
                    stars++;
                }
            }
        }

        // Mag'lubiyat (Pastroqqa tushib ketish)
        let currentHoop = hoops[ball.currentHoopIndex];
        if (ball.y > currentHoop.y + 200) {
            gameOver = true;
        }
    }

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(0, -cameraY);

    // Otish traektoriyasini ko'rsatuvchi chiziq (Aim Line)
    if (ball.isAiming) {
        let dx = dragStart.x - dragCurrent.x;
        let dy = dragStart.y - dragCurrent.y;

        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 4;
        ctx.setLineDash([5, 5]);
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(ball.x + dx * 2, ball.y + dy * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Savatlarni chizish
    hoops.forEach((h, index) => {
        ctx.beginPath();
        ctx.strokeStyle = index === ball.currentHoopIndex ? '#e94560' : '#ffffff';
        ctx.lineWidth = 6;
        ctx.arc(h.x, h.y, h.radius, 0, Math.PI);
        ctx.stroke();

        // Yulduzcha
        if (h.star && !h.star.collected) {
            ctx.fillStyle = '#ffe227';
            ctx.beginPath();
            ctx.arc(h.star.x, h.star.y, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Koptokni chizish
    ctx.beginPath();
    ctx.fillStyle = '#ff6b00'; // Basketbol koptogi rangi
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';
    ctx.stroke();

    ctx.restore();

    // Hisob va Yulduzlar (Ekran tepasida qolishi uchun)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(score, canvas.width / 2, 80);

    ctx.fillStyle = '#ffe227';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('★ ' + stars, canvas.width - 20, 40);

    // Game Over
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#e94560';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Arial';
        ctx.fillText('Tap to Try Again', canvas.width / 2, canvas.height / 2 + 30);
    }
}

update();
