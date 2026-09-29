import React from 'react';
import { Layers, Network, ArrowRight, Scan, GitMerge, Cpu, Eye, CheckCircle2 } from 'lucide-react';

export default function ArchitectureFlow() {
  const cnnLayers = [
    { name: 'Input Layer', spec: '128 x 128 x 1', desc: 'Normalized grayscale intracranial image matrix' },
    { name: 'Conv2D (1)', spec: '32 Filters, 3x3 kernel, ReLU', desc: 'Low-level edge, gradient & tissue boundary filters' },
    { name: 'MaxPooling2D (1)', spec: '2x2 Pool, valid stride', desc: 'Downsamples spatial dimensions to 64x64' },
    { name: 'Conv2D (2)', spec: '32 Filters, 3x3 kernel, ReLU', desc: 'Extracts higher-order anatomical texture patterns' },
    { name: 'MaxPooling2D (2)', spec: '2x2 Pool, valid stride', desc: 'Downsamples spatial dimensions to 32x32' },
    { name: 'Flatten', spec: 'Dense vector of 32,768 units', desc: 'Transforms 2D feature maps into flat vector' },
    { name: 'Dense (Hidden)', spec: '128 Units, ReLU activation', desc: 'Fully connected non-linear feature integration' },
    { name: 'Dense (Softmax)', spec: '2 Units, Softmax output', desc: 'Categorical probability distribution: [Healthy, Tumor]' },
  ];

  const unetStages = [
    { title: 'Encoder Path (Contracting)', desc: '4 levels of stacked Conv2D (32 -> 64 -> 128 -> 256 -> 512) capturing contextual semantics and lesion cues.' },
    { title: 'Bottleneck Core', desc: 'Dense 512-filter feature bottleneck preserving maximum abstraction of abnormal tissue zones.' },
    { title: 'Skip Connections', desc: 'Direct concatenation links joining high-resolution encoder features with upsampled decoder layers to retain exact tumor spatial boundaries.' },
    { title: 'Decoder Path (Expansive)', desc: '4 Transposed Convolutions (Conv2DTranspose 2x2) reconstructing spatial resolution back to 64x64.' },
    { title: 'Output 1x1 Conv', desc: 'Sigmoid activation producing continuous pixel-wise probability values (0.0 to 1.0) for tumor presence.' }
  ];

  return (
    <div className="architecture-section">
      <div className="lab-header" style={{ marginBottom: '24px' }}>
        <div className="lab-title-row">
          <div>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>AI Neural Pipeline Architecture</h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Integrated multi-modal architecture combining deep convolutional classification, U-Net spatial localization, and computer vision heuristics.
            </p>
          </div>
          <span className="badge badge-cyan" style={{ padding: '6px 14px' }}>
            <Cpu size={14} /> Dual-Model Ensemble
          </span>
        </div>
      </div>

      {/* Visual Pipeline 4-Stage Banner */}
      <div className="arch-stages-grid">
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--cyan-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan-glow)' }}>
              1
            </div>
            <h4 style={{ fontSize: '0.95rem' }}>Image Normalization</h4>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Raw MRI scans are converted to grayscale and normalized. Dual branches feed 128x128 into the classifier and 64x64 into the U-Net.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
              2
            </div>
            <h4 style={{ fontSize: '0.95rem' }}>CNN Classification</h4>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            2-stage deep feature extractor determines presence of neoplasm with 99.8%+ confidence, achieving 100% validation accuracy.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #a855f7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
              3
            </div>
            <h4 style={{ fontSize: '0.95rem' }}>U-Net Segmentation</h4>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            19-layer encoder-decoder architecture with skip connections segments exact tumor mass coordinates and pixel masks.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--healthy-emerald)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6ee7b7' }}>
              4
            </div>
            <h4 style={{ fontSize: '0.95rem' }}>Morphological Boundary HUD</h4>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            OpenCV contour algorithms isolate tumor boundaries, compute bounding boxes, calculate area in cm², and render clinical heatmaps.
          </p>
        </div>
      </div>

      {/* Deep Dive: CNN Classification Model Table */}
      <div className="glass-panel arch-deepdive-panel" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Network size={20} color="var(--cyan-glow)" />
            <h3 style={{ fontSize: '1.15rem' }}>Classification Model (Sequential CNN)</h3>
          </div>
          <span className="badge badge-cyan">Model: model.json</span>
        </div>

        <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '420px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 14px' }}>Layer</th>
                <th style={{ padding: '10px 14px' }}>Configuration</th>
                <th style={{ padding: '10px 14px' }}>Functional Role</th>
              </tr>
            </thead>
            <tbody>
              {cnnLayers.map((layer, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-main)' }}>{layer.name}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', color: 'var(--cyan-glow)' }}>{layer.spec}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{layer.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Dive: U-Net Segmentation Architecture */}
      <div className="glass-panel arch-deepdive-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GitMerge size={20} color="#c084fc" />
            <h3 style={{ fontSize: '1.15rem' }}>U-Net Medical Segmentation Network</h3>
          </div>
          <span className="badge badge-cyan" style={{ background: 'rgba(168,85,247,0.15)', borderColor: 'rgba(168,85,247,0.3)', color: '#d8b4fe' }}>
            Model: segmented_model.json
          </span>
        </div>

        <div className="unet-stages-grid">
          {unetStages.map((stage, idx) => (
            <div key={idx} style={{ background: 'rgba(13,21,39,0.6)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={15} color="#c084fc" />
                {stage.title}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {stage.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
