/**
 * Packet is a data object that is being transmitted out
 */
export interface Packet {
  protocol: string;
  //protocol examples are like changeChannel, message
  payload: Record<string, string>;
  // we would need message content + channel sent to
}