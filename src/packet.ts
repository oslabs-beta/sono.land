/**
 * Packet is a data object that is being transmitted out
 * @param { string } protocol - The protocol to be used
 * @param { string } event - The protocol to be used
 * @param { string } payload - The message being sent to
 */
export interface Packet {
  protocol: string;
  event?: string;
  //protocol examples are like changeChannel, message
  payload: Record<string, string>;
  // message: string;
  // username?: string;
  // we would need message content + channel sent to
}