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
    FPS = 60;

var canvas,
    ctx,
    timestep=1000 / FPS,
    lastFrame = 0,
    lastDraw = 0,
    delta = 0,
    screenWidth = 1366,
    screenHeight = 643,
    player,
    background,
    keysPressed = new Array(223);

function Player(x,y) {
    this.x = x;
    this.y = y;
    this.speedX = 0;
    this.speedY = 0;
    this.acceleration = 0.2;
    this.maxSpeed = 4;
    this.width = 42;
    this.height = 44;
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
        if(this.dX != 0 && Math.abs(this.speedX) < Math.abs(this.speedY))
            this.speedX += this.acceleration * dX / Math.sqrt(dX*dX + dY*dY);
        else if(this.dY != 0 && Math.abs(this.speedY) < Math.abs(this.speedX))
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
    ctx.drawImage(this.image, this.imageX * this.imageWidth, this.imageY * this.imageHeight, this.imageWidth, this.imageHeight,
                  this.x, this.y, this.width, this.height);
};

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

function initialize() {
    for(var i=0; i<223; i++)
        keysPressed[i] = false;
    document.addEventListener("keydown", function(e) {keysPressed[e.keyCode]=true;});
    document.addEventListener("keyup", function(e) {keysPressed[e.keyCode]=false;});
    
    canvas = document.getElementById("gameWindow");
    ctx = canvas.getContext('2d');
    player = new Player(673,550);
    background = new Background();
    ctx.font = "24pt sans-serif";
    ctx.fillStyle="#fff";
    
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
    var playerdX = keysPressed[KEY_RIGHT_ARROW] - keysPressed[KEY_LEFT_ARROW];
    var playerdY = keysPressed[KEY_DOWN_ARROW] - keysPressed[KEY_UP_ARROW];
    if(playerdX != 0 || playerdY != 0)
        player.moveBy(delta*playerdX/Math.sqrt(playerdX*playerdX+playerdY*playerdY),delta*playerdY/Math.sqrt(playerdX*playerdX+playerdY*playerdY));
    else
        player.moveBy(0,0);
    background.move();
}

function draw(ctx) {
    var deltaDraw = lastFrame - lastDraw;
    lastDraw = lastFrame;
    
    ctx.clearRect(0,0,canvas.width,canvas.height);
    
    background.draw(ctx);
    player.draw(ctx);
    ctx.fillText(Math.round(1000/deltaDraw) + " fps",20,40);
}