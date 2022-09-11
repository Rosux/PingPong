const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const getRandomFloat = (min, max, decimals) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

var leftPong = new Audio('audio/blipSelect(1).wav');
var rightPong = new Audio('audio/blipSelect(2).wav');
var death = new Audio('audio/hitHurt.wav');

var paddleSpeed = 4;
var maxBallSpeed = 3.5;
var ballSpeed = 3.5;
var paddleLeftX = 0;
var paddleRightX = 0;
var muted = false;

class Game {
    constructor(){
        this.paused = false;
        this.isRunning = false;
        this.score = {left: 0, right: 0};
        this.lastscore = 0;
        this.height = 256;
        this.width = 512;
        this.backgroundColor = "#000";
        this.ball = new Ball(this.width/2, this.height/2);
        this.paddle = {
            left: {
                x: 35,
                y: clamp(this.height/2, 28/2, this.height-(28/2)),
                vel: 0,
                height: 28,
                width: 2
            },
            right: {
                x: this.width-35,
                y: clamp(this.height/2, 28/2, this.height-(28/2)),
                vel: 0,
                height: 28,
                width: 2
            }
        }
    }
    start(){
        if(!this.isRunning){
            this.isRunning = true;
            this.paused = false;
            this.playRound();
        }
    }
    pause(){
        this.paused = !this.paused;
        if(!this.isRunning && !this.paused){
            playRound();
        }
    }
    update(deltatime){
        if(this.paused) return;
        if(this.ball.pos.x < 0){
            this.score.right++;
            this.lastscore = 1;
            if(!muted){
                death.play();
            }
            this.playRound();
        }
        if(this.ball.pos.x > this.width){
            this.score.left++;
            this.lastscore = 0;
            if(!muted){
                death.play();
            }
            this.playRound();
        }
        // update stuff
        this.movePaddles(deltatime);
        this.ball.update(this.paddle, deltatime);
    }
    render(){
        // canvas
        var canvas = document.querySelector("canvas[ping=pong]");
        var ctx = canvas.getContext("2d");
        // background
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0,0,this.width,this.height);
        // center
        ctx.fillStyle = "#1c1c1ca5";
        ctx.fillRect(this.width/2-1, 0, 2, this.height);
        // balls
        if(this.isRunning) this.ball.render(ctx);
        // paddles
        ctx.fillStyle = "#fff";
        ctx.fillRect(this.paddle.left.x-(this.paddle.left.width/2), this.paddle.left.y-(this.paddle.left.height/2), this.paddle.left.width, this.paddle.left.height);
        ctx.fillRect(this.paddle.right.x-(this.paddle.right.width/2), this.paddle.right.y-(this.paddle.right.height/2), this.paddle.right.width, this.paddle.right.height);
        // score
        ctx.fillStyle = "#fff";
        ctx.font = '40';
        ctx.textAlign = 'left';
        ctx.fillText(this.score.left, 5, 14);
        ctx.textAlign = 'right';
        ctx.fillText(this.score.right, this.width-5, 14);
        if(this.paused){
            ctx.textAlign = 'center';
            ctx.fillText("PAUSED", this.width/2, this.height/2);
        }
        if(!this.isRunning){
            ctx.textAlign = 'center';
            ctx.fillText("Click To Start", this.width/2, this.height/2);
        }
    }
    movePaddles(deltatime){
        if(this.paused) return;
        if(!deltatime) return;
        // this.paddle.left.y = this.paddle.left.y += this.paddle.left.vel * paddleSpeed * deltatime;
        // this.paddle.right.y = this.paddle.right.y += this.paddle.right.vel * paddleSpeed * deltatime;
        this.paddle.left.y = clamp(this.paddle.left.y += this.paddle.left.vel * paddleSpeed, this.paddle.left.height/2, this.height-(this.paddle.left.height/2));
        this.paddle.right.y = clamp(this.paddle.right.y += this.paddle.right.vel * paddleSpeed, this.paddle.right.height/2, this.height-(this.paddle.right.height/2));
    }
    playRound(){
        if(!this.isRunning) return;
        this.ball.pos.x = this.width/2;
        this.ball.pos.y = this.height/2;
        if(this.lastscore == 1) this.ball.vel.x = -maxBallSpeed;
        if(this.lastscore == 0) this.ball.vel.x = maxBallSpeed;
        this.ball.vel.y = getRandomFloat(-(maxBallSpeed/2), (maxBallSpeed/2), 2);
        this.paddle.left.y = this.height/2;
        this.paddle.right.y = this.height/2;
    }
    reset(){
        this.score.left = 0;
        this.score.right = 0;
        this.ball.pos.x = this.width/2;
        this.ball.pos.y = this.height/2;
        this.ball.vel.x = 0;
        this.ball.vel.y = 0;
        this.paddle.left.y = this.height/2;
        this.paddle.right.y = this.height/2;
        this.playRound();
    }
    mute(){
        muted = !muted;
        if(muted){
            document.querySelector("h1[mutebutton='']").innerHTML = "&#128264;";
        }
        if(!muted){
            document.querySelector("h1[mutebutton='']").innerHTML = "&#128266;";
        }
    }
}

