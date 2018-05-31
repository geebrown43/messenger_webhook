const express = require("express");
const bodyParser = require("body-parser");
const app = express().use(bodyParser.json());

app.post("/webhook", (req, res) => {
  let body = req.body;
  if (body.object === "page") {
    body.entry.forEach(element => {
      let webhook = element.messaging[0];
      console.log(webhook);
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

app.listen(process.env.PORT || 3000, () => console.log("webhook listening"));
