class ImageGenerator {
    constructor(image, canvas) {
        this.colors = [];
        this.image = image;
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.fillCanvasByImage();
        //this.pixelationImage();
        this.colors = this.processImage();
        console.log(this.colors);
    }
    
    fillCanvasByImage() {
        if (this.image.width > this.image.height) {
            this.canvas.height = this.canvas.width * (this.image.height / this.image.width);
        } else {
            this.canvas.width = this.canvas.height * (this.image.width / this.image.height);
        }
        
        this.context.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
        
        this.imgData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }
    
    pixelationImage(pixelation = 48) {
        let data = this.imgData.data;
        for(var y = 0; y < c.height; y += pixelation) {
            for(var x = 0; x < c.width; x += pixelation) {
                var red = data[((c.width * y) + x) * 4];
                var green = data[((c.width * y) + x) * 4 + 1];
                var blue = data[((c.width * y) + x) * 4 + 2];
                
                //this.colors.push(rgbToHex(red, green, blue));
                
                for(var n = 0; n < pixelation; n++) {
                    for(var m = 0; m < pixelation; m++) {
                        if(x + m < c.width) {
                            data[((c.width * (y + n)) + (x + m)) * 4] = red;
                            data[((c.width * (y + n)) + (x + m)) * 4 + 1] = green;
                            data[((c.width * (y + n)) + (x + m)) * 4 + 2] = blue;
                        }
                    }
                }

            }
        }
        
        this.context.putImageData(this.imgData,0,0);
    }
    
    processImage() {
        var points = [];
        let data = this.imgData.data;
        for (var i = 0, l = data.length; i < l;  i += 4) {
          var r = data[i]
            , g = data[i+1]
            , b = data[i+2];
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