const express = require("express"),
  bodyParser = require("body-parser"),
  app = express().use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const request = require("request");

app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

app.get("", (req, res) => {
  res.status(200).send("Welcome to Kien's messenger bot test server");
});

app.get("/webhook", (req, res) => {
  let VERIFY_TOKEN = "TEST_MESSENGER_BOT";

  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

app.post("/webhook", (req, res) => {
  let body = req.body;

  if (body.object === "page") {
    body.entry.forEach((entry) => {
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      let sender_psid = webhook_event.sender.id;
      if (webhook_event.message.text) {
        showAction(sender_psid, "mark_seen");
        sendResponse(sender_psid, { text: "i'm a hacker" });
        showAction(sender_psid, "typing_on");
        requestUserInfo(sender_psid, (user) => {
          user = JSON.parse(user);
          showAction(sender_psid, "typing_off");
          let user_template = {
            title: user.name,
            image_url: user["profile_pic"],
            subtitle: "this account is now hacked",
            buttons: [
              {
                type: "postback",
                title: "button",
                payload: "TEST",
              },
              {
                type: "postback",
                title: "button2",
                payload: "TEST2",
              },
            ],
          };
          let response = {
            attachment: {
              type: "template",
              payload: {
                template_type: "generic",
                elements: [user_template],
              },
            },
          };
          console.log(user);
          console.log(user.name);
          console.log(response.attachment.type);
          console.log(response);
          sendResponse(sender_psid, response);
        });
        handleMessage(sender_psid, webhook_event.message);
      }
      console.log(webhook_event);
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

function handleMessage(sender_psid, received_message) {
  let response;

  if (received_message.text) {
    response = {
      text: `you sent "${received_message.text}".\nBOT reply "hello"`,
    };
  }

  sendResponse(sender_psid, response);
}

function sendResponse(sender_psid, response) {
  let requestBody = {
    recipient: {
      id: sender_psid,
    },
    message: response,
  };

  request(
    {
      uri: "https://graph.facebook.com/v2.6/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: requestBody,
    },
    (err, res, body) => {
      if (!err) {
        console.log("response to user success");
      } else {
        console.log(`response to user fail: ${err}`);
      }
    }
  );
}

function requestUserInfo(sender_psid, callback) {
  request(
    {
      uri: `https://graph.facebook.com/${sender_psid}`,
      qs: {
        fields: "id, name, first_name, last_name, profile_pic",
        access_token: PAGE_ACCESS_TOKEN,
      },
      method: "GET",
    },
    (err, res, body) => {
      if (!err) {
        callback(body);
      } else {
        console.log(`request user info fail: ${err}`);
      }
    }
  );
}

function showAction(sender_psid, action) {
  let requestBody = {
    recipient: {
      id: sender_psid,
    },
    sender_action: action,
  };

  request(
    {
      uri: "https://graph.facebook.com/v2.6/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: requestBody,
    },
    (err, res, body) => {
      if (!err) {
        console.log("response to user success");
      } else {
        console.log(`response to user fail: ${err}`);
      }
    }
  );
}

// TELEGRAM
const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.TELEGRA_ACCESS_TOKEN);
console.log("create bot");
bot.command("buy", (ctx) => ctx.reply("buy buy"));
bot.command("sell", (ctx) => {
  console.log(ctx);
  ctx.reply(JSON.stringify(ctx));
});
bot.launch();
console.log("bot created");

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
