String.prototype.contains = function(it) { return this.indexOf(it) !== -1; };

var blobs = [];
var blobsSize = 100;
var mapsize = 600 * 2;

// lower decay means faster
var decayRate = 75;

// add blobs
function Blob(id, x, y, r, colr, colg, colb) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.r = r;
    this.col = {
        r: colr || Math.random() * 255 + 1,
        g: colg || Math.random() * 255 + 1,
        b: colb || Math.random() * 255 + 1,
    }
}

var express = require('express');
// Create the app
var app = express();

// Set up the server
// process.env.PORT is related to deploying on heroku
var server = app.listen(process.env.PORT || 3000, listen);

// This call back just tells us that the server has started
function listen() {
    // var host = server.address().address;
    var host = '192.168.254.104';
    var port = server.address().port;
    console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('empty-example'));


// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(server);

// add initial blobs
refillBlobs();

setInterval(heartbeat, 33);
setInterval(refillBlobs, 30000);

function refillBlobs() {
    for (var i = 0; i < blobsSize - blobs.length; i++) {
        var x, y;

        x = Math.random() * mapsize;
        y = Math.random() * mapsize;


        // id , x ,y , r
        blob = new Blob('neutralBlob' + i, x, y, 8);
        blobs.push(blob);
    }
}

function heartbeat() {
    blobs.filter(function (blob) {
        if (!blob.id.contains('neutralBlob')) {
            if (blob.r > 100) {
                var area = Math.PI * (blob.r * blob.r)  - Math.PI * blob.r / decayRate;
                blob.r = Math.sqrt(area / Math.PI);
            }
        }
    });

    io.sockets.emit('heartbeat', blobs);
}


// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
    // We are given a websocket object in our function
    function(socket) {

        console.log("We have a new client: " + socket.id);

        socket.on('start',
            function(data) {
                console.log(socket.id + " " + data.x + " " + data.y + " " + data.r);
                var blob = new Blob(socket.id, data.x, data.y, data.r, data.colr, data.colg, data.colb);
                blobs.push(blob);
            }
        );

        socket.on('update',
            function(data) {
                //console.log(socket.id + " " + data.x + " " + data.y + " " + data.r);
                for (var i = 0; i < blobs.length; i++) {
                    if (socket.id === blobs[i].id) {
                        blobs[i].x = data.x;
                        blobs[i].y = data.y;
                        blobs[i].r = data.r;
                    }
                }
                /*blob.x = data.x;
                blob.y = data.y;
                blob.r = data.r;*/
            }
        );


        socket.on('eaten', function (data) {
            // remove the eaten blob
            // set array of blobs excluding the eaten blob
            var eater = {
                id: '',
                r: ''
            };

            var eaten = {
                id: '',
                r: ''
            };

            var newblob = blobs.filter(function( blobs ) {
                if (blobs.id === data.eaterId) {
                    eater.id = blobs.id;
                    eater.r = blobs.r;
                }

                if (blobs.id === data.eatenId) {
                    eaten.id = blobs.id;
                    eaten.r = blobs.r;
                }

                return blobs.id !== data.eatenId;
            });

            //enlarge the eater blob
            for (var i = 0; i < newblob.length; i++) {
                if (eater.id === newblob[i].id) {
                    var area = Math.PI * (eaten.r * eaten.r)  + Math.PI * (eater.r * eater.r);
                    newblob[i].r = Math.sqrt(area / Math.PI);
                }
            }

            blobs = newblob;

            io.sockets.emit('', blobs);
        });

        socket.on('disconnect', function() {
            console.log("Client has disconnected" + " " + socket.id);
            blobs = blobs.filter(function( blobs ) {
                return blobs.id !== socket.id;
            });
        });
    }
);