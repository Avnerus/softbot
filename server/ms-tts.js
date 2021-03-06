import fetch from 'node-fetch'
import xmlbuilder from 'xmlbuilder'

const TARGET_VOICES = {
    "fi" : "Microsoft Server Speech Text to Speech Voice (fi-FI, HeidiRUS)",
    "he": "Microsoft Server Speech Text to Speech Voice (he-IL, Asaf)",
    "ja" : "Microsoft Server Speech Text to Speech Voice (ja-JP, Ayumi, Apollo)",
    //"en" : "Microsoft Server Speech Text to Speech Voice (en-US, GuyNeural)",
    "en" : "Microsoft Server Speech Text to Speech Voice (en-US, Jessa24kRUS)",
    "ar" : "Microsoft Server Speech Text to Speech Voice (ar-EG, Hoda)",
    "ru": "Microsoft Server Speech Text to Speech Voice (ru-RU, Irina, Apollo)",
    "it": "Microsoft Server Speech Text to Speech Voice (it-IT, LuciaRUS)",
    "es": "Microsoft Server Speech Text to Speech Voice (es-ES, Laura, Apollo)``",
    "fr": "Microsoft Server Speech Text to Speech Voice (fr-FR, Julie, Apollo)",
    "de": "Microsoft Server Speech Text to Speech Voice (de-DE, Hedda)",
    "ca": "Microsoft Server Speech Text to Speech Voice (ca-ES, HerenaRUS)",
    "sv": "Microsoft Server Speech Text to Speech Voice (sv-SE, HedvigRUS)",
    "es-MX": "Microsoft Server Speech Text to Speech Voice (es-MX, HildaRUS)",
    "tr" : "Microsoft Server Speech Text to Speech Voice (tr-TR, SedaRUS)"
}

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

export async function getSpeech(text, target = 'en') {

    let token = await getAccessToken(process.env['MS_KEY']);

    console.log("Token: ", token);
    console.log("Speaking", TARGET_VOICES[target]);

    let xmlBody = xmlbuilder.create('speak')
        .att('version', '1.0')
        .att('xml:lang', 'en-us')
        .ele('voice')
        .att('xml:lang', 'en-us')
        .att('name', TARGET_VOICES[target])
      // .att('name', 'Microsoft Server Speech Text to Speech Voice (fi-FI, HeidiRUS)')
     //   .att('name', 'Microsoft Server Speech Text to Speech Voice (he-IL, Asaf)')
    //    .ele('prosody')
     //   .att('pitch', 'high')
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
    .then(res => ({headers: res.headers, bodyStream: res.body}))
}
