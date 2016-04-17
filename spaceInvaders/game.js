/***************************************
 *   Space Invaders game               *
 *   by Daniel Dakev                   *
 *   5 games in 5 weeks                *
 *   Week 1                            *
 ***************************************/

var KEY_LEFT_ARROW = 37,
    KEY_RIGHT_ARROW = 39,
    KEY_UP_ARROW = 38,
    KEY_DOWN_ARROW = 40,
    KEY_A = 65,
    KEY_D = 68,
    KEY_W = 87,
    KEY_S = 83,
    KEY_SPACE = 32,
    KEY_M = 77,
    KEY_R = 82,
    KEY_1 = 49,
    KEY_2 = 50,
    KEY_3 = 51,
    FPS = 60,
    BULLET_COOLDOWN = 300;

var canvas,
    ctx,
    timestep=1000 / FPS,
    lastFrame = 0,
    lastDraw = 0,
    lastBullet = 0,
    lastDeath = -5000,
    delta = 0,
    freeze = false,
    upgrades = 0,
    score = 0,
    gameOver = 0, //0 for not over, 1 for loss, 2 for win
    screenWidth = 1366,
    screenHeight = 643,
    player,
    background,
    keysPressed = new Array(223),
    bullets = [],
    pickups = [],
    enemies = [];

var muted = false,
    markToMute = false,
    markBtn2 = false,
    markBtn3 = false,
    sound_shoot,
    sound_explosion,
    sound_bullet_collide,
    sound_player_death,
    sound_upgrade,
    music_background;

var image_lives = new Image(),
    image_powerup = new Image(),
    image_guiPanel = new Image(),
    image_background = new Image(),
    image_player = new Image(),
    image_enemy_bullet = new Image(),
    image_player_bullet = new Image(),
    image_upgrade = new Image(),
    image_enemies = new Image(),
    image_explosion = new Image(),
    resourcesLoaded = 0;

function Background() {
    this.width = 1366;
    this.height = 673;
    this.x = 0;
    this.y = 1277; // starting y position on the image
    this.speed = 1.5;
    this.image = image_background;
}
Background.prototype.move = function() {
    this.height=screenHeight*this.width/screenWidth;
    this.y -= this.speed;
    if(this.y > 1920-this.height) this.y=1920-this.height;
    if(this.y <= -this.height) this.y = 1920-this.height;
};
Background.prototype.draw = function(ctx) {
    if(this.y>=0) {
        ctx.drawImage(this.image,this.x,this.y,this.width,this.height,0,0,screenWidth,screenHeight);
    }
    else {
        ctx.drawImage(this.image,this.x,0,this.width,this.height+this.y,0,-this.y*screenHeight/this.height,screenWidth,screenHeight+this.y*screenHeight/this.height);
        ctx.drawImage(this.image,this.x,1920+this.y,this.width,-this.y,0,0,screenWidth,-this.y*screenHeight/this.height);
    }
};

