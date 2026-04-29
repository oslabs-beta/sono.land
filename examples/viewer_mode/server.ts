import { Sono } from "../../mod.ts"

const sono = new Sono();

sono.channel('stream', ()=> {console.log('stream channel opened')})

Deno.serve({ port: 8080 }, async (req: Request) => {
  const url = new URL(req.url);
  
  if (url.pathname === "/") {
    const path = `${Deno.cwd()}/examples/viewer_mode/static/index.html`
    return await serveFile(req, path);
  }
  else if (url.pathname === "/ws") {
    return sono.connect(req);
  }
  else if (url.pathname === "/main.js") {
    const path = `${Deno.cwd()}/examples/viewer_mode/static/main.js`
    return await serveFile(req, path);
  }
  else if (url.pathname === "/style.css") {
    const path = `${Deno.cwd()}/examples/viewer_mode/static/style.css`
    return await serveFile(req, path);
  }
  else if (url.pathname === "/mod.ts"){
    const path = `${Deno.cwd()}/mod.ts`;
    return await serveFile(req, path);
  }
  else if (url.pathname.startsWith("/src/")) {
    const path = `${Deno.cwd()}${url.pathname}`;
    return await serveFile(req, path);
  }
  
  return new Response("Not Found", { status: 404 });
});

async function serveFile(req: Request, path: string): Promise<Response> {
  try {
    const content = await Deno.readFile(path);
    const ext = path.split('.').pop() || '';
    const contentTypes: Record<string, string> = {
      'html': 'text/html',
      'js': 'application/javascript',
      'ts': 'application/typescript',
      'css': 'text/css',
      'json': 'application/json'
    };
    return new Response(content, {
      headers: { 'content-type': contentTypes[ext] || 'text/plain' }
    });
  } catch {
    return new Response("File not found", { status: 404 });
  }
}