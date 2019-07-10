const 
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express().use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const request = require('request');

app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

app.get('', (req, res) => {
    res.status(200).send('Welcome to Kien\'s messenger bot test server');
});

app.post('/webhook', (req, res) => {
    let body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(entry => {
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            // let sender_id = webhook_event.sender.id;
            // showAction('mark_seen');
            // requestUserInfo(sender_id, user => {
            //     console.log(user);
            // });
            // sendResponse(sender_id, {text: "hello!"});
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

app.get('/webhook', (req, res) => {
    let VERIFY_TOKEN = "TEST_MESSENGER_BOT";

    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

sendResponse = (sender_id, response) => {
    let requestBody = {
        "recipient": {
            "id": sender_id,
        },
        "message": response
    }

    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": requestBody
    }, (err, res, body) => {
        if (!err) {
            console.log('response to user success');
        } else {
            console.log(`response to user fail: ${err}`);
        }
    });
}

requestUserInfo = (sender_id, callback) => {
    request({
        "uri": `https://graph.facebook.com/${sender_id}`,
        "qs": { "fields": "id, name, first_name, last_name, profile_pic"},
        "method": "GET"
    }, (err, res, body) => {
        if (!err) {
            callback(body);
        } else {
            console.log(`request user info fail: ${err}`);
        }
    });
}

showAction = (action) => {
    let requestBody = {
        "recipient": {
            "id": sender_id,
        },
        "sender_action": action
    }

    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": requestBody
    }, (err, res, body) => {
        if (!err) {
            console.log('response to user success');
        } else {
            console.log(`response to user fail: ${err}`);
        }
    });
}