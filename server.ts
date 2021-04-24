import { serve, DenoServer, HTTPOptions,
  HTTPSOptions,
  acceptWebSocket,
  isWebSocketCloseEvent,
  WebSocket }
  from "./imports.ts";
import { Client } from "./client.ts"
import { EventHandler } from "./eventhandler.ts"

  //options would look like {host: , port: }
  //want to feed those options into creating a new server
  //after that, upgrade connection to websocket connection if possible
  //
export class Server {

  public server: DenoServer | null = null;
  public hostname = 'localhost';
  public clients: {[key: string]: Client} = {};
  public channelsList: {[key: string]: Client[]} = {'home': []};
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

    this.channelsList[name] = [];
    console.log(this.channelsList)
    callback();
    return;
  }

  async awaitRequests(server: DenoServer){
    // let i = 0;
    for await(const req of server) {
      // console.log(req, 'req')
      // console.log(i)
      // console.log(req)
      // i += 1;
      const { conn, w:bufWriter, r:bufReader, headers } = req;
      // console.log(headers);
      // req.respond({ body: 'hi' });
      // console.log(BufWriter)
      // console.log(BufWriter)
      acceptWebSocket({conn, bufWriter, bufReader, headers})
        .then(async (socket: WebSocket) => {
          const client = new Client(socket, Object.keys(this.clients).length);
          this.clients[client.id] = client;
          this.channelsList['home'].push(client);
          // console.log('clients', this.clients)
          // console.log('channelslist', this.channelsList)

          // const tag = client.id
          // this.clients[tag] = client;
          for await(const message of socket){
            //handle messages
            if(!isWebSocketCloseEvent(message) && typeof message === 'string'){
              this.eventHandler.handle(message, this.channelsList);
            }
            // EventHandler.handle(message)
            console.log('socketreq', message);
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