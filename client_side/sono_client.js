// sono_client
// a client-side library for websockets
// import type { WebSocket } from "../deps.ts";

export class SonoClient {
  // public ws: WebSocket;

  constructor(url) {
    console.log('SonoClient created');
    this.ws = new WebSocket(url);
    this.validCallbacks = {};
    this.subscribedEvents ={};

    // this.ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   const eventName = data.protocol;
    //   const eventNames = Object.keys(this.onCallbacks)
    //   if(eventName in eventNames){
    //     onCallbacks[eventName](data);
    //   }
    // }
  }
  onconnection(callback){
    this.ws.onopen = callback;
  }
  /**
   * Sends a direct message to a specified client
   * @param { string } message - Message to be sent to client
   * @param { string } client - ID number of client to receive message
   */
  directmessage(message, client) {
    this.ws.send(JSON.stringify({
      protocol: 'directmessage',
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
  broadcast(message) {
    this.ws.send(JSON.stringify({
      protocol: 'broadcast',
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
  async message(message, event){
    await this.ws.send(JSON.stringify({
      protocol: 'message',
      event,
      payload: {
        message
      },
    }));
  }
  /**
   * Provides list of clients who are connected to the server
   */ //valid requests'clients'(grabs the client IDs currently connected to the server)('channels' list of open channels)
  grab(request) {
    this.ws.send(JSON.stringify({
      protocol: 'grab',
      payload: {
        message: request
      }
    }));
  }

  // onmessage(callback){
  //   this.ws.onmessage = (event) => {
  //     console.log('IM HERE INERER')
  //     const data = JSON.parse(event.data);
  //     callback(data);
  //   }
  // }
  on(eventParam, callback){
    this.subscribedEvents[eventParam] = callback;
    console.log('this.subscribedevents', this.subscribedEvents)
    // this.onCallbacks[eventParam] = callback;
    this.ws.onmessage = (event) => {
      console.log('event.data', event.data)
      const data = JSON.parse(event.data);
      const eventName = data.protocol;
      console.log('this.subscribedEvents', this.subscribedEvents, 'eventName', eventName)
      if(eventName && this.subscribedEvents[eventName]) this.subscribedEvents[eventName](data.message)
      // Object.keys(this.onCallbacks)
      // if(Object.keys(this.subscribedEvents).includes(eventName)){
      //   console.log('data', data, 'eventname', eventName, 'this.subscribedEvents[eventName]', this.subscribedEvents[eventName])
      //   this.validCallbacks[JSON.stringify(data)] = this.subscribedEvents[eventName];
      //   console.log('this.validcallbacks', this.validCallbacks)
      //   Object.keys(this.validCallbacks).forEach(data => this.validCallbacks[data](JSON.parse(data).message));
      // }
    }
  }
}

// USER EXAMPLE
const sono = new SonoClient('ws://localhost:8080/ws');
sono.onconnection(()=>{
  // sono.message('hi');
  sono.message('hello', 'hello')
  sono.message('bye', 'bye')
})

sono.on('hello', (msg) => {
  console.log(msg, 'HELLO EVENT')
})

sono.on('bye', (msg) => {
  console.log(msg, 'BYE EVENT')
})
