import os
import cv2
import numpy as np
import base64
import pickle
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
import tf_keras as keras
from tf_keras.models import model_from_json

# Resolve paths with robust multi-directory lookup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CANDIDATE_ROOTS = [
    os.path.abspath(os.path.join(BASE_DIR, "..", "BrainTumor")),
    os.path.abspath(os.path.join(BASE_DIR, "..")),
    os.path.abspath(os.path.join(BASE_DIR, "BrainTumor")),
    os.getcwd(),
]

def resolve_project_dir(sub_name: str) -> str:
    for root in CANDIDATE_ROOTS:
        candidate = os.path.join(root, sub_name)
        if os.path.exists(candidate) and os.path.isdir(candidate):
            return candidate
    return os.path.join(CANDIDATE_ROOTS[0], sub_name)

PROJECT_DIR = CANDIDATE_ROOTS[0]
MODEL_DIR = resolve_project_dir("Model")
TEST_IMAGES_DIR = resolve_project_dir("testImages")
DATASET_DIR = resolve_project_dir("brain_tumor_dataset")

print(f"[INFO] TEST_IMAGES_DIR resolved to: {TEST_IMAGES_DIR} (Exists: {os.path.exists(TEST_IMAGES_DIR)})")

app = FastAPI(
    title="NeuroScan AI - Brain Tumor Diagnostics API",
    description="Fullstack AI diagnostic backend powered by CNN classification, U-Net segmentation, and computer vision edge detection.",
    version="2.0.0"
)

# Enable CORS for frontend development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model references
classifier_model = None
segmentation_model = None
history_data = None
disease_classes = ["No Tumor Detected", "Tumor Detected"]

def load_models():
    global classifier_model, segmentation_model, history_data
    try:
        # Load Classification Model
        clf_json_path = os.path.join(MODEL_DIR, "model.json")
        clf_weights_path = os.path.join(MODEL_DIR, "model_weights.h5")
        if os.path.exists(clf_json_path) and os.path.exists(clf_weights_path):
            with open(clf_json_path, "r") as f:
                classifier_model = model_from_json(f.read())
            classifier_model.load_weights(clf_weights_path)
            print("[INFO] Classifier Model successfully loaded.")
        else:
            print("[WARN] Classifier model files not found at:", MODEL_DIR)

        # Load Segmentation Model
        seg_json_path = os.path.join(MODEL_DIR, "segmented_model.json")
        seg_weights_path = os.path.join(MODEL_DIR, "segmented_weights.h5")
        if os.path.exists(seg_json_path) and os.path.exists(seg_weights_path):
            with open(seg_json_path, "r") as f:
                segmentation_model = model_from_json(f.read())
            segmentation_model.load_weights(seg_weights_path)
            print("[INFO] Segmentation Model successfully loaded.")
        else:
            print("[WARN] Segmentation model files not found at:", MODEL_DIR)

        # Load Training History
        hist_path = os.path.join(MODEL_DIR, "history.pckl")
        if os.path.exists(hist_path):
            with open(hist_path, "rb") as f:
                history_data = pickle.load(f)
            print("[INFO] Training history successfully loaded.")
    except Exception as e:
        print("[ERROR] Failed to load models:", e)

# Trigger model load on startup
@app.on_event("startup")
async def startup_event():
    load_models()

def image_to_base64(img_bgr: np.ndarray, format: str = ".png") -> str:
    """Encodes an OpenCV image to a base64 Data URI."""
    success, buffer = cv2.imencode(format, img_bgr)
    if not success:
        return ""
    b64_str = base64.b64encode(buffer).decode("utf-8")
    mime = "image/png" if format == ".png" else "image/jpeg"
    return f"data:{mime};base64,{b64_str}"

