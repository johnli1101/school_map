var net = require('net');
function randomAngle() {
    return Math.floor(Math.random() * 360)
}
var server = net.createServer(function(conn){
    console.log('server-> tcp server created');
  conn.on('data', function(data){
      console.log('server-> ' + data + ' from ' + conn.remoteAddress + ':' + conn.remotePort);
      const angl = randomAngle()
      console.log('return: ', angl.toString())
      conn.write(angl.toString());
  });
    conn.on('close', function(){
        console.log('server-> client closed connection');
    });
}).listen(3000);
console.log('listening on localhost:3000');