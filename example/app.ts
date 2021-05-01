import { Sono } from '../exports.ts'

const sono = new Sono();
sono.run(8080);

sono.channel('secret', () => {
	return console.log('opened secret channel')
});











//what functionality do we want?
//after the server is running, the websocket connection is established... now what?
