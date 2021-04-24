// import{ createSecKey } from "https://deno.land/std@0.94.0/ws/mod.ts";

// Create WebSocket connection.
const socket = new WebSocket("ws://localhost:8080");
// const socket =new sono("ws://localhost:8080")

socket.addEventListener("open", function (event) {
  console.log("Connected!", event);
});

socket.addEventListener("message", function (event) {
  console.log("Message!", event);
});





// socket.emit('customEvent', )