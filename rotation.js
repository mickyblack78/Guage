// STUDIO69 3D WORKSPACE - ROTATION & MIRROR ENGINE
const bgCanvas = document.getElementById('bg-template-canvas');
const bgCtx = bgCanvas.getContext('2d');

// 3D Matrix repository to store drawn vector points for the final emulation
let drawnShapes3D = []; 

// --- 1. THE 180° COPY & INVERT LOGIC (YOUR "ONE BUTTON" TRICK) ---
function triggerCopyInvert() {
    // 1. Grab image data from current active canvas
    const currentFrame = mainCanvasToImage();
    
    // 2. Prepare temporary mirror canvas calculation
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // 3. Mirror the X-axis horizontally across the canvas matrix center
    tempCtx.translate(canvas.width, 0);
    tempCtx.scale(-1, 1);
    
    // 4. Draw original artwork onto the inverted canvas layout
    const img = new Image();
    img.src = currentFrame;
    img.onload = () => {
        tempCtx.drawImage(img, 0, 0);
        
        // 5. Switch viewport to the 180° reverse profile view
        snapToAngle(180);
        
        // 6. Commit the clean mirrored copy directly to the screen workspace
        ctx.drawImage(tempCanvas, 0, 0);
        saveState(); // Commit to undo stack tracker
        
        alert("Symmetrical 180° Reverse Map Locked Flawlessly.");
        toggleOverlay('tools'); // Auto-close menu overlay
    };
}

// Helper to convert active canvas to data URL string smoothly
function mainCanvasToImage() {
    return canvas.toDataURL();
}

// --- 2. TURNTABLE DRAWING ISOLATION MATH (179.5° FREE ORBIT LOGIC) ---
// This hook intercepts your brushes to scale input logic if drawing at an angle
function calculateAngularZ(screenX, angle) {
    const radians = (angle * Math.PI) / 180;
    // Map flat screen X coordinate into 3D Depth space depending on turntable rotation
    return screenX * Math.sin(radians);
}

// --- 3. 2D TEMPLATE CARRIER (IMPORT WITHOUT CRASHING) ---
function triggerImport() {
    // Create an invisible, safe HTML file input upload stack on the fly
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                // Clear old template backgrounds safely
                bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
                
                // Calculate scale aspect ratio to fit image centered inside viewport
                const scale = Math.min(bgCanvas.width / img.width, bgCanvas.height / img.height);
                const x = (bgCanvas.width / 2) - (img.width / 2) * scale;
                const y = (bgCanvas.height / 2) - (img.height / 2) * scale;
                
                // Render flat background guide template at 40% master opacity opacity
                bgCtx.drawImage(img, x, y, img.width * scale, img.height * scale);
                
                alert("2D Repo Trace Template Loaded into Viewport Background.");
                toggleOverlay('tools');
            };
        };
    };
    
    fileInput.click(); // Open system folder prompt file window automatically
}

// --- 4. DATA LOGIC HOOKS FOR THE FINAL BLOCK 4 GENERATION PIPELINE ---
function logActiveZoneTo3D(x1, y1, x2, y2, toolType) {
    // Reads slider settings to append true coordinates to our database
    const xMin = parseFloat(document.getElementById('slider-x-min').value);
    const xMax = parseFloat(document.getElementById('slider-x-max').value);
    const yMin = parseFloat(document.getElementById('slider-y-min').value);
    const yMax = parseFloat(document.getElementById('slider-y-max').value);
    
    drawnShapes3D.push({
        angle: currentAngle,
        points: { startX: x1, startY: y1, endX: x2, endY: y2 },
        bounds: { xMin, xMax, yMin, yMax },
        tool: toolType,
        color: brushColor,
        size: brushSize
    });
}
