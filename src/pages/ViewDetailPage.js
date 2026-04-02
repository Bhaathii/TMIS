import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { getTMISHeader, getLayersByHeaderId, getProcessesByHeaderId, getSlittingsByHeaderId, deleteTMISHeader, } from '../utils/firebaseUtils';
import { LayersGallery } from '../components/LayersGallery';
import { ProcessesGallery } from '../components/ProcessesGallery';
import { SlittingGallery } from '../components/SlittingGallery';
export const ViewDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { canEdit, canDelete, logout } = useAuth();
    const [header, setHeader] = useState(null);
    const [layers, setLayers] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [slittings, setSlittings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (id) {
            loadData(id);
        }
    }, [id]);
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
            else {
                setError('Record not found');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load record');
        }
        finally {
            setLoading(false);
        }
    };
    const handleDelete = async () => {
        if (!header || !id)
            return;
        if (confirm('Are you sure you want to delete this record and all associated data?')) {
            try {
                await deleteTMISHeader(id);
                navigate('/dashboard');
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete record');
            }
        }
    };
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        }
        catch (error) {
            console.error('Logout error:', error);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsx("p", { className: "text-gray-500", children: "Loading..." }) }));
    }
    if (error || !header) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50", children: _jsx("div", { className: "max-w-7xl mx-auto px-6 py-8", children: _jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-6", children: [_jsx("p", { className: "text-red-700 mb-4", children: error || 'Record not found' }), _jsx("button", { onClick: () => navigate('/dashboard'), className: "px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition", children: "Back to Dashboard" })] }) }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("nav", { className: "bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10", children: _jsxs("div", { className: "max-w-7xl mx-auto px-6 py-4 flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-gray-900", children: "TMIS Record Details" }), _jsxs("p", { className: "text-xs text-gray-500", children: ["Tape Code: ", header.TapeCode] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => navigate('/dashboard'), className: "px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition", children: "Back to Dashboard" }), _jsx("button", { onClick: handleLogout, className: "px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition", children: "Logout" })] })] }) }), _jsxs("div", { className: "max-w-7xl mx-auto px-6 py-8", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6", children: [_jsxs("div", { className: "flex justify-between items-start mb-6", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Header Information" }), _jsxs("div", { className: "flex gap-2", children: [canEdit() && (_jsx("button", { onClick: () => navigate(`/edit/${header.id}`), className: "px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition", children: "Edit" })), canDelete() && (_jsx("button", { onClick: handleDelete, className: "px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition", children: "Delete" }))] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-gray-500 uppercase mb-1", children: "Tape Code" }), _jsx("p", { className: "text-lg font-semibold text-gray-900", children: header.TapeCode })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-gray-500 uppercase mb-1", children: "Issue Date" }), _jsx("p", { className: "text-md text-gray-900", children: header.TMISIssueDate ? new Date(header.TMISIssueDate).toLocaleDateString() : 'N/A' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-gray-500 uppercase mb-1", children: "Revision No" }), _jsx("p", { className: "text-md text-gray-900", children: header.RevNo })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-gray-500 uppercase mb-1", children: "Status" }), _jsx("span", { className: `inline-block px-3 py-1 rounded-full text-sm font-medium ${header.Status === 'Active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'}`, children: header.Status })] })] }), header.AdditionalInfo && (_jsxs("div", { className: "mb-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-700 mb-2", children: "Additional Info" }), _jsx("p", { className: "text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded", children: header.AdditionalInfo })] })), header.TMISComments && (_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-700 mb-2", children: "TMIS Comments" }), _jsx("p", { className: "text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded", children: header.TMISComments })] }))] }), _jsx(LayersGallery, { layers: layers, isEditable: false, maxLayers: 5 }), _jsx("div", { className: "my-6" }), _jsx(ProcessesGallery, { processes: processes, isEditable: false }), _jsx("div", { className: "my-6" }), _jsx(SlittingGallery, { slittings: slittings, isEditable: false, maxSlittings: 3 })] })] }));
};
