/*
 * IMAP Test
 *
 * Copyright(c) 2014 Yanin Elbi <yanin@startrise.com>
 * MIT Licensed
 *
 */

/**
 * @author Yanin Elbi <yanin@startrise.com>
 *
 */

// var posix = require('posix');
// var limits = posix.getrlimit("nofile");
// console.log('Current limits: soft=' + limits.soft + ", max=" + limits.hard);

// // raise maximum number of open file descriptors to 60k
// posix.setrlimit('nofile', {
//     soft: 60000,
//     hard: 60000
// });
// console.log(posix.getrlimit('nofile'));

var Imap = require('imap'),
    inspect = require('util').inspect;


process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var totalCount = 0;
var readyCount = 0;
var errorCount = 0;


function testConnection(i) {
    'use strict';

    var imap = new Imap({
        user: i + '@startrise.local',
        password: '123456',
        host: 'sr-stress.cloudapp.net',
        port: 993,
        tls: true,
        connTimeout: 60000,
        authTimeout: 60000
    });

    function openInbox(cb) {
        imap.openBox('INBOX', true, cb);
    }

    imap.once('ready', function() {
        readyCount++;
        openInbox(function(err, box) {
            if (err) throw err;
            console.log('Opened inbox for ' + i);
        });
    });

    imap.once('error', function(err) {
        errorCount++;
        console.log(err);
    });

    imap.once('end', function() {
        console.log('Connection ended ' + i);
    });

    imap.connect();

    totalCount++;

}

function startBulk(total, limit, offset, interval, cb) {
    console.log('startBulk %s', offset);

    setTimeout(function() {

        if (offset + limit > total) {
            limit = total - offset;
        }

        if (offset >= total) {
            return cb();
        }

        var i = offset;

        for (; i <= offset + limit; i++) {
            testConnection(i);
        }

        startBulk(total, limit, i, interval, cb);

    }, interval);
}

function stress(n) {
    console.log('Connectiong %s emails', n);
    startBulk(n, 15, 1, 2000, function() {
        console.log('DONE');
        console.log('--------------------------');
        console.log(readyCount + ' | ' + errorCount);
        console.log('--------------------------');
    });
}

stress(5000);
setInterval(function() {
    console.log('--------------------------');
    console.log(readyCount + ' | ' + errorCount);
    console.log('--------------------------');
}, 3000);
