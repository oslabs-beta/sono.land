export class SonoRTC {
  constructor(serverConfig, signalingServer, localVideo, remoteVideoContainer, constraints){
    this.configuration = {iceServers: [{urls: serverConfig}]};
    this.peerconnection = {}
    this.server = signalingServer;
    this.localVideo = localVideo;
    this.constraints = constraints;
    this.eventListeners();
    this.mediaTracks = {};
    this.remotevideocontainer = remoteVideoContainer;
    this.receivedOffer = false;
    // this.localtracks = [];
    // this.createOffer = this.createOffer.bind(this)
    // this.createdOffer = null;
  }
  eventListeners(){
    this.server.on('grab', (payload) => {
      // if(payload.type === 'clients'){
      //   this.clients = payload.message;
      //   if(this.mychannelclients && this.myid && this.mychannel){
      //     this.server.trigger('createRTCs')
      //   }
      // }
      if(payload.type === 'myid'){
        this.myid = payload.message[0];
        if(this.mychannelclients && this.mychannel){
          this.server.trigger('createRTCs')
        }
      }
      else if(payload.type === 'mychannelclients'){
        this.mychannelclients = payload.message;
        if(this.myid && this.mychannel){
          this.server.trigger('createRTCs')
        }
      }
      else if (payload.type === 'mychannel'){
        this.mychannel = payload.message;
        console.log('this.mychannel', this.mychannel, 'this.mychannelclients', this.mychannelclients, 'this.myid', this.myid)
        if(this.myid && this.mychannelclients){
          this.server.trigger('createRTCs')
        }
      }
    })
    this.server.on('sendingOffer', (payload)=> {
      const from = payload.from;
      const message = payload.message
      if(message.type === 'offer'){
        console.log('seetting remote descript')
        this.receivedOffer = true;
        this.peerconnection[from].setRemoteDescription(new RTCSessionDescription(message)) //wholething?

        this.peerconnection[from].createAnswer()
          .then(async answer => {
            console.log('sending answer')
            await this.peerconnection[from].setLocalDescription(answer)
            console.log(this.peerconnection[from], 'huh')
            this.server.directmessage(answer, from, 'sendingAnswer')
          })
          .catch(err => console.log('error: unable to create answer', err))
      }
    })
    this.server.on('sendingAnswer', (payload) => {
      const from = payload.from;
      const message = payload.message;
      if(message.type === 'answer'){
        console.log('seetting remote descript')
        this.peerconnection[from].setRemoteDescription(new RTCSessionDescription(message));
      }
    })
    this.server.on('createRTCs', ()=> {
      this.createRTCs();
    })
    this.server.on('icecandidate', (payload) => {

      const from = payload.from;
      const message = payload.message;
      console.log('on ice candidate', message['new-ice-candidate'])
      console.log('this.peerconnection[from]', this.peerconnection[from])
      this.peerconnection[from].addIceCandidate(message['new-ice-candidate'])
        .catch(err => console.log('err', err))
    })

    this.server.on('clientleaving', (payload) => {
      console.log('clientleaving', payload)

      const from = payload.from;
      document.getElementById(from).remove();

      delete this.peerconnection[from];
      delete this.mediaTracks[from];

      const results = [];

      this.mychannelclients.forEach(clientid => {
        if(clientid != from) results.push(clientid)
      })

      this.mychannelclients = results.slice();

    })
    this.server.on('clientjoining', (payload) => {
      console.log('clientjoining', payload);

      this.startConnection();
    })
  }
  startLocalMedia(){
    navigator.mediaDevices.getUserMedia(this.constraints)
    .then(mediaStream => {
      this.localVideo.srcObject = mediaStream;
      for (const track of mediaStream.getTracks()){

        this.mediaStream = mediaStream;
      }
    })
    .catch(err => console.log('err: ', err))
  }
  async startConnection(){
    this.server.grab('myid');
    this.server.grab('mychannelclients');
    this.server.grab('mychannel');
  }
  createRTCs(){

    this.mychannelclients.forEach(client => {

      if(client === this.myid || this.peerconnection[client]){ //*
        return;
      }
      console.log('new peer RTC connectino ', client)
      this.peerconnection[client] = new RTCPeerConnection(this.configuration);

      for (const track of this.mediaStream.getTracks()){

        this.peerconnection[client].addTrack(track, this.mediaStream);

      }
      // this.peerconnection[client].onnegotiationneeded = () => {
        
      // }

      this.peerconnection[client].onicecandidate = (event) => {
        if (event.candidate) {

          const message = {'new-ice-candidate': event.candidate}
          this.server.directmessage(message, client, 'icecandidate');
        }
      }
      
      this.peerconnection[client].onconnectionstatechange = (event) => {
        if (this.peerconnection[client].connectionState === 'connected') {

          console.log('connected with client id:', client);
        }
      }
      this.peerconnection[client].ontrack = (event) => {
        console.log('track received', track)

        let remoteVideo;


        if(!this.mediaTracks[client]){ //*

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

        this.mediaTracks[client].addTrack(event.track)

        remoteVideo.srcObject = this.mediaTracks[client];
      };
      if(this.receivedOffer === false){
        this.peerconnection[client].createOffer()
          .then(async createdOffer => {
            console.log('create offer')
            await this.peerconnection[client].setLocalDescription(createdOffer);
            this.server.directmessage(createdOffer, client, 'sendingOffer');
            
          })
          .catch(err => console.log('err', err))
      }
      
    })
  }
  async changeChannel(targetChannel){

    if(!this.client){
      this.server.changeChannel(targetChannel);
      this.server.broadcast('clientjoining', 'clientjoining');
      return this.startConnection();
    }

    if(targetChannel == this.mychannel){
      return;
    }

    this.server.broadcast('clientleaving', 'clientleaving'); // * 

    await this.server.changeChannel(targetChannel);

    this.server.broadcast('clientjoining', 'clientjoining');

    const remoteVideos = this.remotevideocontainer.childNodes;


    document.getElementById('remotevideocontainer').innerHTML = '';

    this.peerconnection = {};
    this.mediaTracks = {};

    this.startConnection();
  }

}