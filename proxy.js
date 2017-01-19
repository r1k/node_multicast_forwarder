var IN_HOST = '10.20.9.1';
var OUT_HOST = '10.0.0.1';
var OUT_PORT = '54321';

var INCOMING_MULTICAST = "224.1.4.100";
var INCOMING_PORT = "2000";
var DEST_MULTICAST = "239.100.1.2";
var DEST_PORT = "5000";

var dgram = require('dgram');
var incoming = dgram.createSocket({type: 'udp4', reuseAddr: true});
var outgoing = dgram.createSocket({type: 'udp4', reuseAddr: true});

outgoing.bind(OUT_PORT, OUT_HOST);
outgoing.on('listening', function() {
    console.log('Broadcasting on ' + this.address().address + ":" + this.address().port);
    this.setBroadcast(true);
    this.setMulticastTTL(128);
});

incoming.on('listening', function () {
    console.log('Listening on ' + this.address().address + ":" + this.address().port);
    this.addMembership(INCOMING_MULTICAST, IN_HOST);
});

incoming.on('message', (packet) => { outgoing.send(packet, 0, packet.length, DEST_PORT, DEST_MULTICAST); });

incoming.bind(INCOMING_PORT);