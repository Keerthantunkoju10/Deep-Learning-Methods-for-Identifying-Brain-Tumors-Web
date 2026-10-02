# NeuroScan AI — Brain Tumor Diagnostic Platform

**NeuroScan AI** is an advanced medical artificial intelligence web platform designed for automated brain tumor detection, U-Net pixel-level spatial segmentation, and computer vision morphological boundary analysis from MRI/CT cranial scans.

Built by integrating your deep learning models with a modern fullstack architecture.

---

## 🌟 Key Features

### 1. 🔬 Deep Diagnostic Workbench
- **Instant Dual-Model Inference**:
  - **Stage 1 (Classification)**: Deep Convolutional Neural Network (CNN) detecting tumor presence with **99.8%+ confidence** and **100% validation accuracy**.
  - **Stage 2 (Segmentation)**: 19-layer **U-Net** encoder-decoder network segmenting exact neoplastic boundaries.
  - **Stage 3 (Computer Vision)**: OpenCV contour hierarchy calculating tumor pixel area, bounding coordinates, centroid localization, and tissue coverage percentage.
- **6 Real-time Radiologist View Modes**:
  1. **Contour Overlay**: Bounding box, center marker, and highlighted tumor borders.
  2. **Thermal Heatmap**: High-contrast JET colormap indicating high-density lesion zones.
  3. **Binary Mask**: Clean U-Net segmentation mask.
  4. **Original Scan**: Raw input MRI image.
  5. **Quad View**: Synchronized 4-quadrant radiologist view.
  6. **Interactive Blend Slider**: Dynamic opacity crossfade between MRI and segmented overlays.
- **Interactive Zoom & Pan**: Precision inspection of micro-features.

### 2. 📁 Sample MRI Scan Repository
- 12 pre-loaded clinical test scans ready for 1-click evaluation.
- Categorized by pathological cases vs healthy controls.

### 3. 📊 Model Training & Convergence Analytics
- Real validation and training curves extracted directly from `history.pckl`.
- Accuracy progression (climbing from 74.7% to 96.1% training / 100% validation).
- Categorical cross-entropy loss reduction curve.
- Key model performance indicators (KPIs).

### 4. 🔀 AI Pipeline & Architecture Explorer
- Layer-by-layer architectural breakdown of the Sequential CNN classifier.
- Deep dive into U-Net contracting paths, skip connections, and expanding paths.
- Computer vision morphological filter parameters.

### 5. 🏥 Hospital-Grade Clinical Report Generator
- Printable diagnostic report with patient demographics (Name, ID, Age, Modality).
- Synchronized multi-spectral imaging documentation.
- Quantified metrics table (tumor area in cm², brain coverage %, severity tier).
- Attending radiologist signature line.
- Instant 1-click **"Print Report / Save as PDF"** with clean medical paper styles.

---

## 🛠️ Technology Stack

- **Deep Learning Core**: Python 3.12, TensorFlow 2.x, `tf-keras`, OpenCV (`cv2`), NumPy, Scikit-Learn
- **Backend API**: FastAPI, Uvicorn, Python-Multipart
- **Frontend App**: React 19, Vite, Lucide Icons, Pure Vanilla CSS Design System

---

## 🚀 How to Run the Application

### Option A: One-Click Fullstack Launcher
Double click or run:
```bash
run_fullstack.bat
```
This automatically boots:
- The FastAPI engine on `http://127.0.0.1:8000`
- The Vite UI on `http://localhost:5173`

### Option B: Backend Only (FastAPI + AI Models + Built UI)
Double click or run:
```bash
run_backend.bat
```
Or from terminal:
```bash
python backend/app.py
```
*(The backend includes self-healing auto-forwarding: if run with standard Python 3.14, it automatically routes execution to the configured Python 3.12 `.venv`).*

### Option C: Manual Startup

