import { SonoClient } from "../../mod.ts"
import { SonoRTC } from "../../mod.ts"

const sono = new SonoClient('ws://localhost:8080/ws');
sono.onconnection(()=>{
  sono.message('client connected')
})

sono.on('message', (payload) => {
  const messageBoard = document.getElementById('messageBoard');
  const newMessage = document.createElement('li')
  console.log(payload)
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

const serverConfig = 'stun:stun2.l.google.com:19302';
const localVideo = document.getElementById('localVideo');
const constraints = {audio: false, video: true};
const remotevideocontainer = document.getElementById('remotevideocontainer')

const rtc= new SonoRTC(serverConfig, sono, localVideo, remotevideocontainer, constraints);

document.getElementById('start').onclick = () => {
  rtc.startLocalMedia();
};

document.getElementById('connectSecret').onclick = () => {
  document.getElementById('currentChannel').innerText = 'Connected to Secret'
  rtc.changeChannel('secret');
}

document.getElementById('connectHome').onclick = () => {
  document.getElementById('currentChannel').innerText = 'Connected to Home'
  rtc.changeChannel('home');
}
