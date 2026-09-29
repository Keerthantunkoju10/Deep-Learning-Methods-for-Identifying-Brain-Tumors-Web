import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DiagnosticLab from './components/DiagnosticLab';
import SampleGallery from './components/SampleGallery';
import ModelAnalytics from './components/ModelAnalytics';
import ArchitectureFlow from './components/ArchitectureFlow';
import DatasetExplorer from './components/DatasetExplorer';
import MedicalReportModal from './components/MedicalReportModal';
import { Activity, Brain, Shield, HeartPulse, Layers, ExternalLink } from 'lucide-react';
import { API_BASE } from './api';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('diagnostic');
  const [systemStatus, setSystemStatus] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [selectedSampleFromGallery, setSelectedSampleFromGallery] = useState(null);

  // Poll system status on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/status`)
      .then(res => res.json())
      .then(data => setSystemStatus(data))
      .catch(err => console.error('Status fetch error:', err));
  }, []);

  const handleSelectSampleFromGallery = (filename) => {
    setSelectedSampleFromGallery(filename);
    setActiveTab('diagnostic');
  };

  return (
    <div className="app-container">
      {/* Top Sticky Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStatus={systemStatus}
      />

      {/* Main Dynamic View */}
      <main className="main-content">
        {activeTab === 'diagnostic' && (
          <DiagnosticLab
            onOpenReport={() => setIsReportOpen(true)}
            setReportData={setReportData}
            initialSample={selectedSampleFromGallery}
          />
        )}

        {activeTab === 'samples' && (
          <SampleGallery
            onSelectSample={handleSelectSampleFromGallery}
          />
        )}

        {activeTab === 'analytics' && (
          <ModelAnalytics />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureFlow />
        )}

        {activeTab === 'dataset' && (
          <DatasetExplorer />
        )}
      </main>

      {/* Medical Report Modal */}
      {isReportOpen && (
        <MedicalReportModal
          reportData={reportData}
          onClose={() => setIsReportOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="no-print" style={{
        background: 'rgba(10, 15, 29, 0.95)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '30px 24px',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Brain size={18} color="var(--cyan-glow)" />
              <strong style={{ fontSize: '0.95rem' }}>NeuroScan AI Platform</strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Deep Learning for Medical Computer Vision • CNN Classifier & U-Net Segmentation
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} color="var(--cyan-primary)" /> Python & TensorFlow 2.x
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={14} color="var(--healthy-emerald)" /> OpenCV 4.x
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HeartPulse size={14} color="#f43f5e" /> React & Vite Fullstack
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