#### Step 1: Start the Backend Server
```bash
# Using the configured virtual environment:
.\.venv\Scripts\python.exe backend/app.py

# Or using Python 3.12 launcher directly:
py -3.12 -m uvicorn app:app --port 8000 --host 127.0.0.1 --app-dir backend
```

#### Step 2: Start the Frontend UI
```bash
cd frontend
npm run dev
```

Visit **`http://localhost:5173`** for Vite dev mode or **`http://127.0.0.1:8000`** for the unified production engine.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/status` | Engine health & loaded model status |
| `GET` | `/api/samples` | List of pre-packaged test MRI scans |
| `GET` | `/api/sample-image/{name}` | Fetch a test scan thumbnail / base64 image |
| `POST` | `/api/predict` | Upload any MRI image file for full diagnostic analysis |
| `POST` | `/api/predict-sample` | Run diagnostics directly on a sample image by filename |
| `GET` | `/api/metrics` | Epoch accuracy & loss data from `history.pckl` |
| `GET` | `/api/dataset-stats` | Dataset counts and class distributions |
| `GET` | `/api/architecture` | Neural layer breakdown and parameters |
| `GET` | `/docs` | Interactive Swagger API documentation |

---

## 🌐 Cloud Deployment Guide (GitHub + Netlify + Backend)

### Step 1: Push Code to GitHub

1. **Create a new GitHub repository**:
   - Visit [github.com/new](https://github.com/new) and create a repository named `brain-tumor-ai` (choose Public or Private).

2. **Commit and push from your local terminal**:
   ```bash
   # Stage all project files
   git add .

   # Create initial commit
   git commit -m "feat: complete NeuroScan AI fullstack application"

   # Rename branch to main
   git branch -M main

   # Link your GitHub remote (replace YOUR_USERNAME and YOUR_REPO)
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

   # Push code to GitHub
   git push -u origin main
   ```

---

### Step 2: Deploy Backend to Render (Free Python Hosting)

Since Netlify hosts static frontend applications and cannot run persistent 500MB+ C-accelerated TensorFlow models, deploy the Python FastAPI backend to **Render.com** (free tier):

1. Go to [dashboard.render.com](https://dashboard.render.com) and click **"New +" → "Web Service"**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `neuroscan-backend`
   - **Environment**: `Python 3`
   - **Root Directory**: Leave blank or set `.`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && uvicorn app:app --host 0.0.0.0 --port $PORT`
4. Click **"Deploy Web Service"**.
5. Once deployed, Render will provide your public backend URL, for example:  
   `https://neuroscan-backend.onrender.com`

---

### Step 3: Deploy Frontend to Netlify

The repository is pre-configured with [`netlify.toml`](./netlify.toml) and [`frontend/public/_redirects`](./frontend/public/_redirects):

#### Option A: Netlify GitHub Integration (Continuous Deployment)
1. Go to [app.netlify.com](https://app.netlify.com) and click **"Add new site" → "Import an existing project"**.
2. Select **GitHub** and authorize your `brain-tumor-ai` repository.
3. Netlify will automatically detect the settings from `netlify.toml`:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
4. **Set Environment Variable (Connect Backend)**:
   - In the Netlify setup screen (or under **Site configuration → Environment variables**), add:
     - **Key**: `VITE_API_URL`
     - **Value**: `https://neuroscan-backend.onrender.com` (your Render backend URL)
5. Click **"Deploy Site"**. Your web application will be live at `https://your-site.netlify.app`!

#### Option B: Zero-CORS Proxy via `netlify.toml`
Alternatively, you can route all API calls through Netlify so the browser makes no cross-origin requests:
1. Open [`netlify.toml`](./netlify.toml) and uncomment the proxy rule:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://neuroscan-backend.onrender.com/api/:splat"
     status = 200
     force = true
   ```
2. Commit and push to GitHub:
   ```bash
   git add netlify.toml
   git commit -m "chore: enable Netlify backend proxy"
   git push
   ```
Netlify will automatically rebuild and route all `/api/*` requests through your custom domain!