function Player(x,y) {
    this.x = x;
    this.y = y;
    this.speedX = 0;
    this.speedY = 0;
    this.acceleration = 0.2;
    this.maxSpeed = 4;
    this.width = 41;
    this.height = 46;
    this.collisionBox = [1, 4, 1, 5];
    this.explosion = new Explosion();
    this.lives=3;
    this.image = image_player;
    this.imageX = 0;
    this.imageY = 0;
    this.imageWidth = 123/3;
    this.imageHeight = 138/3;
}
Player.prototype.moveTo = function(newX, newY) {
    this.x = newX;
    this.y = newY;
};
Player.prototype.moveBy = function(dX, dY) {
    this.imageX = dX==0?1:dX<0?0:2;
    this.imageY = dY==0?2:dY<0?1:0;
    
    if(dX == 0 && this.speedX != 0) {
        if(this.speedX < 0) {
            this.speedX += this.acceleration;
            if(this.speedX > 0) this.speedX = 0;
        }
        else {
            this.speedX -= this.acceleration;
            if(this.speedX < 0) this.speedX = 0;
        }
    }
    else if(dX != 0) {
        this.speedX += this.acceleration * dX / Math.sqrt(dX*dX + dY*dY);
    }
    if(dY == 0 && this.speedY != 0) {
        if(this.speedY < 0) {
            this.speedY += this.acceleration;
            if(this.speedY > 0) this.speedY = 0;
        }
        else {
            this.speedY -= this.acceleration;
            if(this.speedY < 0) this.speedY = 0;
        }
    }
    else if(dY != 0) {
        this.speedY += this.acceleration * dY / Math.sqrt(dX*dX + dY*dY);
    }
    if(Math.sqrt(this.speedX*this.speedX + this.speedY*this.speedY) > this.maxSpeed) {
        if(dX != 0 && Math.abs(this.speedX) < Math.abs(this.speedY))
            this.speedX += this.acceleration * dX / Math.sqrt(dX*dX + dY*dY);
        else if(dY != 0 && Math.abs(this.speedY) < Math.abs(this.speedX))
            this.speedY += this.acceleration * dY / Math.sqrt(dX*dX + dY*dY);
        this.speedX = this.maxSpeed*this.speedX/Math.sqrt(this.speedX*this.speedX + this.speedY*this.speedY);
        this.speedY = this.maxSpeed*this.speedY/Math.sqrt(this.speedX*this.speedX + this.speedY*this.speedY);
    }
    
    this.x += this.speedX;
    this.y += this.speedY;
    
    if(this.x < 20) {this.x = 20; this.imageX = 1;}
    if(this.y < 20) {this.y = 20; this.imageY = 2;}
    if(this.x > screenWidth - 20 - this.width) {this.x = screenWidth - 20 - this.width; this.imageX = 1;}
    if(this.y > screenHeight - 20 - this.height) {this.y = screenHeight - 20 - this.height; this.imageY = 2;}
};
Player.prototype.draw = function(ctx) {
    if(this.explosion.explosionFrame<7) {
        ctx.drawImage(this.image, this.imageX * this.imageWidth, this.imageY * this.imageHeight, this.imageWidth, this.imageHeight,
                  this.x, this.y, this.width, this.height);
    }
    this.explosion.draw(ctx,this.x, this.y, this.width, this.height);
};

function Bullet(x,y,type) {
    this.x = x;
    this.y = y;
    this.width = 4;
    this.height = 12;
    if(type >= 0) {
        this.width = 3;
        this.height = 9;
    }
    this.type = type;
    this.damage = (type+1)*0.5;
    this.collisionBox = [0, 0, 0, 0];
    this.explosion = new Explosion();
    this.speed = 0;
    if(type == -1)
        this.speed = -Math.random()*2 + 5;
    else
        this.speed = -4;
    this.image = (type==-1?image_enemy_bullet:image_player_bullet);
}
Bullet.prototype.moveTo = function(newX, newY) {
    this.x = newX;
    this.y = newY;
};
Bullet.prototype.move = function() {
    this.y += this.speed;
};
Bullet.prototype.draw = function(ctx) {
    if(this.explosion.explosionFrame<2) {
        if(this.type>0)
            ctx.drawImage(this.image, this.x-this.width*this.type/(2*(1+this.type)), this.y, this.width*(1+this.type/(this.type+1)), this.height*(1+this.type/(this.type+1)));
        else
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
    this.explosion.draw(ctx, this.x, this.y, this.width, this.height);
};

function Upgrade(x, y) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.speed = 2;
    this.collisionBox = [0, 0, 0, 0];
    this.image = image_upgrade;
}
Upgrade.prototype.moveTo = function(newX, newY) {
    this.x = newX;
    this.y = newY;
}
Upgrade.prototype.move = function() {
    this.y += this.speed;
}
Upgrade.prototype.draw = function(ctx) {
    ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.x, this.y, this.width, this.height);
}

function Enemy(type,x,y) {
    this.x = x;
    this.y = y;
    this.startY = y;
    this.changeY = 40;
    this.explosion = new Explosion();
    this.type = type;
    this.width = 72;
    this.height = 50;
    this.speed = 0.5;
    this.direction = 0; //0 for right, 1 for down, 2 for left, 3 for down again
    this.armor = 5-type;
    this.shootProbability = 0.002;
    this.upgradeProbability = 0.14;
    this.image = image_enemies;
    this.collisionBox = [0, 0, 0, 0];
    if(type==0) {
        this.collisionBox = [5.4, 10.8, 5.4, 10.8];
    }
    else if(type==1) {
        this.collisionBox = [21.6, 12, 21.6, 12];
    }
    else if(type==2) {
        this.collisionBox = [15.6, 11.4, 15.6, 11.4];
    }
    else if(type==3) {
        this.collisionBox = [18, 11.4, 18, 11.4];
    }
    else {
        this.collisionBox = [18.6, 10.2, 18.6, 10.2];
    }
}
Enemy.prototype.move = function() {
    if(this.direction == 0) {
        this.x += this.speed;
    }
    else if(this.direction == 2) {
        this.x -= this.speed;
    }
    else {
        this.y += this.speed;
        if(this.y-this.startY > this.changeY) {
            this.y = this.startY + this.changeY;
            this.startY = this.y;
            this.direction = (this.direction+1)%4;
        }
    }
    
};
Enemy.prototype.moveTo = function(newX, newY) {
    this.x = newX;
    this.y = newY;
};
Enemy.prototype.moveBy = function(dX, dY) {
    this.x += dX;
    this.y += dY;
};
Enemy.prototype.draw = function(ctx) {
    if(this.explosion.explosionFrame<7)
        ctx.drawImage(this.image, this.type*this.image.width/5, 0, this.image.width/5, this.image.height,
                  this.x, this.y, this.width, this.height);
    this.explosion.draw(ctx, this.x, this.y, this.width, this.height);
    
};

