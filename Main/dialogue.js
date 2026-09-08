
class Glyph {
    constructor(char, style = {}) {
        this.char = char;

        // =========================
        // VISUAL STYLE
        // =========================

        this.font = style.font ?? "20px Arial";
        this.color = style.color ?? "#ffffff";

        // =========================
        // LAYOUT
        // =========================

        // Logical amount of horizontal space this glyph consumes.
        this.advance = 0;

        // Actual pixel bounds of the glyph.
        this.width = 0;
        this.height = 0;

        this.ascent = 0;
        this.descent = 0;

        // Logical position.
        //
        // x = baseline X
        // y = baseline Y
        //
        // These values should NOT be modified by effects.
        this.x = 0;
        this.y = 0;

        // =========================
        // VISUAL TRANSFORM
        // =========================

        // These are applied when rendering.
        this.offsetX = 0;
        this.offsetY = 0;

        this.scaleX = 1;
        this.scaleY = 1;

        this.rotation = 0;
        
        this.alpha = 1;

        // =========================
        // EFFECTS
        // =========================

        this.effect = style.effects ?? null;

        
        this.revealTime = 0;
        this.revealed = false;
        this.hasReveal = false;

        // Optional arbitrary user data.
        this.data = {};
    }
}

class TextLine {
    constructor() {
        this.glyphs = [];

        // Calculated by TextLayout.
        this.width = 0;

        this.ascent = 0;
        this.descent = 0;

        this.height = 0;

        // Baseline position after layout.
        this.x = 0;
        this.y = 0;

        this.time = 0;
    }

    update(dt){
        this.time += dt;
    }

    layout() {

        if (!this.dirty) {
            return;
        }

        TextEngine.layout.layoutLine(this);

        this.dirty = false;
    }


    draw(ctx, time = this.time) {

        if (this.dirty) {
            this.layout();
        }

        TextEngine.renderer.drawLine(
            this,
            time
        );
    }

    addText(text, style = {}){
        for(var char of text){
            var glyph = new Glyph(char, style);
            this.addGlyph(glyph);
        }
    }

    addGlyph(glyph) {
        this.glyphs.push(glyph);
        this.dirty = true;
        return glyph;
    }

    insertGlyph(index, glyph) {
        this.glyphs.splice(index, 0, glyph);
        this.dirty = true;
        return glyph;
    }

    removeGlyph(index) {
        this.dirty = true;
        return this.glyphs.splice(index, 1)[0] ?? null;
    }

    getGlyph(index) {
        return this.glyphs[index] ?? null;
    }

    getLength() {
        return this.glyphs.length;
    }

    clear() {
        this.glyphs.length = 0;

        this.width = 0;
        this.ascent = 0;
        this.descent = 0;
        this.height = 0;
        this.dirty = true;
    }
}





class TextBlock extends BaseObject{

    constructor(x = 0, y = 0, width = 300, height = 100) {
        super(x, y);

        // =========================
        // RECTANGLE
        // =========================

        this.x = x;
        this.y = y;
        this.xScl = 1;
        this.yScl = 1;
        this.ang = 0;
        this.alpha = 1;
        this.depth = 0;

        this.width = width;
        this.height = height;


        // =========================
        // TEXT
        // =========================

        this.glyphs = [];
        this.lines = [];


        // =========================
        // LAYOUT
        // =========================

        this.letterSpacing = 0;
        this.lineSpacing = 0;

        this.horizontalAlign = "left";
        this.verticalAlign = "top";

        this.wrap = true;


        // =========================
        // STATE
        // =========================

        this.dirty = true;

        this.layoutWidth = 0;
        this.layoutHeight = 0;

        this.time = 0;



        this.hasReveal = false;
        this.revealIndex = -1;
        this.revealIndexPrev = -1;
        this.revealSpd = 0.1;
    }

