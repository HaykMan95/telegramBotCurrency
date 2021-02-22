const { Telegraf } = require('telegraf')
const https = require('https');
const fs = require('fs');

// const sticker = fs.readFileSync('./static/welcome.tgs');
const KEY = '3564835a8d9a1e1e1b67';
const api = 'https://free.currconv.com/api/v7/convert?q=';
const LOGCHAT = '-590390872';

const sendMsgWithLog = (ctx, msg, isStart, isFailed) => {
  if (isStart) {
    // ctx.replyWithSticker('123123jkbhj6b');
    ctx.reply(`Բարև, ես բոտ եմ և քեզ կօգնեմ հեշտությամբ հաշվել տարադրամի փոխարժեքները։\nՊարզապես ուղարկիր տեքստը հետևյալ ֆորմատով.\n '10.7 usd to amd'`);

    // ctx.telegram.sendPhoto(ctx.message.chat.id, sticker);
    fs.readFile('./logs/log.txt', 'utf8', function(err, data){ 
      fs.writeFileSync('./logs/log.txt', `${data}, ${ctx.message.chat.id}: ${ctx.message.chat.first_name} ${ctx.message.chat.username}`);
    }); 
  } else {
    ctx.reply(msg);
    ctx.telegram.sendMessage(LOGCHAT, `${msg} ====> ${ctx.message.chat.first_name} | @${ctx.message.chat.username}`);
    if (isFailed) {
      ctx.telegram.sendMessage(LOGCHAT, `Failed ==== >${ctx.message.text} ====> ${ctx.message.chat.first_name} | @${ctx.message.chat.username}`);
    }
  }
}

const bot = new Telegraf('1560085394:AAFR7qg4IHvelmPP_9DuOBG9njJrxcdvsUQ')
bot.start((ctx) => sendMsgWithLog(ctx, 'Welcome', true));
bot.help((ctx) => sendMsgWithLog(ctx,
  `Խնդրում եմ՝ ուղարկել տեքստը հետևյալ ֆորմատով.\n'amd to usd' կամ '100 eur to amd'.`));

bot.command('quit', (ctx) => {
  // Explicit usage
  ctx.telegram.leaveChat(ctx.message.chat.id)

  // Using context shortcut
  ctx.leaveChat()
})

bot.on('text', (ctx) => {
  const msg = ctx.message.text && ctx.message.text.replace(',', '.');

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
                sendMsgWithLog(ctx,`Խնդրում եմ ուղարկել ճիշտ ֆորմատով, օգնության համար /\help`, false, true);
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
                sendMsgWithLog(ctx,`Խնդրում եմ ուղարկել ճիշտ ֆորմատով, օգնության համար /\help`, false, true);
              }
            });
          });
        } catch {
          sendMsgWithLog(ctx,`Something went wrong. /\help`, false, true);
        }
        break;
      default:
        sendMsgWithLog(ctx,`Խնդրում եմ ուղարկել ճիշտ ֆորմատով, օգնության համար /\help`, false, true);
        break;
    }
  }
});

bot.launch()
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))