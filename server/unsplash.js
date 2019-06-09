import fetch from 'node-fetch'
import tmp from 'tmp'
import fs from 'fs'
import EventEmitter from 'events';

const keys = {};
const emitter = new EventEmitter();

export async function getRandomImage(key, search) {

    return Promise.resolve()
    .then(() => {
        if (keys[key]) { 
            return keys[key]
        } else {
            console.log("Downloading " + key + "....");
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

            let options = {
                method: 'GET',
            }
            return fetch(
                'https://source.unsplash.com/random?' + search,
                options
            )
            .then((res) => {
                const {headers, body} = res;
                cache.headers = headers;
                const stream = fs.createWriteStream(cache.file.name, {fd: cache.file.fd})
                res.body.pipe(stream);
                stream.on('finish', () => {
                    console.log("Finished downloading " + key + "(" + search + ") to " + cache.file.name);
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
