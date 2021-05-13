export class webRTC {
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
        // console.log('this.mychannelclients',this.mychannelclients)
        if(this.clients && this.myid && this.mychannel){
          this.server.trigger('createRTCs')
        }
        // console.log(this.mychannelclients)
      }
      else if (payload.type === 'mychannel'){
        this.mychannel = payload.message;
        if(this.clients && this.myid && this.mychannelclients){
          console.log("POOP", this.myid, this.mychannelclients, this.mychannel, this.clients)
          this.server.trigger('createRTCs')
        }
      }
    })
    this.server.on('sendingOffer', (payload)=> {
      // console.log('payload', payload)
      const from = payload.from;
      const message = payload.message
      if(message.type === 'offer'){
        // console.log('offer received from', from)
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
        // console.log('SDP answer received from ', from);
        this.peerconnection[from].setRemoteDescription(new RTCSessionDescription(message));
      }
    })
    this.server.on('createRTCs', ()=> {
      // console.log('createRTCs event received');
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
      // console.log('HELLO')
      // console.log('payload client leaving', payload);
      const from = payload.from;
      document.getElementById(from).remove();
      // console.log('this.peerconnection', this.peerconnection);
      // EXPERIMENTAL
      // this.peerconnection[from].close();
      delete this.peerconnection[from];
      delete this.mediaTracks[from];
      // console.log('this.peerconnection', this.peerconnection);
      this.startConnection();
    })
    this.server.on('clientjoining', (payload) => {
      // add to DOM video element after
      // console.log('clientjoining')
      // this.peerconnection = {};
      // this.mediaTracks = {};
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
    // for each client inthe current channel
    this.mychannelclients.forEach(client => {
      console.log('createRTCs client:', client);
      if(client === this.myid || this.peerconnection[client]){
        return;
      }
      // console.log(client, 'client')
      // make a new rtc peer connection object
      this.peerconnection[client] = new RTCPeerConnection(this.configuration);
      // for each track in the local media stream
      for (const track of this.mediaStream.getTracks()){
        // console.log('track', track)
        // add the track to the peer connection
        this.peerconnection[client].addTrack(track, this.mediaStream);
        // console.log('HEREHRER', this.peerconnection[client])
      }
      this.peerconnection[client].onnegotiationneeded = () => {
        this.peerconnection[client].createOffer()
          .then(createdOffer => {
            // console.log('createdoffer', createdOffer)
            this.peerconnection[client].setLocalDescription(createdOffer); //icecandidate?
            this.server.directmessage(createdOffer, client, 'sendingOffer');
          })
          .catch(err => console.log('err', err))
      }
      this.peerconnection[client].onicecandidate = (event) => {
        if (event.candidate) {
          // console.log('event.candidate', event.candidate)
          const message = {'new-ice-candidate': event.candidate}
          this.server.directmessage(message, client, 'icecandidate');
        }
      }
      this.peerconnection[client].onconnectionstatechange = (event) => {
        if (this.peerconnection[client].connectionState === 'connected') {
          // Peers connected!
          console.log('connected with client; id:', client);
        }
      }
      this.peerconnection[client].ontrack = (event) => {
        // console.log('HEUOAHDAEILHDLAHDLJASHFD', event)
        let remoteVideo;
        // if there is no client in media tracks, make one
        console.log('this.mediaTracks before addition', this.mediaTracks);
        if(!this.mediaTracks[client]){
          // console.log('first track')
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
        // console.log('track received', event.track)
        console.log('remoteVideo', remoteVideo);
        this.mediaTracks[client].addTrack(event.track)
        console.log('this.mediaTracks after addition', this.mediaTracks);
        console.log('this.peerconnection after addition', this.peerconnection);
        // console.log('event.track', event.track)
        remoteVideo.srcObject = this.mediaTracks[client];
      };
    })
  }
  changeChannel(targetChannel){
    console.log('changeChannel invoked');
    // console.log('this.inRoom', this.inRoom);
    if(!this.inRoom && targetChannel === 'home'){
      return this.startConnection();
    }
    // if client is already in targetChannel do nothing
    if(targetChannel == this.mychannel){
      // console.log('return statement hit')
      return;
    }
    // broadcast to current channel that client is leaving
    console.log('current channel', this.mychannel);
    this.server.broadcast('clientleaving', 'clientleaving');
    // change current channel to target channel...
    this.server.changeChannel(targetChannel);
    console.log('current channel after changeChannel, before broadcasting clientjoining',
      this.mychannel);
    // then broadcast to clients in targetChannel that client has joined
    this.server.broadcast('clientjoining', 'clientjoining');
    //clear, and then start connection again
    // remove media from media tracks
    // iterate through this.peerconnection
    // for each pc in peerconnection
    // invoke pc.getSenders() and assign to array containing senders
    // for each sender in senders
    // remove videos from video container
    const remoteVideos = this.remotevideocontainer.childNodes;
    for (let i = 0; i < remoteVideos.length; i += 1) {
      console.log(remoteVideos[i]);
    }
    console.log(this.remotevideocontainer, 'rvc before removal');
    document.getElementById('remotevideocontainer').innerHTML = '';
    console.log(this.remotevideocontainer, 'rvc after removal');
    console.log(this.remotevideocontainer);
    console.log('this.peerconnection before removal', this.peerconnection);
    this.peerconnection = {};
    this.mediaTracks = {};
    console.log('this.peerconnection after removal', this.peerconnection);
    this.startConnection();
  }

}
