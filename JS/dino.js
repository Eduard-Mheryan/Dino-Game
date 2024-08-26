let board;
let boardWidth = window.innerWidth;
let boardHeight = window.innerHeight;
let context;

let dinoWidth = 88 * 1.2;
let dinoHeight = 94 * 1.2;
let dinoX = boardWidth * 0.1; // Beispielposition, 10% der Breite
let dinoY = boardHeight * 0.7; // Beispielposition, 90% der Höhe
let dinoImg;

let dino = {
    x: dinoX,
    y: dinoY,
    width: dinoWidth,
    height: dinoHeight,
    isJumping: false,
    isDucking: false,
    jumpHeight: 120,
    jumpVelocity: 12,
    originalY: dinoY
};

let cactusArray = [];

let cactus1Width = 34 * 1.2;
let cactus2Width = 69 * 1.2;
let cactus3Width = 102 * 1.2;

let cactusHeight = 70 * 1.2;
let cactusX = boardWidth;
let cactusY = boardHeight * 0.74; // Beispielposition, 90% der Höhe

let cactus1Img;
let cactus2Img;
let cactus3Img;

let velocityX = -8;
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;

let currentFrame = 0;
let frameTimer = 0;
const frameInterval = 1000 / 60;

let backgroundImg;

let gameOverImg;
let gameOvers;

let backgroundMusic;

let restartButton;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;

    context = board.getContext("2d");

    backgroundImg = new Image();
    backgroundImg.src = "./img/Back/1.png";

    dinoImg = new Image();
    dinoImg.src = "./img/dino-run1.png";
    dinoImg.onload = function () {
        // Zeichne den Dino relativ zur berechneten Position und Größe
        context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
    };

    cactus1Img = new Image();
    cactus1Img.src = "./img/cactus1.png";

    cactus2Img = new Image();
    cactus2Img.src = "./img/cactus2.png";

    cactus3Img = new Image();
    cactus3Img.src = "./img/cactus3.png";

    gameOverImg = new Image();
    gameOverImg.src = "./img/game-over.png";

    gameOvers = new Audio("./audio/over.mp3");
    gameOvers.volume = 0.4;

    backgroundMusic = new Audio("./audio/backgroundmelody.mp3");
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.35;

    // Versuch, die Hintergrundmusik automatisch abzuspielen
    playBackgroundMusic();

    // Eventlistener für Nutzerinteraktion, um Musik abzuspielen
    document.addEventListener("keydown", function () {
        playBackgroundMusic();
    });

    requestAnimationFrame(update);
    setInterval(placeCactus, 1000);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
};

function playBackgroundMusic() {
    // Versuche, die Musik abzuspielen, falls blockiert, wird auf Nutzerinteraktion gewartet
    backgroundMusic.play().catch(function () {
        console.warn("Automatisches Abspielen der Hintergrundmusik blockiert. Auf Nutzerinteraktion warten.");
        document.addEventListener("keydown", function () {
            backgroundMusic.play();
        });
    });
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        backgroundMusic.pause();
        showRestartButton();
        return;
    }

    context.clearRect(0, 0, board.width, board.height);
    context.drawImage(backgroundImg, 0, 0, board.width, board.height);

    frameTimer += 1;
    if (frameTimer >= frameInterval) {
        frameTimer = 0;
        currentFrame = (currentFrame + 1) % 2;
        if (dino.isJumping) {
            dinoImg.src = "./img/dino-jump.png";
        } else if (dino.isDucking) {
            dinoImg.src = "./img/dino-duck" + (currentFrame + 1) + ".png";
        } else {
            dinoImg.src = "./img/dino-run" + (currentFrame + 1) + ".png";
        }
    }

    if (dino.isJumping) {
        velocityY += gravity;
        dino.y = Math.min(dino.y + velocityY, dino.originalY);

        if (dino.y === dino.originalY) {
            dino.isJumping = false;
        }
    }

    context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);

    for (let i = 0; i < cactusArray.length; i++) {
        let cactus = cactusArray[i];
        cactus.x += velocityX;
        context.drawImage(cactus.img, cactus.x, cactus.y, cactus.width, cactus.height);

        if (detectCollision(dino, cactus)) {
            gameOver = true;
            gameOvers.play();
            dinoImg.src = "./img/dino-dead.png";
            context.drawImage(gameOverImg, boardWidth / 2 - gameOverImg.width / 2, boardHeight / 2 - gameOverImg.height / 2);
            return;
        }
    }

    context.fillStyle = "black";
    context.font = "20px courier";
    score++;
    context.fillText("Score: " + score, 5, 20);
}

function handleKeyDown(e) {
    if (gameOver) {
        return;
    }

    if ((e.code === "Space" || e.code === "ArrowUp") && !dino.isJumping) {
        jump();
    } else if (e.code === "KeyD" && !dino.isJumping) {
        duck();
    }
}

function handleKeyUp(e) {
    if (e.code === "KeyD") {
        standUp();
    }
}

function jump() {
    if (!dino.isJumping) {
        velocityY = -dino.jumpVelocity;
        dino.isJumping = true;
    }
}

function duck() {
    if (!dino.isJumping) {
        dino.isDucking = true;
    }
}

function standUp() {
    dino.isDucking = false;
}

function placeCactus() {
    if (gameOver) {
        return;
    }

    let cactus = {
        img: null,
        x: cactusX,
        y: cactusY,
        width: null,
        height: cactusHeight
    };

    let placeCactusChance = Math.random();

    if (placeCactusChance > 0.90) {
        cactus.img = cactus3Img;
        cactus.width = cactus3Width;
        cactusArray.push(cactus);
    } else if (placeCactusChance > 0.70) {
        cactus.img = cactus2Img;
        cactus.width = cactus2Width;
        cactusArray.push(cactus);
    } else if (placeCactusChance > 0.50) {
        cactus.img = cactus1Img;
        cactus.width = cactus1Width;
        cactusArray.push(cactus);
    }

    if (cactusArray.length > 5) {
        cactusArray.shift();
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

function showRestartButton() {
    if (!restartButton) {
        restartButton = createRestartButton();
    }
    restartButton.style.display = "block";
}

function createRestartButton() {
    let button = document.createElement("button");
    button.textContent = "Play Again";

    // Button-Stil anpassen
    button.style.position = "absolute";
    button.style.left = (boardWidth / 2 - 100) + "px";
    button.style.top = (boardHeight / 2 + 50) + "px"; // Beispielposition, 150 Pixel unterhalb der Mitte
    button.style.padding = "10px 20px";
    button.style.fontSize = "16px";
    button.style.cursor = "pointer";
    button.style.display = "flex"; // Flexbox für die Anordnung von Text und Bild
    button.style.alignItems = "center"; // Zentriert den Inhalt vertikal
    button.style.margin = "20px"; // Abstand zwischen Text und Bild
    button.style.border = "none";
    button.style.borderRadius = "10px"; // Runde Ecken
    button.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)"; // Schatten
    button.style.backgroundColor = "#6200ea"; // Hintergrundfarbe
    button.style.color = "white"; // Textfarbe
    button.style.transition = "background-color 0.3s, transform 0.3s"; // Übergangseffekte

    // Hover-Effekte
    button.onmouseover = function () {
        button.style.backgroundColor = "#3700b3";
        button.style.transform = "scale(1.05)";
    };
    button.onmouseout = function () {
        button.style.backgroundColor = "#6200ea";
        button.style.transform = "scale(1)";
    };

    // Neues Spiel starten, wenn auf den Button geklickt wird
    button.onclick = function () {
        window.location.reload();
    };

    document.body.appendChild(button);
    return button;
}  