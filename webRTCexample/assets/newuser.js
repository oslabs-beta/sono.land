// const signaling = new SignalingChannel();




//what the user does:

//1. i wanna make signaling server on 3000
//2. i want only video
//3. this will be my stun server
//4. on the html page, i have localVideo as ID and remoteVideo as ID
//5. on that page, i also have start button and conncet button
class sonoRTC {

  constructor(serverConfig, signalingServer, localVideo, remoteVideo, constraints){
    this.configuration = {iceServers: [{urls: serverConfig}]};
    this.peerconnection = {};
    this.server = signalingServer;
    this.localVideo = localVideo;
    this.remoteVideo = remoteVideo;
    this.constraints = constraints;
    this.addEventListeners();
  }
  addEventListeners(){
    this.server.onopen = event => {
      console.log("Connected BROSKI??!", event);
    };
    this.server.onmessage = async (event) => {
      const message = JSON.parse(event.data)
      console.log('offer? INSIDE ONMESSAGE', message.sdp)
      if(message.type == 'offer'){
        this.peerconnection[message] = new RTCPeerConnection(this.configuration);
        this.peerconnection[message].setRemoteDescription(new RTCSessionDescription(message));
        // this.peerconnection[message].setLocalDescription(this.localDescription)
        // this.peerconnection.setRemoteDescription(new RTCSessionDescription(message));
        this.peerconnection[message].createAnswer()
        .then(async (answer) => {
          await this.peerconnection[message].setLocalDescription(answer);
          this.server.send(JSON.stringify({protocol: 'broadcast', payload: {message: answer}}));
        })
        .catch(err => console.log('err', err))
      }
      //potentailly move one of these somewhere else so only works AFTER 'connect' works
      if(message.type == 'answer'){
        if(!this.peerconnection[message]){
          console.log('SDP answer received');
          this.peerconnection[message] = new RTCPeerConnection(this.configuration);
          await this.peerconnection[message].setRemoteDescription(new RTCSessionDescription(message));
        }
      }
      if(message['new-ice-candidate']){
        this.peerconnection.addIceCandidate(message['new-ice-candidate'])
          .catch(err => console.log('err', err))
      }
    }
    this.peerconnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ASJKFASKLJDLASKJDLA', event.candidate)
        const message = {'new-ice-candidate': event.candidate}
        this.server.send(JSON.stringify({protocol: 'broadcast', payload: {message: message}}));
      }
    }

    this.peerconnection.onconnectionstatechange = (event) => {
      if (this.peerconnection.connectionState === 'connected') {
        // Peers connected!
        console.log('connected')
      }
    }

    const mediastream = new MediaStream();

    this.peerconnection.ontrack = (event) => {
      console.log('track received', event.track)
      // const remoteVideo = document.getElementById('remoteVideo');
      // remoteVideo.srcObject = new MediaStream();
      mediastream.addTrack(event.track)
      console.log('im heree', mediastream)
      document.getElementById('remoteVideo').srcObject = mediastream;
      // document.getElementById('remoteVideo').play();
      // remoteStream.addTrack(event.track, remoteStream);
    };

  }
  startLocalMedia(){
    navigator.mediaDevices.getUserMedia(this.constraints)
    .then(mediaStream => {
      this.localVideo.srcObject = mediaStream;
      for (const track of mediaStream.getTracks()){
        // console.log('track', track)
        this.peerconnection.addTrack(track, mediaStream);
      }
    })
    .catch(err => console.log('err: ', err))
  }

  startConnection(){

    this.peerconnection.createOffer()
    .then(async (createdOffer) => {
      this.localDescription = createdOffer;
      // await this.peerconnection.setLocalDescription(createdOffer)
      this.server.send(JSON.stringify({protocol: 'broadcast', payload: {message: createdOffer}}));
    })
    .catch(err => console.log('err', err))
  }
}

// let mediaConfig = {audio: true, video: true};
let serverConfig = 'stun:stun2.l.google.com:19302';
let signalingServer = new WebSocket("ws://localhost:3000/ws");
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const constraints = {audio: true, video: true};

