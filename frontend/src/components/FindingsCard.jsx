import React from 'react';
import { AlertTriangle, CheckCircle, FileText, Download, Crosshair, PieChart, ShieldAlert, Cpu } from 'lucide-react';

export default function FindingsCard({ result, onOpenReport, isAnalyzing }) {
  if (isAnalyzing) {
    return (
      <div className="glass-panel findings-panel" style={{ padding: '24px', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '3px solid rgba(6, 182, 212, 0.2)',
            borderTopColor: 'var(--cyan-primary)',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <h4 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>Neural Engine Inferencing...</h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Executing 2-stage CNN feature extraction & U-Net spatial segmentation.
          </p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass-panel findings-panel" style={{ padding: '24px', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <ShieldAlert size={40} style={{ opacity: 0.4, margin: '0 auto 12px', display: 'block' }} />
          <h4 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Awaiting Scan Analysis</h4>
          <p style={{ fontSize: '0.8rem' }}>Diagnostic findings and volumetric metrics will populate here upon scanning.</p>
        </div>
      </div>
    );
  }

  const { classification, segmentation } = result;
  const hasTumor = classification.has_tumor;

  const handleDownloadOverlays = () => {
    if (!result?.images?.contours) return;
    const a = document.createElement('a');
    a.href = result.images.contours;
    a.download = `NeuroScan_${result.filename || 'scan'}_contour.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="glass-panel findings-panel">
      {/* Status Banner */}
      <div className={`finding-banner ${hasTumor ? 'tumor' : 'healthy'}`}>
        <div className="banner-header">
          <div className="banner-title">
            {hasTumor ? <AlertTriangle size={22} /> : <CheckCircle size={22} />}
            <span>{classification.prediction}</span>
          </div>
          <span className={`badge ${hasTumor ? 'badge-danger' : 'badge-success'}`}>
            {hasTumor ? 'PATHOLOGICAL' : 'CLEAR'}
          </span>
        </div>

        {/* Confidence Display */}
        <div className="confidence-display">
          <span className="confidence-val" style={{ color: hasTumor ? '#f43f5e' : '#10b981' }}>
            {classification.confidence}%
          </span>
          <span className="confidence-lbl">Neural Confidence</span>
        </div>

        {/* Probability Dual Bar */}
        <div className="prob-bar-container">
          <div className="prob-label-row">
            <span style={{ color: hasTumor ? 'var(--tumor-alert)' : 'var(--text-muted)' }}>
              Tumor: {classification.probabilities.tumor}%
            </span>
            <span style={{ color: !hasTumor ? 'var(--healthy-emerald)' : 'var(--text-muted)' }}>
              Healthy: {classification.probabilities.no_tumor}%
            </span>
          </div>
          <div className="prob-track">
            <div
              className="prob-fill-tumor"
              style={{ width: `${classification.probabilities.tumor}%` }}
            />
            <div
              className="prob-fill-healthy"
              style={{ width: `${classification.probabilities.no_tumor}%` }}
            />
          </div>
        </div>
      </div>

      {/* Volumetric Metrics Grid */}
      <div className="metrics-quad">
        <div className="metric-mini-card">
          <span className="metric-mini-label">
            <PieChart size={12} /> Tumor Mass Area
          </span>
          <span className="metric-mini-value">
            {hasTumor ? `${segmentation.total_tumor_pixels} px` : '0 px'}
          </span>
          <span className="metric-mini-sub">
            {hasTumor ? `≈ ${(segmentation.total_tumor_pixels * 0.0025).toFixed(2)} cm²` : 'Negative'}
          </span>
        </div>

        <div className="metric-mini-card">
          <span className="metric-mini-label">
            <Crosshair size={12} /> Brain Coverage
          </span>
          <span className="metric-mini-value">
            {hasTumor ? `${segmentation.tumor_coverage_percentage}%` : '0.00%'}
          </span>
          <span className="metric-mini-sub">Of intracranial space</span>
        </div>

        <div className="metric-mini-card">
          <span className="metric-mini-label">
            <Cpu size={12} /> Severity Tier
          </span>
          <span className="metric-mini-value" style={{ fontSize: '0.95rem' }}>
            {segmentation.severity_level.toUpperCase()}
          </span>
          <span className="metric-mini-sub">{segmentation.severity}</span>
        </div>

        <div className="metric-mini-card">
          <span className="metric-mini-label">
            <Crosshair size={12} /> Distinct Foci
          </span>
          <span className="metric-mini-value">
            {segmentation.regions_count}
          </span>
          <span className="metric-mini-sub">Segmented regions</span>
        </div>
      </div>

      {/* Clinical Notes Card */}
      <div className="clinical-card">
        <div className="clinical-card-title">
          <FileText size={14} color="var(--cyan-glow)" />
          Diagnostic Assessment
        </div>
        <p className="clinical-card-text">
          {segmentation.clinical_note}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="findings-actions">
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onOpenReport}>
          <FileText size={16} />
          Generate Clinical Report
        </button>

        <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleDownloadOverlays}>
          <Download size={16} />
          Export Contour Overlay
        </button>
      </div>
    </div>
  );
}
