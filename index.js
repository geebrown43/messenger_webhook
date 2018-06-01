const express = require("express");
const bodyParser = require("body-parser");
const app = express().use(bodyParser.json());
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN
const request = require('request')
app.post("/webhook", (req, res) => {
  let body = req.body;
  if (body.object === "page") {
    body.entry.forEach(element => {
      let webhook = element.messaging[0];
      console.log(webhook);
      let sender_psid = webhook.sender.id
      console.log('Sender PSID: ' + sender_psid)
      if(webhook.message){
        handleMessage(sender_psid, webhook.message)
      } else if(webhook.postback){
        handlePostback(sender_psid, webhook.postback)
      }
    });
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

app.get("/webhook", (req, res) => {
  let verify = "INSPIRE";
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  if (mode && token) {
    mode === "subscribe" && token === verify
      ? res.status(200).send(challenge)
      : res.sendStatus(403);
  }
});

// Handles messages events
function handleMessage(sender_psid, received_message) {
  let response;

  if(received_message.text){
    response = {
      "text": `hey this worked successfully you sent the message${received_message.text}`
    }
  }
  callSendAPI(sender_psid, response)
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {

}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  })
}

app.listen(process.env.PORT || 3000, () => console.log("webhook listening"));
