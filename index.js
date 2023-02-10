import * as dotenv from 'dotenv';
dotenv.config();
import fetch from 'node-fetch';
import { Configuration, OpenAIApi } from 'openai';
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
let twarray = []

async function at(twadres, twlink, twid) {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Extract lat lng in number format from the address in this text and write the address in detail:\n\n${twadres}\n\nAdress: \n`,
        temperature: 0,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    var detaylıadres = response.data.choices[0].text.split('Latitude')[0].replace(/\n/g, '')
    var lat = response.data.choices[0].text.split('Latitude')[1].split('Latitude')
    if (lat.length == 1) lat = response.data.choices[0].text.split('Latitude')[1].split(',')
    var latitude = parseFloat(lat[0].match(/\d+\.\d+/)[0]);
    var longitude = parseFloat(lat[1].match(/\d+\.\d+/)[0]);
    if (twarray.includes(twid)) return;
    twarray.push(twid)
    fetch(process.env.WEBHOOKURL, {
        "method": "POST",
        "headers": { "Content-Type": "application/json" },
        "body": JSON.stringify({
            "content": 'Detaylı adres: ' + detaylıadres + '\nAdrese göre google maps: <https://www.google.com/maps?q=' + encodeURIComponent(detaylıadres) + '>' + '\nKordinat google maps: <https://maps.google.com/?q=' + latitude + ',' + longitude + '&z=8' + '>' + '\nTwitter linki: <' + twlink + '>'
        })

    })
}

async function tw() {
    console.log('başladım')
    let data = await fetch(`https://stream.epctex.com/api/latest?city=all`)
        .then(res => res.json())

    for (let item of data.data) {
        await at(item.full_text, 'https://twitter.com/' + item.user.screen_name + '/status/' + item.id_str, item.id_str)
        await delay(2000);
    }
}

function delay(t) {
    return new Promise(resolve => setTimeout(resolve, t));
}

tw()
