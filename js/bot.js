const { Telegraf } = require('telegraf')
const https = require('https');

const KEY = '3564835a8d9a1e1e1b67';
const api = 'https://free.currconv.com/api/v7/convert?q=';
// "+ upper +"&compact=ultra&apiKey="+config.KEY

const bot = new Telegraf('1560085394:AAFR7qg4IHvelmPP_9DuOBG9njJrxcdvsUQ')
bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply(
  `Currency Converter BOT. \nPlease send me like that syntax\n
  'amd to usd' or '1000 amd to usd'.`))

bot.command('quit', (ctx) => {
  // Explicit usage
  ctx.telegram.leaveChat(ctx.message.chat.id)

  // Using context shortcut
  ctx.leaveChat()
})

bot.on('text', (ctx) => {
  const msg = ctx.message.text;

  if (typeof msg === 'string') {
    const convertedMsg = msg.replace(/\s\s+/g, ' ');
    const splittedMsg = convertedMsg.split(' ');
    switch (splittedMsg.length) {
      case 4:
        try {
          const exchenged = `${splittedMsg[1].toLocaleUpperCase()}_${splittedMsg[3].toLocaleUpperCase()}`;

          https.get(`${api}${splittedMsg[1].toLocaleUpperCase()}_${splittedMsg[3].toLocaleUpperCase()}&compact=ultra&apiKey=${KEY}`,resp => {
            let data = '';

            // A chunk of data has been received.
            resp.on('data', (chunk) => {
              data += chunk;
            });

            resp.on('end', () => {
              const value = JSON.parse(data)[exchenged];
              if (value) {
                const calc = (value * Number(splittedMsg[0]));
                ctx.reply(`${convertedMsg} is ${new Intl.NumberFormat().format(calc)}`);
              } else {
                ctx.reply(`Please write correct currency or keep syntax. /\help`);
              }
            });
          });
        } catch {
          ctx.reply(`Something went wrong. /\help`);
        }
        break;
      case 3:
        try {
          const exchenged = `${splittedMsg[0].toLocaleUpperCase()}_${splittedMsg[2].toLocaleUpperCase()}`;

          https.get(`${api}${exchenged}&compact=ultra&apiKey=${KEY}`,resp => {
            let data = '';

            // A chunk of data has been received.
            resp.on('data', (chunk) => {
              data += chunk;
            });

            resp.on('end', () => {
              const value = JSON.parse(data)[exchenged];
              if (value) {
                ctx.reply(`${convertedMsg} is ${new Intl.NumberFormat().format(value)}`);
              } else {
                ctx.reply(`Please write correct currency or keep syntax. /\help`);
              }
            });
          });
        } catch {
          ctx.reply(`Something went wrong. /\help`);
        }
        break;
      default:
        ctx.reply(`Please write a correctly. If you need a help /\help `);
        break;
    }
  }
});

bot.launch()
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))