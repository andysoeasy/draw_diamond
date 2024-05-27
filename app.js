var canvas = document.getElementById("animationCanvas");
var ctx = canvas.getContext("2d");

var brush = function(x, y) { 

    /**
     * Функция представляет собой аналог кисточки,
     * которая закрашивает пиксель своим цветом.
     */

    if(isFinite(x) && isFinite(y)){
        setPixelPoint(x, y, brush.color);
    }
};

function setPixelPoint(x, y, color) { 

    /**
     * Функция ставит на холст пиксель в точке (x;y),
     * который имеет цвет color.
     */

    if(!color) color = {r : 0, 
                        g : 0, 
                        b : 0, 
                        a : 255};

    var p = ctx.createImageData(1,1);

    p.data[0] = color.r;
    p.data[1] = color.g;
    p.data[2] = color.b;
    p.data[3] = color.a;

    var data = ctx.getImageData(x, y, 1,1).data;

    if(data[3] <= p.data[3])
        ctx.putImageData(p, x, y);
  }

function createLine(x1, y1, x2, y2, color) {

    /**
     * Функция строит прямую линию по алгоритму
     * Брезенхема из точки (x1;y1) в точку (x2;y2)
     * и имеет цвет color.
     */

    if(color){
        brush.color = color;
    } else {
        brush.color = {r:0,
                       g:0,
                       b:0,
                       a:255};
    }

    var deltaX = Math.abs(x2 - x1);
    var deltaY = Math.abs(y2 - y1);
    var signX = x1 < x2 ? 1 : -1;
    var signY = y1 < y2 ? 1 : -1;
   
    var d = deltaX - deltaY;
    
    brush(x2, y2);

    while(x1 != x2 || y1 != y2){
        brush(x1, y1);
        var d2 = d * 2;
      
        if(d2 > -deltaY){
            d -= deltaY;
            x1 += signX;
        }

        if(d2 < deltaX){
            d += deltaX;
            y1 += signY;
        }
    }
}

function circle(center_x, center_y, radius, color) {

    /**
     * Функция строит окружность используя алгоритм
     * Мичнера. Ее центр устанавливается в точке
     * (center_x; center_y). Окружность имеет цвет
     * обводки color, а ее радиус задается с 
     * помощью radius.
     */

    function setPixel8() {
        setPixelPoint(x + center_x, y + center_y, color);
        setPixelPoint(x + center_x, -y + center_y, color);
        setPixelPoint(-x + center_x, -y + center_y, color);
        setPixelPoint(-x + center_x, y + center_y, color);
        setPixelPoint(y + center_x, x + center_y, color);
        setPixelPoint(y + center_x, -x + center_y, color);
        setPixelPoint(-y + center_x, -x + center_y, color);
        setPixelPoint(-y + center_x, x + center_y, color);    
    }
    x = 0;
    y = radius;
    d = 3 - 2 * y;
    while(x <= y) {
       setPixel8();
       if (d < 0) { d = d + 4 * x + 6;}
       else {
       d = d + 4 * (x - y) + 10;
       y--;
       }
    x++;
    }
}


function star(center_x, center_y, borderColor){

    /**
     * Функция star отрисовывает на холсте звезду
     * используя прямые линии, построенные по
     * алгоритму Брезенхема.
     */

    let start_x = center_x - 23;
    let start_y = center_y;

    createLine(start_x, start_y, start_x+20, start_y-3, borderColor)
    createLine(start_x+20, start_y-3, start_x+23, start_y-23, borderColor)
    createLine(start_x+23, start_y-23, start_x+26, start_y-3, borderColor)
    createLine(start_x+26, start_y-3, start_x+56, start_y, borderColor)

    createLine(start_x+56, start_y, start_x+26, start_y+3, borderColor)
    createLine(start_x+26, start_y+3, start_x+23, start_y+23, borderColor)
    createLine(start_x+23, start_y+23, start_x+20, start_y+3, borderColor)
    createLine(start_x+20, start_y+3, start_x, start_y, borderColor)
}



function fill(x, y, fillColor, borderColor) {

    /**
     * Функция рекурсивной заливки фигур указанным 
     * цветом borderColor
     */

    let data = ctx.getImageData(x, y, 1, 1).data;  
    let color = {r: data[0], g:data[1], b: data[2] };

    if ( !eqColor(color, borderColor) && !eqColor(color, fillColor) ) { 
      setPixelPoint(x, y, fillColor); 
      fill(x+1,y, fillColor, borderColor);  
      fill(x,y+1, fillColor, borderColor); 
      fill(x-1,y, fillColor, borderColor); 
      fill(x,y-1, fillColor, borderColor);
    }
}

