import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { getTMISHeader, updateTMISHeader, addTMISHeader, getLayersByHeaderId, getProcessesByHeaderId, getSlittingsByHeaderId, addTMISLayer, updateTMISLayer, addTMISProcess, updateTMISProcess, addTMISSlitting, updateTMISSlitting, } from '../utils/firebaseUtils';
import { LayersGallery } from '../components/LayersGallery';
import { ProcessesGallery } from '../components/ProcessesGallery';
import { SlittingGallery } from '../components/SlittingGallery';
export const CreateEditPage = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const { currentUser, canEdit } = useAuth();
    const [header, setHeader] = useState({
        TMISIssueDate: new Date(),
        RevNo: 0,
        Status: 'Active',
        TapeCode: '',
    });
    const [layers, setLayers] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [slittings, setSlittings] = useState([]);
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!canEdit()) {
            navigate('/dashboard');
            return;
        }
        if (isEditMode && id) {
            loadData(id);
        }
    }, [id, isEditMode, canEdit, navigate]);
    const loadData = async (headerId) => {
        try {
            setLoading(true);
            const headerData = await getTMISHeader(headerId);
            if (headerData) {
                setHeader(headerData);
                const layersData = await getLayersByHeaderId(headerId);
                const processesData = await getProcessesByHeaderId(headerId);
                const slittingsData = await getSlittingsByHeaderId(headerId);
                setLayers(layersData);
                setProcesses(processesData);
                setSlittings(slittingsData);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        }
        finally {
            setLoading(false);
        }
    };
    const handleHeaderChange = (field, value) => {
        setHeader((prev) => ({ ...prev, [field]: value }));
    };
    const handleAddLayer = () => {
        const newLayer = {
            id: `temp-${Date.now()}`,
            headerId: header.id || '',
            LayerNo: layers.length + 1,
            LayerDescription: '',
        };
        setLayers([...layers, newLayer]);
    };
    const handleUpdateLayer = (index, layer) => {
        const newLayers = [...layers];
        newLayers[index] = layer;
        setLayers(newLayers);
    };
    const handleDeleteLayer = (index) => {
        const newLayers = layers.filter((_, i) => i !== index);
        setLayers(newLayers);
    };
    const handleAddProcess = () => {
        const newProcess = {
            id: `temp-${Date.now()}`,
            headerId: header.id || '',
            ProcessLetter: 'A',
        };
        setProcesses([...processes, newProcess]);
    };
    const handleUpdateProcess = (index, process) => {
        const newProcesses = [...processes];
        newProcesses[index] = process;
        setProcesses(newProcesses);
    };
    const handleDeleteProcess = (index) => {
        const newProcesses = processes.filter((_, i) => i !== index);
        setProcesses(newProcesses);
    };
    const handleAddSlitting = () => {
        const newSlitting = {
            id: `temp-${Date.now()}`,
            headerId: header.id || '',
            RowNo: slittings.length + 1,
        };
        setSlittings([...slittings, newSlitting]);
    };
    const handleUpdateSlitting = (index, slitting) => {
        const newSlittings = [...slittings];
        newSlittings[index] = slitting;
        setSlittings(newSlittings);
    };
    const handleDeleteSlitting = (index) => {
        const newSlittings = slittings.filter((_, i) => i !== index);
        setSlittings(newSlittings);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSaving(true);
        try {
            let headerId = header.id;
            if (isEditMode && headerId) {
                // Update existing header
                await updateTMISHeader(headerId, header);
                // Handle layers
                for (const layer of layers) {
                    if (layer.id.startsWith('temp-')) {
                        const { id: _, ...layerData } = layer;
                        await addTMISLayer({
                            ...layerData,
                            headerId,
                        });
                    }
                    else {
                        await updateTMISLayer(layer.id, layer);
                    }
                }
                // Handle processes
                for (const process of processes) {
                    if (process.id.startsWith('temp-')) {
                        const { id: _, ...processData } = process;
                        await addTMISProcess({
                            ...processData,
                            headerId,
                        });
                    }
                    else {
                        await updateTMISProcess(process.id, process);
                    }
                }
                // Handle slittings
                for (const slitting of slittings) {
                    if (slitting.id.startsWith('temp-')) {
                        const { id: _, ...slittingData } = slitting;
                        await addTMISSlitting({
                            ...slittingData,
                            headerId,
                        });
                    }
                    else {
                        await updateTMISSlitting(slitting.id, slitting);
                    }
                }
            }
            else {
                // Create new header
                headerId = await addTMISHeader({
                    ...header,
                    createdBy: currentUser?.uid || '',
                });
                // Add child records
                for (const layer of layers) {
                    const { id: _, ...layerData } = layer;
                    await addTMISLayer({
                        ...layerData,
                        headerId,
                    });
                }
                for (const process of processes) {
                    const { id: _, ...processData } = process;
                    await addTMISProcess({
                        ...processData,
                        headerId,
                    });
                }
                for (const slitting of slittings) {
                    const { id: _, ...slittingData } = slitting;
                    await addTMISSlitting({
                        ...slittingData,
                        headerId,
                    });
                }
            }
            navigate(`/view/${headerId}`);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save record');
        }
        finally {
            setSaving(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsx("p", { className: "text-gray-500", children: "Loading..." }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10", children: _jsxs("div", { className: "max-w-7xl mx-auto px-6 py-4 flex justify-between items-center", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: isEditMode ? 'Edit Record' : 'Create New Record' }), _jsx("button", { onClick: () => navigate(-1), className: "px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition", children: "Cancel" })] }) }), _jsxs("div", { className: "max-w-7xl mx-auto px-6 py-8", children: [error && (_jsx("div", { className: "mb-6 p-4 bg-red-50 border border-red-200 rounded-lg", children: _jsx("p", { className: "text-red-700", children: error }) })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-sm p-6 border border-gray-200", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-6", children: "Header Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Tape Code *" }), _jsx("input", { type: "text", value: header.TapeCode || '', onChange: (e) => handleHeaderChange('TapeCode', e.target.value), required: true, placeholder: "Enter tape code", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Issue Date *" }), _jsx("input", { type: "date", value: header.TMISIssueDate instanceof Date
                                                            ? header.TMISIssueDate.toISOString().split('T')[0]
                                                            : '', onChange: (e) => handleHeaderChange('TMISIssueDate', new Date(e.target.value)), required: true, className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Revision No" }), _jsx("input", { type: "number", value: header.RevNo || 0, onChange: (e) => handleHeaderChange('RevNo', parseInt(e.target.value)), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Status" }), _jsxs("select", { value: header.Status || 'Active', onChange: (e) => handleHeaderChange('Status', e.target.value), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition bg-white", children: [_jsx("option", { value: "Active", children: "Active" }), _jsx("option", { value: "Obsolete", children: "Obsolete" })] })] })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Additional Info" }), _jsx("textarea", { value: header.AdditionalInfo || '', onChange: (e) => handleHeaderChange('AdditionalInfo', e.target.value), placeholder: "Additional information...", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none", rows: 3 })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "TMIS Comments" }), _jsx("textarea", { value: header.TMISComments || '', onChange: (e) => handleHeaderChange('TMISComments', e.target.value), placeholder: "Enter comments...", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none", rows: 3 })] })] }), _jsx(LayersGallery, { layers: layers, isEditable: true, onAdd: handleAddLayer, onUpdate: handleUpdateLayer, onDelete: handleDeleteLayer, maxLayers: 5 }), _jsx(ProcessesGallery, { processes: processes, isEditable: true, onAdd: handleAddProcess, onUpdate: handleUpdateProcess, onDelete: handleDeleteProcess }), _jsx(SlittingGallery, { slittings: slittings, isEditable: true, onAdd: handleAddSlitting, onUpdate: handleUpdateSlitting, onDelete: handleDeleteSlitting, maxSlittings: 3 }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx("button", { type: "button", onClick: () => navigate(-1), className: "px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition", children: "Cancel" }), _jsx("button", { type: "submit", disabled: saving, className: "px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed", children: saving ? 'Saving...' : isEditMode ? 'Update Record' : 'Create Record' })] })] })] })] }));
};
