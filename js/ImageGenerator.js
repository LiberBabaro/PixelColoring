class ImageGenerator {
    constructor(image, canvas) {
        this.colors = [];
        this.image = image;
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.fillCanvasByImage();
        this.pixelationImage();
        let m = this.calcPalette();
        console.log(m);
        let mm = new Map([...m.entries()].sort((a, b) => b[1] - a[1]));
        console.log(this.colors);
        console.log(mm);
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
                
                this.colors.push(rgbToHex(red, green, blue));
                
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
    
    calcPalette() {
        let palette = new Map();
        for (var i = 0; i < this.colors.length; i++) {
            if (palette.has(this.colors[i])) {
                let count = palette.get(this.colors[i]);
                palette.set(this.colors[i], count + 1);
            } else {
                palette.set(this.colors[i], 1);                
            }
        }
        return palette;
    }
}

function rgbToHex(R,G,B) {
    return toHex(R)+toHex(G)+toHex(B)
}

function toHex(n) {
  n = parseInt(n, 10);
  if (isNaN(n)) 
      return "00";
  n = Math.max(0, Math.min(n, 255));
  return "0123456789ABCDEF".charAt((n - n % 16) / 16)  + "0123456789ABCDEF".charAt(n % 16);
}