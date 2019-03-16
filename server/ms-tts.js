import fetch from 'node-fetch'
import xmlbuilder from 'xmlbuilder'

function getAccessToken(subscriptionKey) {
    let options = {
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': subscriptionKey
        }
    }

    return fetch(
        'https://northeurope.api.cognitive.microsoft.com/sts/v1.0/issueToken',
        options
    ).then(res => res.text())
}

export async function getSpeech(text) {

    console.log("Key: " + process.env['MS_KEY']);
    console.log("Text", text);
    let token = await getAccessToken(process.env['MS_KEY']);

    console.log("Token: ", token);

    let xmlBody = xmlbuilder.create('speak')
        .att('version', '1.0')
        .att('xml:lang', 'en-us')
        .ele('voice')
        .att('xml:lang', 'en-us')
    //.att('name', 'Microsoft Server Speech Text to Speech Voice (en-US, Guy24KRUS)')
    //  .att('name', 'Microsoft Server Speech Text to Speech Voice (fi-FI, HeidiRUS)')
        .att('name', 'Microsoft Server Speech Text to Speech Voice (he-IL, Asaf)')
        .ele('prosody')
        .att('pitch', 'high')
        .txt(text)
        .end();

    let body = xmlBody.toString();
    console.log("XMLBody:", body);

    let options = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'cache-control': 'no-cache',
            'User-Agent': 'softrbot-speech',
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
            'Content-Type': 'application/ssml+xml'
        },
        body: body
    }
    return fetch(
        'https://northeurope.tts.speech.microsoft.com/cognitiveservices/v1',
        options
    )
    .then((res) => res.body)
}
