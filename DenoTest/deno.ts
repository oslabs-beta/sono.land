import { serve, Server, HTTPOptions, ServerRequest } from "https://deno.land/std@0.95.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.95.0/http/file_server.ts";
import {
  acceptWebSocket,
  isWebSocketCloseEvent,
} from "https://deno.land/std@0.95.0/ws/mod.ts";

class Bitches {
  public server: Server;

  constructor(){
    this.server = serve({ port: 8080 });
    // this.handleWs = this.handleWs.bind(this);
  }

  async run(): Promise<void> {
    for await (const request of this.server) {
      // let bodyContent = "Your user-agent is:\n\n";
      // bodyContent += request.headers.get("user-agent") || "Unknown";

      // request.respond({ status: 200, body: bodyContent });
      console.log(request)
      this.handler(request)
    }
  }
  async handler(req: ServerRequest) {
    if (req.method === "GET" && req.url === "/") {

      const path = `${Deno.cwd()}/../webRTC/assets/index.html`

      const content = await serveFile(req, path);
      console.log('We are serving index')
      req.respond(content)
    }
    // else if (req.method === "GET" && req.url === "/ws") {
    //   const { conn, w:bufWriter, r:bufReader, headers } = req;
    //   acceptWebSocket({conn, bufWriter, bufReader, headers})
    //   .then(this.handleWs)
    //   .catch(err => console.log(err, 'err'))
    // }
    else if (req.url === "/favicon.ico") {
    }
    else { // localhost:3000/main.js
      console.log(req.url)
      const path = `${Deno.cwd()}/../webRTC/assets/${req.url}`
      const content = await serveFile(req, path);
      req.respond(content)
    }
  }
  // async handleWs (socket: WebSocket):Promise<void> {
  //   console.log('HelloHANDDLINE WS')
    // const client = new Client(socket, Object.keys(this.clients).length);
    // this.clients[client.id] = client;
    // this.channelsList['home'][client.id] = client;
    // // console.log('clients', this.clients)
    // // console.log('channelslist', this.channelsList)

    // // const tag = client.id
    // // this.clients[tag] = client;
    // for await(const message of socket){

    //   if(isWebSocketCloseEvent(message) || typeof message !== 'string'){
    //     //remove client from channelsList
    //     //and from
    //     delete this.channelsList[client.channel][client.id];
    //     delete this.clients[client.id]
    //     // console.log('im here', this.channelsList)
    //     // console.log('im here', this.clients)
    //     break;
    //   }
    //   // console.log('im here', this.channelsList)
    //   // console.log('im heere', this.clients)
    //   const data: Packet = JSON.parse(message)

    //   // if(data.protocol === 'broadcast'){
    //   //   this.eventHandler.broadcast(data.protocol, client, this.channelsList)
    //   // }

    //   switch(data.protocol) {
    //     case 'message':
    //       console.log('case message', this.clients)
    //       this.eventHandler.handleMessage(data, client, this.channelsList);
    //       break;
    //     case 'broadcast':
    //       this.eventHandler.broadcast(data, client, this.channelsList)
    //       break;
    //     case 'changeChannel':
    //       this.channelsList = this.eventHandler.changeChannel(data, client, this.channelsList);
    //       console.log('case channel', this.channelsList);
    //       break;
    //     case 'directMessage':
    //       this.eventHandler.directMessage(data, client, this.clients)
    //     default:
    //       console.log('default hit', data)
    //   }
    // }

}

const bitch = new Bitches();
bitch.run();