const rtc = new sonoRTC(serverConfig, signalingServer, localVideo, remoteVideo, constraints);
document.getElementById('start').onclick = () => {
  rtc.startLocalMedia();
};
document.getElementById('connect').onclick = () => {
  rtc.startConnection();
}

//<------------------------------------------







// // signalingChannel.onopen = event => {
// //   console.log("Connected!", event);
// // };

// const constraints = {audio: true, video: true};
// // const configuration = {iceServers: [{urls: 'stun:stun2.l.google.com:19302'}]};

// // const pc = new RTCPeerConnection(configuration);

// const localVideo = document.getElementById('localVideo');
// // let storeLocalVideo;


// // const remoteVideo = document.getElementById('remoteVideo');
// // remoteVideo.srcObject = new MediaStream();

// document.getElementById('start').onclick = () => {
//   navigator.mediaDevices.getUserMedia(constraints)
//     .then(startLocalMedia)
//     .catch(err => console.log('err: ', err))
// }

// function startLocalMedia(mediaStream) {
//   localVideo.srcObject = mediaStream;

//   addTracks(mediaStream);
// }

// function addTracks(mediaStream) {
//   for (const track of mediaStream.getTracks()){
//     console.log('track', track)
//     pc.addTrack(track, mediaStream);
//   }
// }

// // document.getElementById('connect').onclick = () => {
// //   pc.createOffer()
// //     .then(setConnection)
// //     .catch(err => console.log('err', err))

// // }

// // async function setConnection(createdOffer){
// //   // console.log('im there', createdOffer)
// //   await pc.setLocalDescription(createdOffer)
// //   console.log('im here', createdOffer)

// //   signalingChannel.send(JSON.stringify({protocol: 'broadcast', payload: {message: createdOffer}}));
// //     // .then(signaling.send({description: pc.localDescription}))
// //     // .catch(err => console.log('err', err))
// // }


// // signalingChannel.onmessage = async (event) => {
// //   const message = JSON.parse(event.data)
// //   console.log('receivedMessage', JSON.parse(event.data))
// //   // console.log('offer?', message.sdp)
// //   if(message.type == 'offer'){
// //     console.log('SDP offer received');
// //     pc.setRemoteDescription(new RTCSessionDescription(message));
// //     pc.createAnswer()
// //     .then(handleAnswer)
// //     .catch(err => console.log('err', err))
// //   }
// //   //potentailly move one of these somewhere else so only works AFTER 'connect' works
// //   if(message.type == 'answer'){
// //     console.log('SDP answer received');
// //     const remoteDesc = new RTCSessionDescription(message);
// //     await pc.setRemoteDescription(remoteDesc);
// //   }
// //   if(message['new-ice-candidate']){
// //     pc.addIceCandidate(message['new-ice-candidate'])
// //       .catch(err => console.log('err', err))
// //   }
// // }

// // async function handleAnswer(answer){
// //   console.log(answer)
// //   await pc.setLocalDescription(answer);
// //   signalingChannel.send(JSON.stringify({protocol: 'broadcast', payload: {message: answer}}));
// // }

// // pc.onicecandidate = (event) => {
// //   if (event.candidate) {
// //     console.log('ASJKFASKLJDLASKJDLA', event.candidate)
// //     const message = {'new-ice-candidate': event.candidate}
// //     signalingChannel.send(JSON.stringify({protocol: 'broadcast', payload: {message: message}}));
// //   }
// // }

// // pc.onconnectionstatechange = (event) => {
// //   if (pc.connectionState === 'connected') {
// //     // Peers connected!
// //     console.log('connected')
// //   }
// // }

// // const mediastream = new MediaStream();

// // pc.ontrack = (event) => {
// //   console.log('track received', event.track)
// //   // const remoteVideo = document.getElementById('remoteVideo');
// //   // remoteVideo.srcObject = new MediaStream();
// //   mediastream.addTrack(event.track)
// //   console.log('im heree', mediastream)
// //   document.getElementById('remoteVideo').srcObject = mediastream;
// //   // document.getElementById('remoteVideo').play();
// //   // remoteStream.addTrack(event.track, remoteStream);
// // };