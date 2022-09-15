require('dotenv').config();
// Discord
const { Client } = require('discord.js');
const { GatewayIntentBits } = require('discord-api-types/v10');
const discordClient = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
discordClient.on('debug', console.log);
// Axios
const axios = require('axios');
const URL = 'https://rhsx.rickyqin.repl.co/api/leaderboard';

let message;
const REFRESH_RATE = 6000;
const Price = require('./utils/Price');
const Tools = require('./utils/Tools');
const createTable = require('text-table');

async function update() {
    const startTime = new Date();
    try {
        await message.edit(leaderboardString((await axios.get(URL)).data));
    } catch(error) {
        console.log(error);
    }
    console.log(`updated leaderboard at ${Tools.dateStr(new Date())}, took ${new Date()-startTime}ms`);
    setTimeout(update, REFRESH_RATE);
}

function leaderboardString(data) {
    let str = `Last updated at ${Tools.dateStr(new Date())}\n`;
    const table = [ ['Username', 'Account Value'] ];
    for(const trader of data.traders) table.push([trader.username, Price.format(trader.accountValue)]);
    str += '```\n' + createTable(table) + '```\n';
    return str;
}

async function run() {
    await discordClient.login(process.env['BOT_TOKEN']);
    console.log(`${discordClient.user.tag} is logged in`);
    const channel = await discordClient.channels.fetch(process.env['CHANNEL_ID']);
    message = await channel.messages.fetch(process.env['MESSAGE_ID']);
    setTimeout(update, 0);
}
run();