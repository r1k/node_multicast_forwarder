var IN_HOST = '10.20.9.1';
var OUT_HOST = '10.0.0.1';
var OUT_PORT = '54321';

var INCOMING_MULTICAST = "224.1.4.100";
var INCOMING_PORT = "2000";
var DESTINATION_MULTICAST = "239.100.1.2";
var DESTINATION_PORT = "5000";

var dgram = require('dgram');
var incoming = dgram.createSocket({type: 'udp4', reuseAddr: true});
var outgoing = dgram.createSocket({type: 'udp4', reuseAddr: true});

outgoing.bind(OUT_PORT, OUT_HOST);
outgoing.on('listening', function() {
    var address = outgoing.address();
    console.log('Broadcasting on ' + address.address + ":" + address.port);
    outgoing.setBroadcast(true);
    outgoing.setMulticastTTL(128);
});

incoming.on('listening', function () {
    var address = incoming.address();
    console.log('Listening on ' + address.address + ":" + address.port);
    incoming.addMembership(INCOMING_MULTICAST, IN_HOST);
});

incoming.on('message', function (incoming_packet, remote) {
    outgoing.send(incoming_packet, 0, incoming_packet.length, DESTINATION_PORT, DESTINATION_MULTICAST);
});

incoming.bind(INCOMING_PORT);