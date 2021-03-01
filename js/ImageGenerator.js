class ImageGenerator {
    constructor(image, canvas, canvas1) {
        this.colors = [];
        this.image = image;
        this.canvas = canvas;
        this.canvas1 = canvas1;
        this.pixelation = 48;
        this.context = this.canvas.getContext("2d");
        this.context1 = this.canvas1.getContext("2d");
        this.fillCanvasByImage();
        this.colors = this.processImage();
        this.pixelationImage();
    }
    
    fillCanvasByImage() {
        console.log(this.canvas1);
        if (this.image.width > this.image.height) {
            this.canvas.height = this.canvas.width * (this.image.height / this.image.width);
            this.canvas1.height = this.canvas.height * this.pixelation;
        } else {
            this.canvas.width = this.canvas.height * (this.image.width / this.image.height);
            this.canvas1.width = this.canvas.width * this.pixelation;
        }
        
        this.context.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
        this.context1.drawImage(this.image, 0, 0, this.canvas1.width, this.canvas1.height);
        
        this.imgData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.imgData1 = this.context1.getImageData(0, 0, this.canvas1.width, this.canvas1.height);
    }
    
    pixelationImage() {
        let data = this.imgData1.data;
        for(var y = 0; y < this.canvas1.height; y += this.pixelation) {
            for(var x = 0; x < this.canvas1.width; x += this.pixelation) {
                var red = data[((this.canvas1.width * y) + x) * 4];
                var green = data[((this.canvas1.width * y) + x) * 4 + 1];
                var blue = data[((this.canvas1.width * y) + x) * 4 + 2];
                
                
                let minDist = 10000000;
                let newColor = hexToRgb(this.colors[0]);
                for (let i = 1; i < this.colors.length; i++) {
                    let rgbC = hexToRgb(this.colors[i]);
                    let dist = euclidean([red, green, blue], [rgbC.r, rgbC.g, rgbC.b]);
                    if (dist <= minDist) {
                        minDist = dist;
                        newColor = rgbC;
                    }
                }
                
                red = newColor.r;
                green = newColor.g;
                blue = newColor.b;
                
                //this.colors.push(rgbToHex(red, green, blue));
                
                for(var n = 0; n < this.pixelation; n++) {
                    for(var m = 0; m < this.pixelation; m++) {
                        if(x + m < this.canvas1.width) {
                            data[((this.canvas1.width * (y + n)) + (x + m)) * 4] = red;
                            data[((this.canvas1.width * (y + n)) + (x + m)) * 4 + 1] = green;
                            data[((this.canvas1.width * (y + n)) + (x + m)) * 4 + 2] = blue;
                        }
                    }
                }

            }
        }
        
        this.context1.putImageData(this.imgData1, 0, 0);
        //this.context.scale(48, 48)
    }
    
    processImage() {
        var points = [];
        let data = this.imgData.data;
        for (var i = 0, l = data.length; i < l;  i += 4) {
          var r = data[i]
            , g = data[i + 1]
            , b = data[i + 2];
          points.push([r, g, b]);
        }
        var results = kmeans(points, 10, 1)
         , hex = [];
        for (var i = 0; i < results.length; i++) {
          hex.push(rgbToHex(results[i][0]));
        }
        return hex;
    }
}

function euclidean(p1, p2) {
    var s = 0;
    for (var i = 0, l = p1.length; i < l; i++) {
      s += Math.pow(p1[i] - p2[i], 2)
    }
    return Math.sqrt(s);
}

function calculateCenter(points, n) {
    var vals = []
      , plen = 0;
    for (var i = 0; i < n; i++) { vals.push(0); }
    for (var i = 0, l = points.length; i < l; i++) {
      plen++;
      for (var j = 0; j < n; j++) {
        vals[j] += points[i][j];
      }
    }
    for (var i = 0; i < n; i++) {
      vals[i] = vals[i] / plen;
    }
    return vals;
}

function kmeans(points, k, min_diff) {
    plen = points.length;
    clusters = [];
    seen = [];
    while (clusters.length < k) {
        idx = parseInt(Math.random() * plen);
        found = false;
        for (var i = 0; i < seen.length; i++ ) {
            if (idx === seen[i]) {
                found = true;
                break;
            }
        }
        if (!found) {
            seen.push(idx);
            clusters.push([points[idx], [points[idx]]]);
        }
    }

    while (true) {
        plists = [];
        for (var i = 0; i < k; i++) {
            plists.push([]);
        }

        for (var j = 0; j < plen; j++) {
            var p = points[j]
             , smallest_distance = 10000000
             , idx = 0;
            for (var i = 0; i < k; i++) {
                var distance = euclidean(p, clusters[i][0]);
                if (distance < smallest_distance) {
                    smallest_distance = distance;
                    idx = i;
                }
            }
            plists[idx].push(p);
        }

        var diff = 0;
        for (var i = 0; i < k; i++) {
            var old = clusters[i]
              , list = plists[i]
              , center = calculateCenter(plists[i], 3)
              , new_cluster = [center, (plists[i])]
              , dist = euclidean(old[0], center);
            clusters[i] = new_cluster
            diff = diff > dist ? diff : dist;
        }
        if (diff < min_diff) {
            break;
        }
    }
    return clusters;
}

function rgbToHex(rgb) {
    function th(n) {
      n = parseInt(n, 10);
      if (isNaN(n)) 
          return "00";
      n = Math.max(0, Math.min(n, 255));
      return "0123456789ABCDEF".charAt((n - n % 16) / 16)  + "0123456789ABCDEF".charAt(n % 16);
    }
    return '#' + th(rgb[0]) + th(rgb[1]) + th(rgb[2]);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}