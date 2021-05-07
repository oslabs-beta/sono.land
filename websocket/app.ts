import { Sono } from '../mod.ts';
/**
 * create new instance of Sono, invoke the listen class method with the desired port number.
 */
const sono = new Sono();
sono.listen(8080);
/**
 * invoke the channel class method to create additional channels.
 */
sono.channel('secret', () => {
	return console.log('opened secret channel')
});