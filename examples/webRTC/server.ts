import { serve } from "https://deno.land/std@0.96.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.96.0/http/file_server.ts";
import { Sono } from "../../mod.ts"

const server = serve({ port: 8080 });
const sono = new Sono();

sono.channel('secret', ()=> {console.log('secret opened')})

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
    continue;
  }
  else if (req.url === "/main.js") {
    const path = `${Deno.cwd()}/static/main.js`

    const content = await serveFile(req, path);
    req.respond(content)
  }
  else if (req.method === "GET" && req.url === "/mod.ts"){
    const path = `${Deno.cwd()}/../../mod.ts`;
    const content = await serveFile(req, path);
    req.respond(content)
  }
}