function Explosion() {
    this.explosionFrame = -1;                           //-1 for not exploding, otherwise between 0 and 19 for each frame, 20 for end and destroy
    this.explosionColumns = 5;
    this.explosionRows = 4;
    this.explosionSpeed = 0.5;
    this.status = 0;                                    //0 for not started, 1 for running, 2 for finishes
    this.explosionImage = image_explosion;
}
Explosion.prototype.start = function() {
    this.explosionFrame = 0;
    this.status = 1;
};
Explosion.prototype.advance = function() {
    this.explosionFrame += this.explosionSpeed;
    if(this.explosionFrame >= this.explosionColumns * this.explosionRows)
        this.status = 2;
};
Explosion.prototype.draw = function(ctx, x, y, width, height) {
    if(this.status == 1)
        ctx.drawImage(this.explosionImage,
                      this.explosionImage.width*(Math.floor(this.explosionFrame)%this.explosionColumns)/this.explosionColumns,
                      this.explosionImage.height*(Math.floor(Math.floor(this.explosionFrame)/this.explosionColumns))/this.explosionRows,
                      this.explosionImage.width/this.explosionColumns,
                      this.explosionImage.height/this.explosionRows,
                      x, y, Math.max(width,height), Math.max(width,height));
};

function drawGUI(ctx) {
    var deltaDraw = lastFrame - lastDraw;
    lastDraw = lastFrame;
    var temp = score, numD = (score==0?1:0);
    while(temp>0) {temp=Math.floor(temp/10); numD++;}
    ctx.drawImage(image_guiPanel, 0, 0, 310, 50, -5, -5, 315, 55);
    ctx.font = "20pt KenvectorFuture";
    ctx.fillText(score,10+20*(5-numD),28);
    ctx.drawImage(image_powerup, 120, 10, 20, 20);
    ctx.fillText(upgrades, 142, 28);
    if(player.lives <= 3) {
        for(var i=0; i<player.lives; i++)
            ctx.drawImage(image_lives, 185 + i*28, 10, 20, 20);
    }
    else {
        ctx.drawImage(image_lives, 185, 10, 20, 20);
        ctx.fillText(player.lives, 215, 28);
    }
    ctx.font = "20pt KenvectorFuture";
    ctx.fillText(Math.round(1000/deltaDraw) + " fps", screenWidth - 125, 40);
    ctx.font = "10pt KenvectorFuture";
    ctx.fillText("mute with m", screenWidth - 120, 60);
    
    if(gameOver == 1) {
        ctx.font = "48pt KenvectorFuture";
        ctx.fillText("Game Over", screenWidth/2 - 200, screenHeight/2);
        ctx.font = "20pt KenvectorFuture";
        ctx.fillText("You lost", screenWidth/2 - 72, screenHeight/2 + 48);
    }
    else if(gameOver == 2) {
        ctx.font = "48pt KenvectorFuture";
        ctx.fillText("Congratulations", screenWidth/2 - 330, screenHeight/2);
        ctx.font = "20pt KenvectorFuture";
        ctx.fillText("You won", screenWidth/2 - 65, screenHeight/2 + 48);
    }
}

function spawnEnemies() {
    for(var i = 0; i < 5; i++) {
        for(var j = 0; j < 7; j++) {
            enemies.push(new Enemy(i, 0.15*screenWidth+j*(0.7*screenWidth-72)/6, 0.05*screenHeight+i*0.1*screenHeight));
        }
    }
}

