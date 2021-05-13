import { WebSocket } from "../deps.ts";
/**
 * Client class creates each client with unique id, WebSocket, and the channel client is set to
 */
export class Client {
  public socket: WebSocket;
  public id = 1000;
  public channel: string;
  constructor(socket: WebSocket, lastClientId: number){
    this.socket = socket;
    this.id = lastClientId + 1;
    console.log(this.id)
    this.channel = 'home';
  }
}