import { serve, DenoServer, HTTPOptions,
  HTTPSOptions,
  acceptWebSocket,
  isWebSocketCloseEvent,
  WebSocket, ServerRequest }
  from "./imports.ts";
import { Client } from "./client.ts"
import { EventHandler } from "./eventhandler.ts"
import { Packet } from "./packet.ts"
import { serveFile } from "https://deno.land/std@0.93.0/http/file_server.ts";

  //options would look like {host: , port: }
  //want to feed those options into creating a new server
  //after that, upgrade connection to websocket connection if possible
  //
export class Sono {

  public server: DenoServer | null = null;
  public hostname = 'localhost';
  public clients: {[key: string]: Client} = {};
  public channelsList: {[key: string]: Record<string, Client>} = {'home': {}};
  public eventHandler: EventHandler;

  constructor(){
    //what goes inside this constructor, what do we want const server to equal
    // this.served;
    this.eventHandler = new EventHandler();
    this.handleWs = this.handleWs.bind(this);
  }
  //function run to start the server and then upgrade
  run(port: number): DenoServer {
    //options = just a port number like 8080 object {hostname: 'localhost', port: 8080}

    const options: HTTPOptions = {hostname: this.hostname, port}
    this.server = serve(options);

    console.log(this.server)
    this.awaitRequests(this.server);


    //within run we need some way to accept the websocket connection: acceptWebSocket
    return this.server;
  }

  channel(name: string, callback: ()=>void): void {

    this.channelsList[name] = {};
    console.log(this.channelsList)
    callback();
    return;
  }

// Invoked in run method with
  async awaitRequests(server: DenoServer) {
    // let i = 0;
    console.log('this', this)
    for await(const req of server) {

      console.log("HIHIHIHHIHIHIIHI")
      // console.log(req, 'req')
      // console.log(i)
      console.log(req)
      this.handler(req);
      //   //   console.l`og(err
      // }
    }
  }

  async handler(req: ServerRequest) {
    if (req.method === "GET" && req.url === "/") {

      const path = `${Deno.cwd()}/assets/index.html`

      const content = await serveFile(req, path);
      console.log('We are serving index')
      req.respond(content)
    }
    else if (req.method === "GET" && req.url === "/ws") {
      const { conn, w:bufWriter, r:bufReader, headers } = req;
      acceptWebSocket({conn, bufWriter, bufReader, headers})
      .then(this.handleWs)
      .catch(err => console.log(err, 'err'))
    }
    else if (req.url === "/favicon.ico"){

    }
    else { // localhost:3000/main.js
      console.log(req.url)
      const path = `${Deno.cwd()}/assets${req.url}`;
      const content = await serveFile(req, path);
      req.respond(content)
    }
  }
  async handleWs (socket: WebSocket):Promise<void> {
    console.log('Hello', this)
    const client = new Client(socket, Object.keys(this.clients).length);
    this.clients[client.id] = client;
    this.channelsList['home'][client.id] = client;
    // console.log('clients', this.clients)
    // console.log('channelslist', this.channelsList)

    // const tag = client.id
    // this.clients[tag] = client;
    for await(const message of socket){

      if(isWebSocketCloseEvent(message) || typeof message !== 'string'){
        //remove client from channelsList
        //and from
        delete this.channelsList[client.channel][client.id];
        delete this.clients[client.id]
        // console.log('im here', this.channelsList)
        // console.log('im here', this.clients)
        break;
      }
      // console.log('im here', this.channelsList)
      // console.log('im heere', this.clients)
      const data: Packet = JSON.parse(message)

      // if(data.protocol === 'broadcast'){
      //   this.eventHandler.broadcast(data.protocol, client, this.channelsList)
      // }

      switch(data.protocol) {
        case 'message':
          console.log('case message', this.clients)
          this.eventHandler.handleMessage(data, client, this.channelsList);
          break;
        case 'broadcast':
          this.eventHandler.broadcast(data, client, this.channelsList)
          break;
        case 'changeChannel':
          this.channelsList = this.eventHandler.changeChannel(data, client, this.channelsList);
          console.log('case channel', this.channelsList);
          break;
        default:
          console.log('default hit', data)
      }
    }
  }

}



//on client side it would like
// const server = new Server() <- goes inside constructor