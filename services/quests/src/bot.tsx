import * as Discord from 'discord.js';

const client = new Discord.Client();
client.login(process.env.DISCORD_ENV);

export default client;
