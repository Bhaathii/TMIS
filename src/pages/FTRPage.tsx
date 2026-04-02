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
    customerAccount: '',
    customerName: '',
    returnAddress: '',
    contactName: '',
    contactEmail: '',
    contactTel: '',
    ftrType: 'Tape' as FTRType,
    fabricInfo: '',
    customerRequirements: '',
    results: {} as { [key: string]: string },
  });

  // Define fields required for each FTR type
  const resultFields: { [key in FTRType]: string[] } = {
    'Tape': ['Peel Strength', 'Shear Strength', 'Temperature Resistance', 'Adhesion'],
    'Seam Sealer': ['Waterproof Rating', 'Flexibility', 'Durability', 'Appearance'],
    'Laser': ['Cut Quality', 'Power Setting', 'Speed', 'Accuracy'],
    'Strip Cutter': ['Strip Width', 'Precision', 'Feed Speed', 'Quality'],
    'Other': ['Test Duration', 'Test Result', 'Observations', 'Pass/Fail'],
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset results when changing FTR type
    if (name === 'ftrType') {
      setFormData((prev) => ({
        ...prev,
        results: {},
      }));
    }
  };

  const handleResultChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      results: {
        ...prev.results,
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

              {/* Customer Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Account
                </label>
                <input
                  type="text"
                  name="customerAccount"
                  value={formData.customerAccount}
                  onChange={handleInputChange}
                  placeholder="Enter customer account"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer / Company Name
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Enter customer name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Return Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Return Address
                </label>
                <textarea
                  name="returnAddress"
                  value={formData.returnAddress}
                  onChange={handleInputChange}
                  placeholder="Enter return address"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Contact Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  placeholder="Enter contact name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="Enter contact email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Contact Tel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Tel No.
                </label>
                <input
                  type="tel"
                  name="contactTel"
                  value={formData.contactTel}
                  onChange={handleInputChange}
                  placeholder="Enter contact telephone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* FTR Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  FTR Type
                </label>
                <select
                  name="ftrType"
                  value={formData.ftrType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Tape">Tape</option>
                  <option value="Seam Sealer">Seam Sealer</option>
                  <option value="Laser">Laser</option>
                  <option value="Strip Cutter">Strip Cutter</option>
                  <option value="Other">Other</option>
                </select>
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

              {/* Customer Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Requirements
                </label>
                <textarea
                  name="customerRequirements"
                  value={formData.customerRequirements}
                  onChange={handleInputChange}
                  placeholder="Enter customer requirements"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Results and PDF Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Results Form */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Test Results - {formData.ftrType}
              </h2>

              <div className="space-y-4">
                {resultFields[formData.ftrType as FTRType]?.map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field}
                    </label>
                    <input
                      type="text"
                      value={formData.results[field] || ''}
                      onChange={(e) => handleResultChange(field, e.target.value)}
                      placeholder={`Enter ${field.toLowerCase()}`}
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
                className="bg-white p-8 border border-gray-300 rounded overflow-hidden"
              >
                {/* PDF Content */}
                <div className="space-y-4">
                  {/* Header */}
                  <div className="border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-900">ARDMEL</h1>
                    <p className="text-sm text-gray-600 mt-1">Field Test Report</p>
                    <p className="text-sm text-gray-600">FTR #{formData.ftrNumber}</p>
                    <p className="text-sm text-gray-600">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>

                  {/* Customer Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">
                        Customer Account
                      </p>
                      <p className="text-sm text-gray-900">{formData.customerAccount || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">FTR Type</p>
                      <p className="text-sm text-gray-900">{formData.ftrType}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Customer / Company Name
                    </p>
                    <p className="text-sm text-gray-900">{formData.customerName || '-'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Return Address
                    </p>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {formData.returnAddress || '-'}
                    </p>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">Name</p>
                      <p className="text-sm text-gray-900">{formData.contactName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">Email</p>
                      <p className="text-sm text-gray-900">{formData.contactEmail || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">Tel</p>
                      <p className="text-sm text-gray-900">{formData.contactTel || '-'}</p>
                    </div>
                  </div>

                  {/* Fabric Information */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Fabric Info</p>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {formData.fabricInfo || '-'}
                    </p>
                  </div>

                  {/* Customer Requirements */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Customer Requirements
                    </p>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {formData.customerRequirements || '-'}
                    </p>
                  </div>

                  {/* Results Table */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                      Test Results
                    </p>
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                            Parameter
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultFields[formData.ftrType as FTRType]?.map((field) => (
                          <tr key={field}>
                            <td className="border border-gray-300 px-3 py-2 text-xs text-gray-700">
                              {field}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-xs text-gray-900">
                              {formData.results[field] || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer */}
                  <div className="text-center text-xs text-gray-600 border-t pt-4 mt-6">
                    <p>This is a Field Test Report generated by ARDMEL</p>
                    <p className="mt-1">
                      Generated on: {new Date().toLocaleString()}
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
