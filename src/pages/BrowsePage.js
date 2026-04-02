import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { getAllTMISHeaders, searchTMISByTapeCode } from '../utils/firebaseUtils';
export const BrowsePage = () => {
    const [headers, setHeaders] = useState([]);
    const [filteredHeaders, setFilteredHeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTape, setSearchTape] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    useEffect(() => {
        loadHeaders();
    }, [currentUser]);
    const loadHeaders = async () => {
        try {
            setLoading(true);
            const data = await getAllTMISHeaders();
            setHeaders(data);
            setFilteredHeaders(data);
        }
        catch (error) {
            console.error('Error loading headers:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSearch = async (value) => {
        setSearchTape(value);
        await applyFilters(value, statusFilter);
    };
    const handleStatusFilter = async (status) => {
        setStatusFilter(status);
        await applyFilters(searchTape, status);
    };
    const applyFilters = async (tape, status) => {
        let result = headers;
        if (tape) {
            result = await searchTMISByTapeCode(tape);
        }
        if (status !== 'All') {
            result = result.filter((h) => h.Status === status);
        }
        setFilteredHeaders(result);
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
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("nav", { className: "bg-white shadow-sm border-b border-gray-200", children: _jsxs("div", { className: "max-w-7xl mx-auto px-6 py-4 flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "TMIS" }), _jsx("p", { className: "text-xs text-gray-500", children: "Tape Management Information System" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: currentUser?.email }), _jsx("p", { className: "text-xs text-gray-500 capitalize", children: currentUser?.role })] }), _jsx("button", { onClick: handleLogout, className: "px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition", children: "Logout" })] })] }) }), _jsxs("div", { className: "max-w-7xl mx-auto px-6 py-8", children: [_jsxs("div", { className: "flex justify-between items-center mb-8", children: [_jsx("h2", { className: "text-3xl font-bold text-gray-900", children: "TMIS Records" }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => navigate('/ftr'), className: "px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition", children: "\uD83D\uDCCB FTR" }), (currentUser?.role?.trim() === 'admin' || currentUser?.role?.trim() === 'editor') && (_jsx("button", { onClick: () => navigate('/create'), className: "px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition", children: "+ New Record" }))] })] }), _jsx("div", { className: "bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Search by Tape Code" }), _jsx("input", { type: "text", value: searchTape, onChange: (e) => handleSearch(e.target.value), placeholder: "Enter tape code...", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Status" }), _jsxs("select", { value: statusFilter, onChange: (e) => handleStatusFilter(e.target.value), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition bg-white", children: [_jsx("option", { children: "All" }), _jsx("option", { children: "Active" }), _jsx("option", { children: "Obsolete" })] })] }), _jsx("div", { className: "flex items-end", children: _jsxs("p", { className: "text-sm text-gray-600", children: [filteredHeaders.length, " record", filteredHeaders.length !== 1 ? 's' : '', " found"] }) })] }) }), loading ? (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-500", children: "Loading records..." }) })) : filteredHeaders.length === 0 ? (_jsxs("div", { className: "text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200", children: [_jsx("p", { className: "text-gray-500 mb-4", children: "No records found" }), (currentUser?.role?.trim() === 'admin' || currentUser?.role?.trim() === 'editor') && (_jsx("button", { onClick: () => navigate('/create'), className: "px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition", children: "Create First Record" }))] })) : (_jsx("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 border-b border-gray-200", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase", children: "Tape Code" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase", children: "Issue Date" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase", children: "Revision" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200", children: filteredHeaders.map((header) => {
                                        const isAdmin = currentUser?.role?.trim() === 'admin';
                                        const isEditor = currentUser?.role?.trim() === 'editor';
                                        const canUserEdit = isAdmin || isEditor;
                                        const canUserDelete = isAdmin;
                                        return (_jsxs("tr", { className: "hover:bg-gray-50 transition", children: [_jsx("td", { className: "px-6 py-4 text-sm font-medium text-gray-900", children: header.TapeCode }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: header.TMISIssueDate ? new Date(header.TMISIssueDate).toLocaleDateString() : 'N/A' }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: header.RevNo }), _jsx("td", { className: "px-6 py-4 text-sm", children: _jsx("span", { className: `px-3 py-1 rounded-full text-xs font-medium ${header.Status === 'Active'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'}`, children: header.Status }) }), _jsx("td", { className: "px-6 py-4 text-right", children: _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { onClick: () => navigate(`/view/${header.id}`), className: "px-3 py-1 text-sm text-primary-600 hover:text-primary-700 font-medium", children: "View" }), canUserEdit && (_jsx("button", { onClick: () => navigate(`/edit/${header.id}`), className: "px-3 py-1 text-sm text-primary-600 hover:text-primary-700 font-medium", children: "Edit" })), canUserDelete && (_jsx("button", { onClick: () => {
                                                                    if (confirm('Are you sure you want to delete this record?')) {
                                                                        // Handle delete
                                                                    }
                                                                }, className: "px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium", children: "Delete" }))] }) })] }, header.id));
                                    }) })] }) }))] })] }));
};
