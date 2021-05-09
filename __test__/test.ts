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

  }
});