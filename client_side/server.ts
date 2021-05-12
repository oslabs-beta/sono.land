// import { Server } from '../exports.ts';
import { TestSono } from '../mod.ts';
// import { Lucky } from '../exports.ts';

// const sono = new Sono();

// sono.listen(8080);

// Start listening on port 8080 of localhost.
import { serve } from "https://deno.land/std@0.95.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.95.0/http/file_server.ts";

const server = serve({ port: 8080 });
const sono = new TestSono();

// Connections to the server will be yielded up as an async iterable.
for await (const req of server) {
  // In order to not be blocking, we need to handle each connection individually
  // in its own async function.
  if (req.method === "GET" && req.url === "/") {
    const path = `${Deno.cwd()}/index.html`
    const content = await serveFile(req, path);
    req.respond(content)
  }
  // upgrade to websocket connection
  else if (req.method === "GET" && req.url === "/ws") {
    sono.connect(req, ()=> {
      sono.emit('new client connected')
    });
  }
  // request to favicon is skipped
  else if (req.url === "/favicon.ico") {
    // continue
  }
  else {
    const path = `${Deno.cwd()}/${req.url}`;
    const content = await serveFile(req, path);
    req.respond(content)
  }
}

sono.channel('newChannel', () => {
  console.log('new channel created')
})


