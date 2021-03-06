const BG_COLOUR = '#231F20';
const SNAKE_COLOUR = '#c2c2c2';
const FOOD_COLOUR = '#e66916';

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

const socket = io('https://intense-springs-85677.herokuapp.com/');
socket.on('init',handleInit);
socket.on('gameState',handleGameState);
socket.on('gameOver',handleGameOver);
socket.on('gameCode',handleGameCode);
socket.on('unknownGame',handleUnknownGame);
socket.on('tooManyPlayers',handleTooManyPlayers);

newGameBtn.addEventListener('click',newGame);
joinGameBtn.addEventListener('click',joinGame);

let canvas,ctx;
let playerNumber;
let gameActive = false; 

function newGame(){
    socket.emit('newGame');
    init();
}

function joinGame(){
    const code= gameCodeInput.value;
    socket.emit('joinGame',code);
    init();
}

function init(){
    initialScreen.style.display="none";
    gameScreen.style.display="block";
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 400;

    ctx.fillStyle= BG_COLOUR;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    document.addEventListener('keydown',keydown);
    gameActive = true;
}

function keydown(e){
    socket.emit('keydown',e.keyCode);
}

function paintGame(state){
    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    const food= state.food;
    const gridsize=state.gridsize;
    const size = canvas.width/gridsize;
    
    ctx.fillStyle = FOOD_COLOUR;
    ctx.fillRect(food.x*size,food.y*size,size,size);

    paintPlayer(state.players[0],size,SNAKE_COLOUR);
    paintPlayer(state.players[1],size,'red');
}

function paintPlayer(playerState, size, colour){
    const snake= playerState.snake;
    ctx.fillStyle=colour;
    for(let cell of snake){
        ctx.fillRect(cell.x*size,cell.y*size,size,size);
    }
}


function handleInit(number){
    playerNumber = number;
}

function handleGameState(gameState){
    if(!gameActive){
        return;
    }
    gameState = JSON.parse(gameState);
    requestAnimationFrame(()=>paintGame(gameState));
}

function handleGameOver(data){
    if(!gameActive){
        return;
    }
    data= JSON.parse(data);
    if(data.winner === playerNumber){
        alert('You win!');
    }
    else{
        alert("You lose!");
    }
    gameActive = false;
}

function handleGameCode(gameCode){
    gameCodeDisplay.innerText = gameCode;
}

function handleUnknownGame(){
    reset();
    alert("Unknown game code");
}

function handleTooManyPlayers(){
    reset();
    alert("This game is already in progress");
}

function reset(){
    playerNumber = null;
    gameCodeInput.value = "";
    gameCodeDisplay.innerText = "";
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
}