function spawnBullets(x, y, width) {
    if(upgrades == 0) {
        bullets.push(new Bullet(x + width/2 - 3/2, y, 0));
    }
    else if(upgrades == 1) {
        bullets.push(new Bullet(x + width/2 - 3/2 - 11, y + 13, 0));
        bullets.push(new Bullet(x + width/2 - 3/2 + 11, y + 13, 0));
    }
    else if(upgrades == 2) {
        bullets.push(new Bullet(x + width/2 - 3/2, y, 1));
    }
    else if(upgrades == 3) {
        bullets.push(new Bullet(x + width/2 - 3/2, y, 1));
        bullets.push(new Bullet(x + width/2 - 3/2 - 11, y + 13, 0));
        bullets.push(new Bullet(x + width/2 - 3/2 + 11, y + 13, 0));
    }
    else {
        bullets.push(new Bullet(x + width/2 - 3/2, y, 1));
        bullets.push(new Bullet(x + width/2 - 3/2 - 11, y + 13, 1));
        bullets.push(new Bullet(x + width/2 - 3/2 + 11, y + 13, 1));
    }
}

function spawnUpgrade(x, y) {
    pickups.push(new Upgrade(x - 10, y));
}

function collidingBoxes(a, b)
{
    if(Math.max(a.x+a.collisionBox[0],b.x+b.collisionBox[0])<Math.min(a.x+a.width-a.collisionBox[2],b.x+b.width-b.collisionBox[2]) &&
        Math.max(a.y+a.collisionBox[1],b.y+b.collisionBox[1])<Math.min(a.y+a.height-a.collisionBox[3],b.y+b.height-b.collisionBox[3]))
        return true;
    else return false;
}

function updateNewDims(oldW, newW, oldH, newH)
{
    player.moveTo(player.x*newW/oldW,player.y*newH/oldH);
    enemies.forEach(function(e) {e.moveTo(e.x*newW/oldW,e.y*newH/oldH); e.startY = e.startY*newH/oldH});
    bullets.forEach(function(b) {b.moveTo(b.x*newW/oldW,b.y*newH/oldH);});
    pickups.forEach(function(p) {p.moveTo(p.x*newW/oldW,p.y*newH/oldH);});
}

function initialize() {
    for(var i=0; i<223; i++)
        keysPressed[i] = false;
    document.addEventListener("keydown", function(e) {keysPressed[e.keyCode]=true;});
    document.addEventListener("keyup", function(e) {keysPressed[e.keyCode]=false;});
    
    screenHeight = window.innerHeight;
    screenWidth = window.innerWidth;
    canvas = document.getElementById("gameWindow");
    canvas.height = screenHeight;
    canvas.width = screenWidth;
    ctx = canvas.getContext('2d');
    ctx.fillStyle = "#fff";
    player = new Player(screenWidth/2-41/2,screenHeight*0.95-46);
    background = new Background();
    spawnEnemies();
    
    image_background.onload = function() {resourcesLoaded++;};
    image_lives.onload = function() {resourcesLoaded++;};
    image_powerup.onload = function() {resourcesLoaded++;};
    image_guiPanel.onload = function() {resourcesLoaded++;};
    image_player.onload = function() {resourcesLoaded++;};
    image_enemy_bullet.onload = function() {resourcesLoaded++;};
    image_player_bullet.onload = function() {resourcesLoaded++;};
    image_upgrade.onload = function() {resourcesLoaded++;};
    image_enemies.onload = function() {resourcesLoaded++;};
    image_explosion.onload = function() {resourcesLoaded++;};
    image_background.src = "images/backgroundBig.png";
    image_lives.src = "images/livesIcon.png";
    image_powerup.src = "images/upgradeIcon.png";
    image_guiPanel.src = "images/GUIPanel.png";
    image_player.src = "images/spaceshipSprite.png";
    image_enemy_bullet.src = "images/enemy_bullet.png";
    image_player_bullet.src = "images/player_bullet.png";
    image_upgrade.src = "images/upgrade.png";
    image_enemies.src = "images/enemies.png";
    image_explosion.src = "images/explosion.png";
    
    sound_shoot = new Audio("sounds/bullet_shoot.wav");
    music_background = new Audio("sounds/background_music.wav");
    music_background.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    });
    music_background.play();
    
    main(0);
}

