import telebot
import config
import requests

from telebot import types

bot = telebot.TeleBot(config.TOKEN)
 
@bot.message_handler(commands=['start'])
def welcome(message):
    sti = open('static/welcome.tgs', 'rb')
    bot.send_sticker(message.chat.id, sti)
 
    bot.send_message(message.chat.id, "Hi, {0.first_name}!\n -I am Bott, and my task is to give you an answer,\n how much will your currency be compared to the one dollar <b>{1.first_name}</b>, Author - @HaykMan.".format(message.from_user, bot.get_me()),
        parse_mode='html')
 
@bot.message_handler(content_types=['text'])
def lalala(message):
    if message.chat.type == 'private':
        upper = "USD_" + message.text.upper()
        response = requests.get("https://free.currconv.com/api/v7/convert?q="+ upper +"&compact=ultra&apiKey="+config.KEY)
        print(response.json())
        if len(response.json()):
            price = round(response.json()[upper], 2)
            bot.send_message(message.chat.id, "1 USD is equal => " + str(price) + ".")
        else:
            bot.send_message(message.chat.id, "Invalid ccurrency please type correctly.")
 
# RUN
bot.polling(none_stop=True)