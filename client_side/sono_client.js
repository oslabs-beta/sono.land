// sono_client
// a client-side library for websockets
// import type { WebSocket } from "../deps.ts";

export class SonoClient {
  // public ws: WebSocket;

  constructor(url) {
    console.log('SonoClient created');
    this.ws = new WebSocket(url);

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
   * send message to all clients
   */
  async send(message){
    await this.ws.send(JSON.stringify({
      protocol: 'message',
      payload: {
        message
      },
    }));
  }
  /**
   * Provides list of clients who are connected to the server
   */ //valid requests'clients'(grabs the client IDs currently connected to the server)('channels' list of open channels)
  grab(request) {
    this.ws.send(JSON.stringify({protocol: 'grab', payload: {message: request}}));
  }

  onmessage(callback){
    this.ws.onmessage = (event) => {
      const data = event.data;
      callback(data);
    }
  }
}

const sono = new SonoClient('ws://localhost:8080/ws');
sono.onconnection(()=>{sono.send('hi')})

sono.onmessage((message)=> {
  console.log(message);
});