import React from 'react';
import { Printer, X, ShieldCheck, AlertTriangle, FileText, CheckCircle } from 'lucide-react';

export default function MedicalReportModal({ reportData, onClose }) {
  if (!reportData) return null;

  const { classification, segmentation, images, patient, filename } = reportData;
  const hasTumor = classification?.has_tumor;
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="report-close-btn no-print" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Hospital Header */}
        <div className="report-header">
          <div>
            <div className="report-hospital-name">NEUROSCAN RADIOLOGY & ONCOLOGY CENTER</div>
            <div className="report-hospital-sub">Department of Diagnostic Neuroradiology • Advanced Medical Vision AI</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0369a1' }}>CONFIDENTIAL MEDICAL REPORT</div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>REPORT REF: NS-AI-{Math.floor(100000 + Math.random() * 900000)}</div>
          </div>
        </div>

        {/* Patient Demographics Grid */}
        <div className="report-patient-grid">
          <div className="report-patient-item">
            <strong>Patient Name</strong>
            <span>{patient?.name || 'Anonymous Patient'}</span>
          </div>

          <div className="report-patient-item">
            <strong>Patient ID / MRN</strong>
            <span>{patient?.id || 'PX-9042'}</span>
          </div>

          <div className="report-patient-item">
            <strong>Age / Demographics</strong>
            <span>{patient?.age ? `${patient.age} Yrs` : 'N/A'}</span>
          </div>

          <div className="report-patient-item">
            <strong>Examination Date</strong>
            <span>{currentDate}</span>
          </div>

          <div className="report-patient-item" style={{ gridColumn: 'span 4' }}>
            <strong>Imaging Protocol & Modality</strong>
            <span>{patient?.modality || 'Axial T1-weighted Gadolinium Contrast MRI'} • Scan File: {filename || 'DICOM_001.JPG'}</span>
          </div>
        </div>

        {/* Diagnostic Visual Documentation */}
        <div className="report-section-title">IMAGING DOCUMENTATION & MULTI-SPECTRAL OVERLAYS</div>
        <div className="report-scans-row">
          <div className="report-scan-box">
            {images?.original && <img src={images.original} alt="Original Scan" />}
            <div className="report-scan-caption">Fig 1: Original MRI Scan</div>
          </div>

          <div className="report-scan-box">
            {images?.contours && <img src={images.contours} alt="Contour Overlay" />}
            <div className="report-scan-caption">Fig 2: Segmented Boundary HUD</div>
          </div>

          <div className="report-scan-box">
            {images?.heatmap && <img src={images.heatmap} alt="Thermal Heatmap" />}
            <div className="report-scan-caption">Fig 3: JET Density Heatmap</div>
          </div>
        </div>

        {/* Diagnostic Findings */}
        <div className="report-section-title">NEURAL CLASSIFICATION & QUANTITATIVE FINDINGS</div>
        <div style={{ background: hasTumor ? '#fff1f2' : '#f0fdf4', border: `1px solid ${hasTumor ? '#fecdd3' : '#bbf7d0'}`, borderRadius: '8px', padding: '14px 18px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: hasTumor ? '#be123c' : '#15803d' }}>
              PRIMARY DIAGNOSTIC FINDING: {classification?.prediction?.toUpperCase()}
            </span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem', color: hasTumor ? '#be123c' : '#15803d' }}>
              CONFIDENCE: {classification?.confidence}%
            </span>
          </div>
          <div style={{ fontSize: '0.84rem', color: '#334155' }}>
            {segmentation?.clinical_note}
          </div>
        </div>

        {/* Volumetric Metrics Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', marginBottom: '24px' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '8px 0', color: '#64748b' }}>Estimated Tumor Mass Area:</td>
              <td style={{ padding: '8px 0', fontWeight: 700, textAlign: 'right' }}>
                {hasTumor ? `${segmentation?.total_tumor_pixels} px (≈ ${(segmentation?.total_tumor_pixels * 0.0025).toFixed(2)} cm²)` : '0.00 cm² (None)'}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '8px 0', color: '#64748b' }}>Intracranial Volumetric Coverage:</td>
              <td style={{ padding: '8px 0', fontWeight: 700, textAlign: 'right' }}>
                {segmentation?.tumor_coverage_percentage}% of segmented brain tissue
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '8px 0', color: '#64748b' }}>Severity Staging Tier:</td>
              <td style={{ padding: '8px 0', fontWeight: 700, textAlign: 'right', color: hasTumor ? '#be123c' : '#15803d' }}>
                {segmentation?.severity}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '8px 0', color: '#64748b' }}>Identified Neoplastic Regions:</td>
              <td style={{ padding: '8px 0', fontWeight: 700, textAlign: 'right' }}>
                {segmentation?.regions_count} distinct focal lesion(s)
              </td>
            </tr>
          </tbody>
        </table>

        {/* Recommendations */}
        <div className="report-section-title">RECOMMENDATIONS & CLINICAL CORRELATION</div>
        <p className="report-findings-text">
          {hasTumor
            ? 'Immediate referral to neurosurgical oncology advised. Correlate with stereotactic biopsy, high-resolution 3D volumetric T1-contrast series, and perfusion-weighted MR imaging to assess microvascular proliferation and tumor grading.'
            : 'No acute intracranial pathology or focal lesion identified on the analyzed axial slice. Recommend routine clinical follow-up if symptoms persist or progress.'}
        </p>

        {/* Signature Line */}
        <div className="report-sign-row">
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>AI Engine Verified: NeuroScan CNN v2.0 & U-Net</div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Processed via TensorFlow Deep Learning Core</div>
          </div>

          <div className="report-signature-block">
            <div className="report-sign-line"></div>
            <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>Attending Radiologist, MD</div>
            <div className="report-sign-title">Board Certified Neuroradiology</div>
          </div>
        </div>

        {/* Action Controls for Printing */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
          <button className="btn-secondary" onClick={onClose} style={{ color: '#334155' }}>
            Close
          </button>
          <button className="btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            Print Report / Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
}
