// import { serve, DenoServer, HTTPOptions,
//   HTTPSOptions,
//   acceptWebSocket,
//   isWebSocketCloseEvent,
//   WebSocket, ServerRequest }
//   from "./imports.ts";
import { Client } from "./client.ts"
import { EventHandler } from "./eventhandler.ts"
import { Packet } from "./packet.ts"
import type { WebSocket } from "https://deno.land/std@0.95.0/ws/mod.ts";
// import { serveFile } from "https://deno.land/std@0.95.0/http/file_server.ts";
import type { HTTPOptions } from "https://deno.land/std@0.95.0/http/server.ts";

import { serve, Server as DenoServer, ServerRequest } from "https://deno.land/std@0.95.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.95.0/http/file_server.ts";
import {
  acceptWebSocket,
  isWebSocketCloseEvent,
} from "https://deno.land/std@0.95.0/ws/mod.ts";

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
  // public options: HTTPOptions;

  constructor(){
    //what goes inside this constructor, what do we want const server to equal
    // this.served;

    this.eventHandler = new EventHandler();
    this.handleWs = this.handleWs.bind(this);
    // this.options = {port}

    // this.server = serve(this.options);
  }
  //function run to start the server and then upgrade
  // create run method that takes in a port number and the function must return an output where the type is a DenoServer which is a class from http standard library
  listen(port: number): DenoServer {
    const options: HTTPOptions = {port}

    this.server = serve(options);
    this.awaitRequests(this.server)
    return this.server;
  }

  channel(name: string, callback: ()=>void): void {

    this.channelsList[name] = {};
    console.log(this.channelsList)
    callback();
    return;
  }

  // Invoked in run method with
  // Function returns undefined as per Promise<void>
  async awaitRequests(server: DenoServer):Promise<void> {
    // console.log('hi')
    // server is listening to requests
    for await(const req of server) {
      // console.log('req coming in', req)
      // req.respond({body: 'hi'})
      this.handler(req);
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
    else if (req.url === "/favicon.ico") {
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
        case 'directMessage':
          this.eventHandler.directMessage(data, client, this.clients);
          break;
        default:
          console.log('default hit', data)
      }
    }
  }

}

// const bitch = new Sono();
// bitch.run(3000)

//on client side it would like
// const server = new Server() <- goes inside constructor