def process_mri_analysis(img_bytes: bytes, filename: str = "scan.jpg") -> Dict[str, Any]:
    """
    Executes the comprehensive 3-stage diagnostic pipeline:
    1. CNN Classification (Tumor vs No Tumor + confidence scores)
    2. U-Net Segmentation (Pixel-level localization & mask prediction)
    3. Computer Vision Morphological Contour & Edge Detection + Heatmap
    """
    if classifier_model is None or segmentation_model is None:
        raise HTTPException(status_code=503, detail="AI Diagnostic models are not fully initialized.")

    # Decode bytes to OpenCV image
    nparr = np.frombuffer(img_bytes, np.uint8)
    img_color = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img_gray = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)

    if img_color is None or img_gray is None:
        raise HTTPException(status_code=400, detail="Invalid image file or format.")

    # Dimensions
    orig_h, orig_w = img_gray.shape[:2]

    # STAGE 1: CLASSIFICATION
    # ---------------------------------------------
    clf_resized = cv2.resize(img_gray, (128, 128))
    clf_input = clf_resized.reshape(1, 128, 128, 1).astype(np.float32)
    clf_predictions = classifier_model.predict(clf_input, verbose=0)[0]
    
    predicted_class = int(np.argmax(clf_predictions))
    p_no_tumor = float(clf_predictions[0])
    p_tumor = float(clf_predictions[1])
    confidence = float(clf_predictions[predicted_class])
    has_tumor = (predicted_class == 1)

    # STAGE 2: SEGMENTATION
    # ---------------------------------------------
    seg_resized = cv2.resize(img_gray, (64, 64), interpolation=cv2.INTER_CUBIC)
    seg_input = seg_resized.reshape(1, 64, 64, 1).astype(np.float32)
    seg_input = (seg_input - 127.0) / 127.0
    seg_pred = segmentation_model.predict(seg_input, verbose=0)[0]  # Shape: (64, 64, 1)

    # Upsample segmentation mask to standard 300x300 working canvas
    canvas_size = (300, 300)
    orig_canvas = cv2.resize(img_color, canvas_size, interpolation=cv2.INTER_CUBIC)
    mask_canvas = cv2.resize(seg_pred, canvas_size, interpolation=cv2.INTER_CUBIC)
    
    # 8-bit single channel mask
    mask_uint8 = np.uint8(np.clip(mask_canvas * 255.0, 0, 255))

    # STAGE 3: CONTOUR EXTRACTION & EDGE DETECTION
    # ---------------------------------------------
    # Threshold at 30 as established in original code
    _, thresh = cv2.threshold(mask_uint8, 30, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

    min_area_thresh = 0.95 * 180 * 35  # ~5985 px threshold from original code
    max_area_thresh = 1.05 * 180 * 35  # ~6615 px threshold

    contour_overlay = orig_canvas.copy()
    regions = []
    total_tumor_pixels = 0
    max_contour_area = 0.0

    for idx, c in enumerate(contours):
        area = float(cv2.contourArea(c))
        if area > 15:  # filter negligible speckles
            total_tumor_pixels += area
            if area > max_contour_area:
                max_contour_area = area

            x, y, w, h = cv2.boundingRect(c)
            M = cv2.moments(c)
            cx = int(M["m10"] / M["m00"]) if M["m00"] != 0 else x + w // 2
            cy = int(M["m01"] / M["m00"]) if M["m00"] != 0 else y + h // 2

            # Highlight logic
            is_critical = (area > min_area_thresh and area < max_area_thresh) or (has_tumor and area > 100)
            contour_color = (0, 255, 255) if is_critical else (0, 0, 255)  # Yellow vs Red (BGR)
            
            # Draw precise contour & bounding indicator
            cv2.drawContours(contour_overlay, [c], -1, contour_color, 2)
            cv2.rectangle(contour_overlay, (x, y), (x + w, y + h), (0, 255, 255), 1)
            cv2.circle(contour_overlay, (cx, cy), 3, (0, 255, 0), -1)

            regions.append({
                "region_id": idx + 1,
                "area_px": round(area, 1),
                "bbox": {"x": int(x), "y": int(y), "w": int(w), "h": int(h)},
                "centroid": {"x": cx, "y": cy},
                "is_primary": False
            })

    # Mark the largest region as primary
    if regions:
        largest_region = max(regions, key=lambda r: r["area_px"])
        largest_region["is_primary"] = True

    # Brain area approximation for coverage calculation
    _, brain_thresh = cv2.threshold(cv2.cvtColor(orig_canvas, cv2.COLOR_BGR2GRAY), 20, 255, cv2.THRESH_BINARY)
    brain_pixel_count = max(float(cv2.countNonZero(brain_thresh)), 1.0)
    tumor_coverage_pct = min(round((total_tumor_pixels / brain_pixel_count) * 100, 2), 100.0)

    # STAGE 4: VISUAL OVERLAYS & COLOR MAPS
    # ---------------------------------------------
    # Heatmap overlay: JET colormap on mask
    heatmap_colored = cv2.applyColorMap(mask_uint8, cv2.COLORMAP_JET)
    heatmap_overlay = cv2.addWeighted(orig_canvas, 0.60, heatmap_colored, 0.40, 0)

    # Mask in 3-channel BGR for visualization
    mask_bgr = cv2.cvtColor(mask_uint8, cv2.COLOR_GRAY2BGR)

    # Side-by-side composite comparison
    # [Original | Heatmap | Contour Overlay]
    composite_w = 300 * 3
    composite = np.zeros((300, composite_w, 3), dtype=np.uint8)
    composite[:, 0:300] = orig_canvas
    composite[:, 300:600] = heatmap_overlay
    composite[:, 600:900] = contour_overlay

    # Severity Assessment
    if not has_tumor or total_tumor_pixels < 50:
        severity = "Normal / Negative"
        severity_level = "low"
        clinical_note = "No neoplastic mass or hyper-intense abnormal tissue detected by neural classifier."
    elif total_tumor_pixels < 800:
        severity = "Mild / Early Stage Mass"
        severity_level = "medium"
        clinical_note = "Localized abnormal lesion segmented with minor mass effect. Correlate with contrast MRI."
    elif total_tumor_pixels < 2500:
        severity = "Moderate Sized Neoplasm"
        severity_level = "high"
        clinical_note = "Distinct neoplastic boundary detected with notable volume. Clinical evaluation recommended."
    else:
        severity = "Significant / Large Volume Mass"
        severity_level = "critical"
        clinical_note = "Substantial tumor volume segmented with elevated mass effect. Urgent neuro-oncology review advised."

    # Convert generated images to Base64
    return {
        "filename": filename,
        "classification": {
            "prediction": disease_classes[predicted_class],
            "class_index": predicted_class,
            "has_tumor": has_tumor,
            "confidence": round(confidence * 100, 2),
            "probabilities": {
                "no_tumor": round(p_no_tumor * 100, 2),
                "tumor": round(p_tumor * 100, 2)
            }
        },
        "segmentation": {
            "tumor_detected": has_tumor and total_tumor_pixels > 20,
            "total_tumor_pixels": round(total_tumor_pixels, 1),
            "tumor_coverage_percentage": tumor_coverage_pct,
            "regions_count": len(regions),
            "regions": regions,
            "severity": severity,
            "severity_level": severity_level,
            "clinical_note": clinical_note
        },
        "images": {
            "original": image_to_base64(orig_canvas),
            "mask": image_to_base64(mask_bgr),
            "heatmap": image_to_base64(heatmap_overlay),
            "contours": image_to_base64(contour_overlay),
            "composite": image_to_base64(composite)
        },
        "metadata": {
            "original_dimensions": {"width": orig_w, "height": orig_h},
            "processed_dimensions": {"width": 300, "height": 300},
            "timestamp": None
        }
    }

# ----------------- API ROUTES ----------------- #

@app.get("/api/status")
def get_system_status():
    """Returns AI model loading status and environment metrics."""
    return {
        "status": "online",
        "models": {
            "classifier_ready": classifier_model is not None,
            "segmentation_ready": segmentation_model is not None,
            "training_history_ready": history_data is not None
        },
        "system": {
            "keras_backend": "tf_keras",
            "framework": "TensorFlow 2.x + OpenCV",
            "classes": disease_classes
        }
    }

@app.get("/api/samples")
def list_sample_images():
    """Returns list of pre-packaged test images for instant evaluation."""
    if not os.path.exists(TEST_IMAGES_DIR):
        return {"samples": []}
    
    files = sorted([f for f in os.listdir(TEST_IMAGES_DIR) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
    samples = []
    
    for f in files:
        fpath = os.path.join(TEST_IMAGES_DIR, f)
        stat = os.stat(fpath)
        samples.append({
            "filename": f,
            "size_kb": round(stat.st_size / 1024, 1),
            "url": f"/api/sample-image/{f}"
        })
    return {"samples": samples}

@app.get("/api/sample-image/{filename}")
def get_sample_image(filename: str, format: Optional[str] = None):
    """Fetches a specific sample image from testImages and returns the binary image file (or Base64 if format='base64')."""
    safe_filename = os.path.basename(filename)
    fpath = os.path.join(TEST_IMAGES_DIR, safe_filename)
    if not os.path.exists(fpath):
        raise HTTPException(status_code=404, detail=f"Sample image '{safe_filename}' not found.")
    
    if format == "base64":
        img = cv2.imread(fpath)
        if img is None:
            raise HTTPException(status_code=500, detail="Failed to read sample image.")
        return {
            "filename": safe_filename,
            "image": image_to_base64(img)
        }

    ext = os.path.splitext(safe_filename)[1].lower()
    media_type = "image/jpeg"
    if ext == ".png":
        media_type = "image/png"
    elif ext in [".tif", ".tiff"]:
        media_type = "image/tiff"
    elif ext == ".webp":
        media_type = "image/webp"

    return FileResponse(
        fpath,
        media_type=media_type,
        headers={
            "Cache-Control": "public, max-age=86400",
            "Access-Control-Allow-Origin": "*"
        }
    )

class PredictSampleRequest(BaseModel):
    filename: str

@app.post("/api/predict-sample")
def predict_sample_scan(payload: PredictSampleRequest):
    """Runs full diagnostics directly on a sample image by filename."""
    safe_filename = os.path.basename(payload.filename)
    fpath = os.path.join(TEST_IMAGES_DIR, safe_filename)
    if not os.path.exists(fpath):
        raise HTTPException(status_code=404, detail=f"Sample scan '{safe_filename}' not found.")
    
    with open(fpath, "rb") as f:
        img_bytes = f.read()
    
    return process_mri_analysis(img_bytes, filename=safe_filename)

@app.post("/api/predict")
async def predict_uploaded_scan(file: UploadFile = File(...)):
    """Uploads and analyzes an MRI scan image."""
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    
    return process_mri_analysis(contents, filename=file.filename)

@app.get("/api/metrics")
def get_model_metrics():
    """Returns training accuracy, loss curves, and validation benchmarks from history.pckl."""
    if history_data is None:
        raise HTTPException(status_code=404, detail="Training history data not available.")
    
    # Process history numbers into JSON-serializable floats
    acc = [float(x) for x in history_data.get("accuracy", [])]
    loss = [float(x) for x in history_data.get("loss", [])]
    val_acc = [float(x) for x in history_data.get("val_accuracy", [])]
    val_loss = [float(x) for x in history_data.get("val_loss", [])]
    
    epochs = list(range(1, len(acc) + 1))

    return {
        "epochs": epochs,
        "accuracy": acc,
        "loss": loss,
        "val_accuracy": val_acc,
        "val_loss": val_loss,
        "summary": {
            "final_train_accuracy": round(acc[-1] * 100, 2) if acc else 0,
            "final_val_accuracy": round(val_acc[-1] * 100, 2) if val_acc else 0,
            "final_train_loss": round(loss[-1], 4) if loss else 0,
            "final_val_loss": round(val_loss[-1], 4) if val_loss else 0,
            "peak_val_accuracy": round(max(val_acc) * 100, 2) if val_acc else 0
        }
    }

@app.get("/api/dataset-stats")
def get_dataset_stats():
    """Returns dataset summary counts and class breakdowns."""
    yes_dir = os.path.join(DATASET_DIR, "yes")
    no_dir = os.path.join(DATASET_DIR, "no")

    yes_count = len(os.listdir(yes_dir)) if os.path.exists(yes_dir) else 0
    no_count = len(os.listdir(no_dir)) if os.path.exists(no_dir) else 0
    total = yes_count + no_count

    return {
        "total_images": total,
        "classes": {
            "Tumor Detected (Yes)": yes_count,
            "No Tumor Detected (No)": no_count
        },
        "ratio": {
            "tumor_percentage": round((yes_count / total) * 100, 1) if total > 0 else 0,
            "healthy_percentage": round((no_count / total) * 100, 1) if total > 0 else 0
        }
    }

@app.get("/api/architecture")
def get_architecture_summary():
    """Provides structured pipeline and layer details for both models."""
    return {
        "pipeline": [
            {
                "step": 1,
                "name": "Input MRI Normalization",
                "description": "Standardizes raw MRI/X-ray scans into normalized grayscale matrices."
            },
            {
                "step": 2,
                "name": "CNN Deep Classifier",
                "input_shape": [128, 128, 1],
                "description": "2-stage Conv2D + MaxPooling2D feature extractor followed by Dense 128 and Softmax 2-class classification."
            },
            {
                "step": 3,
                "name": "U-Net Morphological Segmentation",
                "input_shape": [64, 64, 1],
                "description": "Deep encoder-decoder network with skip connections to extract spatial tumor masks."
            },
            {
                "step": 4,
                "name": "Computer Vision Contour & Boundary HUD",
                "description": "Calculates tumor area, bounding coordinates, centroid localization, and generates color-coded diagnostic overlays."
            }
        ],
        "classifier_layers": [
            {"type": "Conv2D", "filters": 32, "kernel": "3x3", "activation": "ReLU"},
            {"type": "MaxPooling2D", "pool_size": "2x2"},
            {"type": "Conv2D", "filters": 32, "kernel": "3x3", "activation": "ReLU"},
            {"type": "MaxPooling2D", "pool_size": "2x2"},
            {"type": "Flatten", "params": "Dense vector conversion"},
            {"type": "Dense", "units": 128, "activation": "ReLU"},
            {"type": "Dense (Output)", "units": 2, "activation": "Softmax"}
        ]
    }

# Mount static frontend build if present
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

FRONTEND_DIST = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend", "dist"))
if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

if __name__ == "__main__":
    import uvicorn
    print("[INFO] Starting NeuroScan AI backend on http://127.0.0.1:8000 ...")
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
