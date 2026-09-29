import React, { useState, useEffect } from 'react';
import { Database, PieChart, CheckCircle, AlertTriangle, Layers, FileCheck } from 'lucide-react';
import { API_BASE } from '../api';

export default function DatasetExplorer() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/dataset-stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Dataset stats fetch error:', err));
  }, []);

  return (
    <div className="dataset-section">
      <div className="lab-header" style={{ marginBottom: '24px' }}>
        <div className="lab-title-row">
          <div>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>Brain Tumor MRI Dataset Repository</h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Comprehensive breakdown of the clinical MRI dataset used for training, feature extraction, and validation.
            </p>
          </div>
          <span className="badge badge-cyan" style={{ padding: '6px 14px' }}>
            <Database size={14} /> Total Scans: {stats?.total_images || '253'}
          </span>
        </div>
      </div>

      {/* Dataset Summary Cards */}
      <div className="dataset-summary-cards">
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Images</span>
            <Database size={18} color="var(--cyan-glow)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            {stats?.total_images || 253}
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Axial and coronal brain MRI scans
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Tumor Detected</span>
            <AlertTriangle size={18} color="#f43f5e" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fda4af' }}>
            {stats?.classes?.['Tumor Detected (Yes)'] || 155}
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {stats?.ratio?.tumor_percentage || '61.3'}% of total dataset
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>No Tumor Detected</span>
            <CheckCircle size={18} color="var(--healthy-emerald)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#6ee7b7' }}>
            {stats?.classes?.['No Tumor Detected (No)'] || 98}
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {stats?.ratio?.healthy_percentage || '38.7'}% of total dataset
          </p>
        </div>
      </div>

      {/* Preprocessing Methodology */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="var(--cyan-glow)" />
          Dataset Preprocessing & Feature Normalization
        </h3>

        <div className="dataset-steps-grid">
          <div style={{ background: 'rgba(13,21,39,0.5)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '6px', color: 'var(--cyan-glow)' }}>1. Grayscale Conversion</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Removes color artifacts and standardizes diverse MRI scanner outputs into single-channel luminance intensity arrays.
            </p>
          </div>

          <div style={{ background: 'rgba(13,21,39,0.5)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '6px', color: 'var(--cyan-glow)' }}>2. Otsu Binarization</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Computes optimal clustering threshold to separate intracranial cerebral tissue from external skull and air background.
            </p>
          </div>

          <div style={{ background: 'rgba(13,21,39,0.5)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '6px', color: 'var(--cyan-glow)' }}>3. Bicubic Rescaling</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Standardizes inputs to fixed neural dimensions: 128x128 for classification network and 64x64 for U-Net spatial localization.
            </p>
          </div>

          <div style={{ background: 'rgba(13,21,39,0.5)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '6px', color: 'var(--cyan-glow)' }}>4. Zero-Mean Normalization</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Transforms pixel dynamic range via (pixel - 127.0) / 127.0 into [-1.0, 1.0] domain, accelerating gradient convergence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