    update(dt){
        this.time += dt;

        if (this.hasReveal) {
            this.revealIndex += this.revealSpd * dt;

            const newRevealIndex = Math.floor(this.revealIndex);
            if (newRevealIndex > this.revealIndexPrev) {
                for (let i = this.revealIndexPrev + 1; i <= newRevealIndex; i++) {
                    if (i >= this.glyphs.length) break;

                    this.glyphs[i].revealed = true;
                    this.glyphs[i].revealTime = this.time;
                }

                this.revealIndexPrev = newRevealIndex;
            }
        }
    }


    // ============================================================
    // CONTENT
    // ============================================================

    addGlyph(glyph) {

        glyph.index = this.glyphs.length;
        this.glyphs.push(glyph);

        this.dirty = true;

        return glyph;
    }


    addText(text, style = {}) {

        for (const char of text) {

            const glyph = new Glyph(char, style);

            this.addGlyph(glyph);
        }

        return this;
    }


    clear() {

        this.glyphs.length = 0;
        this.lines.length = 0;

        this.dirty = true;
    }


    // ============================================================
    // LAYOUT
    // ============================================================

    layout(layoutEngine = TextEngine.layout) {

        if (!this.dirty) {
            return;
        }

        this.lines = [];

        let line = new TextLine();

        this.lines.push(line);


        // --------------------------------
        // Build lines
        // --------------------------------

        for (const glyph of this.glyphs) {

            // Explicit line break
            if (glyph.char === "\n") {

                line = new TextLine();

                this.lines.push(line);

                continue;
            }


            line.addGlyph(glyph);


            // Measure current line
            layoutEngine.layoutLine(line);


            // Wrap
            if (
                this.wrap &&
                line.width > this.width
            ) {

                line = this.wrapLine(layoutEngine, line);
            }


        }


        // --------------------------------
        // Layout every line
        // --------------------------------

        for (const line of this.lines) {

            layoutEngine.layoutLine(line);
        }


        // --------------------------------
        // Vertical metrics
        // --------------------------------

        let totalHeight = 0;

        for (let i = 0; i < this.lines.length; i++) {

            const line = this.lines[i];

            totalHeight += line.height;

            if (i < this.lines.length - 1) {
                totalHeight += this.lineSpacing;
            }
        }

        this.layoutHeight = totalHeight;


        // --------------------------------
        // Vertical alignment
        // --------------------------------

        let startY = this.getVerticalStart();


        for (const line of this.lines) {

            startY += line.ascent;

            line.y = startY;

            for (const glyph of line.glyphs) {
                glyph.y = startY;
            }

            startY += line.descent;
            startY += this.lineSpacing;
        }


        // --------------------------------
        // Horizontal alignment
        // --------------------------------

        for (const line of this.lines) {

            const startX =
                this.getHorizontalStart(line);

            line.x = startX;


            for (const glyph of line.glyphs) {
                glyph.x += startX;
            }
        }


        this.layoutWidth = this.getMaxLineWidth();

        this.dirty = false;
    }


    // ============================================================
    // WORD WRAPPING
    // ============================================================

    wrapLine(layoutEngine, line) {

        // If it fits, nothing to do.
        if (line.width <= this.width) {
            return;
        }


        // Find last whitespace.
        let breakIndex = -1;

        for (let i = line.glyphs.length - 1; i >= 0; i--) {

            if (/\s/.test(line.glyphs[i].char)) {

                breakIndex = i;

                break;
            }
        }


        // No whitespace:
        // break at the current character.
        if (breakIndex === -1) {

            const overflow =
                line.glyphs.pop();

            if (overflow) {

                const newLine = new TextLine();

                newLine.addGlyph(overflow);

                this.lines.push(newLine);

                layoutEngine.layoutLine(line);

                layoutEngine.layoutLine(newLine);
            }

            return;
        }


        // --------------------------------
        // Move everything after the space
        // into a new line.
        // --------------------------------

        const newLine = new TextLine();

        while (line.glyphs.length > breakIndex + 1) {

            newLine.glyphs.unshift(
                line.glyphs.pop()
            );
        }


        // Remove the whitespace that caused
        // the wrap from the original line.

        line.glyphs.pop();


        this.lines.push(newLine);


        layoutEngine.layoutLine(line);
        layoutEngine.layoutLine(newLine);


        // The new line itself might still be
        // too large.

        if (newLine.width > this.width) {
            return this.wrapLine(layoutEngine, newLine);
        }

        return newLine;
    }


