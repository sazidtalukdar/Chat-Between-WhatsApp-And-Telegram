require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Telegraf } = require('telegraf');
const { MessagingResponse } = require('twilio').twiml;

const index = express();

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

const bot = new Telegraf(telegramBotToken);

function forwardToTelegram(message) {
    bot.telegram.sendMessage(chatId, message);
}

function forwardToWhatsapp(message) {
    const twilioClient = require('twilio')(twilioAccountSid, twilioAuthToken);

    twilioClient.messages.create({
        from: `whatsapp:${twilioPhoneNumber}`,
        to: 'whatsapp:+8801709526615',
        body: message,
    }).then(message => console.log(`WhatsApp message sent: ${message.sid}`))
        .catch(error => console.error(`Error sending WhatsApp message: ${error.message}`));
}

function forwardMediaToWhatsapp(mediaUrl) {
    const twilioClient = require('twilio')(twilioAccountSid, twilioAuthToken);

    twilioClient.messages.create({
        from: `whatsapp:${twilioPhoneNumber}`,
        to: 'whatsapp:+8801709526615',
        mediaUrl: [mediaUrl],
    }).then(message => console.log(`WhatsApp media message sent: ${message.sid}`))
        .catch(error => console.error(`Error sending WhatsApp media message: ${error.message}`));
}

index.use(bodyParser.urlencoded({ extended: false }));

index.post('/webhook', (req, res) => {
    console.log('Incoming Twilio request:', req.body);

    const incomingMsg = req.body.Body.toLowerCase();
    const mediaUrl = req.body.MediaUrl0; // Twilio sends media URLs as MediaUrl0, MediaUrl1, ...

    forwardToTelegram(incomingMsg);

    if (mediaUrl) {
        forwardMediaToWhatsapp(mediaUrl);
    } else {
        forwardToWhatsapp(incomingMsg);
    }

    const resp = new MessagingResponse();
    resp.message("Message received! Created By Sajid Talukdar.");
    res.send(resp.toString());
});

bot.start((ctx) => ctx.reply('Welcome!'));
bot.on('text', (ctx) => {
    const message = ctx.message.text;
    forwardToWhatsapp(message);
});

bot.launch();

const port = process.env.PORT || 5000;
index.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
