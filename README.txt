
# sono.io

A real-time communication module for Deno.
## Features

- A WebSocket server module for the Deno runtime
- A Websocket client module for to interface with the sono module
- A WebRTC module for Deno


## Usage/Examples

server.ts:
```typescript
  import { Sono } from 'https://deno.land/x/sono@v0.1.0/mod.ts';

  const sono = new Sono();
```

client.ts:
```typescript
  import { SonoClient } from 'https://deno.land/x/sono@v0.1.0/mod.ts';

  const sono = new SonoClient('ws://localhost:8080/ws');

  sono.on('hello', (event) => {
    console.log(event, 'world')
  })
```

  ## Installation

Import directly from deno.land / github.

deps.ts:
```typescript
  import { Sono } from 'https://deno.land/x/sono@v0.1.0/mod.ts';
```

## Documentation
Find the documentation [here.](https://linktodocumentation)

  ## Authors

- [Chris Ejercito](https://github.com/chris-paul-ejercito)
- [David Suh](https://github.com/DavidJinSuh90)
- [Emily Liu](https://github.com/a-creation)
- [John Lee](https://github.com/JohnL64)
- [Vince Vu](https://github.com/vin-vu)