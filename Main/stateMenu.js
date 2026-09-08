function stateMenuSetup(){
}

function stateMenu(dt){
    manager.update(dt);
    manager.pushDraw();

    stateMenuDraw(ctx, manager.mainCam);

    manager.mainCam.lateUpdate(dt);
}

function stateMenuDraw(ctx, cam = mainCam){;

    // manager.drawingCam = cam;
    
    ctx.save();

    ctx.fillStyle = manager.backgroundColor.toCSS();
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    //screenBorderManager.draw(ctx);

    ctx.translate(canvasOffsetX, canvasOffsetY);
    ctx.scale(canvasSclX, canvasSclY);
    cam.clip(ctx);
    cam.applyTransform(ctx);

    manager.drawRequests(ctx);
    manager.draw(ctx);

    ctx.restore();

    ctx.save();
    ctx.translate(canvasOffsetX, canvasOffsetY);
    ctx.scale(canvasSclX, canvasSclY);
    // manager.drawGUIRequests(ctx);
    // manager.drawGUI(ctx);

    ctx.restore();

    cam.camOverlay(ctx);
}