const faviconElement = document.querySelector('link[rel="icon"]');

const faviconCanvas = document.createElement("canvas");
faviconCanvas.width = 32;
faviconCanvas.height = 32;

const faviconCtx = faviconCanvas.getContext("2d");
faviconCtx.webkitImageSmoothingEnabled = false;
faviconCtx.mozImageSmoothingEnabled = false;
faviconCtx.msImageSmoothingEnabled = false;
faviconCtx.imageSmoothingEnabled = false;


class FaviconAnimation {
    constructor() {
        this.sprite = new SpriteInstance(sprites[SPR.CLOCK], 0, 0, 0);
        this.sprite.setScale(2);
        this.img = 0;
        this.imgSpd = 1/60;

        this.lastFrame = 0;

        this.active = true;
    }

    update(dt) { 
        if(!this.active) return;

        this.img += this.imgSpd * dt;
        if (this.img >= this.sprite.sprite.getImgNum()) {
            this.img = 0;
        }

  

        if(Math.floor(this.img) !== this.lastFrame){
            this.lastFrame = Math.floor(this.img);
            this.sprite.setFrame(Math.floor(this.img));
            faviconCtx.clearRect(0, 0, faviconCanvas.width, faviconCanvas.height);
            this.sprite.draw(faviconCtx);

            faviconElement.href = faviconCanvas.toDataURL("image/png");
        }
    }
}