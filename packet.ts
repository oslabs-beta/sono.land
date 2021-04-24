export interface Packet {

  protocol: string;
  //protocol examples are like changeChannel, message

  payload: Record<string, string>;
  // we would need message content + channel sent to

}

//payload differs depdning on protocol?
//message payload example: {message: '', to: ''}
//changeChannel payload: {to: ''}