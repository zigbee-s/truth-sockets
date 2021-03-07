const socket = io();

// For any basic messages from server, mainy errors
socket.on('message',message => {
    alert(message);
});

//Divs
const form = document.getElementById('input-form');
const addQues = document.getElementById('add-questions');
const game = document.getElementById('game');
const containerDiv = document.querySelector('.container');



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


let timeLeft = 10;
let action = 1;

const socketData={
    roomCode : "",
    questionArray : [],
    player :0,
    totalPlayers :0,
    userName : "",
    turn : false,
};

// Listening for emits
socket.on('joined', roomState=>{
    
    form.style.display = "none";
    addQues.style.display = "block";

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
socket.on('begin-game', ()=>{
    countdown();
})


socket.on('game-started',quesArray => {
    console.log(quesArray);
    produce(quesArray);
})

socket.on('card-clicked',data => {
    let x = document.getElementById(data.cardId);
    socketData.questionArray = data.quesArray;
    x.style.transform = "translateY(100px)"; 
    for(let j =0; j<data.quesArray.length; j++){
        console.log("off");
        let y = document.getElementById(j+"a");
        console.log(y);
        y.onclick = "return false";
    }
})

// Check if it's socket's turn and show whose turn it is
socket.on('player-turn',display=>{
    containerDiv.innerHTML = "";
    produce(display.shuffledArray);
    playerTurnInput.value = display.userTurn;
    if(display.userTurn == socketData.userName){
        console.log(socketData.userName +"'s turn");
        socketData.turn = true;
    }
    else{
        socketData.turn = false;
    }
})



// Button handlers
joinBtn.addEventListener('click',joinButtonHandler);
createBtn.addEventListener('click',createButtonHandler);
addQuesBtn.addEventListener('click',addQueHandler);
startGameBtn.addEventListener('click',startGamehandler);
rotateBtn.addEventListener('click',rotateHandler);

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
    socket.emit('begin-game',data);
}

// Selecting a random player
function rotateHandler(){
    let data = { 
        roomCode : socketData.roomCode, 
    };
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
    let interval = setInterval(function(){
        if(timeLeft <=0){
            clearInterval(interval);

            addQues.style.display = "none";
            game.style.display = "block";

            let data = {
                gameState : "started",
                roomCode : socketData.roomCode,
            };
                socket.emit("game-started",data);
        
        }
        timeLeftDisplay.innerHTML = timeLeft;
        timeLeft -= 1; 
    },1000)
}


function produce(arr){
    for(let i = 0; i < arr.length ; i++){
        containerDiv.innerHTML += `<div class="card"  >
        <div class="face face1"  id = ${i+"a"} onclick = "onClickCardHandler(${i})">
          <div class="content">
             <i class="fab fa-windows"></i>            
            <h3>Windows</h3>
          </div>
        </div>
        <div class="face face2" id = ${i}>
          <div class="content">
            <p>${arr[i]}</p>
          </div>
        </div>
     </div>`
    }
}


function onClickCardHandler(i) {
    if(socketData.turn){
        let data = {
            cardId: i,
            roomCode : socketData.roomCode,
        };
        socket.emit("card-clicked",data)
    }
    else{
        return false;
    }
  }


