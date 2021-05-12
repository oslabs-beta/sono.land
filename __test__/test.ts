import { assert, assertEquals, assertThrows, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.95.0/testing/asserts.ts";
import { delay } from "https://deno.land/std@0.95.0/async/delay.ts";
import { WebSocketServer, WebSocket } from "https://deno.land/x/websocket@v0.1.2/lib/websocket.ts";
import { on } from "https://deno.land/std/node/events.ts";


const testSono = "ws://localhost:8080";

Deno.test({
  name: 'Connected to server',
  async fn(): Promise<void> {
    const mock = new WebSocketServer(8080);
    const connection = on(mock, "connection");

    const testSocket = new Websocket(testSono);
    const openSocket = on(testSocket, "open connection");
    const event = await connection.next();
    assertNotEquals(event, undefined);

    await openSocket.next();
    await testSocket.close();
    assertEquals(testSocket.isClosed, true);

    await mock.close();
  }
});

Deno.test({
  name: "Connect to server from two clients",
  async fn(): Promise<void> {
    const mock = new WebSocketServer(8080);
    const connection = on(mock, 'connection');

    const firstClient = new WebSocket(testSono);
    const secondClient = new Websocket(testSono);

    const firstConnect = on(firstClient, 'open');
    const secondConnect = on(secondClient, 'open');

    let event = await connection.next();
    assertNotEquals(event, undefined);
    event = await connection.next();
    assertNotEquals(event, undefined);

    await firstConnect.next();
    await firstClient.close();
    assertEquals(firstClient.isClosed, true);

    await secondConnect.next();
    await secondClient.close();
    assertEquals(secondClient.isClosed, true);

    await mock.close();
  }
});

Deno.test({
  name: "Failed connection",
  async fn(): Promise<void> {
    const mock = new WebSocketServer(8080);
    const testSocket = new WebSocket(testSono);
    const connection = on(mock, 'connect');
    await assertThrowsAsync(async (): Promise<void> => {
      await testSocket.send('hi');
    }, WebSocketError, 'WebSocket is not open';

    await connection.next();
    await mock.close();
  }
});