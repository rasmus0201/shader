let windowDiagonal;
let da;
let circle;
let origin;
let pol;
let points = [];
let radius = 150;
let angleSum = 360;
let numPoints = 475;

let bulletSize = 5;
let showBulletBorders = false;
let showLinesFromOrigin = false;
let showGrid = false;
let gridBlock = 50;

let primary = 0;
let accent = 255;

function toggleTheme(){
    if (primary === 0) {
        primary = 255;
        accent = 0;
    } else {
        primary = 0;
        accent = 255;
    }
}

function toggleGrid(){
    showGrid = !showGrid;
}

function toggleLinesFromOrigin(){
    showLinesFromOrigin = !showLinesFromOrigin;
}

function toggleBulletBorders(){
    showBulletBorders = !showBulletBorders;
}

function createCircle(){
    points = [];
    let rotate = - (angleSum / numPoints);
    let rotation = 90; // start at top

    for (let angle = angleSum; angle > 0; angle += rotate) {
        let x = circle.x + radius * cos(radians(angle + rotation));
        let y = circle.y + radius * sin(radians(angle + rotation));

        points.push([x, y, 360-angle]);
    }
}

function changePoints(n){
    numPoints += n;

    if (numPoints < 5) {
        numPoints = 5;
    } else if (numPoints > 675) {
        numPoints = 675;
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    windowDiagonal = sqrt(pow(windowWidth, 2)+pow(windowHeight, 2));

    {
        let btn = createButton('Toggle theme');
        btn.position(20, 5);
        btn.mousePressed(function(){
            toggleTheme();
        });
    }

    {
        let btn = createButton('Toggle grid lines');
        btn.position(20, 25);
        btn.mousePressed(function(){
            toggleGrid();
        });
    }

    {
        let btn = createButton('Toggle origin lines');
        btn.position(20, 45);
        btn.mousePressed(function(){
            toggleLinesFromOrigin();
        });
    }

    {
        let btn = createButton('Toggle circle borders');
        btn.position(20, 65);
        btn.mousePressed(function(){
            toggleBulletBorders();
        });
    }

    {
        let minus = createButton('-10');
        minus.position(20, 85);
        minus.mousePressed(function(){
            changePoints(-10);
            createCircle();
        });

        let plus = createButton('+10');
        plus.position(60, 85);
        plus.mousePressed(function(){
            changePoints(10);
            createCircle();
        });
    }


    origin = createVector(0, 0);
    pol = createVector(200, 200);

    circle = createVector(width/2, height/2);

    createCircle();

    //frameRate(10);
    //noLoop();
}

function draw() {
    background(primary);

    changeOriginFromMouse();

    if (showGrid) {
        textAlign(CENTER);
        textSize(8);
        strokeWeight(0.1);
        stroke(accent);
        fill(accent);

        text("0", coordX(4), coordY(8));
        text("0", coordX(8), coordY(4));

        for (i = gridBlock; i < width; i += gridBlock) {
            text(i, coordX(i), coordY(6));
            line(coordX(i), coordY(0), coordX(i), coordY(height));
        }
        for (i = gridBlock; i < height; i += gridBlock) {
            text(i, coordX(10), coordY(i - 3));
            line(coordX(0), coordY(i), coordX(width), coordY(i));
        }
    }

    noFill();
    strokeWeight(0.5);
    stroke(accent);

    if (showBulletBorders) {
        ellipse(coordX(circle.x), coordY(circle.y), radius * 2, radius * 2);
    }

    let newPoints = [];

    for (i = 0; i < points.length; i++) {
        let v = points[i];
        v = createVector(v[0], v[1]);

        if (showLinesFromOrigin){
            stroke(accent);
            strokeWeight(0.2);

            line(coordX(origin.x), coordY(origin.y), coordX(v.x), coordY(v.y), 0.5);
            line(coordX(pol.x), coordY(pol.y), coordX(v.x), coordY(v.y), 0.5);
        }

        let diffuseColor = createVector(1, 1, 1); // color = 1 = 100% * 255

        let sn = p5.Vector.sub(v, circle); // vektoren fra radius til punktet
        sn.normalize(); // som enhedsvektor

        /* MOUSE LIGHT POINT */
        dv = p5.Vector.sub(origin, v); // vektoren fra lyskilden til punktet
        ld = (dv.copy()).normalize(); // som enhedsvektor

        let diffuseFactorA = p5.Vector.dot(sn, ld); //Hvor meget skal farve skaleres ned?
        let a = diffuseColor.copy();

        f = map(dv.mag(), 0, windowDiagonal, 1, 0);
        a = a.mult(diffuseFactorA).mult(f);


        /* STATIC LIGHT POINT */
        dv = p5.Vector.sub(pol, v);
        ld = (dv.copy()).normalize();

        let diffuseFactorB = p5.Vector.dot(sn, ld);
        let b = diffuseColor.copy();

        f = map(dv.mag(), 0, windowDiagonal, 1, 0);
        b = b.mult(diffuseFactorB).mult(f);


        /* BOTH LIGHT SOURCES */
        let c = p5.Vector.add(b, a);
        f = map(c.mag(), 0, windowDiagonal, 1, 0);
        c.mult(f);

        let newPoint = {
            a: a,
            b: b,
            c: c,
            v: v
        };

        newPoints.push(newPoint);
    }

    for (i = 0; i < newPoints.length; i++) {
        let p = newPoints[i];

        if (p.a.x < 0 && p.a.y < 0 && p.a.z < 0) {
            fill(PercentToGreyscale(p.b.x), PercentToGreyscale(p.b.y), PercentToGreyscale(p.b.z));
        } else if (p.b.x < 0 && p.b.y < 0 && p.b.z < 0) {
            fill(PercentToGreyscale(p.a.x), PercentToGreyscale(p.a.y), PercentToGreyscale(p.a.z));
        } else {
            fill(PercentToGreyscale(p.c.x), PercentToGreyscale(p.c.y), PercentToGreyscale(p.c.z));
        }

        if (showBulletBorders){
            stroke(accent);
            strokeWeight(0.2);
        } else {
            noStroke();
        }

        ellipse(coordX(abs(p.v.x)), coordY(abs(p.v.y)), bulletSize, bulletSize);
    }
}

function mousePressed(){
    let coords = coordsInverse(mouseX, mouseY);
    pol.x = coords.x;
    pol.y = coords.y;
}

function changeOriginFromMouse(){
    let coords = coordsInverse(mouseX, mouseY);
    origin.x = coords.x;
    origin.y = coords.y;

    noStroke();
    fill(accent);
    ellipse(coordX(origin.x), coordY(origin.y), 10, 10);
}

function PercentToGreyscale(p){
    return map(p, 0, 1, 0, 255);
}

function coordsInverse(x, y){
    return {
        x: x,
        y: map(y, height, 0, 0, height)
    };
}

function coords(x, y){
    return {
        x: x,
        y: map(y, 0, height, height, 0)
    };
}

function coordX(x){
    return x;
}

function coordY(y){
    return map(y, 0, height, height, 0);
}
