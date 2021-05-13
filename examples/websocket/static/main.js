import { SonoClient } from "./sono_client.js"

const sono = new SonoClient('ws://localhost:8080/ws');
sono.onconnection(()=>{
  sono.message('client connected')
})

sono.on('message', (payload) => {
  const messageBoard = document.getElementById('messageBoard');
  const newMessage = document.createElement('li')

  if(payload.message.username) newMessage.innerHTML = `<strong>${payload.message.username}:</strong> ${payload.message.message}`;
  else newMessage.innerHTML = payload.message;
  messageBoard.appendChild(newMessage);
})

document.getElementById('button').addEventListener('click', () => {
  const message = document.getElementById('input').value;
  const username = document.getElementById('username').value;
  sono.broadcast({message, username});
  const messageBoard = document.getElementById('messageBoard');
  const newMessage = document.createElement('li')
  newMessage.innerHTML = `<strong>${username}:</strong> ${message}`;
  newMessage.style.cssFloat='right';
  messageBoard.appendChild(newMessage);
  messageBoard.appendChild(document.createElement('br'));
});
