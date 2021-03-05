const socket = io();

// For any basic messages from server, mainy errors
socket.on('message',message => {
    alert(message);
});

//Divs
const form = document.getElementById('input-form');
const addQues = document.getElementById('add-questions');
const game = document.getElementById('game');

//Input boxes
const usernameInput = document.getElementById('username-input');
const joinRoomInput = document.getElementById('join-room-input');
const createRoomInput = document.getElementById('create-room-input');


const timeLeftDisplay = document.getElementById('time-left');
const roomCodeInput = document.getElementById('roomCode');
const quesInput = document.getElementById('ques-input');
const randQuesInput = document.getElementById('random-question');
const playerTurnInput = document.getElementById('player-turn');

//Buttons
const joinBtn = document.getElementById('join-btn');
const createBtn = document.getElementById('create-btn');
const addQuesBtn = document.getElementById('add-ques-btn');
const startGameBtn = document.getElementById('start-game-btn');
const rotateBtn = document.getElementById('rotate-btn');
const randQuesBtn = document.getElementById('rand-ques-btn');

let timeLeft = 30;

const socketData={
    roomCode : "",
    questionArray : [],
    player :0,
    totalPlayers :0,
    userName : "",
};

// Listening for emits
socket.on('joined', roomState=>{
    if(roomState.roomGameState == "started"){
        form.style.display = "none";
        addQues.style.display = "blocl";
        game.style.display = "block"
    }
    else{
        form.style.display = "none";
        addQues.style.display = "block";
    }

    roomCodeInput.value = roomState.code; 

    // Updating the socket with the room's current state
    socketData.roomCode = roomState.code;
    socketData.player = roomState.count;
    console.log(socketData);
})

socket.on('room-created', roomCode => {
    socketData.userName = usernameInput.value;
    let data = {
        roomCode : roomCode,
        user : socketData.userName,
    }
    socket.emit('join-room',data);
})

// Updating total players
socket.on('total-players',count => {
    
    socketData.totalPlayers = count;
})

// Updating Socket's question array
socket.on('add-ques',newQuesArray=>{
    socketData.questionArray = newQuesArray;
    console.log(socketData);
})

// Start game countdown
socket.on('start-game', ()=>{
    countdown();
})

// Check if it's socket's turn and show whose turn it is
socket.on('player-turn',userTurn=>{
    playerTurnInput.value = userTurn;
    if(userTurn == socketData.userName){
        console.log(socketData.userName +"'s turn");
        randQuesBtn.disabled = false;
    }
})

// Display a random question
socket.on('rand-ques', ques =>{
    randQuesInput.value = ques;
    randQuesBtn.disabled = "true"
})



// Button handlers
joinBtn.addEventListener('click',joinButtonHandler);
createBtn.addEventListener('click',createButtonHandler);
addQuesBtn.addEventListener('click',addQueHandler);
startGameBtn.addEventListener('click',startGamehandler);
rotateBtn.addEventListener('click',rotateHandler);
randQuesBtn.addEventListener('click',randomQuesHandler);

// Functions
function createButtonHandler(){
    socket.emit("create-room");
}

function joinButtonHandler(){
    socketData.userName = usernameInput.value;
    let data = {
        roomCode : joinRoomInput.value,
        user : socketData.userName,
    }
    socket.emit("join-room",data);
}

function addQueHandler(){
    let data = {
        addedQuestion : quesInput.value,
        roomCode : socketData.roomCode, 
        user : socketData.userName,
    };
    quesInput.value = null;
    socket.emit('add-ques', data);
}

function startGamehandler(){
    let data = {
        roomCode : socketData.roomCode,
    };
    socket.emit('start-game',data);
}

// Selecting a random player
function rotateHandler(){
    let data = { 
        roomCode : socketData.roomCode, 
        turn : Math.floor(Math.random() * socketData.totalPlayers) +1,
    };
    console.log("turn: "+ data.turn);
    socket.emit('player-turn',data);
}

// Display a random-question
function randomQuesHandler(){
    data = {
        roomCode : socketData.roomCode,
    };
    socket.emit("rand-ques",data);

}

function countdown(){
    setInterval(function(){
        if(timeLeft <=0){
            clearInterval(timeLeft = 0);
            startMainGame();
        }
        timeLeftDisplay.innerHTML = timeLeft;
        timeLeft -= 1; 
    },1000)
}

function startMainGame(){
    addQues.style.display = "none";
    game.style.display = "block";
    
    let data = {
        gameState : "started",
        roomCode : socketData.roomCode,
    };

    socket.emit("game-started",data);
}