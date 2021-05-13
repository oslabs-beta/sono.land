export class SonoClient {


  constructor(url) {

    this.ws = new WebSocket(url);
    this.validCallbacks = {};
    this.subscribedEvents ={};

  }
  onconnection(callback){
    this.ws.onopen = callback;
  }
  /**
   * Sends a direct message to a specified client
   * @param { string } message - Message to be sent to client
   * @param { string } client - ID number of client to receive message
   */
  directmessage(message, client, event = 'message') {
    this.ws.send(JSON.stringify({
      protocol: 'directmessage',
      event,
      payload: {
        message,
        to:client,
      },
    }));
  }
  /**
   * Sends out packet to all clients except for the client who sent it
   * @param
   */
  broadcast(message, event = 'message') {
    this.ws.send(JSON.stringify({
      protocol: 'broadcast',
      event,
      payload: {
        message
      },
    }));

  }
  /**
   * Send message to all clients including self
   * @param { any }
   * @param { string } event
   */
  //send('{hi}', 'gameday')
  message(message, event='message'){
    this.ws.send(JSON.stringify({
      protocol: 'message',
      event,
      payload: {
        message
      },
    }));
  }

  changeChannel(targetChannel){
    this.ws.send(JSON.stringify({
      protocol: 'changeChannel',
      payload: {
        to: targetChannel
      },
    }));
  }
  /**
   * Provides list of clients who are connected to the server
   */ //valid requests'clients','channels'(grabs the client IDs currently connected to the server)('channels' list of open channels)
  grab(request, event='grab') {
    this.ws.send(JSON.stringify({
      protocol: 'grab',
      event,
      payload: {
        message: request
      }
    }));
  }

  trigger(eventName) {

    if(this.subscribedEvents[eventName]){
      this.subscribedEvents[eventName]();
    }

  }


  on(eventParam, callback){
    this.subscribedEvents[eventParam] = callback;

    this.ws.onmessage = (event) => {

      const payload = JSON.parse(event.data).payload;
      const eventName = JSON.parse(event.data).protocol;

      if(eventName && this.subscribedEvents[eventName]) this.subscribedEvents[eventName](payload)

    }
  }
}
