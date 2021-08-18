const net = require('net');
const client = new net.Socket();

let resolve = null
let reject = null

function request(port,  host) {
    if (!client || !client.connecting) {
        client.connect(port,host,function() {
            console.log(`Connected to server on ${host}:${port}`);
            //Connection was established, now send a message to the server.
            // ServerTestでタイムスタンプを送っていたので合わせますが、送る必要はなさそうです
            client.write(new Date().toString() + '\n');
        });
    }
    return new Promise((res, rej) => {
        resolve = res
        reject = rej
    })
}

client.on('data',function(data) {
    // const angle = Number(data.toString())
    const angle = data.toString()
    console.log(`Server Says : ${angle}`);
    if (resolve) {
        resolve(angle)
        client.destroy()
    }
});
//Add Client Close function
client.on('close',function(){
    console.log('Connection Closed');
});
//Add Error Event Listener
client.on('error',function(error){
    if (reject) {
        reject(error)
        client.destroy()
    }
    console.error(`Connection Error ${error}`);
});

export default {
    requestAngle: async (host, port) => {
        return await request(port, host)
    }
}
