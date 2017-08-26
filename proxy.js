const commandLineArgs = require('command-line-args')
const commandLineUsage = require('command-line-usage')

const optionDefinitions = [
    { name: 'iniface', type: String, description: "The source interface address", typeLabel: "<addr>"},
    { name: 'inmcast', type: String, description: "The source multicast address", typeLabel: "<addr>" },
    { name: 'inport', type: String, description: "The source port number", typeLabel: "<port>" },
    { name: 'outiface', type: String, description: "The output interface", typeLabel: "<addr>" },
    { name: 'outmcast', type: String, description: "The output address", typeLabel: "<addr>" },
    { name: 'outport', type: String, description: "The output port", typeLabel: "<port>" },
    { name: 'help', alias: 'h', type: Boolean, description: "Display the help"}
  ];

const options = commandLineArgs(optionDefinitions, { partial: false });
    
function show_help(){
    const usage = commandLineUsage([
        {
            header: 'Multicast Forwarder',
            content: 'An application to forward a multicast from one port to another.'
        },
        {
            header: 'Options',
            optionList: optionDefinitions
        }
    ]);
    console.log(usage);
    process.exit();
}

if (options.help){
    show_help();
}

if (!(options.iniface && options.inmcast && options.inport && options.outiface && options.outmcast && options.outport)) {
    show_help();
}


var dgram = require('dgram');
var incoming = dgram.createSocket({type: 'udp4', reuseAddr: true});
var outgoing = dgram.createSocket({type: 'udp4', reuseAddr: true});

outgoing.bind(options.outport, options.outiface);
outgoing.on('listening', function() {
    console.log('Broadcasting on ' + this.address().address + ":" + this.address().port);
    this.setBroadcast(true);
    this.setMulticastTTL(128);
});

incoming.on('listening', function () {
    console.log('Listening on ' + this.address().address + ":" + this.address().port);
    this.addMembership(options.inmcast, options.iniface);
});

incoming.on('message', (packet) => {
    outgoing.send(packet, 0, packet.length, options.outport, options.outmcast);
});

incoming.bind(options.inport);