function betaSpline(points, color){  
    let oldColor = ctx.fillStyle;
    ctx.beginPath();
    points.splice(0,0,points[0]);
    points.push(points[points.length-1]);
    for(let i = 1; i < points.length - 2; i++){
      let a3 = (-points[i-1].x + 3*points[i].x - 3*points[i+1].x + points[i+2].x) / 6,
          a2 = (points[i-1].x - 2*points[i].x + points[i+1].x) / 2,
          a1 = (-points[i-1].x + points[i+1].x) / 2,
          a0 = (points[i-1].x + 4*points[i].x + points[i+1].x) / 6;
      let b3 = (-points[i-1].y + 3*points[i].y - 3*points[i+1].y + points[i+2].y) / 6,
          b2 = (points[i-1].y - 2*points[i].y + points[i+1].y) / 2,
          b1 = (-points[i-1].y + points[i+1].y) / 2,
          b0 = (points[i-1].y + 4*points[i].y + points[i+1].y) / 6;
      
      for(let t = 0; t <= 1; t += 0.005){
        let x = ((a3 * t + a2) * t + a1) * t + a0;
        let y = ((b3 * t + b2) * t + b1) * t + b0;
        ctx.lineTo(x, y);
      }
    }
    points.splice(points.length-1,1);
    points.splice(0,1);
  
    if(color) { ctx.fillStyle = color; ctx.fill(); }
    ctx.stroke();
    ctx.fillStyle = oldColor;
}
  
function eqColor (color1, color2) {

    /**
     * Функция сравнивает два цвета с точностью до eps,
     * представляющую из себя предел погрешности 
     * несовпадения двух цветов.
     */
    let  eps=2;
    if ( Math.abs(color1.r-color2.r) < eps && Math.abs(color1.g-color2.g) < eps && Math.abs(color1.b-color2.b) < eps) 
      return 1; 
    else 
      return 0;
} 

var colors = {
    black: {
        r: 0,
        g: 0,
        b: 0,
        a: 255
    },
    alarm_black: {
        r: 52,
        g: 40,
        b: 40,
        a: 255
    },
    red: {
        r: 255,
        g: 0,
        b: 0, 
        a: 255
    },
    green: {
        r: 0,
        g: 255,
        b: 0,
        a: 255
    },
    blue: {
        r: 0,
        g: 0,
        b: 255,
        a: 160
    },
    celeste: {
        r: 185, 
        g: 242,
        b: 255,
        a: 200
    },
    celeste_2: {
        r: 185,
        g: 242,
        b: 255,
        a: 130
    },
    celeste_3: {
        r: 185,
        g: 242,
        b: 255,
        a: 255
    },
    ametyst: {
        r: 153,
        g: 102,
        b: 204,
        a: 130
    },
    white: {
        r: 255,
        g: 255,
        b: 255,
        a: 255
    },
    yellow: {
        r: 210,
        g: 239,
        b: 52,
        a: 255
    }
}

function triangle(x1, y1, x2, y2, x3, y3, color){
    createLine(x1, y1, x2, y2, color);
    createLine(x2, y2, x3, y3, color);
    createLine(x3, y3, x1, y1, color);
}

triangle(
    53, 143,
    107, 90,
    146, 156,
    colors.blue
);

triangle(
    53, 143,
    146, 156,
    226, 250,
    colors.blue
);

triangle(
    107, 90,
    146, 156,
    224, 101,
    colors.blue
);

createLine(107, 90, 224, 71, colors.blue);
createLine(224, 71, 356, 88, colors.blue);

triangle(
    146, 156,
    303, 157,
    226, 250,
    colors.blue
);

triangle(
    146, 156,
    224, 101,
    303, 157,
    colors.blue
);

triangle(
    224, 101,
    303, 157,
    356, 88,
    colors.blue
);

triangle(
    303, 157,
    356, 88,
    419, 144,
    colors.blue
);

triangle(
    303, 157,
    419, 144,
    226, 250,
    colors.blue
);

fill(103, 127, colors.celeste, colors.blue);
fill(167, 114, colors.celeste, colors.blue);
fill(238, 139, colors.celeste, colors.blue);
fill(309, 117, colors.celeste, colors.blue);
fill(369, 130, colors.celeste, colors.blue);

fill(113, 171, colors.celeste_2, colors.blue);
fill(235, 177, colors.celeste_2, colors.blue);
fill(365, 169, colors.celeste_2, colors.blue);

fill(238, 80, colors.celeste_3, colors.blue);


star(310, 115, colors.white);
fill(310, 115, colors.white, colors.white);
circle(310, 115, 10, colors.white);
circle(310, 115, 20, colors.white);

star(128, 159, colors.white);
fill(128, 159, colors.white, colors.white);
circle(128, 159, 10, colors.white);
circle(128, 159, 20, colors.white);

var shadow_points = [
    {x: 161, y: 296},
    {x: 197, y: 284},
    {x: 236, y: 280},
    {x: 279, y: 284},
    {x: 299, y: 295},
    {x: 278, y: 315},
    {x: 235, y: 330},
    {x: 196, y: 314},
    {x: 161, y: 296}
];

betaSpline(shadow_points, '#858585');