<p align="center">
  <img src="./media/sono-logo.png" alt="sono.land" width="100" height="100">
</p>

<h1 align="center">
  sono.land
</h1>

<p align="center">
  A real-time communication module for Deno
  <br />
  <a href="https://sono.land/"><strong>Explore the docs</strong></a>
  <br />
  <a href="https://chris-paul-ejercito.medium.com/sono-io-real-time-communication-for-deno-d325a5a29b6f">Medium Article</a>
  ·
  <a href="https://deno.land/x/sono@v1.1">Deno Module</a>
  ·
  <a href="https://github.com/oslabs-beta/sono.land/issues">Request Feature</a>
</p>

***

# Features

- 🤝 WebRTC for P2P connections
- 📸 Video and 🎤 Audio implementation
- 👨‍👩‍👧‍👦Exhibit Many to Many WebRTC connectivity utilizing the Mesh system
- 🔌 WebSocket for clients to server connections
- 💬 Chatroom demonstration to display WebSocket connections
- 📺 Multiple channels for different discussions
- 📣 Broadcast messages to everyone in the channel
- 📫 Direct message to a single client
- 📝 Grab a list of all clients in a specified channel
- 🔥 and much more

<br />

# Demo
<div align="center">

  ![test](./media/demogif.gif)

</div>
<br />

# Documentation
Find the full documentation of [sono.land](http://sono.land)

## Usage & Examples

server.ts:
```typescript
  import { Sono } from 'https://deno.land/x/sono@v1.1/mod.ts';

  const sono = new Sono();
```

client.js:
```javascript
  import { SonoClient } from 'https://deno.land/x/sono@v1.1/src/sonoClient.js';

  const sono = new SonoClient('ws://localhost:8080/ws');

  sono.on('hello', (event) => {
    console.log(event, 'world')
  })
```

  ## Installation

Import directly from deno.land / github.

deps.ts:
```typescript
  import { Sono } from 'https://deno.land/x/sono@v1.1/mod.ts';
```
<br />

# Contact the team!

- Chris Ejercito [GitHub](https://github.com/chris-paul-ejercito) [LinkedIn](https://www.linkedin.com/in/christian-paul-ejercito/)
- David Suh [GitHub](https://github.com/DavidJinSuh90) [LinkedIn](https://www.linkedin.com/in/DavidJinSuh/)
- Emily Liu [GitHub](https://github.com/a-creation) [LinkedIn](https://www.linkedin.com/in/eliu00/)
- John Lee [GitHub](https://github.com/JohnL64) [LinkedIn](https://www.linkedin.com/in/john-lee-294a38211/)
- Vince Vu [GitHub](https://github.com/vin-vu) [LinkedIn](https://www.linkedin.com/in/vince-vu-64425b1ba/)
