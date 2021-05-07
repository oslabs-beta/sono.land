import { serve, DenoServer, HTTPOptions,
  HTTPSOptions,
  acceptWebSocket,
  isWebSocketCloseEvent,
  WebSocket, ServerRequest }
  from "./imports.ts";
import { Client } from "./client.ts"
import { EventHandler } from "./eventhandler.ts"
import { Packet } from "./packet.ts"
import { serveFile } from "https://deno.land/std@0.95.0/http/file_server.ts";

  //options would look like {host: , port: }
  //want to feed those options into creating a new server
  //after that, upgrade connection to websocket connection if possible
  //
export class Lucky {

  public server: DenoServer;
  public hostname = 'localhost';
  public clients: {[key: string]: Client} = {};
  public channelsList: {[key: string]: Record<string, Client>} = {'home': {}};
  public eventHandler: EventHandler;
  public options: HTTPOptions;

  constructor(port: number){
    this.eventHandler = new EventHandler();
    this.options = {hostname: this.hostname, port};
    this.server = serve(this.options);
    // this.handleWs = this.handleWs.bind(this);
  }

  async run(): Promise<void> {

    // const options: HTTPOptions = {hostname: this.hostname, port}
    // console.log('step1', options)

    // const hello = serve(options);
    // console.log('step1', hello)

    // console.log(this.server)
    for await (const request of this.server) {
      let bodyContent = "Your user-agent is:\n\n";
      bodyContent += request.headers.get("user-agent") || "Unknown";

      request.respond({ status: 200, body: bodyContent });
    }
    //within run we need some way to accept the websocket connection: acceptWebSocket
    // return this.server;
  }
}