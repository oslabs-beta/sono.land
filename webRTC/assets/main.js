// const signaling = new SignalingChannel();
const signalingChannel = new WebSocket("ws://localhost:3000/ws");





signalingChannel.onopen = event => {
  console.log("Connected!", event);
};

const constraints = {audio: true, video: true};
const configuration = {iceServers: [{urls: 'stun:stun2.l.google.com:19302'}]};

const pc = new RTCPeerConnection(configuration);

const localVideo = document.getElementById('localVideo');
let storeLocalVideo;


// const remoteVideo = document.getElementById('remoteVideo');
// remoteVideo.srcObject = new MediaStream();

document.getElementById('start').onclick = () => {
  navigator.mediaDevices.getUserMedia(constraints)
    .then(startLocalMedia)
    .catch(err => console.log('err: ', err))
}

function startLocalMedia(mediaStream) {
  localVideo.srcObject = mediaStream;
  storeLocalVideo = mediaStream;
  addTracks(mediaStream);
}

function addTracks(mediaStream) {
  for (const track of mediaStream.getTracks()){
    console.log('track', track)
    pc.addTrack(track, mediaStream);
  }
}

document.getElementById('connect').onclick = () => {
  pc.createOffer()
    .then(setConnection)
    .catch(err => console.log('err', err))

}

async function setConnection(createdOffer){
  // console.log('im there', createdOffer)
  await pc.setLocalDescription(createdOffer)
  console.log('im here', createdOffer)

  signalingChannel.send(JSON.stringify({protocol: 'broadcast', payload: {message: createdOffer}}));
    // .then(signaling.send({description: pc.localDescription}))
    // .catch(err => console.log('err', err))
}


signalingChannel.onmessage = async (event) => {
  const message = JSON.parse(event.data)
  console.log('receivedMessage', JSON.parse(event.data))
  // console.log('offer?', message.sdp)
  if(message.type == 'offer'){
    console.log('SDP offer received');
    pc.setRemoteDescription(new RTCSessionDescription(message));
    pc.createAnswer()
    .then(handleAnswer)
    .catch(err => console.log('err', err))
  }
  //potentailly move one of these somewhere else so only works AFTER 'connect' works
  if(message.type == 'answer'){
    console.log('SDP answer received');
    const remoteDesc = new RTCSessionDescription(message);
    await pc.setRemoteDescription(remoteDesc);
  }
  if(message['new-ice-candidate']){
    pc.addIceCandidate(message['new-ice-candidate'])
      .catch(err => console.log('err', err))
  }
}

async function handleAnswer(answer){
  console.log(answer)
  await pc.setLocalDescription(answer);
  signalingChannel.send(JSON.stringify({protocol: 'broadcast', payload: {message: answer}}));
}

pc.onicecandidate = (event) => {
  if (event.candidate) {
    console.log('ASJKFASKLJDLASKJDLA', event.candidate)
    const message = {'new-ice-candidate': event.candidate}
    signalingChannel.send(JSON.stringify({protocol: 'broadcast', payload: {message: message}}));
  }
}

pc.onconnectionstatechange = (event) => {
  if (pc.connectionState === 'connected') {
    // Peers connected!
    console.log('connected')
  }
}

const mediastream = new MediaStream();

pc.ontrack = (event) => {
  console.log('track received', event.track)
  // const remoteVideo = document.getElementById('remoteVideo');
  // remoteVideo.srcObject = new MediaStream();
  mediastream.addTrack(event.track)
  console.log('im heree', mediastream)
  document.getElementById('remoteVideo').srcObject = mediastream;
  // document.getElementById('remoteVideo').play();
  // remoteStream.addTrack(event.track, remoteStream);
};