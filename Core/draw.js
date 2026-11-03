


class RectInstance {
    constructor(x = 0, y = 0, wid = 1, hei = 1) {
        

        // TRANSFORMATION
        this.transform = {
            x: x,
            y: y,
            wid:wid,
            hei:hei,
            color: color,
            alpha: 1,
            ang: 0,
            relXOff: 0,
            relYOff: 0
        }
    }

    getWidth() { return this.transform.wid; }
    getHeight() { return this.transform.hei; }
    getLeft() { return this.transform.x - this.getWidth() * this.transform.relXOff; }
    getTop() { return this.transform.y - this.getHeight() * this.transform.relYOff; }
    getRight() { return this.getLeft() + this.getWidth(); }
    getBottom() { return this.getTop() + this.getHeight(); }

    pointInside(px, py) {
        return Area.pointInside(px, py, this.getLeft(), this.getTop(), this.getWidth(), this.getHeight());
    }

    intersectsBox(box) {
        if (!box) return false;
        return Area.rectCollision(
            this.getLeft(), this.getTop(), this.getWidth(), this.getHeight(),
            box.getLeft(), box.getTop(), box.getWidth(), box.getHeight()
        );
    }


    // TRANSFORM METHODS
    setPosition(x, y) {
        this.transform.x = x;
        this.transform.y = y;
    }

    setSize(wid, hei = wid) {
        this.transform.wid = wid;
        this.transform.hei = hei;
    }

    setColor(color){
        this.transform.color = color;
    }

    setRotation(ang) {
        this.transform.ang = ang;
    }


    setOrigin(originX, originY) {
        this.transform.relXOff = originX;
        this.transform.relYOff = originY;
    }

    setAlpha(alpha) {
        this.transform.alpha = alpha;
    }

    draw(ctx) {
        ctx.save();
        var alpha = ctx.globalAlpha;

        ctx.globalAlpha = this.transform.alpha;

        ctx.translate(this.transform.x, this.transform.y);
        ctx.rotate(this.transform.ang);

        ctx.fillStyle = this.transform.color;
        ctx.fillRect(this.getLeft() - this.transform.x, this.getRight() - this.transform.y, this.getWidth(), this.getHeight());
        ctx.globalAlpha = alpha;
        ctx.restore();
    }
}

function fillRect(ctx, x, y, wid, hei, originX, originY, color){
    if(color){
        ctx.fillStyle = color;
    }

    var orX = originX ?? 0;
    var orY = originY ?? 0;
    var xx = x - wid*orX;
    var yy = y - hei*orY;
    ctx.fillRect(xx, yy, wid, hei);
}

function strokeRect(ctx, x, y, wid, hei, originX, originY, color, lineWid) {
    if (color !== undefined) {
        ctx.strokeStyle = color;
    }

    if(lineWid !== undefined){
        ctx.lineWidth = lineWid;
    }

    var orX = originX ?? 0;
    var orY = originY ?? 0;
    var xx = x - wid * orX;
    var yy = y - hei * orY;
    
    ctx.strokeRect(xx, yy, wid, hei);
}


class TextInstance {
    constructor(text, x = 0, y = 0, color = "rgb(255,255,255)") {
        this.text = text;

        this.font = "Fixedsys";
        this.fontSize = 48;
        this.textAlign = "center";
        this.textBaseline = "middle";

        this.shadow = {
            enabled: false,
            offX: 4,
            offY: 4,
            color: "rgb(0,0,0)"
        };

        this.outline = {
            enabled: false,
            wid: 2,
            color: "rgb(0,0,0)"
        }

        // TRANSFORMATION
        this.transform = {
            x: x,
            y: y,
            xScl: 1,
            yScl: 1,
            color: color,
            alpha: 1,
            ang: 0,
            relXOff: 0,
            relYOff: 0
        }
    }

    // TRANSFORM METHODS
    setPosition(x, y) {
        this.transform.x = x;
        this.transform.y = y;
    }

    setScale(xScl, yScl = xScl){
        this.transform.xScl = xScl;
        this.transform.yScl = yScl;
    }

    setFontSize(size) {
        this.fontSize = size;
    }

    setFont(font, size = this.fontSize){
        this.font = font;
        this.setFontSize(size);
    }

    setAlignBaseline(align, baseline){
        this.setAlign(align);
        this.setBaseline(baseline);
    }

    setAlign(align){
        this.textAlign = align;
    }

    setBaseline(baseline){
        this.textBaseline = baseline;
    }


    setColor(color) {
        this.transform.color = color;
    }

    setRotation(ang) {
        this.transform.ang = ang;
    }

    setAlpha(alpha) {
        this.transform.alpha = alpha;
    }

    setShadow(enabled, config = {}){
        this.shadow.enabled = enabled;

        this.shadow.color = config.color ?? "rgb(0,0,0)";
        this.shadow.offX = config.offX ?? 4;
        this.shadow.offY = config.offY ?? 4;
    }


    setOutline(enabled, config = {}) {
        this.outline.enabled = enabled;

        this.outline.color = config.color ?? "rgb(0,0,0)";
        this.outline.wid = config.wid ?? 2;
    }

    setText(text){
        this.text = text;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.transform.x, this.transform.y);
        ctx.scale(this.transform.xScl, this.transform.yScl);
        ctx.rotate(this.transform.ang);

        ctx.globalAlpha = this.transform.alpha;
        ctx.font = this.fontSize + "px " + this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;

        // SHADOW
        if(this.shadow.enabled){
            ctx.fillStyle = this.shadow.color;
            ctx.fillText(this.text, this.shadow.offX, this.shadow.offY);
        }

        // OUTLINE
        if (this.outline.enabled) {
            ctx.strokeStyle = this.outline.color;
            ctx.lineWidth = this.outline.wid;
            ctx.strokeText(this.text, 0, 0);
        }

        // TEXT
        ctx.fillStyle = this.transform.color;
        ctx.fillText(this.text, 0, 0);

    

        ctx.restore();
    }
}
