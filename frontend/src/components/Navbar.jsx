import React from 'react';
import { Activity, Brain, Image, BarChart3, GitFork, Database, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, systemStatus }) {
  const isOnline = systemStatus?.status === 'online';

  return (
    <header className="navbar no-print">
      <div className="nav-inner">
        {/* Brand */}
        <div className="brand-section" onClick={() => setActiveTab('diagnostic')}>
          <div className="brand-logo-glow">
            <Brain size={24} />
          </div>
          <div>
            <div className="brand-title">NeuroScan AI</div>
            <div className="brand-subtitle">Clinical Brain Tumor Diagnostics</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          <button
            className={`nav-item ${activeTab === 'diagnostic' ? 'active' : ''}`}
            onClick={() => setActiveTab('diagnostic')}
          >
            <Activity size={16} />
            Diagnostic Lab
          </button>

          <button
            className={`nav-item ${activeTab === 'samples' ? 'active' : ''}`}
            onClick={() => setActiveTab('samples')}
          >
            <Image size={16} />
            Sample Scans
          </button>

          <button
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={16} />
            Model Analytics
          </button>

          <button
            className={`nav-item ${activeTab === 'architecture' ? 'active' : ''}`}
            onClick={() => setActiveTab('architecture')}
          >
            <GitFork size={16} />
            AI Pipeline
          </button>

          <button
            className={`nav-item ${activeTab === 'dataset' ? 'active' : ''}`}
            onClick={() => setActiveTab('dataset')}
          >
            <Database size={16} />
            Dataset
          </button>
        </nav>

        {/* Status & Dev Info */}
        <div className="nav-actions">
          <div className={`system-status-pill ${isOnline ? '' : 'demo-pill'}`}>
            <span className={`status-dot ${isOnline ? 'online' : 'demo'}`} />
            <span className="status-label-full">{isOnline ? 'CNN & U-Net Cloud Active' : 'Neural Demo Active'}</span>
            <span className="status-label-short">{isOnline ? 'Live' : 'Demo'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
