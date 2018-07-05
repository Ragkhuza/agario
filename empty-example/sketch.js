var blob;
var blobsize = 32;
var blobs = [];
var zoom = 1;
var socket;
var alive = true;

var mapsize = 600;
var maplimit = 600 * 2;

function setup() {
    // put setup code here
    createCanvas(mapsize, mapsize);
    if (alive) {
        socket = io.connect('http://192.168.254.104:3000/');
    }
    var r = Math.random() * 255 + 1;
    var g = Math.random() * 255 + 1;
    var b = Math.random() * 255 + 1;
    blob = new Blob(0, 0, blobsize, r, g,b);
    var data = {
        x: blob.pos.x,
        y: blob.pos.y,
        r: blob.r,
        colr: r,
        colg: g,
        colb: b
    };

    socket.emit('start', data);
    alive = true;

    socket.on('heartbeat', function (data) {
        var stillAlive = false;
        for (var i = 0; i < data.length; i++) {
            if (socket.id === data[i].id) {
                stillAlive = true;
                blob.r = data[i].r;
                console.log('heart beat');
                console.log('blob.r: ' + blob.r);
            }
        }

        alive = stillAlive;

        blobs = data;
    });
}

function draw() {
    // put drawing code here
    background(0);
    if (socket.connected && alive) {
        background(170);
        if (isNaN(blob.r) || isNaN(blob.pos.x) || isNaN(blob.pos.y)) {
            alive = false;
        }
        translate(width / 2, height / 2);
        showDebugText();
        var newzoom = blobsize * 2 / blob.r;
        zoom = lerp(zoom, newzoom, 0.1);
        zoom < 0.65 ? zoom = 0.65 : zoom;
        scale(zoom);
        translate(-blob.pos.x, -blob.pos.y);

        blob.show();
        blob.update();
        blob.constrain();

        for (var i = 0; i < blobs.length; i++) {
            if (socket.id !== blobs[i].id) {
                fill(blobs[i].col.r, blobs[i].col.g, blobs[i].col.b);
                ellipse(blobs[i].x, blobs[i].y, blobs[i].r * 2, blobs[i].r * 2);

                fill('white');
                textAlign(CENTER);
                text(blobs[i].id, blobs[i].x, blobs[i].y + blobs[i].r);

                var newblob = new Blob(blobs[i].x * 2, blobs[i].y * 2, blobs[i].r, 'red');
                // newblob.show();
                // check if a blob eats a blob (he must be bigger by 1.2)
                if (blob.eats(newblob)) {
                    var area = Math.PI * (blob.r * blob.r)  + Math.PI * (blobs[i].r * blobs[i].r);
                    blob.r = Math.sqrt(area / Math.PI);
                    var data = {
                        eaterId: socket.id,
                        eatenId: blobs[i].id
                    };
                    socket.emit('eaten', data);
                }

            }
        }

        var data = {
            x: blob.pos.x,
            y: blob.pos.y,
            r: blob.r
        };

        socket.emit('update', data);


    } else {
        translate(width / 2, height / 2);
        fill(1000);
        textAlign(LEFT);
        textSize(30);
        text('Game OVER', -width / 7, height / 10); // Text wraps within text box
    }

}

function keyTyped() {
    if (key === 'w') {
        blob.eject(blobs);
    } else if (key === 's') {
        blob.isVel = false;
    } else if (key === 'a') {
        blob.isVel = true;
    }
    // return false; // prevent default
}

// function keyPressed() {
//     if (keyCode === UP_ARROW) {
//         console.log('up arrow');
//     } else if (keyCode === DOWN_ARROW) {
//         console.log('down arrow');
//     }
//     return false; // prevent default
// }

function showDebugText() {
    fill(1000);
    textAlign(LEFT);
    textSize(12);
    text('SIZE: ' + blob.r, -width / 2.1, height / 2.1); // Text wraps within text box
    text('MouseX: ' + mouseX, -width / 2.1, height / 2.2); // Text wraps within text box
    text('MouseY: ' + mouseY, -width / 2.1, height / 2.3); // Text wraps within text box

    text('BlobId: ' + socket.id, -100, height / 2.1); // Text wraps within text box

    text('BlobX: ' + blob.pos.x, 130, height / 2.2); // Text wraps within text box
    text('BlobY: ' + blob.pos.y, 130, height / 2.3); // Text wraps within text box
}