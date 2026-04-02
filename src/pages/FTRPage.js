import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
export const FTRPage = () => {
    const navigate = useNavigate();
    const pdfRef = useRef(null);
    const [generating, setGenerating] = useState(false);
    const [formData, setFormData] = useState({
        ftrNumber: 1001,
        customerAccount: '',
        customerName: '',
        returnAddress: '',
        contactName: '',
        contactEmail: '',
        contactTel: '',
        ftrType: 'Tape',
        fabricInfo: '',
        customerRequirements: '',
        results: {},
    });
    // Define fields required for each FTR type
    const resultFields = {
        'Tape': ['Peel Strength', 'Shear Strength', 'Temperature Resistance', 'Adhesion'],
        'Seam Sealer': ['Waterproof Rating', 'Flexibility', 'Durability', 'Appearance'],
        'Laser': ['Cut Quality', 'Power Setting', 'Speed', 'Accuracy'],
        'Strip Cutter': ['Strip Width', 'Precision', 'Feed Speed', 'Quality'],
        'Other': ['Test Duration', 'Test Result', 'Observations', 'Pass/Fail'],
    };
    const handleInputChange = (e) => {
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
    const handleResultChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            results: {
                ...prev.results,
                [field]: value,
            },
        }));
    };
    const generatePDF = async () => {
        if (!pdfRef.current)
            return;
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
        }
        catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        }
        finally {
            setGenerating(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-4", children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs("div", { className: "mb-6 flex justify-between items-center", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Field Test Report (FTR)" }), _jsx("button", { onClick: () => navigate('/dashboard'), className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50", children: "Back to Dashboard" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-1 bg-white shadow rounded-lg p-6", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: "FTR Details" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "FTR Number" }), _jsx("input", { type: "number", name: "ftrNumber", value: formData.ftrNumber, onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500", readOnly: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Customer Account" }), _jsx("input", { type: "text", name: "customerAccount", value: formData.customerAccount, onChange: handleInputChange, placeholder: "Enter customer account", className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Customer / Company Name" }), _jsx("input", { type: "text", name: "customerName", value: formData.customerName, onChange: handleInputChange, placeholder: "Enter customer name", className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Return Address" }), _jsx("textarea", { name: "returnAddress", value: formData.returnAddress, onChange: handleInputChange, placeholder: "Enter return address", rows: 3, className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Contact Name" }), _jsx("input", { type: "text", name: "contactName", value: formData.contactName, onChange: handleInputChange, placeholder: "Enter contact name", className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Contact Email" }), _jsx("input", { type: "email", name: "contactEmail", value: formData.contactEmail, onChange: handleInputChange, placeholder: "Enter contact email", className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Contact Tel No." }), _jsx("input", { type: "tel", name: "contactTel", value: formData.contactTel, onChange: handleInputChange, placeholder: "Enter contact telephone", className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "FTR Type" }), _jsxs("select", { name: "ftrType", value: formData.ftrType, onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "Tape", children: "Tape" }), _jsx("option", { value: "Seam Sealer", children: "Seam Sealer" }), _jsx("option", { value: "Laser", children: "Laser" }), _jsx("option", { value: "Strip Cutter", children: "Strip Cutter" }), _jsx("option", { value: "Other", children: "Other" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Fabric Info" }), _jsx("textarea", { name: "fabricInfo", value: formData.fabricInfo, onChange: handleInputChange, placeholder: "Enter fabric information", rows: 3, className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Customer Requirements" }), _jsx("textarea", { name: "customerRequirements", value: formData.customerRequirements, onChange: handleInputChange, placeholder: "Enter customer requirements", rows: 3, className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" })] })] })] }), _jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsxs("div", { className: "bg-white shadow rounded-lg p-6", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: ["Test Results - ", formData.ftrType] }), _jsx("div", { className: "space-y-4", children: resultFields[formData.ftrType]?.map((field) => (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: field }), _jsx("input", { type: "text", value: formData.results[field] || '', onChange: (e) => handleResultChange(field, e.target.value), placeholder: `Enter ${field.toLowerCase()}`, className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" })] }, field))) })] }), _jsxs("div", { className: "bg-white shadow rounded-lg p-6", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: "PDF Preview" }), _jsx("div", { ref: pdfRef, className: "bg-white p-8 border border-gray-300 rounded overflow-hidden", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-start border-b pb-4", children: [_jsx("div", { children: _jsx("img", { src: "ardmel-logo.jpg", alt: "ARDMEL Logo", className: "h-20 w-auto" }) }), _jsxs("div", { className: "text-right", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "FIELD TEST REPORT" }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["FTR #", formData.ftrNumber] }), _jsx("p", { className: "text-sm text-gray-600", children: new Date().toLocaleDateString() })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-600 uppercase", children: "Customer Account" }), _jsx("p", { className: "text-sm text-gray-900", children: formData.customerAccount || '-' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-600 uppercase", children: "FTR Type" }), _jsx("p", { className: "text-sm text-gray-900", children: formData.ftrType })] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-600 uppercase", children: "Customer / Company Name" }), _jsx("p", { className: "text-sm text-gray-900", children: formData.customerName || '-' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-600 uppercase", children: "Return Address" }), _jsx("p", { className: "text-sm text-gray-900 whitespace-pre-wrap", children: formData.returnAddress || '-' })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-600 uppercase", children: "Name" }), _jsx("p", { className: "text-sm text-gray-900", children: formData.contactName || '-' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-600 uppercase", children: "Email" }), _jsx("p", { className: "text-sm text-gray-900", children: formData.contactEmail || '-' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-600 uppercase", children: "Tel" }), _jsx("p", { className: "text-sm text-gray-900", children: formData.contactTel || '-' })] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-600 uppercase", children: "Fabric Info" }), _jsx("p", { className: "text-sm text-gray-900 whitespace-pre-wrap", children: formData.fabricInfo || '-' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-600 uppercase", children: "Customer Requirements" }), _jsx("p", { className: "text-sm text-gray-900 whitespace-pre-wrap", children: formData.customerRequirements || '-' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-600 uppercase mb-2", children: "Test Results" }), _jsxs("table", { className: "w-full border-collapse border border-gray-300", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-100", children: [_jsx("th", { className: "border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700", children: "Parameter" }), _jsx("th", { className: "border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700", children: "Value" })] }) }), _jsx("tbody", { children: resultFields[formData.ftrType]?.map((field) => (_jsxs("tr", { children: [_jsx("td", { className: "border border-gray-300 px-3 py-2 text-xs text-gray-700", children: field }), _jsx("td", { className: "border border-gray-300 px-3 py-2 text-xs text-gray-900", children: formData.results[field] || '-' })] }, field))) })] })] }), _jsxs("div", { className: "text-center text-xs text-gray-600 border-t pt-4 mt-6", children: [_jsx("p", { children: "This is a Field Test Report generated by ARDMEL" }), _jsxs("p", { className: "mt-1", children: ["Generated on: ", new Date().toLocaleString()] })] })] }) }), _jsx("button", { onClick: generatePDF, disabled: generating, className: "mt-6 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors", children: generating ? 'Generating PDF...' : '📥 Download PDF' })] })] })] })] }) }));
};