function main(timestamp) {
    window.requestAnimationFrame(main);
    delta = timestamp - lastFrame;
    lastFrame = timestamp;
    
    if(window.innerHeight != screenHeight || window.innerWidth != screenWidth) {
        updateNewDims(screenWidth,window.innerWidth,screenHeight,window.innerHeight);
        screenHeight = window.innerHeight;
        screenWidth = window.innerWidth;
        canvas.width = screenWidth;
        canvas.height = screenHeight;
        ctx.fillStyle="#fff";
    }
    
    if(resourcesLoaded == 10) {
        update(delta);
        draw(ctx);
    }
    else {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.font = "30pt sans-serif";
        ctx.fillText("Loading " + 100*(resourcesLoaded/10) + "%", screenWidth/2 - 130, screenHeight/2);
    }
}

function update(delta) {
    background.move();
    if(keysPressed[KEY_M]) markToMute = true;
    else if(!keysPressed[KEY_M]&&markToMute) {muted=!muted; markToMute=false;}
    music_background.muted=muted;
    if(keysPressed[KEY_1]) {
        enemies.forEach(function(e) {
            if(e.explosion.status == 0) e.explosion.start();
            if(!muted) {
                sound_explosion = new Audio("sounds/enemy_explosion.wav");
                sound_explosion.play();
            }
        });
    }
    if(keysPressed[KEY_2]) markBtn2 = true;
    else if(!keysPressed[KEY_2]&&markBtn2) {
        markBtn2 = false;
        spawnUpgrade(Math.random()*screenWidth, -20);
    }
    if(keysPressed[KEY_3]) markBtn3 = true;
    else if(!keysPressed[KEY_3]&&markBtn3) {
        markBtn3 = false;
        player.lives++;
    }
    
    var n=bullets.length;
    for(var i=0; i<n; i++) {
        if(bullets[i].explosion.status == 0)
            bullets[i].move();
        else
            bullets[i].explosion.advance();
        if(bullets[i].y<=-bullets[i].height || bullets[i].y>=screenHeight || bullets[i].explosion.status == 2) {
            delete bullets[i];
            bullets.splice(i,1);
            n--;
            i--;
        }
    }
    
    var u = pickups.length;
    for(var i=0; i<u; i++) {
        pickups[i].move();
        if(pickups[i].y >= screenHeight) {
            delete pickups[i];
            pickups.splice(i,1);
            u--;
            i--;
        }
        else if(collidingBoxes(player,pickups[i])) {
            upgrades++;
            score += 50;
            if(!muted) {
                sound_upgrade = new Audio("sounds/upgrade.wav");
                sound_upgrade.play();
            }
            delete upg;
            pickups.splice(i,1);
            u--;
            i--;
        }
    }
    
    if(freeze) {
        if(gameOver == 0 && lastFrame - lastDeath >= 2000) {
            player.moveTo(screenWidth/2-41/2,screenHeight*0.95-46);
            player.explosion.explosionFrame = -1;
            player.speedX = 0;
            player.speedY = 0;
            player.explosion.status = 0;
            freeze=false;
        }
        else return;
    }
    
    if(enemies.length == 0)
        gameOver = 2;
    
    if(player.explosion.status > 0) {
        if(player.explosion.status == 2) {
            freeze=true;
        }
        else {
            player.explosion.advance();
            enemies.forEach(function(enemy) {
                if(enemy.explosion.status > 0) {
                    if(enemy.explosion.status == 1) enemy.explosion.advance();
                    else {enemies.splice(enemies.indexOf(enemy),1); delete enemy;}
                }
            });
            bullets.forEach(function(bullet) {
                bullet.move();
                if(bullet.y<=-bullet.height || bullet.y>=screenHeight) {bullets.splice(bullets.indexOf(bullet),1); delete bullet;}
            });
            pickups.forEach(function(upg) {
                upg.move();
                if(upg.y >= screenHeight) {pickups.splice(pickups.indexOf(upg),1); delete upg;}
            });
            return;
        }
    }
    var playerdX = Math.max(keysPressed[KEY_RIGHT_ARROW], keysPressed[KEY_D]) - Math.max(keysPressed[KEY_LEFT_ARROW], keysPressed[KEY_A]);
    var playerdY = Math.max(keysPressed[KEY_DOWN_ARROW], keysPressed[KEY_S]) - Math.max(keysPressed[KEY_UP_ARROW], keysPressed[KEY_W]);
    if(playerdX != 0 || playerdY != 0)
        player.moveBy(delta*playerdX/Math.sqrt(playerdX*playerdX+playerdY*playerdY),delta*playerdY/Math.sqrt(playerdX*playerdX+playerdY*playerdY));
    else
        player.moveBy(0,0);
    
    var shouldChangeDir = 0;
    enemies.forEach(function(enemy) {
        enemy.move();
        if(shouldChangeDir == 0 && enemy.x > 0.95*screenWidth - 72) {
            shouldChangeDir = enemy.x - 0.95*screenWidth + 72;
        }
        if(shouldChangeDir == 0 && enemy.x < 0.05*screenWidth) {
            shouldChangeDir = enemy.x - 0.05*screenWidth;
        }
        if(Math.random() < enemy.shootProbability) {
            bullets.push(new Bullet(enemy.x+enemy.width/2-2, enemy.y+enemy.height-enemy.collisionBox[3]-12, -1));
            
        }
    });
    if(shouldChangeDir!=0) {
        enemies.forEach(function(enemy) {
            enemy.x -= shouldChangeDir;
            enemy.direction = (enemy.direction+1)%4;
        });
    }
    
    if(keysPressed[KEY_SPACE]) {
        if(lastFrame - lastBullet >= BULLET_COOLDOWN) {
            spawnBullets(player.x, player.y+player.collisionBox[1], player.width);
            lastBullet = lastFrame;
            if(!muted) {
                sound_shoot = new Audio("sounds/bullet_shoot.wav");
                sound_shoot.play();
            }
        }
    }
    
    var enC = enemies.length;
    var buC = bullets.length;
    for(var i=0; i<enC; i++) {
        if(enemies[i].explosion.status == 1) {
            enemies[i].explosion.advance();
            continue;
        }
        if(enemies[i].explosion.status == 2) {
            delete enemies[i];
            enemies.splice(i,1);
            enC--;
            i--;
            continue;
        }
        if(collidingBoxes(enemies[i],player) && lastFrame - lastDeath > 5000) {
            enemies[i].explosion.start();
            score += (4-enemies[i].type)*50 + 100;
            if(Math.random() < enemies[i].upgradeProbability)
                spawnUpgrade(enemies[i].x+enemies[i].width/2, enemies[i].y+enemies[i].height/2);
            player.explosion.start();
            lastDeath = lastFrame;
            player.lives--;
            upgrades = Math.floor(upgrades/2);
            if(player.lives == 0) gameOver = 1;
            if(!muted) {
                sound_player_death = new Audio("sounds/player_explosion.wav");
                sound_player_death.play();
            }
        }
        for(var j=0; j<buC; j++) {
            if(bullets[j].explosion.status > 0) continue;
            if(collidingBoxes(enemies[i],bullets[j]) && bullets[j].type >= 0)
            {
                enemies[i].armor-=bullets[j].damage;
                if(enemies[i].armor <= 0) {
                    enemies[i].explosion.start();
                    score += (4-enemies[i].type)*50 + 100;
                    if(Math.random() < enemies[i].upgradeProbability)
                        spawnUpgrade(enemies[i].x+enemies[i].width/2, enemies[i].y+enemies[i].height/2);
                    if(!muted) {
                        sound_explosion = new Audio("sounds/enemy_explosion.wav");
                        sound_explosion.play();
                    }
                }
                bullets[j].explosion.start();
                if(!muted) {
                    sound_bullet_collide = new Audio("sounds/bullet_collision.wav");
                    sound_bullet_collide.play();
                }
            }
            if(collidingBoxes(player,bullets[j]) && bullets[j].type == -1) {
                if(lastFrame - lastDeath <= 5000) continue;
                player.explosion.start();
                lastDeath = lastFrame;
                player.lives--;
                upgrades = Math.floor(upgrades/2);
                if(player.lives == 0) gameOver = 1;
                if(!muted) {
                    sound_player_death = new Audio("sounds/player_explosion.wav");
                    sound_player_death.play();
                }
                bullets[j].explosion.start();
                if(!muted) {
                    sound_bullet_collide = new Audio("sounds/bullet_collision.wav");
                    sound_bullet_collide.play();
                }
            }
        }
    }
}

function draw(ctx) {    
    ctx.clearRect(0,0,canvas.width,canvas.height);
    
    background.draw(ctx);
    bullets.forEach(function(bull) {bull.draw(ctx);});
    pickups.forEach(function(upg) {upg.draw(ctx);});
    if(!((lastFrame - lastDeath >= 2500 && lastFrame - lastDeath <= 3000) ||
         (lastFrame - lastDeath >= 3500 && lastFrame - lastDeath <= 4000) ||
         (lastFrame - lastDeath >= 4500 && lastFrame - lastDeath <= 5000)))
       player.draw(ctx);
    enemies.forEach(function(enemy) {enemy.draw(ctx);});
    drawGUI(ctx);
}