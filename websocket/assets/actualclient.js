
/**
 * Create a websocket connection
 */
const socket = new WebSocket("ws://localhost:8080/ws");
/**
 *
 * @param { * } event onopen confirms websocket connection, and evaluates
 */
socket.onopen = event => {
  console.log("Connected!", event);
};

socket.onerror = event => {
  console.log('error', event)
};

socket.onmessage = function (event) {
  console.log("Message!", event.data);
  //append message to message board
  const messageBoard = document.getElementById('messageBoard');
  const newMessage = document.createElement('li');
  const username = JSON.parse(event.data).username;
  const message = JSON.parse(event.data).message;
  newMessage.innerHTML = `<strong>${username}</strong>: ${message}`;
  messageBoard.appendChild(newMessage);
};

document.getElementById('button').addEventListener('click', () => {
  // socket.broadcast(message)
  socket.send(JSON.stringify({protocol: 'message', payload: {message: document.getElementById('input').value, username: document.getElementById('usernameInput').value}}));
  console.log('In button script tag of index.html', document.getElementById('input').value)
});

document.getElementById('connectSecret').addEventListener('click', () => {
  socket.send(JSON.stringify({protocol: 'changeChannel', payload: {to: 'secret'}}));
  console.log('In secret script tag of index.html')
  document.getElementById('currentChannel').innerText = 'Connected to Secret'
});

document.getElementById('connectHome').addEventListener('click', () => {
  socket.send(JSON.stringify({protocol: 'changeChannel', payload: {to: 'home'}}));
  console.log('In home script tag of index.html');
  document.getElementById('currentChannel').innerText = 'Connected to Home'
});
