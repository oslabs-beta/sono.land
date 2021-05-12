import { serve, DenoServer, HTTPOptions,
  HTTPSOptions,
  acceptWebSocket,
  isWebSocketCloseEvent,
  WebSocket }
  from "./imports.ts";
import { Client } from "./client.ts"
import { EventHandler } from "./eventhandler.ts"
import { Packet } from "./packet.ts"
// import { serveFile } from "https://deno.land/std@0.93.0/http/file_server.ts";
  //options would look like {host: , port: }
  //want to feed those options into creating a new server
  //after that, upgrade connection to websocket connection if possible
  //
export class Server {
  public server: DenoServer | null = null;
  public hostname = 'localhost';
  public clients: {[key: string]: Client} = {};
  public channelsList: {[key: string]: Record<string, Client>} = {'home': {}};
  public eventHandler: EventHandler;
  constructor(){
    //what goes inside this constructor, what do we want const server to equal
    // this.served;
    this.eventHandler = new EventHandler();
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
  async awaitRequests(server: DenoServer){
    // let i = 0;
    for await(const req of server) {
      // console.log(req, 'req')
      // console.log(i)
      // console.log(req)
      // i += 1;
      // if(req.url === '/'){
      //   // try{
      //     const path = `${Deno.cwd()}/assets/index.html`
      //     const content = await serveFile(req, path);
      //     req.respond(content);
      //   // }
      //   // catch(err){
      //   //   console.log(err)
      //   // }
      //   break;


      // }
      const { conn, w:bufWriter, r:bufReader, headers } = req;
      // console.log(headers);
      // req.respond({ body: 'hi' });
      // console.log(BufWriter)
      // console.log(BufWriter)
      acceptWebSocket({conn, bufWriter, bufReader, headers})
        .then(async (socket: WebSocket) => {
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
              //and from
              delete this.channelsList[client.channel][client.id];
              delete this.clients[client.id]
              // console.log('im here', this.channelsList)
              console.log('im here', this.clients)
              break;
            }
            // console.log('im here', this.channelsList)
            console.log('im heere', message)
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
        })
        .catch(err => console.log(err, 'err'))
      //within the acceptwebsocket function, it takes an object:req: {
      //   conn: Deno.Conn;
      //   bufWriter: BufWriter;
      //   bufReader: BufReader;
      //   headers: Headers;
      // }
    }
  }
}
//on client side it would like
// const server = new Server() <- goes inside constructor


// import { serve, DenoServer, HTTPOptions,
//   HTTPSOptions,
//   acceptWebSocket,
//   isWebSocketCloseEvent,
//   WebSocket }
//   from "./imports.ts";
// import { Client } from "./client.ts"
// import { EventHandler } from "./eventhandler.ts"
// import { Packet } from "./packet.ts"
// // import { serveFile } from "https://deno.land/std@0.93.0/http/file_server.ts";


//   //options would look like {host: , port: }
//   //want to feed those options into creating a new server
//   //after that, upgrade connection to websocket connection if possible
//   //
// export class Server {

//   public server: DenoServer | null = null;
//   public hostname = 'localhost';
//   public clients: {[key: string]: Client} = {};
//   public channelsList: {[key: string]: Record<string, Client>} = {'home': {}};
//   public eventHandler: EventHandler;

//   constructor(){
//     //what goes inside this constructor, what do we want const server to equal
//     // this.served;
//     this.eventHandler = new EventHandler();
//   }
//   //function run to start the server and then upgrade
//   run(port: number): DenoServer {
//     //options = just a port number like 8080 object {hostname: 'localhost', port: 8080}

//     const options: HTTPOptions = {hostname: this.hostname, port}
//     this.server = serve(options);

//     console.log(this.server)
//     this.awaitRequests(this.server);


//     //within run we need some way to accept the websocket connection: acceptWebSocket
//     return this.server;
//   }

//   channel(name: string, callback: ()=>void): void {

//     this.channelsList[name] = {};
//     console.log(this.channelsList)
//     callback();
//     return;
//   }

// // Invoked in run method with
//   async awaitRequests(server: DenoServer){
//     // let i = 0;
//     for await(const req of server) {
//       // console.log(req, 'req')
//       // console.log(i)
//       // console.log(req)
//       // i += 1;
//       // if(req.url === '/'){
//       //   // try{
//       //     const path = `${Deno.cwd()}/assets/index.html`
//       //     const content = await serveFile(req, path);
//       //     req.respond(content);
//       //   // }
//       //   // catch(err){
//       //   //   console.log(err)
//       //   // }
//       //   break;

//       // }
//       const { conn, w:bufWriter, r:bufReader, headers } = req;
//       // console.log(headers);
//       // req.respond({ body: 'hi' });
//       // console.log(BufWriter)
//       // console.log(BufWriter)
//       acceptWebSocket({conn, bufWriter, bufReader, headers})
//         .then(async (socket: WebSocket) => {
//           const client = new Client(socket, Object.keys(this.clients).length);
//           this.clients[client.id] = client;
//           this.channelsList['home'][client.id] = client;
//           // console.log('clients', this.clients)
//           // console.log('channelslist', this.channelsList)

//           // const tag = client.id
//           // this.clients[tag] = client;
//           for await(const message of socket){

//             if(isWebSocketCloseEvent(message) || typeof message !== 'string'){
//               //remove client from channelsList
//               //and from
//               delete this.channelsList[client.channel][client.id];
//               delete this.clients[client.id]
//               // console.log('im here', this.channelsList)
//               console.log('im here', this.clients)
//               break;
//             }
//             // console.log('im here', this.channelsList)
//             console.log('im heere', message)
//             const data: Packet = JSON.parse(message)

//             // if(data.protocol === 'broadcast'){
//             //   this.eventHandler.broadcast(data.protocol, client, this.channelsList)
//             // }

//             switch(data.protocol) {
//               case 'message':
//                 console.log('case message', this.clients)
//                 this.eventHandler.handleMessage(data, client, this.channelsList);
//                 break;
//               case 'broadcast':
//                 this.eventHandler.broadcast(data, client, this.channelsList)
//                 break;
//               case 'changeChannel':
//                 this.channelsList = this.eventHandler.changeChannel(data, client, this.channelsList);
//                 console.log('case channel', this.channelsList);
//                 break;
//               default:
//                 console.log('default hit', data)
//             }
//           }
//         })
//         .catch(err => console.log(err, 'err'))
//       //within the acceptwebsocket function, it takes an object:req: {
//       //   conn: Deno.Conn;
//       //   bufWriter: BufWriter;
//       //   bufReader: BufReader;
//       //   headers: Headers;
//       // }
//     }
//   }
// }



// //on client side it would like
// // const server = new Server() <- goes inside constructor