import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { searchTMISByTapeCode, getAllTMISHeaders, getProcessesByHeaderId, getLayersByHeaderId, getLatestFTRNumber, saveFTRReport, } from '../utils/firebaseUtils';
export const FTRPage = () => {
    const navigate = useNavigate();
    const previewContentRef = useRef(null);
    const [tmisRecords, setTmisRecords] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);
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
        ftrType: 'Tape',
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
            }
            catch (error) {
                console.error('Error initializing FTR page:', error);
            }
            finally {
                setLoading(false);
            }
        };
        initializeData();
    }, []);
    // Handle tape code entry - search TMIS and auto-fill ALL technical parameters
    const handleTapeCodeChange = async (tapeCode) => {
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
            }
            catch (error) {
                console.error('Error searching TMIS:', error);
            }
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleTechnicalParamChange = (field, value) => {
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
        }
        catch (error) {
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
        }
        catch (error) {
            alert(`Error saving FTR: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 p-4", children: [_jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-6 flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Field Test Report (FTR)" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "\u2713 Auto-fill FTR #  \u2713 Auto-fill Date  \u2713 Search Tape Code to Auto-fill Details" })] }), _jsx("button", { onClick: () => navigate('/dashboard'), className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50", children: "\u2190 Back" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-6", children: [_jsxs("div", { className: "lg:col-span-1 bg-white shadow rounded-lg p-6 h-fit", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "\uD83D\uDD0D TMIS Lookup" }), selectedRecord ? (_jsxs("div", { className: "p-3 bg-blue-50 border-2 border-blue-300 rounded mb-4", children: [_jsx("p", { className: "text-sm font-bold text-blue-900", children: "\u2713 Linked:" }), _jsx("p", { className: "text-sm font-bold text-blue-700", children: selectedRecord.TapeCode }), _jsxs("p", { className: "text-xs text-blue-600 mt-1", children: ["Status: ", selectedRecord.Status] })] })) : (_jsx("div", { className: "p-3 bg-gray-100 border border-gray-300 rounded mb-4 text-center", children: _jsx("p", { className: "text-sm text-gray-600", children: "No tape selected" }) })), _jsx("h3", { className: "text-sm font-semibold text-gray-900 mb-2", children: "Available Tapes" }), _jsx("div", { className: "space-y-1 max-h-96 overflow-y-auto border border-gray-200 rounded p-2 bg-white", children: loading ? (_jsx("p", { className: "text-sm text-gray-500 p-2", children: "Loading..." })) : tmisRecords.length > 0 ? (tmisRecords.map(record => (_jsxs("button", { onClick: () => handleTapeCodeChange(record.TapeCode), className: `w-full text-left px-2 py-2 rounded text-sm border transition ${selectedRecord?.id === record.id
                                                ? 'bg-blue-100 border-blue-400 font-semibold'
                                                : 'hover:bg-gray-50 border-gray-200'}`, children: [_jsx("p", { className: "font-semibold", children: record.TapeCode }), _jsx("p", { className: "text-xs text-gray-600", children: record.Status })] }, record.id)))) : (_jsx("p", { className: "text-sm text-gray-500 p-2", children: "No tapes found" })) })] }), _jsxs("div", { className: "lg:col-span-3 space-y-6", children: [_jsxs("div", { className: "bg-white shadow rounded-lg p-6", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: "\uD83D\uDCCB FTR Details" }), _jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "FTR Number" }), _jsx("input", { type: "number", value: formData.ftrNumber, readOnly: true, className: "w-full px-3 py-2 border border-gray-300 rounded-md bg-green-100 text-gray-900 font-semibold cursor-not-allowed" }), _jsx("p", { className: "text-xs text-green-700 mt-1", children: "\u2713 Auto" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Date Raised" }), _jsx("input", { type: "date", value: formData.dateRaised, readOnly: true, className: "w-full px-3 py-2 border border-gray-300 rounded-md bg-green-100 text-gray-900 font-semibold cursor-not-allowed" }), _jsx("p", { className: "text-xs text-green-700 mt-1", children: "\u2713 Auto" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Customer" }), _jsx("input", { type: "text", name: "customer", value: formData.customer, onChange: handleInputChange, placeholder: "Enter name", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Category" }), _jsx("input", { type: "text", name: "ftrCategory", value: formData.ftrCategory, onChange: handleInputChange, placeholder: "Test type", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Status" }), _jsxs("select", { name: "status", value: formData.status, onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "Open", children: "Open" }), _jsx("option", { value: "In Progress", children: "In Progress" }), _jsx("option", { value: "Closed", children: "Closed" }), _jsx("option", { value: "On Hold", children: "On Hold" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Priority" }), _jsxs("select", { name: "priority", value: formData.priority, onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "Low", children: "Low" }), _jsx("option", { value: "Medium", children: "Medium" }), _jsx("option", { value: "High", children: "High" }), _jsx("option", { value: "Critical", children: "Critical" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Raised By" }), _jsx("input", { type: "text", name: "raisedBy", value: formData.raisedBy, onChange: handleInputChange, placeholder: "Your name", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Target Date" }), _jsx("input", { type: "date", name: "targetDate", value: formData.targetDate, onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] }), _jsxs("div", { className: "grid grid-cols-1 gap-4 mt-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }), _jsx("textarea", { name: "description", value: formData.description, onChange: handleInputChange, placeholder: "Describe the test...", rows: 2, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Remarks" }), _jsx("textarea", { name: "remarks", value: formData.remarks, onChange: handleInputChange, placeholder: "Additional remarks...", rows: 2, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] })] }), _jsxs("div", { className: "bg-white shadow rounded-lg p-6 border-2 border-blue-200", children: [_jsx("h2", { className: "text-xl font-semibold text-blue-900 mb-4", children: "\uD83D\uDD17 Auto-filled from TMIS" }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-blue-800 mb-1", children: "Fabric Info" }), _jsx("textarea", { name: "fabricInfo", value: formData.fabricInfo, onChange: handleInputChange, placeholder: "Auto-filled from TMIS...", rows: 3, className: "w-full px-3 py-2 border-2 border-blue-300 rounded-md bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-blue-800 mb-1", children: "Customer Requirement" }), _jsx("textarea", { name: "customerRequirement", value: formData.customerRequirement, onChange: handleInputChange, placeholder: "Auto-filled from TMIS...", rows: 3, className: "w-full px-3 py-2 border-2 border-blue-300 rounded-md bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] })] }), _jsxs("div", { className: "bg-white shadow rounded-lg p-6 border-2 border-purple-200", children: [_jsx("h2", { className: "text-xl font-semibold text-purple-900 mb-4", children: "\u2699\uFE0F Technical Parameters" }), _jsxs("div", { className: "mb-6", children: [_jsxs("label", { className: "block text-sm font-bold text-purple-900 mb-2", children: ["Tape Code \uD83D\uDD11 ", _jsx("span", { className: "text-red-600", children: "*Required" })] }), _jsx("input", { type: "text", value: formData.technicalParams.tapeCode, onChange: (e) => handleTapeCodeChange(e.target.value), placeholder: "Enter tape code (e.g., TC-001) to auto-fill TMIS details", className: "w-full px-4 py-3 border-3 border-purple-400 rounded-md bg-purple-50 text-gray-900 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-purple-600" }), selectedRecord && (_jsxs("p", { className: "text-sm text-green-600 font-semibold mt-2", children: ["\u2713 Matched with TMIS: ", selectedRecord.TapeCode] }))] }), _jsxs("div", { className: "mb-4 p-3 bg-blue-50 border border-blue-200 rounded", children: [_jsx("p", { className: "text-sm font-semibold text-blue-900 mb-3", children: "\uD83D\uDFE6 Fields Auto-filled from TMIS:" }), _jsx("div", { className: "grid grid-cols-2 lg:grid-cols-3 gap-4", children: [
                                                            { field: 'machineType', label: '1. Machine Type', source: '(from TMIS Process)' },
                                                            { field: 'fabric', label: '2. Fabric', source: '(from TMIS Layer)' },
                                                            { field: 'tapeWidth', label: '3. Tape Width', source: '(from TMIS Layer)' },
                                                            { field: 'temperature', label: '4. Temperature', source: '(from TMIS Process Heat)' },
                                                            { field: 'airFlow', label: '5. Air Flow', source: '(from TMIS Process)' },
                                                            { field: 'speed', label: '6. Speed', source: '(from TMIS Process)' },
                                                            { field: 'quillPressure', label: '7. Quill Pressure', source: '(from TMIS Press)' },
                                                        ].map(({ field, label, source }) => (_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-blue-900 mb-1", children: [label, " ", _jsx("span", { className: "text-xs text-blue-700", children: source })] }), _jsx("input", { type: "text", value: formData.technicalParams[field] || '', onChange: (e) => handleTechnicalParamChange(field, e.target.value), placeholder: "Value", className: "w-full px-2 py-2 border-2 border-blue-300 rounded-md bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold" })] }, field))) })] }), _jsxs("div", { className: "mb-4 p-3 bg-orange-50 border border-orange-200 rounded", children: [_jsx("p", { className: "text-sm font-semibold text-orange-900 mb-3", children: "\uD83D\uDFE8 Fields for Manual Entry:" }), _jsx("div", { className: "grid grid-cols-2 lg:grid-cols-3 gap-4", children: [
                                                            { field: 'nozzlePosition', label: '8. Nozzle Position' },
                                                            { field: 'rollerTemperature', label: '9. Roller Temp' },
                                                            { field: 'differential', label: '10. Differential' },
                                                            { field: 'depthStop', label: '11. Depth Stop' },
                                                            { field: 'hydroTest', label: '12. Hydro Test' },
                                                            { field: 'gaugeSetting', label: '13. Gauge Setting' },
                                                        ].map(({ field, label }) => (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-orange-900 mb-1", children: label }), _jsx("input", { type: "text", value: formData.technicalParams[field] || '', onChange: (e) => handleTechnicalParamChange(field, e.target.value), placeholder: "Enter value", className: "w-full px-2 py-2 border border-orange-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-500" })] }, field))) })] }), _jsxs("div", { className: "mt-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Attachments/Notes" }), _jsx("input", { type: "text", name: "attachments", value: formData.attachments, onChange: handleInputChange, placeholder: "Add file references or notes", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" })] }), _jsxs("div", { className: "mt-6 flex gap-3", children: [_jsx("button", { onClick: handlePreview, className: "px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-50", disabled: loading, children: "\uD83D\uDC41\uFE0F Preview PDF" }), _jsx("button", { onClick: handleSaveFTR, className: "px-6 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition disabled:opacity-50", disabled: loading, children: loading ? '⏳ Saving...' : '💾 Save FTR' })] })] })] })] })] }), showPreview && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2", children: _jsxs("div", { className: "bg-white rounded-lg shadow-2xl w-full max-h-[95vh] flex flex-col", style: { maxWidth: '900px' }, children: [_jsxs("div", { className: "flex justify-between items-center p-4 border-b border-gray-300 bg-gradient-to-r from-blue-600 to-blue-700", children: [_jsx("h2", { className: "text-xl font-bold text-white", children: "\uD83D\uDCC4 FTR PDF Preview" }), _jsx("button", { onClick: () => setShowPreview(false), className: "text-white hover:text-gray-200 text-2xl font-bold", children: "\u2715" })] }), _jsx("div", { className: "flex-1 overflow-y-auto bg-gray-100 p-4", children: _jsxs("div", { ref: previewContentRef, className: "bg-white shadow-xl mx-auto", style: { width: '210mm', fontFamily: 'Arial, sans-serif', padding: '20px' }, children: [_jsxs("div", { className: "flex justify-between items-start mb-6 pb-3", style: { borderBottom: '1px solid #000' }, children: [_jsx("div", { className: "flex items-start", children: _jsx("img", { src: "/ardmel-logo.jpg", alt: "ARDMEL Logo", className: "object-contain", style: { height: '50px', width: 'auto' } }) }), _jsxs("div", { className: "text-right", children: [_jsx("div", { style: { fontSize: '18px', fontWeight: 'bold', color: '#000' }, children: "FIELD TEST REPORT" }), _jsxs("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#000', marginTop: '2px' }, children: ["FTR #", formData.ftrNumber] })] })] }), _jsxs("div", { style: { marginBottom: '10px', border: '1px solid #000' }, children: [_jsxs("div", { style: { display: 'flex', borderBottom: '1px solid #000' }, children: [_jsxs("div", { style: { flex: 1, borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#d3d3d3' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold' }, children: "FTR #" }), _jsx("div", { style: { fontSize: '11px' }, children: formData.ftrNumber })] }), _jsxs("div", { style: { flex: 1, borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#d3d3d3' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold' }, children: "DATE RAISED" }), _jsx("div", { style: { fontSize: '11px' }, children: formData.dateRaised })] }), _jsxs("div", { style: { flex: 1, borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#d3d3d3' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold' }, children: "CUSTOMER" }), _jsx("div", { style: { fontSize: '11px' }, children: formData.customer || '-' })] }), _jsxs("div", { style: { flex: 1, padding: '4px 6px', backgroundColor: '#d3d3d3' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold' }, children: "CATEGORY" }), _jsx("div", { style: { fontSize: '11px' }, children: formData.ftrCategory || '-' })] })] }), _jsxs("div", { style: { display: 'flex', borderBottom: '1px solid #000' }, children: [_jsxs("div", { style: { flex: 1, borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#d3d3d3' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold' }, children: "STATUS" }), _jsx("div", { style: { fontSize: '11px' }, children: formData.status })] }), _jsxs("div", { style: { flex: 1, borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#d3d3d3' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold' }, children: "PRIORITY" }), _jsx("div", { style: { fontSize: '11px' }, children: formData.priority })] }), _jsxs("div", { style: { flex: 1, borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#d3d3d3' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold' }, children: "RESPONSIBLE" }), _jsx("div", { style: { fontSize: '11px' }, children: formData.responsiblePerson || '-' })] }), _jsxs("div", { style: { flex: 1, padding: '4px 6px', backgroundColor: '#d3d3d3' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold' }, children: "TARGET DATE" }), _jsx("div", { style: { fontSize: '11px' }, children: formData.targetDate || '-' })] })] }), _jsxs("div", { style: { display: 'flex' }, children: [_jsxs("div", { style: { width: '25%', borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#d3d3d3' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold' }, children: "RAISED BY" }), _jsx("div", { style: { fontSize: '11px' }, children: formData.raisedBy || '-' })] }), _jsxs("div", { style: { width: '25%', borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#d3d3d3' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold' }, children: "FTR TYPE" }), _jsx("div", { style: { fontSize: '11px' }, children: formData.ftrType })] }), _jsxs("div", { style: { width: '50%', padding: '4px 6px', backgroundColor: '#d3d3d3' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold' }, children: "SUPPORT INK" }), _jsx("div", { style: { fontSize: '11px' }, children: formData.supportInk || '-' })] })] })] }), _jsxs("div", { style: { marginBottom: '8px' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold', marginBottom: '2px', borderBottom: '1px solid #000', paddingBottom: '2px' }, children: "DESCRIPTION" }), _jsx("div", { style: { border: '1px solid #000', padding: '6px', backgroundColor: '#fff', minHeight: '30px', fontSize: '10px' }, children: formData.description || '-' })] }), _jsxs("div", { style: { marginBottom: '8px' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold', marginBottom: '2px', borderBottom: '1px solid #000', paddingBottom: '2px' }, children: "REMARKS" }), _jsx("div", { style: { border: '1px solid #000', padding: '6px', backgroundColor: '#fff', minHeight: '30px', fontSize: '10px' }, children: formData.remarks || '-' })] }), _jsxs("div", { style: { display: 'flex', gap: '8px', marginBottom: '8px' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold', marginBottom: '2px', borderBottom: '1px solid #000', paddingBottom: '2px' }, children: "FABRIC INFO" }), _jsx("div", { style: { border: '1px solid #000', padding: '6px', backgroundColor: '#fff', minHeight: '30px', fontSize: '10px' }, children: formData.fabricInfo || '-' })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold', marginBottom: '2px', borderBottom: '1px solid #000', paddingBottom: '2px' }, children: "CUSTOMER REQUIREMENT" }), _jsx("div", { style: { border: '1px solid #000', padding: '6px', backgroundColor: '#fff', minHeight: '30px', fontSize: '10px' }, children: formData.customerRequirement || '-' })] })] }), _jsxs("div", { style: { marginBottom: '8px' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold', marginBottom: '2px', borderBottom: '1px solid #000', paddingBottom: '2px' }, children: "ATTACHMENTS" }), _jsx("div", { style: { border: '1px solid #000', padding: '6px', backgroundColor: '#fff', minHeight: '20px', fontSize: '10px' }, children: formData.attachments || '-' })] }), _jsxs("div", { style: { marginBottom: '8px' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold', marginBottom: '2px', borderBottom: '2px solid #000', paddingBottom: '2px' }, children: "TECHNICAL PARAMETERS / SETTINGS" }), _jsxs("div", { style: { border: '1px solid #000' }, children: [_jsxs("div", { style: { display: 'flex', borderBottom: '1px solid #000' }, children: [_jsxs("div", { style: { width: '25%', borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#fff' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold' }, children: "1. Machine Type" }), _jsx("div", { style: { fontSize: '10px' }, children: formData.technicalParams.machineType || '-' })] }), _jsxs("div", { style: { width: '25%', borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#fff' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold' }, children: "2. Fabric" }), _jsx("div", { style: { fontSize: '10px' }, children: formData.technicalParams.fabric || '-' })] }), _jsxs("div", { style: { width: '25%', borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#fff' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold' }, children: "3. Tape Code" }), _jsx("div", { style: { fontSize: '10px' }, children: formData.technicalParams.tapeCode || '-' })] }), _jsxs("div", { style: { width: '25%', padding: '4px 6px', backgroundColor: '#fff' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold' }, children: "4. Tape Width" }), _jsx("div", { style: { fontSize: '10px' }, children: formData.technicalParams.tapeWidth || '-' })] })] }), _jsxs("div", { style: { display: 'flex', borderBottom: '1px solid #000' }, children: [_jsxs("div", { style: { width: '25%', borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#fff' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold' }, children: "5. Temperature" }), _jsx("div", { style: { fontSize: '10px' }, children: formData.technicalParams.temperature || '-' })] }), _jsxs("div", { style: { width: '25%', borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#fff' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold' }, children: "6. Air Flow" }), _jsx("div", { style: { fontSize: '10px' }, children: formData.technicalParams.airFlow || '-' })] }), _jsxs("div", { style: { width: '25%', borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#fff' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold' }, children: "7. Speed (m/min)" }), _jsx("div", { style: { fontSize: '10px' }, children: formData.technicalParams.speed || '-' })] }), _jsxs("div", { style: { width: '25%', padding: '4px 6px', backgroundColor: '#fff' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold' }, children: "8. Quill Pressure (psi)" }), _jsx("div", { style: { fontSize: '10px' }, children: formData.technicalParams.quillPressure || '-' })] })] }), _jsxs("div", { style: { display: 'flex', borderBottom: '1px solid #000' }, children: [_jsxs("div", { style: { width: '25%', borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#fff' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold' }, children: "9. Nozzle Position" }), _jsx("div", { style: { fontSize: '10px' }, children: formData.technicalParams.nozzlePosition || '-' })] }), _jsxs("div", { style: { width: '25%', borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#fff' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold' }, children: "10. Roller Temp (\u00B0C)" }), _jsx("div", { style: { fontSize: '10px' }, children: formData.technicalParams.rollerTemperature || '-' })] }), _jsxs("div", { style: { width: '25%', borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#fff' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold' }, children: "11. Differential" }), _jsx("div", { style: { fontSize: '10px' }, children: formData.technicalParams.differential || '-' })] }), _jsxs("div", { style: { width: '25%', padding: '4px 6px', backgroundColor: '#fff' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold' }, children: "12. Depth Stop" }), _jsx("div", { style: { fontSize: '10px' }, children: formData.technicalParams.depthStop || '-' })] })] }), _jsxs("div", { style: { display: 'flex' }, children: [_jsxs("div", { style: { width: '25%', borderRight: '1px solid #000', padding: '4px 6px', backgroundColor: '#fff' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold' }, children: "13. Hydro Test (Bar)" }), _jsx("div", { style: { fontSize: '10px' }, children: formData.technicalParams.hydroTest || '-' })] }), _jsxs("div", { style: { width: '75%', padding: '4px 6px', backgroundColor: '#fff' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold' }, children: "14. Gauge Setting" }), _jsx("div", { style: { fontSize: '10px' }, children: formData.technicalParams.gaugeSetting || '-' })] })] })] })] }), _jsxs("div", { style: { marginBottom: '8px', paddingTop: '6px', borderTop: '1px solid #000' }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }, children: "Warning \u2013 Guidance Only:" }), _jsx("div", { style: { fontSize: '9px', lineHeight: '1.4', color: '#333' }, children: "Samples are provided; users should make their own tests to determine the suitability of our settings and/or materials prior to production. As Ardmel Automation Ltd cannot foresee the varied conditions under which this information and our materials may be used, we shall not be held liable for incidental or consequential damages or costs in connection with the supply, performance or use of this material or this information." })] }), _jsxs("div", { style: { textAlign: 'center', fontSize: '9px', color: '#666', paddingTop: '6px', borderTop: '1px solid #000' }, children: [_jsx("div", { children: "Field Test Report Generated by ARDMEL" }), _jsx("div", { children: new Date().toLocaleString() })] })] }) }), _jsxs("div", { className: "flex justify-end gap-3 p-4 border-t border-gray-300 bg-gray-50", children: [_jsx("button", { onClick: () => setShowPreview(false), className: "px-4 py-2 text-gray-700 bg-white border border-gray-400 rounded-md hover:bg-gray-100 font-semibold text-sm", children: "Close" }), _jsx("button", { onClick: handleDownloadPDF, className: "px-6 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition text-sm", children: "\u2713 Download PDF" })] })] }) }))] }));
};
