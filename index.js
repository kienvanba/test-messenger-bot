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

app.post('/webhook', (req, res) => {
    let body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(entry => {
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            let sender_psid = webhook_event.sender.id;
            showAction(sender_id, 'mark_seen');
            sendResponse(sender_psid, {text: "i'm a hacker"});
            showAction(sender_psid, 'typing_on');
            requestUserInfo(sender_psid, user => {
                showAction(sender_psid, 'typing_off');
                let response = {};
                var payload = {};
                payload['template_type'] = "generic";
                payload['elements'] = [{
                    title: user.name,
                    image_url: user.profile_pic,
                    subtitle: 'this account is now hacked',
                    buttons: []
                }];
                var attachment = {};
                attachment['type'] = "template";
                attachment['payload'] = payload;
                response['attachment'] = attachment;
                sendResponse(sender_psid, response);
            });
            // console.log(`received message from ${sender_psid}`);
            // if (webhook_event.message) {
            //     handleMessage(sender_psid, webhook_event.message);
            // }
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

function handleMessage(sender_psid, received_message) {
    let response;

    if (received_message.text) {
        response = {
            text: `you sent "${received_message.text}".\nBOT reply "hello"`,
        }
    }

    sendResponse(sender_psid, response);
}

function sendResponse(sender_psid, response) {
    let requestBody = {
        "recipient": {
            "id": sender_psid,
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

function requestUserInfo(sender_psid, callback) {
    request({
        "uri": `https://graph.facebook.com/${sender_psid}`,
        "qs": { "fields": "id, name, first_name, last_name, profile_pic", "access_token": PAGE_ACCESS_TOKEN},
        "method": "GET"
    }, (err, res, body) => {
        if (!err) {
            callback(body);
        } else {
            console.log(`request user info fail: ${err}`);
        }
    });
}

function showAction(sender_psid, action) {
    let requestBody = {
        "recipient": {
            "id": sender_psid,
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