    // ============================================================
    // ALIGNMENT
    // ============================================================

    getHorizontalStart(line) {
        switch (this.horizontalAlign) {
            case "center":
                return ((this.width - line.width) / 2);

            case "right":
                return (this.width -line.width);

            case "left":
            default:
                return 0;
        }
    }


    getVerticalStart() {
        switch (this.verticalAlign) {
            case "center":
                return ((this.height - this.layoutHeight) / 2);

            case "bottom":
                return (this.height -this.layoutHeight);

            case "top":
            default:
                return 0;
        }
    }


    getMaxLineWidth() {

        let width = 0;

        for (const line of this.lines) {

            width = Math.max(
                width,
                line.width
            );
        }

        return width;
    }


    // ============================================================
    // DRAW
    // ============================================================


    setReveal(hasReveal){
        this.hasReveal = hasReveal;

        for(var glyph of this.glyphs){
            glyph.hasReveal = hasReveal;
            glyph.revealed = false;
            glyph.revealTime = 0;
        }
    }

    revealRestart(){
        this.setRevealIndex(0);
    }

    setRevealIndex(revealIndex){
        this.revealIndex = revealIndex;
        this.revealIndexPrev = revealIndex-1;

        for(var glyph of this.glyphs){
            if(glyph.index < revealIndex){
                glyph.revealTime = -1000;
                glyph.revealed = true;
            } else {
                glyph.revealed = false;
            }
        }
    }

    getGlyph(index){
        return this.glyphs[index];
    }

    draw(ctx, time = this.time) {

        ctx.save();

        ctx.translate(this.x, this.y);
        ctx.rotate(this.ang);
        ctx.scale(this.xScl, this.yScl);

        ctx.globalAlpha *= this.alpha;

        if (this.dirty) {
            this.layout();
        }

        for (const line of this.lines) {

            for (const glyph of line.glyphs) {
                TextEngine.renderer.draw(
                    glyph,
                    time
                );
            }
        }

        ctx.restore();
    }
}

























class TextMetricsCache {

    constructor(ctx) {
        this.ctx = ctx;
        this.cache = new Map();
    }

    measure(char, font) {

        const key = font + "\0" + char;

        let metrics = this.cache.get(key);

        if (metrics) {
            return metrics;
        }

        const oldFont = this.ctx.font;

        this.ctx.font = font;

        const m = this.ctx.measureText(char);

        metrics = {
            width: m.width,

            left: m.actualBoundingBoxLeft,
            right: m.actualBoundingBoxRight,

            ascent: m.actualBoundingBoxAscent,
            descent: m.actualBoundingBoxDescent
        };

        this.ctx.font = oldFont;

        this.cache.set(key, metrics);

        return metrics;
    }

    clear() {
        this.cache.clear();
    }
}

class TextLayout {

    constructor(ctx) {
        this.ctx = ctx;

        this.metrics = new TextMetricsCache(ctx);

        this.letterSpacing = 0;
        this.lineSpacing = 0;
    }

    layoutLine(line) {

        let cursorX = 0;

        let maxAscent = 0;
        let maxDescent = 0;

        for (let i = 0; i < line.glyphs.length; i++) {

            const glyph = line.glyphs[i];

            const metrics =
                this.metrics.measure(
                    glyph.char,
                    glyph.font
                );

            // =========================
            // METRICS
            // =========================

            glyph.advance = metrics.width;

            glyph.width =
                metrics.left +
                metrics.right;

            glyph.ascent =
                metrics.ascent;

            glyph.descent =
                metrics.descent;

            glyph.height =
                glyph.ascent +
                glyph.descent;

            // =========================
            // POSITION
            // =========================

            glyph.x = cursorX;

            // y is assigned later when
            // the line's baseline is known.

            // =========================
            // LINE METRICS
            // =========================

            maxAscent = Math.max(
                maxAscent,
                glyph.ascent
            );

            maxDescent = Math.max(
                maxDescent,
                glyph.descent
            );

            // =========================
            // ADVANCE
            // =========================

            cursorX += glyph.advance;

            // Letter spacing belongs BETWEEN
            // glyphs, not after the final glyph.
            if (i < line.glyphs.length - 1) {
                cursorX += this.letterSpacing;
            }
        }

        line.width = cursorX;

        line.ascent = maxAscent;
        line.descent = maxDescent;

        line.height =
            maxAscent +
            maxDescent;

        return line;
    }


