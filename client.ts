import { WebSocket } from "./deps.ts";
/**
 * Client class creates each client with unique id, WebSocket, and the channel client is set to
 */
export class Client {
  public socket: WebSocket;
  public id = 0;
  public channel: string;
  constructor(socket: WebSocket, id: number){
    this.socket = socket;
    this.id = id + 1000;
    this.channel = 'home';
  }
}