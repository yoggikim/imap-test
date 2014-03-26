var ImapServer = require('imap-server');
var server = ImapServer();

var net = require('net');
net.createServer(server).listen(process.env.IMAP_PORT || 1434);