    layout(lines) {

        for (const line of lines) {
            this.layoutLine(line);
        }

        return lines;
    }

     alignLine(line, x, width, align = "left") {

        let offsetX = 0;

        switch (align) {

            case "left":
                offsetX = 0;
                break;

            case "center":
                offsetX =
                    (width - line.width) / 2;
                break;

            case "right":
                offsetX =
                    width - line.width;
                break;
        }

        line.x = x + offsetX;

        for (const glyph of line.glyphs) {
            glyph.x += line.x;
        }

        return line;
    }

    layoutLineVertical(line, baselineY) {

    line.y = baselineY;

    for (const glyph of line.glyphs) {
        glyph.y = baselineY;
    }

    return line;
}
}


class GlyphRenderer {

    constructor(ctx) {
        this.ctx = ctx;
    }

    draw(glyph, time = 0) {

        if(glyph.hasReveal && !glyph.revealed) return;

        const ctx = this.ctx;

        ctx.save();

        ctx.font = glyph.font;
        ctx.fillStyle = glyph.color;

        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";

        let x = glyph.x;
        let y = glyph.y;

        let alpha = glyph.alpha;

        let sclX = glyph.scaleX;
        let sclY = glyph.scaleY;

        let ang = glyph.rotation;


        // =========================
        // VISUAL OFFSET
        // =========================

        x += glyph.offsetX;
        y += glyph.offsetY;

  

        // =========================
        // EFFECTS
        // =========================

        if (glyph.effect) {
            const effect = glyph.effect;

            if (effect.shake) {

                const amount = effect.shake.amplitude ?? 2;

                x += (Math.random() * 2 - 1) * amount;
                y += (Math.random() * 2 - 1) * amount;
            }

            if (effect.wave) {
                const amplitude = effect.wave.amplitude ?? 3;
                const speed = effect.wave.speed ?? 5;
                var phase = effect.wave.phase ?? 0;

                var phaseXRel = effect.wave.phaseX ?? 0;
                phase += phaseXRel*glyph.x; 

                y += Math.sin( time * speed + phase) * amplitude;
            }

            if(glyph.hasReveal){
                if(glyph.revealed){
                    var diff = Math.max(time - glyph.revealTime, 0);

                    if(effect.fadeIn){
                        var duration = effect.fadeIn.duration ?? 200;
                        var prog = clamp(diff/duration, 0, 1);

                        alpha *= prog;
                        
                    }

                    if(effect.fadeOut){
                        var duration = 100;
                        var prog = clamp((diff-300)/duration, 0, 1);

                        alpha *= 1-prog;
                        
                    }
                } else {
                    alpha = 0;
                }
            }
        }


        // =========================
        // TRANSFORM
        // =========================

        ctx.globalAlpha *= alpha;

        if (sclX !== 1 || sclY !== 1 || ang !== 0) {

            ctx.translate(x, y);

            ctx.rotate(ang);

            ctx.scale(
                sclX,
                sclY
            );

            x = 0;
            y = 0;
        }


        ctx.fillText(
            glyph.char,
            x,
            y
        );

        ctx.restore();
    }

    drawLine(line, time = 0, visChars = -1) {
        for (var i = 0; i < line.glyphs.length; i++) {
            var glyph = line.glyphs[i];
            if(visChars != -1 && visChars < i) return;
            this.draw(glyph, time);
        }
    }
}





class TextEngine {

    static init(ctx) {
        TextEngine.layout = new TextLayout(ctx);
        TextEngine.renderer = new GlyphRenderer(ctx);
    }
}

TextEngine.init(ctx);
