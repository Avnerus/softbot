import fetch from 'node-fetch'
import tmp from 'tmp'
import fs from 'fs'
import EventEmitter from 'events';

const keys = {};
const emitter = new EventEmitter();
let LAST_SEED = "";

const KEYWORDS = [
    "animal",
    "person",
    "culture",
    "fashion",
    "game",
    "war",
    "love",
    "toy",
    "robot",
    "music",
    "food",
    "house",
    "family",
    "nature",
    "farm",
    "technology",
    "money",
    "politics",
    "religion",
    "love",
    "business",
    "school"
]

export async function getRandomImage(seed, id) {
    const key = seed + "-" + id;
    return Promise.resolve()
    .then(() => {
        if (seed != LAST_SEED) {
            ["-1", "-2"].forEach((suffix) => {
                if (keys[LAST_SEED + suffix]) {
                    console.log("Deleting " + keys[LAST_SEED + suffix].file.name)
                     fs.unlinkSync(keys[LAST_SEED + suffix].file.name);
                }
            })
            LAST_SEED = seed;
        }
        if (keys[key]) { 
            return keys[key]
        } else {
            console.log("Downloading " + key + "....");
            let keyword = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];

            const cache = new Proxy( {
                ready: false,
                file: tmp.fileSync(),
                headers: null
            }, {
                set: (target, prop, val) => {
                    if (prop == 'ready') {
                        emitter.emit('cache-ready-' + key);
                    }
                    target[prop] = val;
                    return true;
                }
            });

            keys[key] = cache;

            return randomUnsplashApi(keyword)
            .then((url) => {
                console.log("URL: ", url);
                const options = {
                    method: 'GET',
                }
                return fetch(
                    url,
                    options
                )
            })
            .then((res) => {
                const {headers, body} = res;
                cache.headers = headers;
                const stream = fs.createWriteStream(cache.file.name, {fd: cache.file.fd})
                res.body.pipe(stream);
                stream.on('finish', () => {
                    console.log("Finished downloading " + key + " to " + cache.file.name);
                    cache.ready = true;
                })
                return cache;
            })
        }
    })
    .then((cacheEntry) => {
        if (cacheEntry.ready) {
            return cacheEntry;
        } else {
            console.log("Waiting..")
            return new Promise((resolve, reject) => {
                emitter.on('cache-ready-' + key, () => {
                    console.log("Ready!");
                    resolve(cacheEntry);
                })
            })
        }
    })
    .then((cache) => {
        console.log("Returning!");
        const stream = fs.createReadStream(cache.file.name)
        return {headers: cache.headers, bodyStream: stream}
    })
}

function randomUnsplashSource(keyword) {
    const url = 'https://source.unsplash.com/random?' + keyword;
    return Promise.resolve(url);
}

function randomUnsplashApi(keyword) {
   console.log("Getting random photo from unsplash api")
   const url = "https://api.unsplash.com/photos/random?query=" + keyword + "&client_id=" + process.env['UNSPLASH_KEY'];
   const options = {
        method: 'GET',
   }
   return fetch(url,options)
  .then(res => res.json())
  .then(data => {
      return data.urls.regular;
  })
}
