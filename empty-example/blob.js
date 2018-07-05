function Blob(x, y, r, colr, colg, colb) {
    this.pos = createVector(x / 2, y / 2);
    this.r = r;
    this.isVel = true;
    this.vel = createVector(0,0);

    this.col = {
        r: colr || Math.random() * 255 + 1,
        g: colg || Math.random() * 255 + 1,
        b: colb || Math.random() * 255 + 1
    };

    this.update = function () {
        if (this.isVel) {
            var newVel = createVector(mouseX - width / 2, mouseY - height / 2);
            this.vel.setMag(3 / this.r * 50);
            this.vel.lerp(newVel, 0.005);
            this.pos.add(this.vel);
        }
    };

    this.moveRandomly = function () {
        this.pos.x += random(-1, 1);
        this.pos.y += random(-1, 1);
    };

    this.eats = function (other) {
        var d = this.pos.dist(other.pos);

        if (d < this.r + other.r && this.r > other.r * 1.2) {
            // var area = PI * pow(this.r, 2) + PI * pow(other.r, 2);
            // this.r = sqrt(area / PI);
            return true;
        }

        return false;
    };

    this.eject = function (other) {
        var area = PI * pow(this.r, 2) - PI * pow(16, 2);
        this.r = sqrt(area / PI);
        scale(0);

        var newmouseX = map(mouseX, width/2, width, 0, width/2 + this.r) * 2;
        var newmouseY = map(mouseY, height/2, height, 0, height/2 + this.r) * 2;
        var newblob = new Blob(this.pos.x * 2 + newmouseX, this.pos.y * 2 + newmouseY, 10, 'red');
        other.push(newblob);
        console.log('BlobY: ' +newblob.pos.y);
        console.log('BlobX: ' +newblob.pos.x);
    };

    this.constrain = function() {
        this.pos.x = constrain(this.pos.x, -maplimit, maplimit);
        this.pos.y = constrain(this.pos.y, -maplimit, maplimit);
    };

    this.show = function () {
        fill(this.col.r, this.col.g, this.col.b);
        ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);

    }

}
