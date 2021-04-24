import { WebSocket } from "./imports.ts";



/*
for each client:
have unique id
have their socket
have their channels/rooms they're subscribed to/in
currentroom?

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