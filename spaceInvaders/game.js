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
    KEY_SPACE = 32,
    KEY_M = 77,
    FPS = 60,
    BULLET_COOLDOWN = 300;

var canvas,
    ctx,
    timestep=1000 / FPS,
    lastFrame = 0,
    lastDraw = 0,
    lastBullet = 0,
    delta = 0,
    freeze = false,
    screenWidth = 1366,
    screenHeight = 643,
    player,
    background,
    keysPressed = new Array(223),
    bullets = [],
    enemies = [];

var muted = false,
    markToMute = false,
    sound_shoot,
    sound_explosion,
    sound_bullet_collide,
    sound_player_death,
    music_background;

function Background() {
    this.width = 1366;
    this.height = 643;
    this.x = 0;
    this.y = 1277; // starting y position on the image
    this.speed = 1.5;
    this.image = new Image();
    this.image.src = "images/backgroundBig.png";
}
Background.prototype.move = function() {
    this.y -= this.speed;
    if(this.y <= -643) this.y = 1277;
};
Background.prototype.draw = function(ctx) {
    if(this.y>=0) {
        ctx.drawImage(this.image,this.x,this.y,this.width,this.height,0,0,1366,643);
    }
    else {
        ctx.drawImage(this.image,this.x,0,this.width,this.height+this.y,0,-this.y,1366,643+this.y);
        ctx.drawImage(this.image,this.x,1920+this.y,this.width,-this.y,0,0,1366,-this.y);
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
    this.image = new Image();
    this.image.src = "images/spaceshipSprite.png";
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
    this.type = type;
    this.collisionBox = [0, 0, 0, 0];
    this.explosion = new Explosion();
    this.speed = 4*(type==0?-1:1);
    this.image = new Image();
    this.image.src = (type==0?"images/player_bullet.png":"images/enemy_bullet.png");
}
Bullet.prototype.moveTo = function(newX, newY) {
    this.x = newX;
    this.y = newY;
};
Bullet.prototype.move = function() {
    this.y += this.speed;
};
Bullet.prototype.draw = function(ctx) {
    if(this.explosion.explosionFrame<7) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
    this.explosion.draw(ctx, this.x, this.y, this.width, this.height);
};

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
    this.shootProbability = 0.001;
    this.image = new Image();
    this.image.src = "images/enemies.png";
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
    this.explosionImage = new Image();
    this.explosionImage.src = "images/explosion.png";
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

function spawnEnemies() {
    for(var i = 0; i < 5; i++) {
        for(var j = 0; j < 7; j++) {
            enemies.push(new Enemy(i, 0.15*screenWidth+j*(0.7*screenWidth-72)/6, 0.05*screenHeight+i*0.1*screenHeight));
        }
    }
}

function collidingBoxes(a, b)
{
    if(Math.max(a.x+a.collisionBox[0],b.x+b.collisionBox[0])<Math.min(a.x+a.width-a.collisionBox[2],b.x+b.width-b.collisionBox[2]) &&
        Math.max(a.y+a.collisionBox[1],b.y+b.collisionBox[1])<Math.min(a.y+a.height-a.collisionBox[3],b.y+b.height-b.collisionBox[3]))
        return true;
    else return false;
}

function initialize() {
    for(var i=0; i<223; i++)
        keysPressed[i] = false;
    document.addEventListener("keydown", function(e) {keysPressed[e.keyCode]=true;});
    document.addEventListener("keyup", function(e) {keysPressed[e.keyCode]=false;});
    
    canvas = document.getElementById("gameWindow");
    ctx = canvas.getContext('2d');
    ctx.fillStyle="#fff";
    player = new Player(673,550);
    background = new Background();
    sound_shoot = new Audio("sounds/bullet_shoot.wav");
    music_background = new Audio("sounds/background_music.wav");
    music_background.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    });
    music_background.play();
    spawnEnemies();
    
    main(0);
}

function main(timestamp) {
    window.requestAnimationFrame(main);
    delta = timestamp - lastFrame;
    lastFrame = timestamp;
    
    update(delta);
    draw(ctx);
}

function update(delta) {
    background.move();
    if(keysPressed[KEY_M]) markToMute = true;
    else if(!keysPressed[KEY_M]&&markToMute) {muted=!muted; markToMute=false;}
    music_background.muted=muted;
    
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
    
    if(freeze) return;
    
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
                if(bullet.y<=-bullet.height) {bullets.splice(bullets.indexOf(bullet),1); delete bullet;}
            });
            return;
        }
    }
    var playerdX = keysPressed[KEY_RIGHT_ARROW] - keysPressed[KEY_LEFT_ARROW];
    var playerdY = keysPressed[KEY_DOWN_ARROW] - keysPressed[KEY_UP_ARROW];
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
            bullets.push(new Bullet(enemy.x+enemy.width/2-2, enemy.y+enemy.height-enemy.collisionBox[3]-12, 1));
            
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
            bullets.push(new Bullet(player.x + player.width/2 - 2, player.y + player.collisionBox[1], 0));
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
        }
        if(collidingBoxes(enemies[i],player)) {
            if(enemies[i].explosion.status == 0) enemies[i].explosion.start();
            player.explosion.start();
            if(!muted) {
                sound_player_death = new Audio("sounds/player_explosion.wav");
                sound_player_death.play();
            }
        }
        for(var j=0; j<buC; j++) {
            if(bullets[j].explosion.status > 0) continue;
            if(collidingBoxes(enemies[i],bullets[j]) && bullets[j].type == 0)
            {
                enemies[i].armor--;
                if(enemies[i].armor == 0) {
                    if(enemies[i].explosion.status == 0) enemies[i].explosion.start();
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
            if(collidingBoxes(player,bullets[j]) && bullets[j].type == 1) {
                player.explosion.start();
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
    var deltaDraw = lastFrame - lastDraw;
    lastDraw = lastFrame;
    
    ctx.clearRect(0,0,canvas.width,canvas.height);
    
    background.draw(ctx);
    bullets.forEach(function(bull) {bull.draw(ctx);});
    player.draw(ctx);
    enemies.forEach(function(enemy) {enemy.draw(ctx);});
    ctx.font = "24pt sans-serif";
    ctx.fillText(Math.round(1000/deltaDraw) + " fps",20,40);
    ctx.font = "10pt sans-serif";
    ctx.fillText("Last update: sounds!!! (mute with m)",20,60);
}