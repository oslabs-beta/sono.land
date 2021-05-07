// import { Server } from '../exports.ts';
import { Sono } from '../mod.ts';
// import { Lucky } from '../exports.ts';

const sono = new Sono();

sono.listen(8080);

const server = Deno.listen({ port: 8080 });

// Connections to the server will be yielded up as an async iterable.
for await (const req of server) {
  // In order to not be blocking, we need to handle each connection individually
  // in its own async function.
  console.log(req)
  (async () => {

    if (req.method === "GET" && req.url === "/") {
      const path = `${Deno.cwd()}/webRTC/assets/index.html`
      const content = await serveFile(req, path);
      req.respond(content)
    }
    // upgrade to websocket connection
    else if (req.method === "GET" && req.url === "/ws") {
      const { conn, w:bufWriter, r:bufReader, headers } = req;
      acceptWebSocket({conn, bufWriter, bufReader, headers})
      .then(this.handleWs)
      .catch(err => console.log(err, 'err'))
    }
    // request to favicon is skipped
    else if (req.url === "/favicon.ico") {
      // continue
    }
    else {
      const path = `${Deno.cwd()}/webRTC/assets${req.url}`;
      const content = await serveFile(req, path);
      req.respond(content)
    }

  })();
}



