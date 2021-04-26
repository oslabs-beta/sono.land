// import{ createSecKey } from "https://deno.land/std@0.94.0/ws/mod.ts";

// Create WebSocket connection.
const socket = new WebSocket("ws://localhost:8080");
// const socket =new sono("ws://localhost:8080")



socket.onopen(event => {
  console.log("Connected!", event);
});

socket.onerror(event => {
  console.log('error', event)
})

socket.onmessage(function (event) {
  console.log("Message!", event);
  //append message to message board
  const messageBoard = document.getElementById('messageBoard');
  const newMessage = document.createElement('li');
  newMessage.innerText = event.data;
  messageBoard.appendChild(newMessage);
});

document.getElementById('button').addEventListener('click', () => {
  socket.send(JSON.stringify({protocol: 'message', payload: {message: document.getElementById('input').value}}));
  console.log('In button script tag of index.html', document.getElementById('input').value)
})

document.getElementById('secret').addEventListener('click', () => {
  socket.send(JSON.stringify({protocol: 'changeChannel', payload: {to: 'secret'}}));
  console.log('In secret script tag of index.html')
})

document.getElementById('home').addEventListener('click', () => {
  socket.send(JSON.stringify({protocol: 'changeChannel', payload: {to: 'home'}}));
  console.log('In home script tag of index.html')
})



// socket.emit('customEvent', )