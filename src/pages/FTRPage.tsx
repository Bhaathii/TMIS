import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FTRType, TMISHeader, TMISLayer, TMISProcess } from '../types';
import { 
  searchTMISByTapeCode, 
  getAllTMISHeaders,
  getProcessesByHeaderId,
  getLayersByHeaderId,
  getLatestFTRNumber,
  saveFTRReport,
} from '../utils/firebaseUtils';

export const FTRPage: React.FC = () => {
  const navigate = useNavigate();
  const previewContentRef = useRef<HTMLDivElement>(null);
  
  const [tmisRecords, setTmisRecords] = useState<TMISHeader[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<TMISHeader | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    ftrNumber: 1001,
    dateRaised: new Date().toISOString().split('T')[0],
    customer: '',
    ftrCategory: '',
    description: '',
    raisedBy: '',
    status: 'Open',
    priority: 'Medium',
    responsiblePerson: '',
    targetDate: '',
    remarks: '',
    supportInk: '',
    fabricInfo: '',
    customerRequirement: '',
    ftrType: 'Tape' as FTRType,
    technicalParams: {
      machineType: '',
      fabric: '',
      tapeCode: '',
      tapeWidth: '',
      temperature: '',
      airFlow: '',
      speed: '',
      quillPressure: '',
      nozzlePosition: '',
      rollerTemperature: '',
      differential: '',
      depthStop: '',
      hydroTest: '',
      gaugeSetting: '',
    },
    attachments: '',
  });

  // Load FTR number and TMIS records
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        // Load next FTR number
        const nextFTRNumber = await getLatestFTRNumber();
        setFormData(prev => ({
          ...prev,
          ftrNumber: nextFTRNumber,
        }));
        
        // Load TMIS records
        const records = await getAllTMISHeaders();
        setTmisRecords(records);
      } catch (error) {
        console.error('Error initializing FTR page:', error);
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, []);

  // Handle tape code entry - search TMIS and auto-fill ALL technical parameters
  const handleTapeCodeChange = async (tapeCode: string) => {
    setFormData(prev => ({
      ...prev,
      technicalParams: {
        ...prev.technicalParams,
        tapeCode: tapeCode,
      },
    }));

    if (tapeCode.length > 0) {
      try {
        const results = await searchTMISByTapeCode(tapeCode);
        if (results.length > 0) {
          const record = results[0];
          setSelectedRecord(record);

          // Fetch processes and layers for this tape
          const processes = await getProcessesByHeaderId(record.id);
          const layers = await getLayersByHeaderId(record.id);

          // Extract values from TMIS processes (use first process A)
          let machineType = '';
          let temperature = '';
          let airFlow = '';
          let speed = '';
          let quillPressure = '';
          
          if (processes && processes.length > 0) {
            const processA = processes.find(p => p.ProcessLetter === 'A');
            if (processA) {
              machineType = processA.MachineType?.toString() || '';
              temperature = processA.Heat?.toString() || '';
              airFlow = processA.AFlow?.toString() || '';
              speed = processA.Speed?.toString() || '';
              quillPressure = processA.Press?.toString() || '';
            }
          }

          // Extract values from layers
          let fabric = '';
          let tapeWidth = '';
          if (layers && layers.length > 0) {
            const layer1 = layers[0];
            fabric = layer1.LayerDescription || '';
            tapeWidth = layer1.WeightOrThickness || '';
          }

          // Auto-fill from TMIS
          setFormData(prev => ({
            ...prev,
            fabricInfo: record.AdditionalInfo || '',
            customerRequirement: record.TMISComments || '',
            technicalParams: {
              ...prev.technicalParams,
              tapeCode: record.TapeCode,
              // From TMIS Processes
              machineType: machineType,
              temperature: temperature,
              airFlow: airFlow,
              speed: speed,
              quillPressure: quillPressure,
              // From TMIS Layers
              fabric: fabric,
              tapeWidth: tapeWidth,
              // These fields would need additional TMIS data or manual entry
              nozzlePosition: '',
              rollerTemperature: '',
              differential: '',
              depthStop: '',
              hydroTest: '',
              gaugeSetting: '',
            },
          }));
        }
      } catch (error) {
        console.error('Error searching TMIS:', error);
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTechnicalParamChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      technicalParams: {
        ...prev.technicalParams,
        [field]: value,
      },
    }));
  };

  // Generate PDF by capturing preview HTML
  const generatePDF = async () => {
    if (!previewContentRef.current) {
      alert('Preview content not found');
      return null;
    }

    try {
      // Capture the preview div as canvas
      const canvas = await html2canvas(previewContentRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      // Create PDF from canvas
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      return pdf;
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please check the console for details.');
      return null;
    }
  };

  const handlePreview = async () => {
    setShowPreview(true);
  };

  const handleDownloadPDF = async () => {
    const doc = await generatePDF();
    if (doc) {
      doc.save(`FTR-${formData.ftrNumber}-${formData.dateRaised}.pdf`);
      setShowPreview(false);
    }
  };

  const handleSaveFTR = async () => {
    try {
      setLoading(true);
      const ftrId = await saveFTRReport(formData);
      alert(`FTR #${formData.ftrNumber} saved successfully (ID: ${ftrId})`);
      
      // Load next FTR number for next form
      const nextFTRNumber = await getLatestFTRNumber();
      setFormData(prev => ({
        ...prev,
        ftrNumber: nextFTRNumber,
        dateRaised: new Date().toISOString().split('T')[0],
      }));
    } catch (error) {
      alert(`Error saving FTR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Field Test Report (FTR)</h1>
            <p className="text-sm text-gray-600 mt-1">✓ Auto-fill FTR #  ✓ Auto-fill Date  ✓ Search Tape Code to Auto-fill Details</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ← Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - TMIS Lookup */}
          <div className="lg:col-span-1 bg-white shadow rounded-lg p-6 h-fit">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🔍 TMIS Lookup</h2>

            {selectedRecord ? (
              <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded mb-4">
                <p className="text-sm font-bold text-blue-900">✓ Linked:</p>
                <p className="text-sm font-bold text-blue-700">{selectedRecord.TapeCode}</p>
                <p className="text-xs text-blue-600 mt-1">Status: {selectedRecord.Status}</p>
              </div>
            ) : (
              <div className="p-3 bg-gray-100 border border-gray-300 rounded mb-4 text-center">
                <p className="text-sm text-gray-600">No tape selected</p>
              </div>
            )}

            <h3 className="text-sm font-semibold text-gray-900 mb-2">Available Tapes</h3>
            <div className="space-y-1 max-h-96 overflow-y-auto border border-gray-200 rounded p-2 bg-white">
              {loading ? (
                <p className="text-sm text-gray-500 p-2">Loading...</p>
              ) : tmisRecords.length > 0 ? (
                tmisRecords.map(record => (
                  <button
                    key={record.id}
                    onClick={() => handleTapeCodeChange(record.TapeCode)}
                    className={`w-full text-left px-2 py-2 rounded text-sm border transition ${
                      selectedRecord?.id === record.id
                        ? 'bg-blue-100 border-blue-400 font-semibold'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <p className="font-semibold">{record.TapeCode}</p>
                    <p className="text-xs text-gray-600">{record.Status}</p>
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500 p-2">No tapes found</p>
              )}
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Row 1: Auto-filled Fields */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 FTR Details</h2>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* FTR Number - Auto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">FTR Number</label>
                  <input
                    type="number"
                    value={formData.ftrNumber}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-green-100 text-gray-900 font-semibold cursor-not-allowed"
                  />
                  <p className="text-xs text-green-700 mt-1">✓ Auto</p>
                </div>

                {/* Date Raised - Auto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Raised</label>
                  <input
                    type="date"
                    value={formData.dateRaised}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-green-100 text-gray-900 font-semibold cursor-not-allowed"
                  />
                  <p className="text-xs text-green-700 mt-1">✓ Auto</p>
                </div>

                {/* Customer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <input
                    type="text"
                    name="customer"
                    value={formData.customer}
                    onChange={handleInputChange}
                    placeholder="Enter name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    name="ftrCategory"
                    value={formData.ftrCategory}
                    onChange={handleInputChange}
                    placeholder="Test type"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                {/* Raised By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Raised By</label>
                  <input
                    type="text"
                    name="raisedBy"
                    value={formData.raisedBy}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Target Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                  <input
                    type="date"
                    name="targetDate"
                    value={formData.targetDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Text Areas */}
              <div className="grid grid-cols-1 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the test..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    placeholder="Additional remarks..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Auto-filled from TMIS */}
            <div className="bg-white shadow rounded-lg p-6 border-2 border-blue-200">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">🔗 Auto-filled from TMIS</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">Fabric Info</label>
                  <textarea
                    name="fabricInfo"
                    value={formData.fabricInfo}
                    onChange={handleInputChange}
                    placeholder="Auto-filled from TMIS..."
                    rows={3}
                    className="w-full px-3 py-2 border-2 border-blue-300 rounded-md bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">Customer Requirement</label>
                  <textarea
                    name="customerRequirement"
                    value={formData.customerRequirement}
                    onChange={handleInputChange}
                    placeholder="Auto-filled from TMIS..."
                    rows={3}
                    className="w-full px-3 py-2 border-2 border-blue-300 rounded-md bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Technical Parameters */}
            <div className="bg-white shadow rounded-lg p-6 border-2 border-purple-200">
              <h2 className="text-xl font-semibold text-purple-900 mb-4">⚙️ Technical Parameters</h2>

              {/* Tape Code Input - MAIN FIELD */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-purple-900 mb-2">
                  Tape Code 🔑 <span className="text-red-600">*Required</span>
                </label>
                <input
                  type="text"
                  value={formData.technicalParams.tapeCode}
                  onChange={(e) => handleTapeCodeChange(e.target.value)}
                  placeholder="Enter tape code (e.g., TC-001) to auto-fill TMIS details"
                  className="w-full px-4 py-3 border-3 border-purple-400 rounded-md bg-purple-50 text-gray-900 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                {selectedRecord && (
                  <p className="text-sm text-green-600 font-semibold mt-2">✓ Matched with TMIS: {selectedRecord.TapeCode}</p>
                )}
              </div>

              {/* Other Parameters */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm font-semibold text-blue-900 mb-3">🟦 Fields Auto-filled from TMIS:</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { field: 'machineType', label: '1. Machine Type', source: '(from TMIS Process)' },
                    { field: 'fabric', label: '2. Fabric', source: '(from TMIS Layer)' },
                    { field: 'tapeWidth', label: '3. Tape Width', source: '(from TMIS Layer)' },
                    { field: 'temperature', label: '4. Temperature', source: '(from TMIS Process Heat)' },
                    { field: 'airFlow', label: '5. Air Flow', source: '(from TMIS Process)' },
                    { field: 'speed', label: '6. Speed', source: '(from TMIS Process)' },
                    { field: 'quillPressure', label: '7. Quill Pressure', source: '(from TMIS Press)' },
                  ].map(({ field, label, source }) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-blue-900 mb-1">
                        {label} <span className="text-xs text-blue-700">{source}</span>
                      </label>
                      <input
                        type="text"
                        value={formData.technicalParams[field as keyof typeof formData.technicalParams] || ''}
                        onChange={(e) => handleTechnicalParamChange(field, e.target.value)}
                        placeholder="Value"
                        className="w-full px-2 py-2 border-2 border-blue-300 rounded-md bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Manual Entry Parameters */}
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded">
                <p className="text-sm font-semibold text-orange-900 mb-3">🟨 Fields for Manual Entry:</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { field: 'nozzlePosition', label: '8. Nozzle Position' },
                    { field: 'rollerTemperature', label: '9. Roller Temp' },
                    { field: 'differential', label: '10. Differential' },
                    { field: 'depthStop', label: '11. Depth Stop' },
                    { field: 'hydroTest', label: '12. Hydro Test' },
                    { field: 'gaugeSetting', label: '13. Gauge Setting' },
                  ].map(({ field, label }) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-orange-900 mb-1">{label}</label>
                      <input
                        type="text"
                        value={formData.technicalParams[field as keyof typeof formData.technicalParams] || ''}
                        onChange={(e) => handleTechnicalParamChange(field, e.target.value)}
                        placeholder="Enter value"
                        className="w-full px-2 py-2 border border-orange-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Attachments */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Attachments/Notes</label>
                <input
                  type="text"
                  name="attachments"
                  value={formData.attachments}
                  onChange={handleInputChange}
                  placeholder="Add file references or notes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handlePreview}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  disabled={loading}
                >
                  👁️ Preview PDF
                </button>
                <button
                  onClick={handleSaveFTR}
                  className="px-6 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? '⏳ Saving...' : '💾 Save FTR'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg shadow-2xl w-full max-h-[95vh] flex flex-col" style={{ maxWidth: '900px' }}>
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-gradient-to-r from-blue-600 to-blue-700">
              <h2 className="text-xl font-bold text-white">📄 FTR PDF Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body - PDF Preview */}
            <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
              <div ref={previewContentRef} className="bg-white shadow-xl mx-auto" style={{ width: '210mm', fontFamily: 'Arial, sans-serif', padding: '20px' }}>
                {/* Header with ARDMEL Logo */}
                <div className="flex justify-between items-start mb-6 pb-3" style={{ borderBottom: '1px solid #000' }}>
                  <div className="flex items-start">
                    <img src="/ardmel-logo.jpg" alt="ARDMEL Logo" className="object-contain" style={{ height: '50px', width: 'auto' }} />
                  </div>
                  <div className="text-right">
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#000' }}>FIELD TEST REPORT</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#000', marginTop: '2px' }}>FTR #{formData.ftrNumber}</div>
                  </div>
                </div>

                {/* Form Fields - Professional Table Layout */}
                <div style={{ marginBottom: '10px', border: '1px solid #000' }}>
                  {/* Row 1: FTR #, DATE RAISED, CUSTOMER, CATEGORY */}
                  <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                    <div style={{ flex: 1, borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#d3d3d3' }}>
                      <div style={{ fontSize: '10px', fontWeight: 'bold' }}>FTR #</div>
                      <div style={{ fontSize: '11px' }}>{formData.ftrNumber}</div>
                    </div>
                    <div style={{ flex: 1, borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#d3d3d3' }}>
                      <div style={{ fontSize: '10px', fontWeight: 'bold' }}>DATE RAISED</div>
                      <div style={{ fontSize: '11px' }}>{formData.dateRaised}</div>
                    </div>
                    <div style={{ flex: 1, borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#d3d3d3' }}>
                      <div style={{ fontSize: '10px', fontWeight: 'bold' }}>CUSTOMER</div>
                      <div style={{ fontSize: '11px' }}>{formData.customer || '-'}</div>
                    </div>
                    <div style={{ flex: 1, padding: '4px 6px', backgroundColor: '#d3d3d3' }}>
                      <div style={{ fontSize: '10px', fontWeight: 'bold' }}>CATEGORY</div>
                      <div style={{ fontSize: '11px' }}>{formData.ftrCategory || '-'}</div>
                    </div>
                  </div>

                  {/* Row 2: STATUS, PRIORITY, RESPONSIBLE, TARGET DATE */}
                  <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                    <div style={{ flex: 1, borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#d3d3d3' }}>
                      <div style={{ fontSize: '10px', fontWeight: 'bold' }}>STATUS</div>
                      <div style={{ fontSize: '11px' }}>{formData.status}</div>
                    </div>
                    <div style={{ flex: 1, borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#d3d3d3' }}>
                      <div style={{ fontSize: '10px', fontWeight: 'bold' }}>PRIORITY</div>
                      <div style={{ fontSize: '11px' }}>{formData.priority}</div>
                    </div>
                    <div style={{ flex: 1, borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#d3d3d3' }}>
                      <div style={{ fontSize: '10px', fontWeight: 'bold' }}>RESPONSIBLE</div>
                      <div style={{ fontSize: '11px' }}>{formData.responsiblePerson || '-'}</div>
                    </div>
                    <div style={{ flex: 1, padding: '4px 6px', backgroundColor: '#d3d3d3' }}>
                      <div style={{ fontSize: '10px', fontWeight: 'bold' }}>TARGET DATE</div>
                      <div style={{ fontSize: '11px' }}>{formData.targetDate || '-'}</div>
                    </div>
                  </div>

                  {/* Row 3: RAISED BY, FTR TYPE, SUPPORT INK */}
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '25%', borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#d3d3d3' }}>
                      <div style={{ fontSize: '10px', fontWeight: 'bold' }}>RAISED BY</div>
                      <div style={{ fontSize: '11px' }}>{formData.raisedBy || '-'}</div>
                    </div>
                    <div style={{ width: '25%', borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#d3d3d3' }}>
                      <div style={{ fontSize: '10px', fontWeight: 'bold' }}>FTR TYPE</div>
                      <div style={{ fontSize: '11px' }}>{formData.ftrType}</div>
                    </div>
                    <div style={{ width: '50%', padding: '4px 6px', backgroundColor: '#d3d3d3' }}>
                      <div style={{ fontSize: '10px', fontWeight: 'bold' }}>SUPPORT INK</div>
                      <div style={{ fontSize: '11px' }}>{formData.supportInk || '-'}</div>
                    </div>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '2px', borderBottom: '1px solid #000', paddingBottom: '2px' }}>DESCRIPTION</div>
                  <div style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#fff', minHeight: '30px', fontSize: '10px' }}>
                    {formData.description || '-'}
                  </div>
                </div>

                {/* REMARKS */}
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '2px', borderBottom: '1px solid #000', paddingBottom: '2px' }}>REMARKS</div>
                  <div style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#fff', minHeight: '30px', fontSize: '10px' }}>
                    {formData.remarks || '-'}
                  </div>
                </div>

                {/* FABRIC INFO & CUSTOMER REQUIREMENT */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '2px', borderBottom: '1px solid #000', paddingBottom: '2px' }}>FABRIC INFO</div>
                    <div style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#fff', minHeight: '30px', fontSize: '10px' }}>
                      {formData.fabricInfo || '-'}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '2px', borderBottom: '1px solid #000', paddingBottom: '2px' }}>CUSTOMER REQUIREMENT</div>
                    <div style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#fff', minHeight: '30px', fontSize: '10px' }}>
                      {formData.customerRequirement || '-'}
                    </div>
                  </div>
                </div>

                {/* ATTACHMENTS */}
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '2px', borderBottom: '1px solid #000', paddingBottom: '2px' }}>ATTACHMENTS</div>
                  <div style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#fff', minHeight: '20px', fontSize: '10px' }}>
                    {formData.attachments || '-'}
                  </div>
                </div>

                {/* TECHNICAL PARAMETERS */}
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '2px', borderBottom: '2px solid #000', paddingBottom: '2px' }}>TECHNICAL PARAMETERS / SETTINGS</div>
                  
                  <div style={{ border: '1px solid #000' }}>
                    {/* Row 1 */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                      <div style={{ width: '25%', borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#fff' }}>
                        <div style={{ fontSize: '10px', fontWeight: 'bold' }}>1. Machine Type</div>
                        <div style={{ fontSize: '10px' }}>{formData.technicalParams.machineType || '-'}</div>
                      </div>
                      <div style={{ width: '25%', borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#fff' }}>
                        <div style={{ fontSize: '10px', fontWeight: 'bold' }}>2. Fabric</div>
                        <div style={{ fontSize: '10px' }}>{formData.technicalParams.fabric || '-'}</div>
                      </div>
                      <div style={{ width: '25%', borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#fff' }}>
                        <div style={{ fontSize: '10px', fontWeight: 'bold' }}>3. Tape Code</div>
                        <div style={{ fontSize: '10px' }}>{formData.technicalParams.tapeCode || '-'}</div>
                      </div>
                      <div style={{ width: '25%', padding: '4px 6px', backgroundColor: '#fff' }}>
                        <div style={{ fontSize: '10px', fontWeight: 'bold' }}>4. Tape Width</div>
                        <div style={{ fontSize: '10px' }}>{formData.technicalParams.tapeWidth || '-'}</div>
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                      <div style={{ width: '25%', borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#fff' }}>
                        <div style={{ fontSize: '10px', fontWeight: 'bold' }}>5. Temperature</div>
                        <div style={{ fontSize: '10px' }}>{formData.technicalParams.temperature || '-'}</div>
                      </div>
                      <div style={{ width: '25%', borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#fff' }}>
                        <div style={{ fontSize: '10px', fontWeight: 'bold' }}>6. Air Flow</div>
                        <div style={{ fontSize: '10px' }}>{formData.technicalParams.airFlow || '-'}</div>
                      </div>
                      <div style={{ width: '25%', borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#fff' }}>
                        <div style={{ fontSize: '10px', fontWeight: 'bold' }}>7. Speed (m/min)</div>
                        <div style={{ fontSize: '10px' }}>{formData.technicalParams.speed || '-'}</div>
                      </div>
                      <div style={{ width: '25%', padding: '4px 6px', backgroundColor: '#fff' }}>
                        <div style={{ fontSize: '10px', fontWeight: 'bold' }}>8. Quill Pressure (psi)</div>
                        <div style={{ fontSize: '10px' }}>{formData.technicalParams.quillPressure || '-'}</div>
                      </div>
                    </div>

                    {/* Row 3 */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                      <div style={{ width: '25%', borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#fff' }}>
                        <div style={{ fontSize: '10px', fontWeight: 'bold' }}>9. Nozzle Position</div>
                        <div style={{ fontSize: '10px' }}>{formData.technicalParams.nozzlePosition || '-'}</div>
                      </div>
                      <div style={{ width: '25%', borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#fff' }}>
                        <div style={{ fontSize: '10px', fontWeight: 'bold' }}>10. Roller Temp (°C)</div>
                        <div style={{ fontSize: '10px' }}>{formData.technicalParams.rollerTemperature || '-'}</div>
                      </div>
                      <div style={{ width: '25%', borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#fff' }}>
                        <div style={{ fontSize: '10px', fontWeight: 'bold' }}>11. Differential</div>
                        <div style={{ fontSize: '10px' }}>{formData.technicalParams.differential || '-'}</div>
                      </div>
                      <div style={{ width: '25%', padding: '4px 6px', backgroundColor: '#fff' }}>
                        <div style={{ fontSize: '10px', fontWeight: 'bold' }}>12. Depth Stop</div>
                        <div style={{ fontSize: '10px' }}>{formData.technicalParams.depthStop || '-'}</div>
                      </div>
                    </div>

                    {/* Row 4 */}
                    <div style={{ display: 'flex' }}>
                      <div style={{ width: '25%', borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#fff' }}>
                        <div style={{ fontSize: '10px', fontWeight: 'bold' }}>13. Hydro Test (Bar)</div>
                        <div style={{ fontSize: '10px' }}>{formData.technicalParams.hydroTest || '-'}</div>
                      </div>
                      <div style={{ width: '75%', padding: '4px 6px', backgroundColor: '#fff' }}>
                        <div style={{ fontSize: '10px', fontWeight: 'bold' }}>14. Gauge Setting</div>
                        <div style={{ fontSize: '10px' }}>{formData.technicalParams.gaugeSetting || '-'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warning Section */}
                <div style={{ marginBottom: '8px', paddingTop: '6px', borderTop: '1px solid #000' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}>Warning – Guidance Only:</div>
                  <div style={{ fontSize: '9px', lineHeight: '1.4', color: '#333' }}>
                    Samples are provided; users should make their own tests to determine the suitability of our settings and/or materials prior to production. As Ardmel Automation Ltd cannot foresee the varied conditions under which this information and our materials may be used, we shall not be held liable for incidental or consequential damages or costs in connection with the supply, performance or use of this material or this information.
                  </div>
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', fontSize: '9px', color: '#666', paddingTop: '6px', borderTop: '1px solid #000' }}>
                  <div>Field Test Report Generated by ARDMEL</div>
                  <div>{new Date().toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-4 border-t border-gray-300 bg-gray-50">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-400 rounded-md hover:bg-gray-100 font-semibold text-sm"
              >
                Close
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-6 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition text-sm"
              >
                ✓ Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
