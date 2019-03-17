import {Translate} from '@google-cloud/translate'

const projectId = 'marrow-dev';

export function translate(text, target) {
    console.log("Translating " + text + " to " + target )
    // Instantiates a client
    const translate = new Translate({
      projectId: projectId,
    });

    return translate
    .translate(text, target)
    .then(results => results[0])
}
