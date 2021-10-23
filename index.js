"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = exports.Client = exports.Protocol = exports.Port = exports.Proxy = exports.encode = exports.decode = exports.register = exports.thisClient = void 0;
const stdlib_paper_1 = require("@grakkit/stdlib-paper");
const socket_1 = require("@grakkit/socket");
Object.defineProperty(exports, "Client", { enumerable: true, get: function () { return socket_1.Client; } });
Object.defineProperty(exports, "Server", { enumerable: true, get: function () { return socket_1.Server; } });
function decode(content) {
    let index = 0;
    let string = '';
    let extra1, extra2;
    while (index < content.length) {
        let char = content[index++];
        switch (char >> 4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                string += String.fromCharCode(char);
                break;
            case 12:
            case 13:
                extra1 = content[index++];
                string += String.fromCharCode(((char & 0x1f) << 6) | (extra1 & 0x3f));
                break;
            case 14:
                extra1 = content[index++];
                extra2 = content[index++];
                string += String.fromCharCode(((char & 0x0f) << 12) | ((extra1 & 0x3f) << 6) | ((extra2 & 0x3f) << 0));
                break;
        }
    }
    return string;
}
exports.decode = decode;
function encode(content) {
    let index = 0;
    const array = new Uint8Array(content.length);
    while (index < content.length) {
        array[index] = content.charCodeAt(index++);
    }
    return array;
}
exports.encode = encode;
//@ts-expect-error
const Driver = (0, stdlib_paper_1.type)('com.mysql.cj.jdbc.Driver');
//@ts-expect-error
const sql = (0, stdlib_paper_1.type)('me.vagdedes.mysql.database.MySQL');
//@ts-expect-error
sql.connect();
const query = {
    getFriends(friender, friendee) {
        //@ts-expect-error
        sql.query(`select * from users AS \`friend\` join friendships on friender_id = friend.id where friendee_id = ${friender} and aceppted_at is null and blocked_at is null`);
    }
};
let Proxy;
exports.Proxy = Proxy;
let Port;
exports.Port = Port;
let NodeType;
const UUID = (0, stdlib_paper_1.type)('java.util.UUID');
const thisClient = new socket_1.Client();
exports.thisClient = thisClient;
function register(type, port) {
    exports.Port = Port = port;
    NodeType = type;
    switch (type) {
        case 'server': {
            exports.Proxy = Proxy = new socket_1.Server();
            Proxy.start(port);
            try {
                thisClient.connect(port);
            }
            catch (e) {
                console.error(e);
            }
            break;
        }
        case 'client': {
            try {
                thisClient.connect(port);
            }
            catch (e) {
                console.error(e);
            }
            break;
        }
    }
    /* Register Proxy Listeners */
    Proxy.on('data', ({ client, data }) => {
        const metadata = JSON.parse(decode(data));
        const Data = metadata.params;
        const protocol = metadata.protocol;
        if (typeof protocol == 'undefined')
            return;
        switch (protocol) {
            case 'SEND_MESSAGE': {
                if (typeof Data.uuid != 'undefined' && typeof Data.message != 'undefined') {
                    //@ts-expect-error
                    const player = server.getOfflinePlayer(UUID.fromString(Data.uuid));
                    if (player.isOnline())
                        player.getPlayer().sendMessage(Data.message);
                }
                break;
            }
            /*case 'DISPATCH_PARTY_REQUEST': {
               if (typeof Data.sender != 'undefined' && typeof Data.target != 'undefined') {
                  ////@ts-expect-error
                  const target = server.getOfflinePlayer(UUID.fromString(Data.target));
                  if (!target.isOnline()) return;
                  ////@ts-expect-error
                  const sender = server.getOfflinePlayer(UUID.fromString(Data.sender));
                  break;
               }
            }*/
        }
    });
}
exports.register = register;
const fn = {
    getFriends(uuid) {
        //@ts-expect-error
        sql.query(`select * from users AS \`friend\` join friendships on friender_id = friend.id OR friendee_id = user.id where ${uuid} IN (friendee_id, friender_id) and friend.id <> ${uuid} and aceppted_at is null and blocked_at is null`);
    }
};
function Protocol(protocol, params) {
    thisClient.send(encode(JSON.stringify({ protocol: protocol, params })));
}
exports.Protocol = Protocol;
