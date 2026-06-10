

function stateInit(dt){
    if (input.mouseState[0][1] && checkImages()) {
        loadSprites();
        executingState = stateMenu;

        stateMenuSetup();
    }

    stateInitDraw(ctx, mainCam);
    mainCam.lateUpdate(dt);
}

function stateInitDraw(ctx, cam = mainCam){
    ctx.save();
    ctx.translate(canvasOffsetX, canvasOffsetY);
    ctx.scale(canvasSclX, canvasSclY);
    cam.clip(ctx);
    cam.applyTransform(ctx);



    ctx.restore();

    cam.camOverlay(ctx);
}