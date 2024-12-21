// 자바스크립트로 구현한 테트리스 레이싱 게임

// 캔버스 및 컨텍스트 설정
const canvas = document.createElement("canvas");
canvas.width = 700; // 캔버스 너비
canvas.height = 600; // 캔버스 높이
document.body.appendChild(canvas); // 캔버스를 문서에 추가
const ctx = canvas.getContext("2d"); // 2D 드로잉 컨텍스트

// 게임을 위한 상수
const BLOCK_SIZE = 20; // 블록 하나의 크기
const FPS = 60; // 초당 프레임 수
const colors = ["red", "green", "blue"]; // 적의 색상
const yellow = "rgb(255, 255, 0)"; // 배경 색상

// 미리 정의된 테트리스 모양
const tetrisShapes = [
    [[0, 0], [1, 0], [2, 0], [3, 0]], // I 블록
    [[0, 0], [0, 1], [1, 0], [1, 1]], // O 블록
    [[1, 0], [0, 1], [1, 1], [2, 1]], // T 블록
    [[0, 0], [1, 0], [1, 1], [2, 1]], // Z 블록
    [[1, 0], [2, 0], [0, 1], [1, 1]]  // S 블록
];

// 랜덤 모양과 색상을 가져오는 유틸리티 함수
function getRandomShape() {
    return tetrisShapes[Math.floor(Math.random() * tetrisShapes.length)];
}

function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

// 플레이어 클래스 정의
class Player {
    constructor() {
        this.resetPosition(); // 플레이어 위치 초기화
        this.shape = getRandomShape(); // 랜덤 모양 할당
        this.color = "blue"; // 플레이어 색상
        this.speed = 5; // 이동 속도
        this.timer = 0; // 모양 변경을 추적하는 타이머
    }

    resetPosition() {
        // 플레이어의 시작 위치 설정
        this.x = canvas.width / 2 - 40;
        this.y = canvas.height - 80;
    }

    draw() {
        // 플레이어의 모양에 포함된 각 블록을 그림
        this.shape.forEach(([dx, dy]) => {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x + dx * BLOCK_SIZE, this.y + dy * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        });
    }

    move(keys) {
        // 키 입력에 따라 수평 이동 처리
        if (keys["ArrowLeft"] && this.x > 0) this.x -= this.speed;
        if (keys["ArrowRight"] && this.x < canvas.width - BLOCK_SIZE * 4) this.x += this.speed;

        // 3초마다 모양 변경
        this.timer++;
        if (this.timer >= FPS * 3) {
            this.shape = getRandomShape();
            this.timer = 0;
        }
    }
}

// 적 클래스 정의
class Enemy {
    constructor() {
        this.x = Math.random() * (canvas.width - BLOCK_SIZE * 4); // 랜덤 가로 위치
        this.y = -80; // 캔버스 위쪽에서 시작
        this.shape = getRandomShape(); // 랜덤 모양 할당
        this.color = getRandomColor(); // 랜덤 색상 할당
        this.speed = Math.random() * 3 + 3; // 랜덤 하강 속도
    }

    draw() {
        // 적의 모양에 포함된 각 블록을 그림
        this.shape.forEach(([dx, dy]) => {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x + dx * BLOCK_SIZE, this.y + dy * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        });
    }

    move() {
        // 적을 아래로 이동시킴
        this.y += this.speed;
        if (this.y > canvas.height) {
            // 화면 밖으로 나가면 위치 재설정
            this.y = -80;
            this.x = Math.random() * (canvas.width - BLOCK_SIZE * 4);
            this.shape = getRandomShape();
            this.speed = Math.random() * 3 + 3;
        }
    }
}

// 게임 객체 초기화
let player = new Player();
let enemies = Array.from({ length: 8 }, () => new Enemy());
let score = 0;
let keys = {}; // 눌린 키를 추적

// 터치용 검정 화살표 버튼 그리기
function drawArrows() {
    ctx.fillStyle = "black";
    // 왼쪽 화살표
    ctx.fillRect(10, canvas.height - 120, 100, 100);
    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.fillText("←", 35, canvas.height - 50);

    // 오른쪽 화살표
    ctx.fillStyle = "black";
    ctx.fillRect(canvas.width - 110, canvas.height - 120, 100, 100);
    ctx.fillStyle = "white";
    ctx.fillText("→", canvas.width - 85, canvas.height - 50);
}

// 터치 입력 처리
canvas.addEventListener("touchstart", (e) => {
    const touchX = e.touches[0].clientX; // 터치 위치 가져오기
    const touchY = e.touches[0].clientY; // 터치 Y 위치

    if (touchY > canvas.height - 120) {
        if (touchX < 120) {
            // 왼쪽 버튼 영역
            keys["ArrowLeft"] = true;
        } else if (touchX > canvas.width - 120) {
            // 오른쪽 버튼 영역
            keys["ArrowRight"] = true;
        }
    }
});

canvas.addEventListener("touchend", () => {
    keys["ArrowLeft"] = false; // 왼쪽 이동 중지
    keys["ArrowRight"] = false; // 오른쪽 이동 중지
});

// 키보드 입력 처리
document.addEventListener("keydown", (e) => (keys[e.key] = true));
document.addEventListener("keyup", (e) => (keys[e.key] = false));

// 충돌 감지
function checkCollision() {
    for (let enemy of enemies) {
        for (let [px, py] of player.shape) {
            const playerX = player.x + px * BLOCK_SIZE;
            const playerY = player.y + py * BLOCK_SIZE;
            for (let [ex, ey] of enemy.shape) {
                const enemyX = enemy.x + ex * BLOCK_SIZE;
                const enemyY = enemy.y + ey * BLOCK_SIZE;
                if (Math.abs(playerX - enemyX) < BLOCK_SIZE && Math.abs(playerY - enemyY) < BLOCK_SIZE) {
                    if (JSON.stringify(player.shape) === JSON.stringify(enemy.shape)) {
                        // 모양이 일치하면 적 제거
                        enemies = enemies.filter((e) => e !== enemy);
                        score += 10; // 점수 증가
                    } else {
                        // 모양이 일치하지 않으면 게임 종료
                        alert("Game Over");
                        resetGame();
                    }
                }
            }
        }
    }
}

// 게임 상태 재설정
function resetGame() {
    player = new Player();
    enemies = Array.from({ length: 8 }, () => new Enemy());
    score = 0;
}

// 메인 게임 루프
function gameLoop() {
    ctx.fillStyle = yellow; // 배경 색상 설정
    ctx.fillRect(0, 0, canvas.width, canvas.height); // 화면 초기화

    drawArrows(); // 화살표 버튼 그리기

    player.move(keys); // 플레이어 이동 처리
    player.draw(); // 플레이어 그리기

    enemies.forEach((enemy) => {
        enemy.move(); // 각 적 이동 처리
        enemy.draw(); // 각 적 그리기
    });

    checkCollision(); // 충돌 감지

    // 점수 표시
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);

    if (enemies.length === 0) {
        // 승리 조건
        alert("You Win!");
        resetGame();
    }

    requestAnimationFrame(gameLoop); // 게임 루프 반복
}

gameLoop();