class Ball{
    constructor(x, y){
        this.pos = {x: x, y: y};
        this.vel = {x: clamp(0, -maxBallSpeed, maxBallSpeed), y: clamp(0, -maxBallSpeed, maxBallSpeed)};
        this.color = "#fff";
        this.game = {width: x*2, height: y*2};
    }
    update(paddle, deltatime){
        if(!deltatime) return;
        if(this.pos.y >= this.game.height || this.pos.y <= 0){
            this.vel.y = -this.vel.y;
        }
        // TODO FIX COLLISION DETECTION TO HAVE A WIDER CHECK WITH (right now it checks for 1 pixel)
        if(this.pos.x >= paddle.left.x-(paddle.left.width/2) && this.pos.x <= paddle.left.x+(paddle.left.width/2)){
            if(this.pos.y >= paddle.left.y-paddle.left.height/2 && this.pos.y <= paddle.left.y+paddle.left.height/2){
                let offset = (this.pos.y - paddle.left.y) / paddle.left.height / 2;
                this.vel.y = offset * deltatime;
                this.vel.x = -this.vel.x;
                if(!muted){
                    leftPong.play();
                }
            }
        }
        // TODO FIX COLLISION DETECTION TO HAVE A WIDER CHECK WITH (right now it checks for 1 pixel)
        if(this.pos.x >= paddle.right.x-(paddle.right.width/2) && this.pos.x <= paddle.right.x+(paddle.right.width/2)){
            if(this.pos.y >= paddle.right.y-paddle.right.height/2 && this.pos.y <= paddle.right.y+paddle.right.height/2){
                let offset = (this.pos.y - paddle.right.y) / paddle.right.height / 2;
                this.vel.y = offset * deltatime;
                this.vel.x = -this.vel.x;
                if(!muted){
                    rightPong.play();
                }
            }
        }
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
    }
    render(ctx){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.pos.x-2,this.pos.y-2,4,4);
    }
    setVel(x, y){
        this.vel.x = x;
        this.vel.y = y;
    }
}

let game = new Game();
game.playRound();

let lastTime = 0;
function gameloop(timestamp){
    if(!timestamp) return;
    let deltatime = timestamp - lastTime;
    // lastTime = timestamp;
    console.log(deltatime);
    lastTime = timestamp;
    /* -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- */
    // controlls
    document.onkeyup=(e)=>{
        if(e.key == "ArrowUp"){
            paddleLeftX = 0;
        }
        if(e.key == "ArrowDown"){
            paddleLeftX = 0;
        }
        if(e.key == "w"){
            paddleRightX = 0;
        }
        if(e.key == "s"){
            paddleRightX = 0;
        }
    };
    document.onkeydown=(e)=>{
        if(e.key == "r"){
            game.reset();
        }
        if(e.key == "p"){
            game.pause();
        }
        if(e.key == "ArrowUp"){
            paddleLeftX = -1;
        }
        if(e.key == "ArrowDown"){
            paddleLeftX = 1;
        }
        if(e.key == "w"){
            paddleRightX = -1;
        }
        if(e.key == "s"){
            paddleRightX = 1;
        }
    };
    // set velocity of paddles
    game.paddle.left.vel = paddleRightX;
    game.paddle.right.vel = paddleLeftX;
    /* -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- */
    game.update(deltatime);
    game.render();
    requestAnimationFrame(gameloop);
}

window.requestAnimationFrame(gameloop);
// gameloop();