import { Client } from "./client.ts"
import { Packet } from "./packet.ts"

export class EventHandler {

  constructor(){
    return;
  }

  handleMessage(packet: Packet, channelsList: {[key: string]: Record<string, Client>}){
    // console.log('imhere', JSON.parse(message))
    const { to, message } = packet.payload;
    //now that we have the channel, we need to grab the channelsList
    //grab its array of values, run a loop and send message to each client connected
    // console.log(to)
    // if(channelsList[to]){
    const ids = Object.keys(channelsList[to])
    ids.forEach((id)=>{
      channelsList[to][id].socket.send(message);
      // console.log('client', client);
    })
    // }
  }

  changeChannel(packet: Packet, client: Client, channelsList: {[key: string]: Record<string, Client>}): {[key: string]: Record<string, Client>}{
    const { to } = packet.payload;
    const channel = client.channel;

    delete channelsList[channel][client.id];
    client.channel = to;
    channelsList[to][client.id] = client;

    return channelsList;
    // delete channelsList[channel]
    //how do we actually find the channel that has this specific client
  }


}