import { serve } from "https://deno.land/std@0.96.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.96.0/http/file_server.ts";
import { Sono } from "https://deno.land/x/sono@v1.1/mod.ts"

const server = serve({ port: 8080 });
const sono = new Sono();

sono.channel('secret', () => {console.log('opened secret')})
sono.channel('channel1', () => {console.log('opened channel1')})

for await (const req of server) {
  if (req.method === "GET" && req.url === "/") {
    const path = `${Deno.cwd()}/static/index.html`
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
  else if (req.url === "/webRTCmodule.js") {
    const path = `${Deno.cwd()}/webRTCmodule.js`
    console.log(path, 'path')
    const content = await serveFile(req, path);
    req.respond(content)
  }
  else {
    const path = `${Deno.cwd()}/static/${req.url}`;
    const content = await serveFile(req, path);
    req.respond(content)
  }
}