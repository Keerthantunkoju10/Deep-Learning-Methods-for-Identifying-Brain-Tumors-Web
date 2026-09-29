import React, { useState, useRef } from 'react';
import { Layers, Flame, Eye, Grid, Sliders, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

export default function ImageViewer({ result, isAnalyzing }) {
  const [viewMode, setViewMode] = useState('contours'); // 'contours' | 'heatmap' | 'mask' | 'original' | 'quad' | 'blend'
  const [blendAlpha, setBlendAlpha] = useState(0.5);
  const [zoomLevel, setZoomLevel] = useState(1);
  const canvasRef = useRef(null);

  if (!result && !isAnalyzing) {
    return (
      <div className="glass-panel viewer-panel" style={{ alignItems: 'center', justifyContent: 'center', padding: '60px 20px', minHeight: '480px' }}>
        <div style={{ textAlign: 'center', maxWidth: '380px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--cyan-primary)' }}>
            <Layers size={32} />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Radiology Screen Ready</h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Upload an MRI scan or select a pre-loaded sample from above to trigger neural segmentation and classification.
          </p>
        </div>
      </div>
    );
  }

  const handleZoom = (delta) => {
    setZoomLevel(prev => Math.min(Math.max(0.8, prev + delta), 2.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  // Determine which image to render
  const getImageSrc = () => {
    if (!result?.images) return null;
    switch (viewMode) {
      case 'heatmap':
        return result.images.heatmap || null;
      case 'mask':
        return result.images.mask || null;
      case 'original':
        return result.images.original || null;
      case 'contours':
      default:
        return result.images.contours || null;
    }
  };

  return (
    <div className="glass-panel viewer-panel">
      {/* Top Control Bar */}
      <div className="viewer-top-bar">
        {/* View Mode Tabs */}
        <div className="view-mode-tabs">
          <button
            className={`view-mode-btn ${viewMode === 'contours' ? 'active' : ''}`}
            onClick={() => setViewMode('contours')}
            title="Tumor Boundary & Contour Overlay"
          >
            <Layers size={14} />
            Contours
          </button>

          <button
            className={`view-mode-btn ${viewMode === 'heatmap' ? 'active' : ''}`}
            onClick={() => setViewMode('heatmap')}
            title="Thermal Density Heatmap"
          >
            <Flame size={14} />
            Heatmap
          </button>

          <button
            className={`view-mode-btn ${viewMode === 'mask' ? 'active' : ''}`}
            onClick={() => setViewMode('mask')}
            title="Binary Segmentation Mask"
          >
            <Eye size={14} />
            Mask
          </button>

          <button
            className={`view-mode-btn ${viewMode === 'original' ? 'active' : ''}`}
            onClick={() => setViewMode('original')}
            title="Original MRI Scan"
          >
            Original
          </button>

          <button
            className={`view-mode-btn ${viewMode === 'quad' ? 'active' : ''}`}
            onClick={() => setViewMode('quad')}
            title="Synchronized Quad View"
          >
            <Grid size={14} />
            Quad
          </button>

          <button
            className={`view-mode-btn ${viewMode === 'blend' ? 'active' : ''}`}
            onClick={() => setViewMode('blend')}
            title="Interactive Alpha Blending"
          >
            <Sliders size={14} />
            Blend
          </button>
        </div>

        {/* Zoom & Screen Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button className="btn-ghost" onClick={() => handleZoom(-0.2)} title="Zoom Out">
            <ZoomOut size={16} />
          </button>
          <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', minWidth: '42px', textAlign: 'center' }}>
            {Math.round(zoomLevel * 100)}%
          </span>
          <button className="btn-ghost" onClick={() => handleZoom(0.2)} title="Zoom In">
            <ZoomIn size={16} />
          </button>
          <button className="btn-ghost" onClick={handleResetZoom} title="Reset View">
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="viewer-canvas-area" ref={canvasRef}>
        {/* Animated Laser Scanning Bar when analyzing */}
        {isAnalyzing && <div className="scanning-laser" />}

        {/* View Mode: QUAD GRID */}
        {viewMode === 'quad' && result?.images ? (
          <div className="quad-grid" style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease' }}>
            <div className="quad-item">
              <span className="quad-label">Original MRI</span>
              <img src={result.images.original} alt="Original Scan" />
            </div>
            <div className="quad-item">
              <span className="quad-label">Contour Detection</span>
              <img src={result.images.contours} alt="Contours" />
            </div>
            <div className="quad-item">
              <span className="quad-label">U-Net Mask</span>
              <img src={result.images.mask} alt="Segmentation Mask" />
            </div>
            <div className="quad-item">
              <span className="quad-label">Thermal Heatmap</span>
              <img src={result.images.heatmap} alt="Heatmap" />
            </div>
          </div>
        ) : viewMode === 'blend' && result?.images ? (
          /* View Mode: ALPHA BLEND OVERLAY */
          <div style={{ position: 'relative', display: 'inline-block', transform: `scale(${zoomLevel})` }}>
            <img
              src={result.images.original}
              alt="Original MRI"
              className="mri-display-image"
            />
            <img
              src={result.images.heatmap}
              alt="Heatmap Overlay"
              className="mri-display-image"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: blendAlpha,
                mixBlendMode: 'screen',
                pointerEvents: 'none'
              }}
            />
            {/* Blend Slider Overlay HUD */}
            <div className="blend-slider-wrapper">
              <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)' }}>MRI</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={blendAlpha}
                onChange={(e) => setBlendAlpha(parseFloat(e.target.value))}
                className="blend-slider"
              />
              <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--cyan-glow)' }}>HEATMAP</span>
            </div>
          </div>
        ) : (
          /* View Mode: SINGLE HIGH-RES DISPLAY */
          <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease' }}>
            {getImageSrc() && (
              <img
                src={getImageSrc()}
                alt="Brain MRI Visualization"
                className="mri-display-image"
              />
            )}
            {/* HUD Scan Timestamp Tag */}
            <div style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              maxWidth: 'calc(100% - 16px)',
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(6px)',
              padding: '3px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              color: 'var(--cyan-glow)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              SCAN: {result?.filename || 'SCAN-INPUT.JPG'} • 300x300 RES
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
