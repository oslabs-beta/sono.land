import { Client } from "./client.ts";
import { EventHandler } from "./eventhandler.ts";
import { Packet } from "./packet.ts";
import type { WebSocket } from "./deps.ts";
import type { HTTPOptions } from "./deps.ts";
import { serve, Server as DenoServer, ServerRequest } from "https://deno.land/std@0.95.0/http/server.ts";
import { serveFile } from "./deps.ts";
import { acceptWebSocket, isWebSocketCloseEvent } from "./deps.ts";

/**
 * Class that handles WebSocket messages.
 * Uses Client objects and an EventHandler object
 * to send messages to Clients.
*/

export class TestSono {
  public server: DenoServer | null = null;
  public hostname = 'localhost';
  public clients: {[key: string]: Client} = {};
  public channelsList: {[key: string]: Record<string, Client>} = {'home': {}};
  public eventHandler: EventHandler;

  /**
   * Constructor creates a new instance of the Event,
   * binds handleWs to this and returns a Sono instance.
   */
  constructor() {

    this.eventHandler = new EventHandler();
    this.handleWs = this.handleWs.bind(this);
  }

  // /**
  //  * Start server listening on passed-in port number.
  //  * @param {number} port - Port that Sono.server listens to.
  //  */
  // listen(port: number): DenoServer {
  //   const options: HTTPOptions = {port};
  //   this.server = serve(options);
  //   this.awaitRequests(this.server);
  //   return this.server;
  // }

  /**
   * Adding a channel to channelsList object
   * @param { name } - name of channel
   */
  channel(name: string, callback: () => void) :void {
    this.channelsList[name] = {};
    console.log('in .channel')
    callback();
    return;
  }

  // /**
  //  * awaitRequests handles requests to server and returns undefined
  //  * @param { DenoServer } - Sono.server from which requests are sent from
  //  */
  // async awaitRequests(server: DenoServer):Promise<void> {
  //   // iterate over async request objects to server
  //   for await(const req of server) {
  //     this.handler(req);
  //   }
  // }

  /**
   * Handler method handles request to server
   * and serves files or upgrades connection to websocket
   * @param { ServerRequest } - request object from a client
    */
  // async handler(req: ServerRequest) {
  //   //serve index html
  //   console.log(req, 'request')
  //   if (req.method === "GET" && req.url === "/") {
  //     const path = `${Deno.cwd()}/webRTC/assets/index.html`
  //     const content = await serveFile(req, path);
  //     req.respond(content)
  //   }
  //   // upgrade to websocket connection
  //   else if (req.method === "GET" && req.url === "/ws") {
  //     const { conn, w:bufWriter, r:bufReader, headers } = req;
  //     acceptWebSocket({conn, bufWriter, bufReader, headers})
  //     .then(this.handleWs)
  //     .catch(err => console.log(err, 'err'))
  //   }
  //   // request to favicon is skipped
  //   else if (req.url === "/favicon.ico") {
  //     // continue
  //   }
  //   else {
  //     const path = `${Deno.cwd()}/webRTC/assets${req.url}`;
  //     const content = await serveFile(req, path);
  //     req.respond(content)
  //   }
  // }

  connect(req: ServerRequest, callback: () => void){
    const { conn, w:bufWriter, r:bufReader, headers } = req;
    acceptWebSocket({conn, bufWriter, bufReader, headers})
      .then(this.handleWs)
      .catch(err => console.log(err, 'err'))
    callback();
  }



  emit(message: string){
    Object.values(this.clients).forEach(client => {
      client.socket.send(JSON.stringify({message}))
    })
  }

  /**
   * handleWS method handles a socket connection
   * Instantiants a new client
   * Events of socket are looped thru and dealt with accordingly
   * @param { WebSocket } - WebSocket connection from a client
   */
  async handleWs (socket: WebSocket):Promise<void> {
    // create new client, add to clients object, add client to home channel
    // console.log(socket, 'im here')
    const client = new Client(socket, Object.keys(this.clients).length);
    this.clients[client.id] = client;
    this.channelsList['home'][client.id] = client;

    for await(const message of socket){
      // if client sends close websocket event, delete client
      if (isWebSocketCloseEvent(message) || typeof message !== 'string'){
        delete this.channelsList[client.channel][client.id];
        delete this.clients[client.id]
        break;
      }
      const data: Packet = JSON.parse(message)
      // const event = new Event(data.protocol)
      // const grab = data.payload.message;
      console.log('message', data)
      // depending on data.protocol, invoke an eventHandler method
      switch(data.protocol) {
        case 'message':
          // console.log('case message', this.clients)
          this.eventHandler.handleMessage(data, client, this.channelsList);
          break;
        case 'broadcast':
          this.eventHandler.broadcast(data, client, this.channelsList)
          break;
        case 'changeChannel':
          this.channelsList = this.eventHandler.changeChannel(data, client, this.channelsList);
          console.log('case channel', this.channelsList);
          break;
        case 'directmessage':
          this.eventHandler.directMessage(data, client, this.clients);
          break;
        case 'grab':
          this.eventHandler.grab(data, client, this.clients, this.channelsList);
          break;
        default:
          // this.eventHandler
          console.log('default hit', data)
      }
    }
  }
}