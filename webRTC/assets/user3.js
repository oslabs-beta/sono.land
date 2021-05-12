import { SonoClient } from "../../client_side/sono_client.js"
class webRTC {
  constructor(serverConfig, signalingServer, localVideo, remoteVideoContainer, constraints){
    this.configuration = {iceServers: [{urls: serverConfig}]};
    this.peerconnection = {}
    this.server = signalingServer;
    this.localVideo = localVideo;
    this.constraints = constraints;
    // this.eventListeners();
    this.mediaTracks = {};
    this.remotevideocontainer = remoteVideoContainer;
    // this.localtracks = [];
    // this.createOffer = this.createOffer.bind(this)
    // this.createdOffer = null;
  }
  eventListeners(){
    this.server.on('grab', (payload) => {
      if(payload.type === 'clients'){
        this.clients = payload.message;
        if(this.mychannelclients && this.myid && this.mychannel){
          this.server.trigger('createRTCs')
        }
      }
      else if(payload.type === 'myid'){
        this.myid = payload.message[0];
        if(this.mychannelclients && this.clients && this.mychannel){
          this.server.trigger('createRTCs')
        }
      }
      else if(payload.type === 'mychannelclients'){
        this.mychannelclients = payload.message;
        console.log('this.mychannelclients',this.mychannelclients)
        if(this.clients && this.myid && this.mychannel){
          this.server.trigger('createRTCs')
        }
        console.log(this.mychannelclients)
      }
      else if (payload.type === 'mychannel'){
        this.mychannel = payload.message;
        if(this.clients && this.myid && this.mychannelclients){
          this.server.trigger('createRTCs')
        }
      }
    })
    this.server.on('sendingOffer', (payload)=> {
      // console.log('payload', payload)
      const from = payload.from;
      const message = payload.message
      if(message.type === 'offer'){
        console.log('offer received from', from)
        if(this.inRoom === true) this.startConnection();
        else return;
        // this.peerconnection[from] = new RTCPeerConnection(this.configuration)
        this.peerconnection[from].setRemoteDescription(new RTCSessionDescription(message)) //wholething?
        // for (const track of this.mediaStream.getTracks()){
        //   console.log('track', track)
        //   this.peerconnection[from].addTrack(track, this.mediaStream);
        //   console.log('HEREHRER2', this.peerconnection[from])
        // }
        this.peerconnection[from].createAnswer()
          .then(answer => {
            this.peerconnection[from].setLocalDescription(answer);
            this.server.directmessage(answer, from, 'sendingAnswer')
          })
          .catch(err => console.log('error: unable to create answer', err))
      }
    })
    this.server.on('sendingAnswer', (payload) => {
      const from = payload.from;
      const message = payload.message;
      if(message.type === 'answer'){
        console.log('SDP answer received from ', from);
        this.peerconnection[from].setRemoteDescription(new RTCSessionDescription(message));
      }
    })
    this.server.on('createRTCs', ()=> {
      console.log('createRTCs event received');
      // const isInitiator = true;
      this.createRTCs();
    })
    this.server.on('icecandidate', (payload) => {
      // console.log(payload, 'IM HERE')
      const from = payload.from;
      const message = payload.message;
      this.peerconnection[from].addIceCandidate(message['new-ice-candidate'])
        .catch(err => console.log('err', err))
    })
    // define event handler to handle event 'clientleaving'
    this.server.on('clientleaving', (payload) => {
      console.log('HELLO')
      console.log('payload client leaving', payload);
      const from = payload.from;
      document.getElementById(from).remove();
      console.log('this.peerconnection', this.peerconnection);
      delete this.peerconnection[from];
      console.log('this.peerconnection', this.peerconnection);
      this.startConnection();
    })
    this.server.on('clientjoining', (payload) => {
      // add to DOM video element after
      console.log('clientjoining')
      this.startConnection();
    })
  }
  startLocalMedia(){
    navigator.mediaDevices.getUserMedia(this.constraints)
    .then(mediaStream => {
      this.localVideo.srcObject = mediaStream;
      for (const track of mediaStream.getTracks()){
        // console.log('track', track)
        // this.localtracks.push(track);
        this.mediaStream = mediaStream;
      }
    })
    .catch(err => console.log('err: ', err))
  }
  async startConnection(){
    if(!this.inRoom) await this.eventListeners();
    this.inRoom = true;
    this.server.grab('clients');
    this.server.grab('myid');
    this.server.grab('mychannelclients');
    this.server.grab('mychannel');
  }
  createRTCs(){
    // this.channelclients.forE
    // for(let i=0; i<this.mychannelclients.length; i++){
    //   if(this.mychannelclients[i] === this.myid) break;
    //   this.mychannelclients[i]

    // }
    this.mychannelclients.forEach(client => {
      if(client === this.myid || this.peerconnection[client]){
        return;
      }
      console.log(client, 'client')
      this.peerconnection[client] = new RTCPeerConnection(this.configuration);
      for (const track of this.mediaStream.getTracks()){
        console.log('track', track)
        this.peerconnection[client].addTrack(track, this.mediaStream);
        console.log('HEREHRER', this.peerconnection[client])
      }
      this.peerconnection[client].onnegotiationneeded = () => {
        this.peerconnection[client].createOffer()
          .then(createdOffer => {
            console.log('createdoffer', createdOffer)
            this.peerconnection[client].setLocalDescription(createdOffer); //icecandidate?
            this.server.directmessage(createdOffer, client, 'sendingOffer');
          })
          .catch(err => console.log('err', err))
      }
      this.peerconnection[client].onicecandidate = (event) => {
        if (event.candidate) {
          console.log('event.candidate', event.candidate)
          const message = {'new-ice-candidate': event.candidate}
          this.server.directmessage(message, client, 'icecandidate');
        }
      }
      this.peerconnection[client].onconnectionstatechange = (event) => {
        if (this.peerconnection[client].connectionState === 'connected') {
          // Peers connected!
          console.log('connected', client, event)
        }
      }
      this.peerconnection[client].ontrack = (event) => {
        console.log('HEUOAHDAEILHDLAHDLJASHFD', event)
        let remoteVideo;
        if(!this.mediaTracks[client]){
          console.log('first track')
          this.mediaTracks[client] = new MediaStream();
          remoteVideo = document.createElement('video')
          remoteVideo.setAttribute('playsinline', 'true')
          remoteVideo.setAttribute('autoplay', 'true')
          remoteVideo.setAttribute('id', client)
          this.remotevideocontainer.appendChild(remoteVideo)
        }
        else {
          remoteVideo = document.getElementById(client)
        }
        console.log('track received', event.track)

        this.mediaTracks[client].addTrack(event.track)
        console.log('event.track', event.track)
        remoteVideo.srcObject = this.mediaTracks[client];

      };
    })
  }
  changeChannel(targetChannel){
    if(!this.inRoom){
      return this.startConnection();
    }
    if(targetChannel == this.mychannel){
      console.log('return statement hit')
      return;
    }
    this.server.broadcast('clientleaving', 'clientleaving');
    this.server.changeChannel(targetChannel);
    this.server.broadcast('clientjoining', 'clientjoining');
    console.log('Im changing channel')
    //clear, and then start connection again
    document.getElementById('remotevideocontainer').innerHTML = '';
    this.peerconnection = {};
    this.startConnection();
  }

}

const serverConfig = 'stun:stun2.l.google.com:19302';
const signalingServer = new SonoClient("ws://localhost:3000/ws");
const localVideo = document.getElementById('localVideo');
// const remoteVideo = document.getElementById('remoteVideo');
const constraints = {audio: false, video: true};
const remotevideocontainer = document.getElementById('remotevideocontainer')

const rtc= new webRTC(serverConfig, signalingServer, localVideo, remotevideocontainer, constraints);

document.getElementById('start').onclick = () => {
  rtc.startLocalMedia();
};

document.getElementById('connect').onclick = () => {
  rtc.changeChannel('home');
}

document.getElementById('connectSecret').onclick = () => {
  document.getElementById('currentChannel').innerText = 'Connected to Secret'
  rtc.changeChannel('secret');

}

document.getElementById('connectHome').onclick = () => {
  document.getElementById('currentChannel').innerText = 'Connected to Home'
  rtc.changeChannel('home');

}