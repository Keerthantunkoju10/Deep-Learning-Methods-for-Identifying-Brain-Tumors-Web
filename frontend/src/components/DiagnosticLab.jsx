import React, { useState, useEffect } from 'react';
import { Upload, Sparkles, User, Hash, Calendar, Layers, Image as ImageIcon } from 'lucide-react';
import ImageViewer from './ImageViewer';
import FindingsCard from './FindingsCard';
import { API_BASE } from '../api';

export default function DiagnosticLab({ onOpenReport, setReportData, initialSample }) {
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeSample, setActiveSample] = useState(initialSample || '2.jpg');
  const [dragActive, setDragActive] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    name: 'John Doe',
    id: 'PX-9042',
    age: '48',
    modality: 'Axial T1w Gadolinium Enhanced MRI'
  });

  const sampleChips = [
    { name: '2.jpg', label: 'Tumor Case A' },
    { name: '1.jpg', label: 'Healthy Case' },
    { name: '10.JPG', label: 'Tumor Case B' },
    { name: '11.jpg', label: 'Normal Case' },
    { name: '12.png', label: 'Dense Neoplasm' },
  ];

  // Analyze a sample scan
  const handleAnalyzeSample = async (filename) => {
    setActiveSample(filename);
    setIsAnalyzing(true);
    try {
      const response = await fetch(`${API_BASE}/api/predict-sample`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      });
      if (!response.ok) throw new Error('Prediction request failed.');
      const data = await response.json();
      setResult(data);
      if (setReportData) {
        setReportData({ ...data, patient: patientInfo });
      }
    } catch (err) {
      console.error('Diagnostic error:', err);
      alert('Failed to analyze scan. Ensure backend server is running on port 8000.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Upload custom file
  const handleFileUpload = async (file) => {
    if (!file) return;
    setActiveSample(null);
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/api/predict`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('File upload failed.');
      const data = await response.json();
      setResult(data);
      if (setReportData) {
        setReportData({ ...data, patient: patientInfo });
      }
    } catch (err) {
      console.error('File analysis error:', err);
      alert('Error analyzing uploaded scan file.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // React to initialSample or initial mount
  useEffect(() => {
    const target = initialSample || '2.jpg';
    handleAnalyzeSample(target);
  }, [initialSample]);

  // Update report data when patient info changes
  useEffect(() => {
    if (result && setReportData) {
      setReportData({ ...result, patient: patientInfo });
    }
  }, [patientInfo, result]);

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="diagnostic-lab-section">
      {/* Header & Patient Meta Strip */}
      <div className="lab-header">
        <div className="lab-title-row">
          <div>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>Deep Diagnostic Workbench</h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Automated multi-stage neuro-oncology assessment, boundary segmentation, and morphological quantification.
            </p>
          </div>

          {/* Patient Quick Info Input */}
          <div className="lab-meta-bar">
            <div className="lab-meta-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <User size={13} color="var(--cyan-primary)" />
                <span>Patient:</span>
              </div>
              <input
                type="text"
                className="lab-meta-input"
                value={patientInfo.name}
                onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                placeholder="Patient Name"
              />
            </div>

            <div className="lab-meta-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Hash size={13} color="var(--cyan-primary)" />
                <span>ID:</span>
              </div>
              <input
                type="text"
                className="lab-meta-input"
                value={patientInfo.id}
                onChange={(e) => setPatientInfo({ ...patientInfo, id: e.target.value })}
                placeholder="ID"
              />
            </div>

            <div className="lab-meta-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={13} color="var(--cyan-primary)" />
                <span>Age:</span>
              </div>
              <input
                type="text"
                className="lab-meta-input"
                value={patientInfo.age}
                onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
                placeholder="Age"
              />
            </div>

            <div className="lab-meta-item lab-meta-modality">
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Layers size={13} color="var(--cyan-primary)" />
                <span>Modality:</span>
              </div>
              <select
                className="lab-meta-input"
                value={patientInfo.modality}
                onChange={(e) => setPatientInfo({ ...patientInfo, modality: e.target.value })}
              >
                <option value="Axial T1w Gadolinium Enhanced MRI">Axial T1w Contrast MRI</option>
                <option value="Axial T2w Fluid Attenuated MRI">Axial T2w FLAIR MRI</option>
                <option value="Coronal Brain CT / X-Ray Scan">Brain X-Ray / CT Scan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Input Bar: Quick Samples + Dropzone */}
        <div className="input-control-strip">
          <div className="quick-sample-chips">
            <span className="chip-label">
              <Sparkles size={13} style={{ display: 'inline', verticalAlign: '-1px' }} /> Quick Test Scans:
            </span>
            {sampleChips.map((chip) => (
              <button
                key={chip.name}
                className={`sample-chip ${activeSample === chip.name ? 'active' : ''}`}
                onClick={() => handleAnalyzeSample(chip.name)}
                disabled={isAnalyzing}
              >
                <ImageIcon size={12} />
                {chip.label}
              </button>
            ))}
          </div>

          <label className="btn-primary" style={{ cursor: 'pointer', fontSize: '0.84rem', padding: '7px 14px' }}>
            <Upload size={14} />
            <span>Upload Scan File</span>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
              disabled={isAnalyzing}
            />
          </label>
        </div>
      </div>

      {/* Main Grid: Viewer (Left) + Findings (Right) */}
      <div className="diagnostic-grid">
        <div className="diagnostic-visualizer-col">
          {/* Main Visualizer */}
          <ImageViewer result={result} isAnalyzing={isAnalyzing} />

          {/* Compact Drop Area */}
          <div
            className={`dropzone-container ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('manual-dropzone-input')?.click()}
          >
            <input
              id="manual-dropzone-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
            />
            <div className="dropzone-content-inner">
              <div className="dropzone-icon-box">
                <Upload size={16} />
              </div>
              <div className="dropzone-text-box">
                <div className="dropzone-text-title">Drag & Drop Any DICOM / MRI / CT Image</div>
                <div className="dropzone-text-sub">JPG, PNG, WEBP, and TIFF medical imagery supported</div>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Findings Panel */}
        <FindingsCard
          result={result}
          onOpenReport={onOpenReport}
          isAnalyzing={isAnalyzing}
        />
      </div>
    </div>
  );
}
