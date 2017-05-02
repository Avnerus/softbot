import uuid from 'node-uuid'
import crypto from 'crypto'
import config from './config'

export default class Signaling {
    constructor(io) {
        console.log("Signaling server constructed!")
        this.io = io;
    }
    init() {
        console.log("Signaling server initalized");
        this.io.sockets.on('connection', (client) => {
            this.client = client;
            client.resources = {
                screen: false,
                video: true,
                audio: false
            };

            // pass a message to another id
            client.on('message', (details) => {
                if (!details) return;

                var otherClient = this.io.to(details.to);
                if (!otherClient) return;

                details.from = client.id;
                otherClient.emit('message', details);
            });

            client.on('shareScreen', () => {
                client.resources.screen = true;
            });

            client.on('unshareScreen', (type) => {
                client.resources.screen = false;
                this.removeFeed(client, 'screen');
            });

            client.on('join', (name, cb) => this.join(client, name, cb));

            // we don't want to pass "leave" directly because the
            // event type string of "socket end" gets passed too.
            client.on('disconnect', () => {
                this.removeFeed(client);
            });
            client.on('leave',  () => {
                this.removeFeed(client);
            });
            client.on('create', function (name, cb) {
                if (arguments.length == 2) {
                    cb = (typeof cb == 'function') ? cb : function () {};
                    name = name || uuid();
                } else {
                    cb = name;
                    name = uuid();
                }
                // check if exists
                var room = this.io.nsps['/'].adapter.rooms[name];
                if (room && room.length) {
                    safeCb(cb)('taken');
                } else {
                    this.join(client,name);
                    safeCb(cb)(null, name);
                }
            });

            // support for logging full webrtc traces to stdout
            // useful for large-scale error monitoring
            client.on('trace', function (data) {
                console.log('trace', JSON.stringify(
                [data.type, data.session, data.prefix, data.peer, data.time, data.value]
                ));
            });


            // tell client about stun and turn servers and generate nonces
            client.emit('stunservers', config.stunservers || []);

            // create shared secret nonces for TURN authentication
            // the process is described in draft-uberti-behave-turn-rest
            var credentials = [];
            // allow selectively vending turn credentials based on origin.
            var origin = client.handshake.headers.origin;
            if (!config.turnorigins || config.turnorigins.indexOf(origin) !== -1) {
                config.turnservers.forEach(function (server) {
                    var hmac = crypto.createHmac('sha1', server.secret);
                    // default to 86400 seconds timeout unless specified
                    var username = Math.floor(new Date().getTime() / 1000) + (server.expiry || 86400) + "";
                    hmac.update(username);
                    credentials.push({
                        username: username,
                        credential: hmac.digest('base64'),
                        urls: server.urls || server.url
                    });
                });
            }
            client.emit('turnservers', credentials);

        });
    }
    removeFeed(client, type) {
            if (client.room) {
                this.io.sockets.in(client.room).emit('remove', {
                    id: client.id,
                    type: type
                });
                if (!type) {
                    client.leave(client.room);
                    client.room = undefined;
                }
            }
    }

    join(client, name, cb) {
            // sanity check
            if (typeof name !== 'string') return;
            // check if maximum number of clients reached
            if (config.rooms && config.rooms.maxClients > 0 &&
                clientsInRoom(name) >= config.rooms.maxClients) {
                safeCb(cb)('full');
                return;
            }
            // leave any existing rooms
            this.removeFeed(client);
            safeCb(cb)(null, this.describeRoom(client, name));
            client.join(name);
            client.room = name;
    }

    describeRoom(client,name) {
        var adapter = this.io.nsps['/'].adapter;
        var clients = adapter.rooms[name] ? adapter.rooms[name].sockets : {};
        var result = {
            clients: {}
        };
        console.log("Adapter",adapter);
        Object.keys(clients).forEach(function (id) {
            console.log("Checking ID", id);
            result.clients[id] = adapter.nsp.connected[id].resources;
        });
        return result;
    }

    clientsInRoom(name) {
        return this.io.sockets.clients(name).length;
    }

};

function safeCb(cb) {
    if (typeof cb === 'function') {
        return cb;
    } else {
        return function () {};
    }
}
