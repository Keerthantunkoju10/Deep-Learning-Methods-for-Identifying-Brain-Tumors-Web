import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Filter, CheckCircle, AlertTriangle, FileImage } from 'lucide-react';
import { API_BASE } from '../api';

export default function SampleGallery({ onSelectSample }) {
  const [samples, setSamples] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Sample metadata annotations for curated exploration
  const sampleMeta = {
    '1.jpg': { type: 'Healthy', desc: 'Symmetrical cerebral hemispheres, no mass effect.' },
    '2.jpg': { type: 'Tumor', desc: 'Prominent hyperintense mass in right cerebral hemisphere.' },
    '3.jpg': { type: 'Tumor', desc: 'Neoplastic lesion with surrounding edema.' },
    '4.JPG': { type: 'Tumor', desc: 'Circumscribed intracranial tumor focus.' },
    '5.jpg': { type: 'Healthy', desc: 'Unremarkable brain parenchyma, normal ventricles.' },
    '6.jpg': { type: 'Healthy', desc: 'Clear ventricular margins, negative for neoplasm.' },
    '7.JPG': { type: 'Tumor', desc: 'Significant mass lesion with midline shift.' },
    '8.jpg': { type: 'Healthy', desc: 'Normal axial T1-weighted cranial MRI scan.' },
    '9.jpg': { type: 'Tumor', desc: 'Hyperintense temporal lobe mass lesion.' },
    '10.JPG': { type: 'Tumor', desc: 'Frontal lobe neoplasm with irregular boundaries.' },
    '11.jpg': { type: 'Healthy', desc: 'Clear cranial vault, no lesions or edema.' },
    '12.png': { type: 'Tumor', desc: 'High-attenuation cranial mass lesion.' },
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/samples`)
      .then(res => res.json())
      .then(data => {
        setSamples(data.samples || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load samples:', err);
        setLoading(false);
      });
  }, []);

  const filteredSamples = samples.filter(s => {
    const meta = sampleMeta[s.filename];
    if (filter === 'tumor') return meta?.type === 'Tumor';
    if (filter === 'healthy') return meta?.type === 'Healthy';
    return true;
  });

  return (
    <div className="sample-gallery-section">
      <div className="lab-header" style={{ marginBottom: '16px' }}>
        <div className="lab-title-row">
          <div>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>Sample MRI Library</h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Curated clinical test repository. Select any scan below for immediate automated neural inference and segmentation.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="gallery-filter-bar">
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>FILTER:</span>
            <button
              className={`sample-chip ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Scans ({samples.length})
            </button>
            <button
              className={`sample-chip ${filter === 'tumor' ? 'active' : ''}`}
              onClick={() => setFilter('tumor')}
            >
              <AlertTriangle size={12} color="#f43f5e" />
              Pathological Cases
            </button>
            <button
              className={`sample-chip ${filter === 'healthy' ? 'active' : ''}`}
              onClick={() => setFilter('healthy')}
            >
              <CheckCircle size={12} color="#10b981" />
              Healthy Scans
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid rgba(6,182,212,0.2)',
            borderTopColor: 'var(--cyan-primary)',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading MRI scan library...</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {filteredSamples.map(sample => {
            const meta = sampleMeta[sample.filename] || { type: 'MRI Scan', desc: 'Axial cranial examination' };
            const isTumor = meta.type === 'Tumor';

            return (
              <div key={sample.filename} className="sample-card">
                <div className="sample-thumb-wrap">
                  <img
                    src={`${API_BASE}/api/sample-image/${sample.filename}`}
                    alt={sample.filename}
                    loading="lazy"
                    onError={(e) => {
                      console.warn(`Failed to load image for: ${sample.filename}`);
                    }}
                  />
                  <span
                    className={`badge ${isTumor ? 'badge-danger' : 'badge-success'}`}
                    style={{ position: 'absolute', top: '10px', right: '10px' }}
                  >
                    {meta.type}
                  </span>
                </div>

                <div className="sample-card-body">
                  <div>
                    <div className="sample-card-title">{sample.filename}</div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                      {meta.desc}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Size: {sample.size_kb} KB
                    </span>

                    <button
                      className="btn-primary"
                      style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                      onClick={() => onSelectSample(sample.filename)}
                    >
                      <Play size={13} />
                      Diagnose
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
