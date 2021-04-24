import { Server } from '../exports.ts'



const server = new Server();
server.run(8080);


server.channel('secret', ()=>{return console.log('opened secret channel')})

// server.listen('fuck', () => console.log('hi') )


//what functionality do we want?
//after the server is running, the websocket connection is established... now what?
//