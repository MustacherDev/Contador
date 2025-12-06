

function stateGame(dt){
    ctx.save();
    ctx.translate(canvasOffsetX, canvasOffsetY);
    ctx.scale(canvasSclX, canvasSclY);
    mainCam.applyTransform(ctx);

    

    ctx.restore();
}