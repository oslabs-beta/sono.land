import { serve } from "https://deno.land/std@0.95.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.95.0/http/file_server.ts";
import { TestSono } from "../mod.ts"

const server = serve({ port: 3000 });
const sono = new TestSono();

sono.channel('secret', ()=> {console.log('secret opened')})

for await (const req of server) {
  if (req.method === "GET" && req.url === "/") {
    const path = `${Deno.cwd()}/assets/index.html`
    const content = await serveFile(req, path);
    req.respond(content)
  }
  else if (req.method === "GET" && req.url === "/ws") {
    sono.connect(req, () => {
      sono.emit('new client connected')
    });
  }
  else if (req.method === "GET" && req.url === "/favicon.ico") {
    // Do nothing in case of favicon request
  }
  else if (req.url === "/client_side/sono_client.js") {
    const path = `${Deno.cwd()}/../client_side/sono_client.js`
    console.log(path, 'path')
    const content = await serveFile(req, path);
    req.respond(content)
  }
  else {
    const path = `${Deno.cwd()}/assets/${req.url}`;
    const content = await serveFile(req, path);
    req.respond(content)
  }
}
















//what functionality do we want?
//after the server is running, the websocket connection is established... now what?







// //require our websocket library
// var WebSocketServer = require('ws').Server;

// //creating a websocket server at port 9090
// var wss = new WebSocketServer({port: 9090});

// //when a user connects to our sever
// wss.on('connection', function(connection) {
//    console.log("user connected");

//    //when server gets a message from a connected user
//    connection.on('message', function(message){
//       console.log("Got message from a user:", message);
//    });

//    connection.send("Hello from server");
// });