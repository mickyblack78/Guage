// STUDIO69 3D WORKSPACE - ENGINE CORE
const canvas = document.getElementById('main-3d-canvas');
const maskCanvas = document.getElementById('mask-zonal-canvas');
const uiCanvas = document.getElementById('temp-ui-canvas');

const ctx = canvas.getContext('2d');
const mctx = maskCanvas.getContext('2d');
const uictx = uiCanvas.getContext('2d');

let isDrawing = false;
let startX = 0, startY = 0;
let undoStack = [];
const maxUndo = 20;

// Configuration defaults tied to your original app's style
let brushColor = '#00ffff'; 
let brushSize = 5;

// Initialize and auto-resize canvas stack to match viewport
function initCanvases() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    [canvas, maskCanvas, uiCanvas].forEach(c => {
        c.width = w;
        c.height = h;
    });
    
    // Fill main canvas black initially
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, w, h);
    
    saveState();
    updateZonalMask(); // Draw initial mask
}

window.addEventListener('resize', initCanvases);
window.addEventListener('load', initCanvases);

// --- UNDO ENGINE ---
function saveState() {
    if (undoStack.length >= maxUndo) undoStack.shift();
    undoStack.push(canvas.toDataURL());
}

function performUndo() {
    if (undoStack.length > 1) {
        undoStack.pop(); // Remove current state
        const img = new Image();
        img.src = undoStack[undoStack.length - 1];
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }
}

// --- DRAWING PIPELINE (WITH ISOLATION CHECK) ---
function getPos(e) {
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX, y: t.clientY };
}

function isInsideActiveZone(x, y) {
    const xMin = (document.getElementById('slider-x-min').value / 100) * canvas.width;
    const xMax = (document.getElementById('slider-x-max').value / 100) * canvas.width;
    const yMin = (document.getElementById('slider-y-min').value / 100) * canvas.height;
    const yMax = (document.getElementById('slider-y-max').value / 100) * canvas.height;
    
    return (x >= xMin && x <= xMax && y >= yMin && y <= yMax);
}

function startDraw(e) {
    const pos = getPos(e);
    // Lock actions out completely if clicked outside editable boundaries
    if (!isInsideActiveZone(pos.x, pos.y)) return;
    
    isDrawing = true;
    startX = pos.x;
    startY = pos.y;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
}

function draw(e) {
    if (!isDrawing) return;
    const pos = getPos(e);
    
    // Dynamically throttle drawing input outside active sliders
    if (!isInsideActiveZone(pos.x, pos.y)) {
        stopDraw();
        return;
    }
    
    if (activeTool === 'BRUSH' || activeTool === 'ERASER') {
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = (activeTool === 'ERASER') ? '#050505' : brushColor;
        
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    } else if (activeTool === 'LINE') {
        // Draw real-time alignment line guide on UI layer
        uictx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
        uictx.beginPath();
        uictx.strokeStyle = brushColor;
        uictx.lineWidth = 2;
        uictx.setLineDash([6, 4]); // Clean tech crosshair dash look
        uictx.moveTo(startX, startY);
        uictx.lineTo(pos.x, pos.y);
        uictx.stroke();
    }
}

function stopDraw(e) {
    if (!isDrawing) return;
    isDrawing = false;
    
    // Commit the temporary dashed guide line permanently if using LINE tool
    if (activeTool === 'LINE' && e) {
        const pos = getPos(e);
        if (isInsideActiveZone(pos.x, pos.y)) {
            ctx.beginPath();
            ctx.strokeStyle = brushColor;
            ctx.lineWidth = brushSize;
            ctx.setLineDash([]); // Reset to solid
            ctx.moveTo(startX, startY);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        }
    }
    uictx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
    saveState();
}

// Attach listeners cleanly to viewport to allow multi-touch tracking
uiCanvas.addEventListener('mousedown', startDraw);
uiCanvas.addEventListener('mousemove', draw);
uiCanvas.addEventListener('mouseup', stopDraw);
uiCanvas.addEventListener('touchstart', startDraw);
uiCanvas.addEventListener('touchmove', draw);
uiCanvas.addEventListener('touchend', stopDraw);


// --- THE 25% GREYED-OUT DYNAMIC MASK ENGINE ---
function updateZonalMask() {
    const w = maskCanvas.width;
    const h = maskCanvas.height;
    
    mctx.clearRect(0, 0, w, h);
    
    // Calculate pixel coordinates from slider percentages
    const xMin = (document.getElementById('slider-x-min').value / 100) * w;
    const xMax = (document.getElementById('slider-x-max').value / 100) * w;
    const yMin = (document.getElementById('slider-y-min').value / 100) * h;
    const yMax = (document.getElementById('slider-y-max').value / 100) * h;
    
    // 1. Draw global 25% visibility mask layout over canvas
    mctx.fillStyle = 'rgba(5, 5, 5, 0.75)'; // Exact 25% transparency pass
    mctx.fillRect(0, 0, w, h);
    
    // 2. Punch a crystal clear hole right through the active box coordinates
    mctx.clearRect(xMin, yMin, xMax - xMin, yMax - yMin);
    
    // 3. Draw clean neon frame border lines around the active window box cut
    mctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
    mctx.lineWidth = 1;
    mctx.strokeRect(xMin, yMin, xMax - xMin, yMax - yMin);
}

// Reset wrapper function to link back to core tracking display
function clearCanvas() {
    if(confirm("Clear workspace canvas repository?")) {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveState();
    }
}
