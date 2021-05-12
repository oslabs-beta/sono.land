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
    this.mediaTracks = {};
    this.localtracks = [];
    this.createOffer = this.createOffer.bind(this)
    this.createdOffer = null;

  }
  addEventListeners = () => {
    this.server.onopen = event => {
      console.log("Connected BROSKI??!", event);
    };
    this.server.onmessage = async (event) => {
      const data = JSON.parse(event.data)
      const message = data.message;
      const from = data.from;
      // console.log(message)
      if(from == 'server'){
        // console.log(message)
        this.clients = message;
        console.log('grabaing message from server')
        // if(this.createOffer){
        this.createOffer(this.clients, this.peerconnection, this.createdOffer, this.server);
        // }
      }
      // console.log('offer? INSIDE ONMESSAGE', message.sdp)
      if(message.type == 'offer'){
        console.log('offer received')
        this.peerconnection[from] = new RTCPeerConnection(this.configuration);
        this.localtracks.forEach(track => {
          console.log('this.localtracks.foreach track')
          this.peerconnection[from].addTrack(track, this.mediaStream)
        })

        this.peerconnection[from].onconnectionstatechange = (event) => {
          if (this.peerconnection[from].connectionState === 'connected') {
            // Peers connected!
            console.log('connected', from)
          }
        }
        this.peerconnection[from].ontrack = (event) => {
          if(!this.mediaTracks[from]){
            this.mediaTracks[from] = new MediaStream();
            let remoteVideo = document.createElement('video')
            remoteVideo.setAttribute('playsinline', 'true')
            remoteVideo.setAttribute('autoplay', 'true')
            remoteVideo.setAttribute('id', from)
            document.getElementById('remotevideocontainer').appendChild(remoteVideo)
          }
          else {
            remoteVideo = document.getElementById(from)
          }
          console.log('track received', event.track)
          // const remoteVideo = document.getElementById('remoteVideo');
          // remoteVideo.srcObject = new MediaStream();

          this.mediaTracks[from].addTrack(event.track)
          console.log('im HEHREHHRERHEHRHE', event.track)
          remoteVideo.srcObject = this.mediaTracks[from];
          // document.getElementById('remoteVideo').play();
          // remoteStream.addTrack(event.track, remoteStream);
        };
        this.peerconnection[from].onicecandidate = (event) => {
          if (event.candidate) {
            console.log('ASJKFASKLJDLASKJDLA', event.candidate)
            const message = {'new-ice-candidate': event.candidate}
            this.server.send(JSON.stringify({protocol: 'broadcast', payload: {message, from}}));
          }
        }
        this.peerconnection[from].setRemoteDescription(new RTCSessionDescription(message));
        this.peerconnection[from].createAnswer()
        .then(async (answer) => {
          await this.peerconnection[from].setLocalDescription(answer);
          this.server.send(JSON.stringify({protocol: 'directmessage', payload: {message: answer, to: from}}));
        })
        .catch(err => console.log('err', err))
      }
      //potentailly move one of these somewhere else so only works AFTER 'connect' works
      if(message.type == 'answer'){
        console.log('SDP answer received');
        await this.peerconnection[from].setLocalDescription(this.createdOffer);
        await this.peerconnection[from].setRemoteDescription(new RTCSessionDescription(message));
      }
      if(message['new-ice-candidate']){
        this.peerconnection[from].addIceCandidate(message['new-ice-candidate'])
          .catch(err => console.log('err', err))
      }
    }

    // const mediastream = new MediaStream();



  }
  startLocalMedia(){
    navigator.mediaDevices.getUserMedia(this.constraints)
    .then(mediaStream => {
      this.localVideo.srcObject = mediaStream;
      for (const track of mediaStream.getTracks()){
        // console.log('track', track)
        this.localtracks.push(track);
        this.mediaStream = mediaStream;
      }
    })
    .catch(err => console.log('err: ', err))
  }

  startConnection(){
    this.server.send(JSON.stringify({protocol: 'grab', payload: {message: 'clients'}}));
  }
  createOffer(clients, peerconnection, offer, server){
    console.log('in creating offer')
    clients.forEach(client => {
      peerconnection[client] = new RTCPeerConnection(this.configuration);
      peerconnection[client].onconnectionstatechange = (event) => {
        if (peerconnection[client].connectionState === 'connected') {
          // Peers connected!
          console.log('connected', from)
        }
      }
      peerconnection[client].ontrack = (event) => {
        if(!this.mediaTracks[from]){
          this.mediaTracks[from] = new MediaStream();
          let remoteVideo = document.createElement('video')
          remoteVideo.setAttribute('playsinline', 'true')
          remoteVideo.setAttribute('autoplay', 'true')
          remoteVideo.setAttribute('id', from)
          document.getElementById('videocontainer').appendChild(remoteVideo)
        }
        else {
          remoteVideo = document.getElementById(from)
        }
        console.log('track received', event.track)
        // const remoteVideo = document.getElementById('remoteVideo');
        // remoteVideo.srcObject = new MediaStream();

        this.mediaTracks[from].addTrack(event.track)
        console.log('im HEHREHHRERHEHRHE', event.track)
        remoteVideo.srcObject = this.mediaTracks[from];
        // document.getElementById('remoteVideo').play();
        // remoteStream.addTrack(event.track, remoteStream);
      };
      peerconnection[client].onicecandidate = (event) => {
        if (event.candidate) {
          console.log('ASJKFASKLJDLASKJDLA', event.candidate)
          const message = {'new-ice-candidate': event.candidate}
          this.server.send(JSON.stringify({protocol: 'broadcast', payload: {message, from}}));
        }
      }
      peerconnection[client].setRemoteDescription(new RTCSessionDescription(message));
      peerconnection[client].createAnswer()
      .then(async (answer) => {
        await peerconnection[client].setLocalDescription(answer);
        this.server.send(JSON.stringify({protocol: 'directmessage', payload: {message: answer, to: from}}));
      })
      .catch(err => console.log('err', err))
    }
      peerconnection[client].createOffer()
        .then((createdOffer) => {
        offer = createdOffer;
        server.send(JSON.stringify({protocol: 'directmessage', payload: {message: createdOffer, to: client}}));
        })
        .catch(err => console.log('err', err))
    });
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


class webRTC {
  constructor(serverConfig, signalingServer, localVideo, remoteVideo, constraints){
    this.configuration = {iceServers: [{urls: serverConfig}]};
    this.peerconnection = {};
    this.server = signalingServer;
    this.localVideo = localVideo;
    this.remoteVideo = remoteVideo;
    this.constraints = constraints;
    // this.addEventListeners();
    // this.mediaTracks = {};
    // this.localtracks = [];
    // this.createOffer = this.createOffer.bind(this)
    // this.createdOffer = null;
  }
  eventListeners(){
    this.server.onmessage = () => {

    }

    }
  }
  startConnection(){
    this.server.send(JSON.stringify({protocol: 'grab', payload: {message: 'clients'}}));
  }

}



const rtc2 = new webRTC(serverConfig, signalingServer, localVideo, remoteVideo, constraints);
document.getElementById('start').onclick = () => {
  rtc2.startLocalMedia();
};
document.getElementById('connect').onclick = () => {
  rtc2.startConnection();
}
