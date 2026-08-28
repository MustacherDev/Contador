
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

        // =========================
        // EFFECTS
        // =========================

        this.effect = style.effects ?? null;

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





class TextBlock {

    constructor(x = 0, y = 0, width = 300, height = 100) {

        // =========================
        // RECTANGLE
        // =========================

        this.x = x;
        this.y = y;

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
    }


    // ============================================================
    // CONTENT
    // ============================================================

    addGlyph(glyph) {

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

                this.wrapLine(layoutEngine, line);
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
            this.wrapLine(layoutEngine, newLine);
        }
    }


    // ============================================================
    // ALIGNMENT
    // ============================================================

    getHorizontalStart(line) {

        switch (this.horizontalAlign) {

            case "center":

                return (
                    this.x +
                    (this.width - line.width) / 2
                );


            case "right":

                return (
                    this.x +
                    this.width -
                    line.width
                );


            case "left":
            default:

                return this.x;
        }
    }


    getVerticalStart() {

        switch (this.verticalAlign) {

            case "center":

                return (
                    this.y +
                    (this.height - this.layoutHeight) / 2
                );


            case "bottom":

                return (
                    this.y +
                    this.height -
                    this.layoutHeight
                );


            case "top":
            default:

                return this.y;
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

    draw(renderer, time = 0) {

        for (const line of this.lines) {

            renderer.drawLine(
                line,
                time
            );
        }
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

        const ctx = this.ctx;

        ctx.save();

        ctx.font = glyph.font;
        ctx.fillStyle = glyph.color;

        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";

        let x = glyph.x;
        let y = glyph.y;

        // =========================
        // VISUAL OFFSET
        // =========================

        x += glyph.offsetX;
        y += glyph.offsetY;

        // =========================
        // TRANSFORM
        // =========================

        if (
            glyph.scaleX !== 1 ||
            glyph.scaleY !== 1 ||
            glyph.rotation !== 0
        ) {

            ctx.translate(x, y);

            ctx.rotate(glyph.rotation);

            ctx.scale(
                glyph.scaleX,
                glyph.scaleY
            );

            x = 0;
            y = 0;
        }

        // =========================
        // EFFECTS
        // =========================

        if (glyph.effect) {
            const effect = glyph.effect;

            if (effect.shake) {

                const amount =
                    effect.shake.amplitude ?? 2;

                x +=
                    (Math.random() * 2 - 1) *
                    amount;

                y +=
                    (Math.random() * 2 - 1) *
                    amount;
            }

            if (effect.wave) {


                const amplitude =
                    effect.wave.amplitude ?? 3;

                const speed =
                    effect.wave.speed ?? 5;

                var phase =
                    effect.wave.phase ?? 0;

                var phaseXRel = effect.wave.phaseX ?? 0;
                phase += phaseXRel*glyph.x; 

                y += Math.sin(
                    time * speed +
                    phase
                ) * amplitude;
            }
        }

        ctx.fillText(
            glyph.char,
            x,
            y
        );

        ctx.restore();
    }

    drawLine(line, time = 0) {
        for (const glyph of line.glyphs) {
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
