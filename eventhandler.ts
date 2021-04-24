import { Client } from "./client.ts"

export class EventHandler {

  constructor(){
    return;
  }

  handle(packet: string, channelsList: {[key: string]: Client[]}){
    // console.log('imhere', JSON.parse(message))
    const { to, message } = JSON.parse(packet);
    //now that we have the channel, we need to grab the channelsList
    //grab its array of values, run a loop and send message to each client connected
    // console.log(to)
    // if(channelsList[to]){
      channelsList[to].forEach((client)=>{
        // console.log('client', client);
        client.socket.send(message);
      })
    // }
  }


}