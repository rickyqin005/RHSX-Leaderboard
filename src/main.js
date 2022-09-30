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
    const timerLabel = Tools.dateStr(new Date());
    console.time(timerLabel);
    try {
        await message.edit(leaderboardString((await axios.get(URL)).data));
    } catch(error) {
        console.log(error);
    }
    console.timeEnd(timerLabel);
    setTimeout(update, REFRESH_RATE);
}

function leaderboardString(data) {
    let str = `Last updated ${Tools.dateStr(new Date())}\n`;
    const table = [ ['Rank', 'Username', 'Acct Value'] ];
    const align = ['l', 'l', 'r'];
    for(const ticker of data.tickers) {
        table[0].push(ticker.id);
        align.push('r');
    }
    for(const trader of data.traders) {
        const row = [`${trader.rank}.`, trader.username.substring(0, trader.username.length-5), Price.format(trader.accountValue)];
        for(const ticker of data.tickers) {
            const position = trader.positions.find(pos => pos.ticker == ticker.id);
            row.push((position != undefined) ? position.quantity : '');
        }
        table.push(row);
    }
    str += '```\n' + createTable(table, { align: align }) + '```\n';
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