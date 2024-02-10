const express = require('express');
const bodyParser = require('body-parser');
const { Telegraf } = require('telegraf');
const { MessagingResponse } = require('twilio').twiml;

const index = express();

const telegramBotToken = '6758603953:AAHDIGMJew8CkyioteQgHdr9VHf_s19DICw';
const chatId = '-4119571699';
const twilioAccountSid = 'AC212f896398d9776bfabd71ada09d2912';
const twilioAuthToken = '5a48cd9523db9a30f7864f4c5deca28c';
const twilioPhoneNumber = '+14155238886';

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
        mediaUrl: mediaUrl,
    }).then(message => console.log(`WhatsApp media message sent: ${message.sid}`))
        .catch(error => console.error(`Error sending WhatsApp media message: ${error.message}`));
}

index.use(bodyParser.urlencoded({ extended: false }));

index.post('/webhook', (req, res) => {
    console.log('Incoming Twilio request:', req.body);

    const incomingMsg = req.body.Body.toLowerCase();
    const mediaUrl = req.body.MediaUrl;

    forwardToTelegram(incomingMsg);

    if (mediaUrl) {
        // Handle media messages
        forwardMediaToWhatsapp(mediaUrl);
    } else {
        // Handle text messages
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

const port = 5000;
index.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
