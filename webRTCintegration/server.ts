import { serve } from "https://deno.land/std@0.95.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.95.0/http/file_server.ts";
import { TestSono } from "../mod.ts"

const server = serve({ port: 8080 });
const sono = new TestSono();

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
  }
  else {
    const path = `${Deno.cwd()}/static/${req.url}`;
    const content = await serveFile(req, path);
    req.respond(content)
  }
}
