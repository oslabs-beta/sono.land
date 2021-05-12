
import { serve } from "https://deno.land/std@0.95.0/http/server.ts";

const server = serve({ port: 8080 });

for await (const req of server) {
  if (req.method === "GET" && req.url === "/") {
    req.respond({status: 200, body: 'Hello World!'})
  }
}