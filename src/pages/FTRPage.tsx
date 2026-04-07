import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FTRType } from '../types';

export const FTRPage: React.FC = () => {
  const navigate = useNavigate();
  const pdfRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

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

  const generatePDF = async () => {
    if (!pdfRef.current) return;

    try {
      setGenerating(true);
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      pdf.save(`FTR-${formData.ftrNumber}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Field Test Report (FTR)</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Form and PDF Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-1 bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">FTR Details</h2>

            <div className="space-y-4">
              {/* FTR Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  FTR Number
                </label>
                <input
                  type="number"
                  name="ftrNumber"
                  value={formData.ftrNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  readOnly
                />
              </div>

              {/* Date Raised */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Raised
                </label>
                <input
                  type="date"
                  name="dateRaised"
                  value={formData.dateRaised}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Customer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer
                </label>
                <input
                  type="text"
                  name="customer"
                  value={formData.customer}
                  onChange={handleInputChange}
                  placeholder="Enter customer name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* FTR Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  FTR Category
                </label>
                <input
                  type="text"
                  name="ftrCategory"
                  value={formData.ftrCategory}
                  onChange={handleInputChange}
                  placeholder="Enter FTR category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Raised By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raised By
                </label>
                <input
                  type="text"
                  name="raisedBy"
                  value={formData.raisedBy}
                  onChange={handleInputChange}
                  placeholder="Enter name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* Responsible Person */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsible Person
                </label>
                <input
                  type="text"
                  name="responsiblePerson"
                  value={formData.responsiblePerson}
                  onChange={handleInputChange}
                  placeholder="Enter name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Target Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  name="targetDate"
                  value={formData.targetDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  placeholder="Enter remarks"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Support Ink */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Support Ink
                </label>
                <input
                  type="text"
                  name="supportInk"
                  value={formData.supportInk}
                  onChange={handleInputChange}
                  placeholder="Enter support ink details"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Fabric Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fabric Info
                </label>
                <textarea
                  name="fabricInfo"
                  value={formData.fabricInfo}
                  onChange={handleInputChange}
                  placeholder="Enter fabric information"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Customer Requirement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Requirement
                </label>
                <textarea
                  name="customerRequirement"
                  value={formData.customerRequirement}
                  onChange={handleInputChange}
                  placeholder="Enter customer requirements"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attachments
                </label>
                <input
                  type="text"
                  name="attachments"
                  value={formData.attachments}
                  onChange={handleInputChange}
                  placeholder="Enter attachment details"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Results and PDF Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Technical Parameters Form */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Technical Parameters / Settings
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { field: 'machineType', label: '1. Machine Type' },
                  { field: 'fabric', label: '2. Fabric' },
                  { field: 'tapeCode', label: '3. Tape Code' },
                  { field: 'tapeWidth', label: '4. Tape Width' },
                  { field: 'temperature', label: '5. Temperature' },
                  { field: 'airFlow', label: '6. Air Flow' },
                  { field: 'speed', label: '7. Speed (m/min)' },
                  { field: 'quillPressure', label: '8. Quill Pressure (psi)' },
                  { field: 'nozzlePosition', label: '9. Nozzle Position' },
                  { field: 'rollerTemperature', label: '10. Roller Temperature (°C)' },
                  { field: 'differential', label: '11. Differential' },
                  { field: 'depthStop', label: '12. Depth Stop' },
                  { field: 'hydroTest', label: '13. Hydro Test (Bar)' },
                  { field: 'gaugeSetting', label: '14. Gauge Setting' },
                ].map(({ field, label }) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={formData.technicalParams[field as keyof typeof formData.technicalParams] || ''}
                      onChange={(e) => handleTechnicalParamChange(field, e.target.value)}
                      placeholder="Enter value"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* PDF Preview */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">PDF Preview</h2>
              <div
                ref={pdfRef}
                className="bg-white p-6 border border-gray-300 rounded overflow-hidden"
                style={{ fontSize: '11px', lineHeight: '1.3' }}
              >
                {/* PDF Content - Print Optimized */}
                <div style={{ pageBreakAfter: 'always' }}>
                  {/* Header with Logo */}
                  <div className="flex justify-between items-start border-b border-gray-400 pb-3 mb-3">
                    <div>
                      <img
                        src="ardmel-logo.jpg"
                        alt="ARDMEL Logo"
                        className="h-16 w-auto"
                      />
                    </div>
                    <div className="text-right">
                      <h1 className="text-xl font-bold text-gray-900">FIELD TEST REPORT</h1>
                      <p className="text-xs text-gray-600 mt-1">FTR #{formData.ftrNumber}</p>
                    </div>
                  </div>

                  {/* Main Details - Compact Grid */}
                  <div className="mb-3">
                    {/* Row 1: FTR#, Date, Customer, Category */}
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      <div>
                        <p className="text-xs font-bold text-gray-700 uppercase">FTR #</p>
                        <p className="text-xs text-gray-900">{formData.ftrNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700 uppercase">Date Raised</p>
                        <p className="text-xs text-gray-900">{formData.dateRaised || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700 uppercase">Customer</p>
                        <p className="text-xs text-gray-900">{formData.customer || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700 uppercase">Category</p>
                        <p className="text-xs text-gray-900">{formData.ftrCategory || '-'}</p>
                      </div>
                    </div>

                    {/* Row 2: Status, Priority, Responsible, Target Date */}
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      <div>
                        <p className="text-xs font-bold text-gray-700 uppercase">Status</p>
                        <p className="text-xs text-gray-900">{formData.status}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700 uppercase">Priority</p>
                        <p className="text-xs text-gray-900">{formData.priority}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700 uppercase">Responsible</p>
                        <p className="text-xs text-gray-900">{formData.responsiblePerson || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700 uppercase">Target Date</p>
                        <p className="text-xs text-gray-900">{formData.targetDate || '-'}</p>
                      </div>
                    </div>

                    {/* Row 3: Raised By, FTR Type, Support Ink */}
                    <div className="grid grid-cols-3 gap-2 mb-2 border-b border-gray-300 pb-2">
                      <div>
                        <p className="text-xs font-bold text-gray-700 uppercase">Raised By</p>
                        <p className="text-xs text-gray-900">{formData.raisedBy || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700 uppercase">FTR Type</p>
                        <p className="text-xs text-gray-900">{formData.ftrType}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700 uppercase">Support Ink</p>
                        <p className="text-xs text-gray-900">{formData.supportInk || '-'}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-2">
                      <p className="text-xs font-bold text-gray-700 uppercase">Description</p>
                      <p className="text-xs text-gray-900 whitespace-pre-wrap leading-tight">{formData.description || '-'}</p>
                    </div>

                    {/* Remarks */}
                    <div className="mb-2">
                      <p className="text-xs font-bold text-gray-700 uppercase">Remarks</p>
                      <p className="text-xs text-gray-900 whitespace-pre-wrap leading-tight">{formData.remarks || '-'}</p>
                    </div>

                    {/* Fabric Info & Customer Requirement */}
                    <div className="grid grid-cols-2 gap-3 mb-2 border-b border-gray-300 pb-2">
                      <div>
                        <p className="text-xs font-bold text-gray-700 uppercase">Fabric Info</p>
                        <p className="text-xs text-gray-900 whitespace-pre-wrap leading-tight">{formData.fabricInfo || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700 uppercase">Customer Requirement</p>
                        <p className="text-xs text-gray-900 whitespace-pre-wrap leading-tight">{formData.customerRequirement || '-'}</p>
                      </div>
                    </div>

                    {/* Attachments */}
                    <div>
                      <p className="text-xs font-bold text-gray-700 uppercase">Attachments</p>
                      <p className="text-xs text-gray-900">{formData.attachments || '-'}</p>
                    </div>
                  </div>

                  {/* Technical Parameters Section - 2 Column Table */}
                  <div className="mb-3">
                    <p className="text-xs font-bold text-gray-700 uppercase mb-2 border-b-2 border-gray-400 pb-1">Technical Parameters / Settings</p>
                    <table className="w-full border-collapse border border-gray-400 text-xs">
                      <tbody>
                        {[
                          { field: 'machineType', label: '1. Machine Type' },
                          { field: 'fabric', label: '2. Fabric' },
                          { field: 'tapeCode', label: '3. Tape Code' },
                          { field: 'tapeWidth', label: '4. Tape Width' },
                          { field: 'temperature', label: '5. Temperature' },
                          { field: 'airFlow', label: '6. Air Flow' },
                          { field: 'speed', label: '7. Speed (m/min)' },
                          { field: 'quillPressure', label: '8. Quill Pressure (psi)' },
                          { field: 'nozzlePosition', label: '9. Nozzle Position' },
                          { field: 'rollerTemperature', label: '10. Roller Temp (°C)' },
                          { field: 'differential', label: '11. Differential' },
                          { field: 'depthStop', label: '12. Depth Stop' },
                          { field: 'hydroTest', label: '13. Hydro Test (Bar)' },
                          { field: 'gaugeSetting', label: '14. Gauge Setting' },
                        ].map((item, idx) => (
                          idx % 2 === 0 && (
                            <tr key={idx}>
                              <td className="border border-gray-400 px-2 py-1 font-semibold text-gray-700 w-1/4">
                                {item.label}
                              </td>
                              <td className="border border-gray-400 px-2 py-1 text-gray-900 w-1/4">
                                {formData.technicalParams[item.field as keyof typeof formData.technicalParams] || '-'}
                              </td>
                              {idx + 1 < 14 && (
                                <>
                                  <td className="border border-gray-400 px-2 py-1 font-semibold text-gray-700 w-1/4">
                                    {[
                                      { field: 'machineType', label: '1. Machine Type' },
                                      { field: 'fabric', label: '2. Fabric' },
                                      { field: 'tapeCode', label: '3. Tape Code' },
                                      { field: 'tapeWidth', label: '4. Tape Width' },
                                      { field: 'temperature', label: '5. Temperature' },
                                      { field: 'airFlow', label: '6. Air Flow' },
                                      { field: 'speed', label: '7. Speed (m/min)' },
                                      { field: 'quillPressure', label: '8. Quill Pressure (psi)' },
                                      { field: 'nozzlePosition', label: '9. Nozzle Position' },
                                      { field: 'rollerTemperature', label: '10. Roller Temp (°C)' },
                                      { field: 'differential', label: '11. Differential' },
                                      { field: 'depthStop', label: '12. Depth Stop' },
                                      { field: 'hydroTest', label: '13. Hydro Test (Bar)' },
                                      { field: 'gaugeSetting', label: '14. Gauge Setting' },
                                    ][idx + 1]?.label}
                                  </td>
                                  <td className="border border-gray-400 px-2 py-1 text-gray-900 w-1/4">
                                    {formData.technicalParams[[
                                      { field: 'machineType', label: '1. Machine Type' },
                                      { field: 'fabric', label: '2. Fabric' },
                                      { field: 'tapeCode', label: '3. Tape Code' },
                                      { field: 'tapeWidth', label: '4. Tape Width' },
                                      { field: 'temperature', label: '5. Temperature' },
                                      { field: 'airFlow', label: '6. Air Flow' },
                                      { field: 'speed', label: '7. Speed (m/min)' },
                                      { field: 'quillPressure', label: '8. Quill Pressure (psi)' },
                                      { field: 'nozzlePosition', label: '9. Nozzle Position' },
                                      { field: 'rollerTemperature', label: '10. Roller Temp (°C)' },
                                      { field: 'differential', label: '11. Differential' },
                                      { field: 'depthStop', label: '12. Depth Stop' },
                                      { field: 'hydroTest', label: '13. Hydro Test (Bar)' },
                                      { field: 'gaugeSetting', label: '14. Gauge Setting' },
                                    ][idx + 1]?.field as keyof typeof formData.technicalParams] || '-'}
                                  </td>
                                </>
                              )}
                            </tr>
                          )
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Warning Disclaimer */}
                  <div className="text-xs text-gray-700 border-t-2 border-gray-400 pt-2 mt-2 leading-tight">
                    <p className="font-bold mb-1">Warning – Guidance Only:</p>
                    <p>
                      Samples are provided, users should make their own tests to determine the suitability of our settings and / or materials prior to production. As Ardmel Automation Ltd cannot foresee the varied conditions under which this information and our materials may be used, we shall not be held liable for incidental or consequential damages or costs in connection with the supply, performance or use of this material or this information.
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="text-center text-xs text-gray-600 border-t border-gray-400 pt-2 mt-2">
                    <p>Field Test Report Generated by ARDMEL</p>
                    <p className="text-xs">
                      {new Date().toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={generatePDF}
                disabled={generating}
                className="mt-6 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {generating ? 'Generating PDF...' : '📥 Download PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
