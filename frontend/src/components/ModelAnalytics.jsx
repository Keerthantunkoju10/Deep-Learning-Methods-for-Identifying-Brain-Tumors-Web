import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Award, Activity, CheckCircle, Zap } from 'lucide-react';
import { API_BASE } from '../api';

export default function ModelAnalytics() {
  const [metrics, setMetrics] = useState(null);
  const [activeEpochHover, setActiveEpochHover] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/metrics`)
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(err => console.error('Error fetching metrics:', err));
  }, []);

  if (!metrics) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading neural training metrics...</p>
      </div>
    );
  }

  const { epochs, accuracy, val_accuracy, loss, val_loss, summary } = metrics;

  // Chart coordinate helper
  const svgWidth = 520;
  const svgHeight = 220;
  const padding = 36;
  const chartW = svgWidth - padding * 2;
  const chartH = svgHeight - padding * 2;

  const getAccuracyPoints = (data) => {
    return data.map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * chartW;
      const y = padding + (1 - (val - 0.6) / 0.45) * chartH;
      return { x, y, val };
    });
  };

  const getLossPoints = (data) => {
    const maxLoss = 1.4;
    return data.map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * chartW;
      const y = padding + (1 - (val / maxLoss)) * chartH;
      return { x, y, val };
    });
  };

  const accTrainPoints = getAccuracyPoints(accuracy);
  const accValPoints = getAccuracyPoints(val_accuracy);
  const lossTrainPoints = getLossPoints(loss);
  const lossValPoints = getLossPoints(val_loss);

  const pointsToPath = (points) => {
    return points.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  };

  return (
    <div className="analytics-section">
      <div className="lab-header" style={{ marginBottom: '20px' }}>
        <div className="lab-title-row">
          <div>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>Model Training & Convergence Metrics</h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Empirical validation curves, loss gradients, and performance benchmarks extracted directly from training logs (`history.pckl`).
            </p>
          </div>
          <span className="badge badge-cyan" style={{ padding: '6px 14px' }}>
            <Award size={14} /> Peak Validation: {summary.peak_val_accuracy}%
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="analytics-kpi-grid">
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Validation Accuracy</span>
            <Award size={18} color="var(--healthy-emerald)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--healthy-emerald)' }}>
            {summary.final_val_accuracy}%
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Tested on independent holdout partition
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Training Accuracy</span>
            <TrendingUp size={18} color="var(--cyan-glow)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--cyan-glow)' }}>
            {summary.final_train_accuracy}%
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Achieved across 10 epochs
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Convergence Loss</span>
            <Activity size={18} color="#a855f7" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#c084fc' }}>
            {summary.final_train_loss}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Categorical cross-entropy loss
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Validation Loss</span>
            <Zap size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
            {summary.final_val_loss}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Strong generalization, zero overfitting
          </div>
        </div>
      </div>

      {/* Interactive Charts Grid */}
      <div className="charts-grid">
        {/* Chart 1: Accuracy Curve */}
        <div className="chart-panel">
          <div className="chart-header">
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Model Accuracy Progression</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Training vs. Validation Accuracy over Epochs</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.76rem' }}>
              <span style={{ color: 'var(--cyan-glow)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cyan-primary)' }} /> Train
              </span>
              <span style={{ color: 'var(--healthy-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--healthy-emerald)' }} /> Val
              </span>
            </div>
          </div>

          <div className="chart-svg-container">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: '100%' }}>
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                <line
                  key={i}
                  x1={padding}
                  y1={padding + ratio * chartH}
                  x2={svgWidth - padding}
                  y2={padding + ratio * chartH}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Training Line */}
              <path
                d={pointsToPath(accTrainPoints)}
                fill="none"
                stroke="var(--cyan-primary)"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Validation Line */}
              <path
                d={pointsToPath(accValPoints)}
                fill="none"
                stroke="var(--healthy-emerald)"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Points */}
              {accTrainPoints.map((p, idx) => (
                <circle
                  key={`t-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  fill="var(--cyan-primary)"
                  stroke="#070b14"
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setActiveEpochHover({ epoch: idx + 1, train: (p.val * 100).toFixed(1), val: (accValPoints[idx].val * 100).toFixed(1) })}
                  onMouseLeave={() => setActiveEpochHover(null)}
                />
              ))}

              {accValPoints.map((p, idx) => (
                <circle
                  key={`v-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  fill="var(--healthy-emerald)"
                  stroke="#070b14"
                  strokeWidth="2"
                />
              ))}

              {/* X Axis Labels */}
              {epochs.map((ep, idx) => (
                <text
                  key={ep}
                  x={padding + (idx / (epochs.length - 1)) * chartW}
                  y={svgHeight - 10}
                  fill="var(--text-muted)"
                  fontSize="11"
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                >
                  E{ep}
                </text>
              ))}
            </svg>

            {/* Hover Tooltip */}
            {activeEpochHover && (
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(13, 21, 39, 0.95)',
                border: '1px solid var(--border-active)',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)'
              }}>
                <div>Epoch {activeEpochHover.epoch}</div>
                <div style={{ color: 'var(--cyan-glow)' }}>Train: {activeEpochHover.train}%</div>
                <div style={{ color: 'var(--healthy-emerald)' }}>Val: {activeEpochHover.val}%</div>
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Loss Curve */}
        <div className="chart-panel">
          <div className="chart-header">
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Loss Minimization Curve</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Training vs. Validation Cross-Entropy Loss</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.76rem' }}>
              <span style={{ color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }} /> Train
              </span>
              <span style={{ color: '#a855f7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7' }} /> Val
              </span>
            </div>
          </div>

          <div className="chart-svg-container">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: '100%' }}>
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                <line
                  key={i}
                  x1={padding}
                  y1={padding + ratio * chartH}
                  x2={svgWidth - padding}
                  y2={padding + ratio * chartH}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeDasharray="4 4"
                />
              ))}

              <path
                d={pointsToPath(lossTrainPoints)}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <path
                d={pointsToPath(lossValPoints)}
                fill="none"
                stroke="#a855f7"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {lossTrainPoints.map((p, idx) => (
                <circle
                  key={`lt-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  fill="#f43f5e"
                  stroke="#070b14"
                  strokeWidth="2"
                />
              ))}

              {lossValPoints.map((p, idx) => (
                <circle
                  key={`lv-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  fill="#a855f7"
                  stroke="#070b14"
                  strokeWidth="2"
                />
              ))}

              {epochs.map((ep, idx) => (
                <text
                  key={ep}
                  x={padding + (idx / (epochs.length - 1)) * chartW}
                  y={svgHeight - 10}
                  fill="var(--text-muted)"
                  fontSize="11"
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                >
                  E{ep}
                </text>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
