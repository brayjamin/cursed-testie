import { data, root, type, manager } from '@grakkit/stdlib-paper';
import { Client, Server } from '@grakkit/socket';
function decode (content: Uint8Array) {
   let index = 0;
   let string = '';
   let extra1: number, extra2: number;
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
function encode (content: string) {
   let index = 0;
   const array = new Uint8Array(content.length);
   while (index < content.length) {
      array[index] = content.charCodeAt(index++);
   }
   return array;
}
//@ts-expect-error
const Driver = type('com.mysql.cj.jdbc.Driver');
//@ts-expect-error
const sql = type('me.vagdedes.mysql.database.MySQL');
//@ts-expect-error
sql.connect();
const query = {
   getFriends (friender: string, friendee: string) {
      //@ts-expect-error
      sql.query(
         `select * from users AS \`friend\` join friendships on friender_id = friend.id where friendee_id = ${friender} and aceppted_at is null and blocked_at is null`
      );
   }
};
type Proxy = Server;
let Proxy: Proxy;
let Port;
let NodeType;
const UUID = type('java.util.UUID');
const thisClient = new Client();
type NodeType = 'server' | 'client';
function register (type: NodeType, port: number) {
   Port = port;
   NodeType = type;
   switch (type) {
      case 'server': {
         Proxy = new Server();
         Proxy.start(port);
         try {
            thisClient.connect(port);
         } catch (e) {
            console.error(e);
         }
         break;
      }
      case 'client': {
         try {
            thisClient.connect(port);
         } catch (e) {
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
      if (typeof protocol == 'undefined') return;
      switch (protocol) {
         case 'SEND_MESSAGE': {
            if (typeof Data.uuid != 'undefined' && typeof Data.message != 'undefined') {
               //@ts-expect-error
               const player = server.getOfflinePlayer(UUID.fromString(Data.uuid));
               if (player.isOnline()) player.getPlayer().sendMessage(Data.message);
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
const fn = {
   getFriends (uuid: string) {
      //@ts-expect-error
      sql.query(
         `select * from users AS \`friend\` join friendships on friender_id = friend.id OR friendee_id = user.id where ${uuid} IN (friendee_id, friender_id) and friend.id <> ${uuid} and aceppted_at is null and blocked_at is null`
      );
   }
};
function Protocol (protocol: string, params: {}) {
   thisClient.send(encode(JSON.stringify({ protocol: protocol, params })));
}
export { thisClient, register, decode, encode, Proxy, Port, Protocol, Client, Server };
