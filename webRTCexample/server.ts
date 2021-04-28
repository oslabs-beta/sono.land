import { Server } from '../exports.ts';

const server = new Server();

server.run(3000);






//what functionality do we want?
//after the server is running, the websocket connection is established... now what?







// //require our websocket library
// var WebSocketServer = require('ws').Server;

// //creating a websocket server at port 9090
// var wss = new WebSocketServer({port: 9090});

// //when a user connects to our sever
// wss.on('connection', function(connection) {
//    console.log("user connected");

//    //when server gets a message from a connected user
//    connection.on('message', function(message){
//       console.log("Got message from a user:", message);
//    });

//    connection.send("Hello from server");
// });