const { Telegraf } = require('telegraf')
const https = require('https');
const fs = require('fs');

// const sticker = fs.readFileSync('./static/welcome.tgs');
const KEY = '3564835a8d9a1e1e1b67';
const api = 'https://free.currconv.com/api/v7/convert?q=';
const LOGCHAT = '-590390872';

const sendMsgWithLog = (ctx, msg, isStart, isFailed) => {
    console.log(ctx.message.chat);

  if (isStart) {
    ctx.reply(`Hello. I’m a bot and I will help you to easily convert currencies.`);
    ctx.reply(`For example type me '10.7 usd to rub'\n or something like this syntax.`);

    // ctx.telegram.sendPhoto(ctx.message.chat.id, sticker);
    fs.readFile('./logs/log.txt', 'utf8', function(err, data){ 
      fs.writeFileSync('./logs/log.txt', `${data}, ${ctx.message.chat.id}: ${ctx.message.chat.first_name} ${ctx.message.chat.username}`);
    }); 
  } else {
    ctx.reply(msg);
    ctx.telegram.sendMessage(LOGCHAT, `${msg} ====> ${ctx.message.chat.first_name} ${ctx.message.chat.username}`);
    if (isFailed) {
      ctx.telegram.sendMessage(LOGCHAT, `Failed ==== >${ctx.message.text} ====> ${ctx.message.chat.first_name} ${ctx.message.chat.username}`);
    }
  }
}

const bot = new Telegraf('1560085394:AAFR7qg4IHvelmPP_9DuOBG9njJrxcdvsUQ')
bot.start((ctx) => sendMsgWithLog(ctx, 'Welcome', true));
bot.help((ctx) => sendMsgWithLog(ctx,
  `Currency Converter BOT. \nPlease send me like that syntax\n
  'amd to usd' or '10.8 eur to amd'.`));

bot.command('quit', (ctx) => {
  // Explicit usage
  ctx.telegram.leaveChat(ctx.message.chat.id)

  // Using context shortcut
  ctx.leaveChat()
})

bot.on('text', (ctx) => {
  const msg = ctx.message.text.replaceAll(',', '.');

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
                sendMsgWithLog(ctx,`${convertedMsg} is ${new Intl.NumberFormat().format(calc)}`);
              } else {
                sendMsgWithLog(ctx,`Please write correct currency or keep syntax. /\help`, false, true);
              }
            });
          });
        } catch {
          sendMsgWithLog(ctx,`Something went wrong. /\help`);
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
                sendMsgWithLog(ctx,`${convertedMsg} is ${new Intl.NumberFormat().format(value)}`);
              } else {
                sendMsgWithLog(ctx,`Please write correct currency or keep syntax. /\help`, false, true);
              }
            });
          });
        } catch {
          sendMsgWithLog(ctx,`Something went wrong. /\help`, false, true);
        }
        break;
      default:
        sendMsgWithLog(ctx,`Please write a correctly. If you need a help /\help`, false, true);
        break;
    }
  }
});

bot.launch()
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))