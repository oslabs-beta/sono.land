export class SonoRTC {
  constructor(serverConfig, signalingServer, localVideo, remoteVideoContainer, constraints, viewerMode = false){
    console.log('[RTC] constructor - viewerMode:', viewerMode)
    this.configuration = {iceServers: [{urls: serverConfig}]};
    this.peerconnection = {}
    this.server = signalingServer;
    this.localVideo = localVideo;
    this.constraints = constraints;
    this.mediaTracks = {};
    this.remotevideocontainer = remoteVideoContainer;
    this.viewerMode = viewerMode;
  }
  eventListeners(){
    console.log('[RTC] setting up event listeners')
    this.server.on('grab', (payload) => {
      console.log('[RTC] grab:', payload.type, payload.message)
      if(payload.type === 'clients'){
        this.clients = payload.message;
        if(this.mychannelclients && this.myid && this.mychannel){
          console.log('[RTC] all info ready, triggering createRTCs')
          this.server.trigger('createRTCs')
        }
      }
      else if(payload.type === 'myid'){
        this.myid = payload.message[0];
        if(this.mychannelclients && this.clients && this.mychannel){
          console.log('[RTC] all info ready, triggering createRTCs')
          this.server.trigger('createRTCs')
        }
      }
      else if(payload.type === 'mychannelclients'){
        this.mychannelclients = payload.message;
        if(this.clients && this.myid && this.mychannel){
          console.log('[RTC] all info ready, triggering createRTCs')
          this.server.trigger('createRTCs')
        }
      }
      else if (payload.type === 'mychannel'){
        this.mychannel = payload.message;
        if(this.clients && this.myid && this.mychannelclients){
          console.log('[RTC] all info ready, triggering createRTCs')
          this.server.trigger('createRTCs')
        }
      }
    })
    this.server.on('sendingOffer', (payload)=> {
      const from = payload.from;
      const message = payload.message
      console.log('[RTC] receivedOffer from:', from, 'inRoom:', this.inRoom, 'type:', message.type)
      if(message.type === 'offer'){
        if(this.inRoom === true) this.startConnection();
        else {
          console.log('[RTC] DROPPING OFFER - not in room!')
          return;
        }

        console.log('[RTC] setting remote description for offer from:', from)
        this.peerconnection[from].setRemoteDescription(new RTCSessionDescription(message))

        this.peerconnection[from].createAnswer()
          .then(answer => {
            console.log('[RTC] created answer for:', from)
            this.peerconnection[from].setLocalDescription(answer);
            this.server.directmessage(answer, from, 'sendingAnswer')
          })
          .catch(err => console.log('[RTC] error creating answer:', err))
      }
    })
    this.server.on('sendingAnswer', (payload) => {
      const from = payload.from;
      const message = payload.message;
      console.log('[RTC] receivedAnswer from:', from, 'type:', message.type)
      if(message.type === 'answer'){
        this.peerconnection[from].setRemoteDescription(new RTCSessionDescription(message));
      }
    })
    this.server.on('createRTCs', ()=> {
      console.log('[RTC] createRTCs event')
      this.createRTCs();
    })
    this.server.on('icecandidate', (payload) => {
      const from = payload.from;
      const message = payload.message;
      console.log('[RTC] icecandidate from:', from)
      this.peerconnection[from].addIceCandidate(message['new-ice-candidate'])
        .catch(err => console.log('[RTC] icecandidate error:', err))
    })

    this.server.on('clientleaving', (payload) => {
      const from = payload.from;
      console.log('[RTC] client leaving:', from)
      const el = document.getElementById(from);
      if(el) el.remove();

      delete this.peerconnection[from];
      delete this.mediaTracks[from];

      this.startConnection();
    })
    this.server.on('clientjoining', (payload) => {
      console.log('[RTC] client joining:', payload.from)
      this.startConnection();
    })
  }
  startLocalMedia(){
    if(this.viewerMode){
      console.log('[RTC] startLocalMedia - skipped (viewer mode)')
      return;
    }
    console.log('[RTC] startLocalMedia - requesting camera')
    const getUserMedia = (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
      ? navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
      : (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia)
        ? (constraints) => new Promise((resolve, reject) => {
            const fn = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            fn.call(navigator, constraints, resolve, reject);
          })
        : null;

    if(!getUserMedia){
      console.log('[RTC] getUserMedia not supported');
      return;
    }

    getUserMedia(this.constraints)
    .then(mediaStream => {
      console.log('[RTC] got local media, tracks:', mediaStream.getTracks().length)
      this.localVideo.srcObject = mediaStream;
      this.mediaStream = mediaStream;
      // Add tracks to all existing peer connections
      this.addTracksToAllConnections()
    })
    .catch(err => {
      console.log('[RTC] getUserMedia error:', err.name, err.message);
    })
  }
  async startConnection(){
    console.log('[RTC] startConnection, inRoom:', this.inRoom)
    if(!this.inRoom) await this.eventListeners();
    this.inRoom = true;
    console.log('[RTC] startConnection - grabbing info')
    this.server.grab('clients');
    this.server.grab('myid');
    this.server.grab('mychannelclients');
    this.server.grab('mychannel');
  }
  createRTCs(){
    console.log('[RTC] createRTCs - myid:', this.myid, 'mychannelclients:', this.mychannelclients)
    console.log('[RTC] createRTCs - viewerMode:', this.viewerMode, 'hasMediaStream:', !!this.mediaStream)

    this.mychannelclients.forEach(client => {

      if(client === this.myid || this.peerconnection[client]){
        console.log('[RTC] createRTCs - skipping client:', client, '(self or already connected)')
        return;
      }

      console.log('[RTC] createRTCs - creating peer connection for:', client)
      this.peerconnection[client] = new RTCPeerConnection(this.configuration);

      if(!this.viewerMode && this.mediaStream){
        const tracks = this.mediaStream.getTracks()
        console.log('[RTC] createRTCs - adding', tracks.length, 'tracks to connection with', client)
        for (const track of tracks){
          this.peerconnection[client].addTrack(track, this.mediaStream);
        }
      } else {
        console.log('[RTC] createRTCs - viewer mode or no media, NOT adding tracks')
      }
      this.peerconnection[client].onnegotiationneeded = () => {
        console.log('[RTC] onnegotiationneeded for:', client)
        this.peerconnection[client].createOffer()
          .then(createdOffer => {
            console.log('[RTC] created offer for:', client)
            this.peerconnection[client].setLocalDescription(createdOffer);
            this.server.directmessage(createdOffer, client, 'sendingOffer');
          })
          .catch(err => console.log('[RTC] offer error:', err))
      }
      this.peerconnection[client].onicecandidate = (event) => {
        if (event.candidate) {
          const message = {'new-ice-candidate': event.candidate}
          this.server.directmessage(message, client, 'icecandidate');
        }
      }
      this.peerconnection[client].onconnectionstatechange = (event) => {
        console.log('[RTC] connection state for', client, ':', this.peerconnection[client].connectionState)
      }
      this.peerconnection[client].ontrack = (event) => {
        console.log('[RTC] ontrack from', client, 'kind:', event.track.kind)

        let remoteVideo;

        if(!this.mediaTracks[client]){
          console.log('[RTC] creating new media stream and video element for:', client)
          this.mediaTracks[client] = new MediaStream();
          remoteVideo = document.createElement('video')
          remoteVideo.setAttribute('playsinline', 'true')
          remoteVideo.setAttribute('autoplay', 'true')
          remoteVideo.setAttribute('muted', 'true')
          remoteVideo.setAttribute('id', client)
          this.remotevideocontainer.appendChild(remoteVideo)
        }
        else {
          remoteVideo = document.getElementById(client)
        }

        this.mediaTracks[client].addTrack(event.track)
        remoteVideo.srcObject = this.mediaTracks[client];
        console.log('[RTC] video element updated for:', client)
      };
    })
  }
  changeChannel(targetChannel){
    if(!this.inRoom && targetChannel === 'home'){
      return this.startConnection();
    }

    if(targetChannel == this.mychannel){
      return;
    }

    this.server.broadcast('clientleaving', 'clientleaving');
    this.server.changeChannel(targetChannel);
    this.server.broadcast('clientjoining', 'clientjoining');

    document.getElementById('remotevideocontainer').innerHTML = '';

    this.peerconnection = {};
    this.mediaTracks = {};

    this.startConnection();
  }

  setViewerMode(enabled){
    console.log('[RTC] setViewerMode:', enabled)
    this.viewerMode = enabled;
    if(enabled){
      if(this.mediaStream){
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
      }
      if(this.localVideo){
        this.localVideo.srcObject = null;
      }
    } else {
      this.startLocalMedia();
    }
  }

  addTracksToAllConnections(){
    if(!this.mediaStream) {
      console.log('[RTC] addTracksToAllConnections - no mediaStream')
      return
    }
    const tracks = this.mediaStream.getTracks()
    console.log('[RTC] addTracksToAllConnections -', tracks.length, 'tracks to', Object.keys(this.peerconnection).length, 'connections')
    Object.keys(this.peerconnection).forEach(client => {
      const pc = this.peerconnection[client]
      // Check if tracks already added
      const senders = pc.getSenders()
      const hasTracks = senders.some(s => s.track)
      if(!hasTracks && tracks.length > 0) {
        console.log('[RTC] adding tracks to connection with', client)
        tracks.forEach(track => pc.addTrack(track, this.mediaStream))
      }
    })
  }

}
