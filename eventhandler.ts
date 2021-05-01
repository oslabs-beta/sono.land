import { Client } from "./client.ts"
import { Packet } from "./packet.ts"

export class EventHandler {
  constructor(){
    return;
  }

  handleMessage(packet: Packet, client: Client, channelsList: {[key: string]: Record<string, Client>}){
    // console.log('imhere', JSON.parse(message))
    const { message, username } = packet.payload;
    //now that we have the channel, we need to grab the channelsList
    //grab its array of values, run a loop and send message to each client connected
    // console.log(to)
    const channelName = client.channel;
    // console.log(channelName);
    // console.log(channelsList[channelName]);
    // if(channelsList[to]){
    const ids = Object.keys(channelsList[channelName])
    ids.forEach((id)=>{
      channelsList[channelName][id].socket.send(JSON.stringify({username, message}));
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

  broadcast(packet: Packet, client: Client, channelsList: {[key: string]: Record<string, Client>}){
    // console.log('imhere', JSON.parse(message))
    const { message } = packet.payload;
    //now that we have the channel, we need to grab the channelsList
    //grab its array of values, run a loop and send message to each client connected
    // console.log(to)
    const channelName = client.channel; //'home'
    const currentClientId = client.id; //1001
    // console.log(channelName);
    // console.log(channelsList[channelName]);
    // if(channelsList[to]){
    const ids = Object.keys(channelsList[channelName])
    ids.forEach((id)=>{
      if(id !== currentClientId.toString()) channelsList[channelName][id].socket.send(JSON.stringify(message));
      console.log('broadcasting');
    })
    // }
  }


}