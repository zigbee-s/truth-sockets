// Importing from utils.js
const {makeid,shuffleArray} = require('./utils');

// Importing essentail packages
const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

// Setting up the server
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Assigning the port for Node to listen to
const PORT = process.env.PORT || 3000;

//set static folder
app.use(express.static(path.join(__dirname,"public")));

//start server
server.listen(PORT,() => console.log(`Listining to port ${PORT}`));

// Stores data about all the rooms
const rooms = [];

// Listining on sockets
io.on('connection',(socket) => {
    socket.on('create-room',handleCreateRoom);
    socket.on('join-room',handleJoinRoom);
    socket.on('add-ques',handleAddQues);


    // Functions
    function handleCreateRoom(){
        
        // Getting a random room number from makeid function
        const roomCode = makeid(5);

        // Creating an adding the room object to the rooms dictionary
        rooms[roomCode] = {
            code : roomCode,
            quesArray : [],
            count : 0,
            usersArray : [],
            roomGameState: "",
        }; 

        socket.emit("room-created",roomCode);
    }

    function handleJoinRoom(data){
        const roomCode = data.roomCode;
        
        // Check whether the room exists
        if(rooms[roomCode]){

            // Checking whether The client has entered a UserName
            if(data.user == ""){
                socket.emit("message","Please enter a valid username");
                return;
            }

            if(rooms[roomCode].roomGameState == "started"){
                socket.emit("message", "Game has already startd!");
                return;
            }

            // Checking if the given username already exists
            if(rooms[roomCode].usersArray.includes(data.user)){
                socket.emit("message","Usernmae already taken!");
                return;
            }

            rooms[roomCode].usersArray.push(data.user);

            
            // Increasing the number of clients in the room by 1 and pushing the new Username in the Room's username array
            rooms[roomCode].count +=1;
            
            socket.join(roomCode);
            socket.emit("joined",rooms[roomCode]);
            
            // Emitting the total user count to all the clients in a room
            io.to(rooms[roomCode].code).emit("total-players",rooms[roomCode].count);
            
        }   
    else{
        socket.emit("message",`The room ${roomCode} doesn't exist`);
    }}

    function handleAddQues(data){
        const roomCode = data.roomCode;
        rooms[roomCode].quesArray.push(data.addedQuestion);
        
        // Emitting the updated room's question array to all the clients in the room
        io.to(roomCode).emit('add-ques',rooms[roomCode].quesArray);
    }

    // Listening for more emits
    socket.on("begin-game", data=>{
        io.to(data.roomCode).emit("begin-game");
    })    
    
    socket.on("game-started", data => {
        // Only if the room exists
        if(rooms[data.roomCode]){
            rooms[data.roomCode].roomGameState = "started";
            let x = shuffleArray(rooms[data.roomCode].quesArray)
            socket.emit("game-started",x);
        }
    })

    socket.on('player-turn', data =>{
        let turn = Math.floor(Math.random() * rooms[data.roomCode].count);
        let userTurn = rooms[data.roomCode].usersArray[turn];
        let display ={
            shuffledArray : shuffleArray(rooms[data.roomCode].quesArray),
            userTurn : userTurn
        }
        io.to(data.roomCode).emit('player-turn', display);
    })

    socket.on('card-clicked',data => {
        let cardData = {
            cardId: data.cardId,
            quesArray : rooms[data.roomCode].quesArray,
        };
        io.to(data.roomCode).emit('card-clicked',cardData);
    })

    

})



 