//notes for 5/7:multiple answers (twice from each other client)
//mesh structure how to get second client to third

import { SonoClient } from "../../client_side/sono_client.js"



class webRTC {
  constructor(serverConfig, signalingServer, localVideo, remoteVideo, constraints){
    this.configuration = {iceServers: [{urls: serverConfig}]};
    this.peerconnection = {}
    this.server = signalingServer;
    this.localVideo = localVideo;
    this.remoteVideo = remoteVideo;
    this.constraints = constraints;
    this.eventListeners();
    this.mediaTracks = {};
    this.localtracks = [];
    // fthis.createOffer = this.createOffer.bind(this)
    // this.createdOffer = null;
  }
  eventListeners(){
    this.server.onopen = event => {
      console.log("WebRTC Connection established!", event);
    };
    this.server.on('grab', (payload) => {
      console.log('this.server.on retreiving info')
      if(payload.type === 'clients'){
        this.clients = payload.message;
      }
      else if(payload.type === 'myid'){
        this.myid = payload.message;
      }
    })
    this.server.on('message', async (payload) => {
      // const data = JSON.parse(event.data).payload;
      console.log(payload,'payload line 36')
      const message = payload.message;
      const from = payload.from;
      if(message.type == 'offer'){
        console.log('in message.type=offer')
        // const notInitiator = new Event('notInitiator')
        this.server.trigger('notInitiator');
p
        // this.peerconnection[from] = new RTCPeerConnection(this.configuration);
        // this.localtracks.forEach(track => {
        //   console.log('this.localtracks.foreach track')
        //   this.peerconnection[from].addTrack(track, this.mediaStream)
        // })
        this.peerconnection[from].setRemoteDescription(new RTCSessionDescription(message));
        this.peerconnection[from].createAnswer()
        .then(async (answer) => {
          await this.peerconnection[from].setLocalDescription(answer);
          this.server.directmessage(answer, from)
          // this.server.send(JSON.stringify({
          //   protocol: 'directmessage',
          //   payload: {
          //     message: answer,
          //     to: from,
          //   }
          // }));
        })
        .catch(err => console.log('err', err))
      }
      if(message.type == 'answer'){
        console.log('SDP answer received', from);
        // await this.peerconnecti on[from].setLocalDescription(this.createdOffer);
        await this.peerconnection[from].setRemoteDescription(new RTCSessionDescription(message));
      }
      if(message['new-ice-candidate']){
        this.peerconnection[from].addIceCandidate(message['new-ice-candidate'])
          .catch(err => console.log('err', err))
      }
    })
    this.server.on('initiator', ()=> {
      console.log('initiator this.server.on')
      const isInitiator = true;
      this.createRTCs(isInitiator);
    })
    this.server.on('notInitiator', ()=> {
      const isInitiator = false;
      console.log('event not initiator');
      this.createRTCs(isInitiator);
    })

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
    // this.server.send(JSON.stringify({
    //   protocol: 'grab',
    //   event: 'message',
    //   payload: {
    //     message: 'clients'
    //   }}));
    this.server.grab('clients');
    this.server.grab('myid');
  }

  startConnection(){
    // const initiator = new Event('initiator')
    this.server.trigger('initiator');
  }
  createRTCs(initiator){
    console.log(this)
    console.log(this.clients, 'createRTCs, im here')
    this.clients.forEach(client => {
      this.peerconnection[client] = new RTCPeerConnection(this.configuration);
      console.log('IMHEREE', this.mediaStream)
      for (const track of this.mediaStream.getTracks()){
        console.log('track', track)
        this.peerconnection[client].addTrack(track, this.mediaStream);
      }
      this.peerconnection[client].onconnectionstatechange = (event) => {
        if (this.peerconnection[client].connectionState === 'connected') {
          // Peers connected!
          console.log('connected', client)
        }
      }
      this.peerconnection[client].ontrack = (event) => {
        let remoteVideo;
        if(!this.mediaTracks[client]){
          this.mediaTracks[client] = new MediaStream();
          remoteVideo = document.createElement('video')
          remoteVideo.setAttribute('playsinline', 'true')
          remoteVideo.setAttribute('autoplay', 'true')
          remoteVideo.setAttribute('id', client)
          document.getElementById('videocontainer').appendChild(remoteVideo)
        }
        else {
          remoteVideo = document.getElementById(client)
        }
        console.log('track received', event.track)
        // const remoteVideo = document.getElementById('remoteVideo');
        // remoteVideo.srcObject = new MediaStream();

        this.mediaTracks[client].addTrack(event.track)
        console.log('event.track', event.track)
        remoteVideo.srcObject = this.mediaTracks[client];
        // document.getElementById('remoteVideo').play();
        // remoteStream.addTrack(event.track, remoteStream);
      };
      this.peerconnection[client].onicecandidate = (event) => {
        if (event.candidate) {
          console.log('event.candidate', event.candidate)
          const message = {'new-ice-candidate': event.candidate}
          this.server.directmessage(message, client);
          // this.server.send(JSON.stringify({
          //   protocol: 'directmessage',
          //   payload: {
          //     message,
          //     to:client
          //   }
          // }));
        }
      }
    })
    if(initiator === true){
      this.createOffers();
    }
  }
  createOffers(){

    this.clients.forEach(client => {
      this.peerconnection[client].createOffer()
        .then(async createdOffer => {
          console.log('inside async createdOffer, inside createOffers')
          await this.peerconnection[client].setLocalDescription(createdOffer)
          this.server.broadcast(createdOffer);
          //this.server.send(JSON.stringify({protocol: 'broadcast', payload: {message: createdOffer}}));
        })
    })
  }


}

// let mediaConfig = {audio: true, video: true};
let serverConfig = 'stun:stun2.l.google.com:19302';
let signalingServer = new SonoClient("ws://localhost:3000/ws");
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const constraints = {audio: true, video: true};


const rtc2 = new webRTC(serverConfig, signalingServer, localVideo, remoteVideo, constraints);
document.getElementById('start').onclick = () => {
  rtc2.startLocalMedia();
};
document.getElementById('connect').onclick = () => {
  rtc2.startConnection();
}
