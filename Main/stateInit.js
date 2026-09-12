

function stateInit(dt){
    if (input.mouseState[0][1]){
        if(Assets.checkTextures()) {
            Assets.loadSprites();
            executingState = stateMenu;

            manager.init();

            stateMenuSetup();
        }
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