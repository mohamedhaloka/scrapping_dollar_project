const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('qs');
const app = express();

const port = 8000;
var oldDollarValue = '';

let httpServer = app.listen(port, () => console.log(`Server listening on ` + port))
const { Server } = require("socket.io");

var io = new Server(httpServer);
global.io = io
io.on('connection', socket => {
    console.log("connected");
    socket.on('disconnect', () => { });
    socket.on('dollar-value', (data) => {
        console.log(data)
    });
});

app.get('/', (req, res) => res.send('Hello World!'))

console.log(Date())
//5*60*1000 = 300K milliseconds
setInterval(getDollarValue, 300000);

async function getDollarValue() {
    try {
        const response = await axios.get("https://sa.investing.com/currencies/usd-egp");
        const $ = cheerio.load(response.data);

        const divStr = $("div > div > div > div > div > div").find(".flex.gap-6").text()

        var dollarValue = extractNumbersFromString(divStr)[0];
        console.log('Dollar Value ' + dollarValue);


        if (oldDollarValue > dollarValue) {
            console.log("decreasing")
        } else if (oldDollarValue < dollarValue) {
            console.log("increasing")
        }

        global.io.emit('dollar-value', { 'dollarValue': dollarValue });
        console.log(Date())

        // postNotification(dollarValue)
        oldDollarValue = dollarValue
    }
    catch (e) {
        console.error(e)
    }
}


function extractNumbersFromString(inputString) {
    var regex = /-?\d+(\.\d+)?/g;

    var numbersArray = inputString.match(regex);

    if (numbersArray !== null) {
        return numbersArray.map(function (number) {
            return parseFloat(number);
        });
    } else {
        return [0];
    }
}


async function postNotification(dollarValue) {
    try {
        const serverToken = "AAAAVLJ09T0:APA91bHuBoYiVWTlCyKFIdBachIwzu9fEHdZiFE1BmJAseKJyHBGBzHJ5KS3rNVzd_EkpNCt0jepyvLoE51GjcfHLxei5H9imU463YaYrrWHQrAh-knlAw7g0gP5WXrYWG7OIIQ8PJfZ";
        const data = {
            'notification': {
                "title": "تغيير جديد",
                "body": "في سعر الدولار" + dollarValue,
            },
            'priority': 'high',
            'data': {
                'click_action': 'FLUTTER_NOTIFICATION_CLICK',
                'id': '1',
                'status': 'done'
            },
            'to': '/topics/test',

        };
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'key=' + serverToken
            },
            data: qs.stringify(data),
            url: "https://fcm.googleapis.com/fcm/send"
        };

        await axios(options);

    }
    catch (e) {
        console.error(e)
    }
}