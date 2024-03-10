const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { database } = require('./firebase');
const { collection, doc, setDoc, getDoc, updateDoc } = require("firebase/firestore");
const admin = require('firebase-admin');

//30*1000 = 300K milliseconds
//15×60×1000 
setInterval(processGoldValuesEGP, 900000);

let oldGold21Price = '';


async function processGoldValuesEGP() {
    try {
        const response = await axios.get("https://market.isagha.com/products/2153");
        const $ = cheerio.load(response.data);

        const divStr = $("div > div > table > tbody > tr > td").text()

        let gold21Value = (extractNumbersFromString(divStr)[0]).toString();

        var regex = /^\d+(\.\d+)?$/;

        var strIsAValidNumber = gold21Value.match(regex);

        if (!strIsAValidNumber) return;

        if (gold21Value == '0' || gold21Value.trim() == '') return;

        let gold24Value = parseInt(parseFloat(gold21Value) * (24 / 21)).toString();
        let gold18Value = parseInt(parseFloat(gold21Value) * (18 / 21)).toString();

        console.log('Gold 18 ' + gold18Value);
        console.log('Gold 21 ' + gold21Value);
        console.log('Gold 24 ' + gold24Value);

        if (oldGold21Price == gold21Value) return;




        const goldPricesRef = collection(database, "prices");
        const notificationsRef = collection(database, "notifications");

        var myTimestamp = admin.firestore.Timestamp.fromDate(new Date());

        await updateDoc(doc(goldPricesRef, "gold_prices"), {
            gold_prices: {
                karat_18_sell: gold18Value,
                karat_21_sell: gold21Value,
                karat_24_sell: gold24Value,
            },
            date: myTimestamp.toDate(),
        });


        await setDoc(doc(notificationsRef), {
            title: "تم تحديث سعر الذهب عيار 21",
            body: gold21Value,
            created_at: myTimestamp.toDate(),
        });

        postNotification(gold21Value)


        oldGold21Price = gold21Value;
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


async function postNotification(value) {
    try {
        const serverToken = "AAAAVLJ09T0:APA91bHuBoYiVWTlCyKFIdBachIwzu9fEHdZiFE1BmJAseKJyHBGBzHJ5KS3rNVzd_EkpNCt0jepyvLoE51GjcfHLxei5H9imU463YaYrrWHQrAh-knlAw7g0gP5WXrYWG7OIIQ8PJfZ";
        const data = {
            'notification': {
                "title": "تم تحديث سعر الذهب عيار 21",
                "body": value,
            },
            'priority': 'high',
            'data': {
                'click_action': 'FLUTTER_NOTIFICATION_CLICK',
                'status': 'done'
            },
            'to': '/topics/all',

        };
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'key=' + serverToken
            },
            data: data,
            url: "https://fcm.googleapis.com/fcm/send"
        };

        let response = await axios(options);

        console.log(response.data)
    }
    catch (e) {
        console.error(e)
    }
}