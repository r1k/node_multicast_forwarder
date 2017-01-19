var IN_HOST = '10.20.9.1';
var OUT_HOST = '10.0.0.1';


var INCOMING_MULTICAST = process.argv[2];
var INCOMING_PORT = process.argv[3];
var DESTINATION_MULTICAST = process.argv[4];
var DESTINATION_PORT = process.argv[5];
var DESTINATION_MULTICAST2 = process.argv[6];
var DESTINATION_PORT2 = process.argv[7];

var dgram = require('dgram');

var incoming = [];
incoming.push(
    {
        socket:            dgram.createSocket({type: 'udp4', reuseAddr: true}),
        multicast_address: INCOMING_MULTICAST,
        multicast_port:    INCOMING_PORT,
        packetDropCount:   0
    }
);

var outgoing = []
outgoing.push(
    {
        socket:            dgram.createSocket({type: 'udp4', reuseAddr: true}),
        multicast_address: DESTINATION_MULTICAST,
        multicast_port:    DESTINATION_PORT,
        packetDropCount:   0
    }
);


outgoing.forEach(function(og){
    og.socket.bind(OUT_HOST);
    og.socket.on('listening', function() {
        og.socket.setBroadcast(true);
        og.socket.setMulticastTTL(128);
    });
});

incoming.forEach(function(ig) {
    ig.socket.on('listening', function () {
        var address = ig.socket.address();
        console.log('UDP Client listening on ' + address.address + ":" + address.port);
        ig.socket.setBroadcast(true)
        ig.socket.setMulticastTTL(128);
        ig.socket.addMembership(ig.multicast_address, HOST);
    });
});

incoming[0].socket.on('message', function (incoming_packet, remote) {
    outgoing.forEach(function(og) {
        og.socket.send(incoming_packet,
                       0,
                       incoming_packet.length,
                       og.multicast_port, og.multicast_address);
    });
});

incoming[0].socket.bind(incoming[0].multicast_port, IN_HOST);