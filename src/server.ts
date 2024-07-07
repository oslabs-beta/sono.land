import { Client } from "./client.ts";
import { EventHandler } from "./eventhandler.ts";
import { Packet } from "./packet.ts";


/**
 * Class that handles WebSocket messages.
 * Uses Client objects and an EventHandler object
 * to send messages to Clients.
 */
export class Sono {
  public hostname = "localhost";
  public clients: { [key: string]: Client } = {};
  public channelsList: { [key: string]: Record<string, Client> } = {
    home: {},
  };
  public eventHandler: EventHandler;
  public lastClientId: number = 1000;

  /**
   * Constructor creates a new instance of the Event,
   * binds handleWs to this and returns a Sono instance.
   */
  constructor() {
    this.eventHandler = new EventHandler();
    this.handleWs = this.handleWs.bind(this);
  }


  /**
   * Adding a channel to channelsList object
   * @param { name } - name of channel
   */
  channel(name: string, callback: () => void): void {
    this.channelsList[name] = {};

    callback();
    return;
  }

  connect(req: Request, callback: () => void) {
    // @ts-ignore
    const { socket, response }: { socket: WebSocket, response: Response } = Deno.upgradeWebSocket(req);
    this.handleWs(socket);
    this.emit("new client connected");
    callback();
    return response;
  }

  emit(message: string) {
    Object.values(this.clients).forEach((client) => {
      client.socket.send(JSON.stringify({ message }));
    });
  }

  /**
   * handleWS method handles a socket connection
   * Instantiants a new client
   * Events of socket are looped thru and dealt with accordingly
   * @param { WebSocket } - WebSocket connection from a client
   */
  handleWs(socket: WebSocket): void {
    // create new client, add to clients object, add client to home channel

    const client = new Client(socket, this.lastClientId);
    this.lastClientId = client.id;
    this.clients[client.id] = client;
    this.channelsList["home"][client.id] = client;
    socket.addEventListener("close", () => {
      delete this.channelsList[client.channel][client.id];
      delete this.clients[client.id];
    });
    socket.addEventListener("open", () => {
      console.log(client.id, " client connected!");
    });
    socket.addEventListener("message", (event) => {
      const message = event.data;
      console.log(message);
      const data: Packet = JSON.parse(message);
      // const event = new Event(data.protocol)
      // const grab = data.payload.message;

      // depending on data.protocol, invoke an eventHandler method
      switch (data.protocol) {
        case "message":
          // console.log("case message", this.clients);
          this.eventHandler.handleMessage(
            data,
            client,
            this.channelsList
          );
          break;
        case "broadcast":
          this.eventHandler.broadcast(
            data,
            client,
            this.channelsList
          );
          break;
        case "changeChannel":
          this.channelsList = this.eventHandler.changeChannel(
            data,
            client,
            this.channelsList
          );
          // console.log('case channel', this.channelsList);
          break;
        case "directmessage":
          this.eventHandler.directMessage(data, client, this.clients);
          break;
        case "grab":
          this.eventHandler.grab(
            data,
            client,
            this.clients,
            this.channelsList
          );
          break;
        default:
          // this.eventHandler
          // console.log('default hit', data)
          console.log("default case in testServer");
      }
    });
  }
}
