import { Client } from "./client.ts"
import { Packet } from "./packet.ts"

/**
 * Class with static methods that handles messages from WebSocket connections.
 */
export class EventHandler {
  constructor(){
    return;
  }
  /**
   * Sends a message to each Client object in the same channel as client
   * @param { Packet } packet - Message received from client
   * @param { Client } client - Client sending message packet
   * @param { [key: string]: Record<string, Client> } channelsList - Object containing all channels in Sono server
   */
  handleMessage(packet: Packet, client: Client, channelsList: {[key: string]: Record<string, Client>}){
    const { message } = packet.payload;
    const currentClientId = client.id.toString(); //1001

    const channelName = client.channel;
    const ids = Object.keys(channelsList[channelName])

    // if(packet.event !== undefined){
    //   console.log('in here', packet.event)
    ids.forEach((id)=>{
      // console.log(id, 'chaannelName', channelName, 'channelsList', channelsList)
      channelsList[channelName][id].socket.send(JSON.stringify({
        protocol: packet.event,
        payload: {
          message,
          from: currentClientId
        }
      }));
    })
    // }
    // else {
      // console.log('else statement')
      // ids.forEach((id)=>{
      //   channelsList[channelName][id].socket.send(JSON.stringify({
      //     protocol: 'message',
      //     username,
      //     message,
      //   }));
      // })
    }


  /**
   * Changes the channel client is in
   * @param { Packet } packet - Message containing channel to change client to
   * @param { Client } client - Client to change channel
   * @param { [key: string]: Record<string, Client> } channelsList - Object containing all channels in Sono server
   */
  changeChannel(packet: Packet, client: Client, channelsList: {[key: string]: Record<string, Client>}): {[key: string]: Record<string, Client>}{
    const { to } = packet.payload;


    const channel = client.channel;
    // console.log('to', to, 'channelsList', channelsList, 'channeel', channel)
    delete channelsList[channel][client.id];
    client.channel = to;
    channelsList[to][client.id] = client;
    return channelsList;
  }

  /**
   * Broadcast data to all clients except for the cliet sending the data
   * @param { Packet } packet - Message containing channel to change client to
   * @param { Client } client - Client to change channel
   * @param { [key: string]: Record<string, Client> } channelsList - Object containing all channels in Sono server
   */
  broadcast(packet: Packet, client: Client, channelsList: {[key: string]: Record<string, Client>}){
    const { message } = packet.payload;
    const channelName = client.channel; //'home'
    const currentClientId = client.id.toString(); //1001
    const ids = Object.keys(channelsList[channelName]);
    ids.forEach((id)=>{
      // console.log('broadcasting', id)
      if(id !== currentClientId) channelsList[channelName][id].socket.send(JSON.stringify({
        protocol: packet.event,
        payload: {
          message,
          from: currentClientId
        },
      }));
    });
  }

  /**
   * Direct messages to a specific client
   * @param { Packet } packet - Message containing channel to change client to
   * @param { Client } client - Client to change channel
   * @param { [key: string]: Record<string, Client> } clients - Object containing all channels in Sono server
   */
  directMessage(packet: Packet, client: Client, clients: {[key: string]: Client}){
    const { message, to } = packet.payload;
    const currentClientId = client.id;
    // console.log(clients)
    Object.values(clients).forEach(client => {
      if(client.id.toString() == to.toString()){
        client.socket.send(JSON.stringify({
          protocol: packet.event,
          payload: {
            message,
            from: currentClientId
          },
        }))
      }
    })
  }

  /**
   * Provides the list of clients that are connected to the server
   * @param packet - Message containing channel to change client to
   * @param client
   * @param clients
   */
  grab(packet: Packet, client: Client, clients: {[key: string]: Client}, channelsList: {[key: string]: Record<string, Client>}){

    const currentClientId = client.id.toString();
    const results: Array<string> = [];

    const { message } = packet.payload;
    if(message === 'myid'){
      results.push(currentClientId)
    }
    else if(message === 'clients'){
      Object.keys(clients).forEach(clientId => {
        results.push(clientId)
      })
    }
    else if (message === 'channels'){
      Object.keys(channelsList).forEach(channel => {
        results.push(channel);
      });
    }
    else if (message === 'mychannelclients'){
      // console.log('channelsList', channelsList)
      Object.keys(channelsList[client.channel]).forEach(id => {
        results.push(id)
      })
      // Object.keys(channelsList).forEach(channel => {
      //   results.push(channel);
      // });
    }
    else if (message === 'mychannel'){
      results.push(client.channel)
    }
    else {
      results.push('invalid grab request')
    }

    client.socket.send(JSON.stringify({
      protocol: packet.event,
      payload: {
        message: results,
        type: message
      }
    }))
  }
}