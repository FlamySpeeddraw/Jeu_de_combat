const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

ctx.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.5;

const background = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc: './img/background.png'
})

const shop = new Sprite({
    position: {
        x: 651,
        y: 160
    },
    imageSrc: './img/shop.png',
    scale: 2.5,
    framesMax: 6
})

const player = new Fighter({
    position: {
        x: 50,
        y: 200
    },
    velocity: {
        x: 0,
        y: 0
    },
    color: 'blue',
    offset: {
        x: 0,
        y: 0
    },
    imageSrc: './img/samuraiMack/Idle.png',
    scale: 2.5,
    framesMax: 8,
    offset: {
        x: 215,
        y: 157
    },
    sprites: {
        idle: {
            imageSrc: './img/samuraiMack/Idle.png',
            framesMax: 8
        },
        run: {
            imageSrc: './img/samuraiMack/Run.png',
            framesMax: 8
        },
        jump: {
            imageSrc: './img/samuraiMack/Jump.png',
            framesMax: 2
        },
        fall: {
            imageSrc: './img/samuraiMack/Fall.png',
            framesMax: 2
        },
        attack1: {
            imageSrc: './img/samuraiMack/Attack1.png',
            framesMax: 6
        },
        takeHit: {
            imageSrc: './img/samuraiMack/Take Hit.png',
            framesMax: 4
        },
        death: {
            imageSrc: './img/samuraiMack/Death.png',
            framesMax: 6
        }
    },
    attackBox: {
        offset: {
            x: 100,
            y: 50
        },
        width: 150,
        height: 50
    }
});

const enemy = new Fighter({
    position: {
        x: 900,
        y: 200
    },
    velocity: {
        x: 0,
        y: 0
    },
    color: 'crimson',
    offset: {
        x: -50,
        y: 0
    },
    imageSrc: './img/Kenji/Idle.png',
    scale: 2.5,
    framesMax: 4,
    offset: {
        x: 215,
        y: 167
    },
    sprites: {
        idle: {
            imageSrc: './img/Kenji/Idle.png',
            framesMax: 4
        },
        run: {
            imageSrc: './img/Kenji/Run.png',
            framesMax: 8
        },
        jump: {
            imageSrc: './img/Kenji/Jump.png',
            framesMax: 2
        },
        fall: {
            imageSrc: './img/Kenji/Fall.png',
            framesMax: 2
        },
        attack1: {
            imageSrc: './img/Kenji/Attack1.png',
            framesMax: 4
        },
        takeHit: {
            imageSrc: './img/Kenji/Take hit.png',
            framesMax: 3
        },
        death: {
            imageSrc: './img/Kenji/Death.png',
            framesMax: 7
        }
    },
    attackBox: {
        offset: {
            x: -170,
            y: 50
        },
        width: 170,
        height: 50
    }
});

const keys = {
    q: {
        pressed: false
    },
    d: {
        pressed: false
    },
    z: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    },
    ArrowUp: {
        pressed: false
    }
}

decreaseTimer();

function animate() {
    window.requestAnimationFrame(animate);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    background.update();
    shop.update();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(0,0, canvas.width, canvas.height);
    player.update();
    enemy.update();

    player.velocity.x = 0;
    enemy.velocity.x = 0;

    //Mouvements joueur
    if (keys.q.pressed && player.lastKey === 'q') {
        player.velocity.x = -5;
        player.switchSprite('run');
    } else if (keys.d.pressed && player.lastKey === 'd') {
        player.switchSprite('run');
        player.velocity.x = 5;
    } else {
        player.switchSprite('idle');
    }

    //saut joueur
    if (player.velocity.y < 0) {
        player.switchSprite('jump');
    } else if (player.velocity.y > 0) {
        player.switchSprite('fall');
    }


    //Mouvements ennemis
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -5;
        enemy.switchSprite('run');
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
        enemy.velocity.x = 5;
        enemy.switchSprite('run');
    } else {
        enemy.switchSprite('idle');
    }

    //saut ennemis
    if (enemy.velocity.y < 0) {
        enemy.switchSprite('jump');
    } else if (enemy.velocity.y > 0) {
        enemy.switchSprite('fall');
    }

    //Détection des collisions (attaques) + hits
    if (rectCollision({ rectangle1: player, rectangle2: enemy }) && player.isAttacking && player.currentFrame === 4) {
        enemy.takeHit();
        player.isAttacking = false;

        gsap.to('#enemyHealth', {
            width: enemy.health + '%'
        });
    }

    //Si le joueur rate
    if (player.isAttacking && player.currentFrame === 4) {
        player.isAttacking = false;
    }

    if (rectCollision({ rectangle1: enemy, rectangle2: player }) && enemy.isAttacking && enemy.currentFrame === 2) {
        player.takeHit();
        enemy.isAttacking = false;

        gsap.to('#playerHealth', {
            width: player.health + '%'
        });
    }

    //Si l'ennemis rate
    if (enemy.isAttacking && enemy.currentFrame === 2) {
        enemy.isAttacking = false;
    }

    //Fin de jeu (plus de vie)
    if (enemy.health <= 0 || player.health <= 0) {
        gagnant({ player, enemy, timerId })
    }
}

animate();

window.addEventListener('keydown', (e) => {
    if (!player.dead) {
        //Mouvements joueur
        switch (e.key) {

            case 'd':
                keys.d.pressed = true;
                player.lastKey = 'd';
                break;
            case 'q':
                keys.q.pressed = true;
                player.lastKey = 'q';
                break;
            case ' ':
                if (player.position.y + player.height === canvas.height - 96) {
                    player.velocity.y = -15;
                }
                break;
            case 's':
                player.attack()
                break;
        }
    }

    if (!enemy.dead) {
        //Mouvements ennemis
        switch (e.key) {

            case 'ArrowRight':
                keys.ArrowRight.pressed = true;
                enemy.lastKey = 'ArrowRight';
                break;
            case 'ArrowLeft':
                keys.ArrowLeft.pressed = true;
                enemy.lastKey = 'ArrowLeft';
                break;
            case 'ArrowUp':
                if (enemy.position.y + enemy.height === canvas.height - 96) {
                    enemy.velocity.y = -15;
                }
                break;
            case 'ArrowDown':
                enemy.attack()
                break;
        }
    }
});

window.addEventListener('keyup', (e) => {
    switch (e.key) {

        //Mouvements joueur
        case 'd':
            keys.d.pressed = false;
            break;
        case 'q':
            keys.q.pressed = false;
            break;
        case ' ':
            keys.z.pressed = false;
            break;

        //Mouvements joueur
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
        case 'ArrowUp':
            keys.ArrowUp.pressed = false;
            break;
    }
});