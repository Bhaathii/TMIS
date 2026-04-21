import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { getLoginHistoryForUser, getAllLoginHistory, getActivityLogForUser, getAllActivityLog } from '../utils/firebaseUtils';
export const LoginHistoryModal = ({ isOpen, onClose }) => {
    const [loginHistory, setLoginHistory] = useState([]);
    const [activityLog, setActivityLog] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('login');
    const { currentUser, isAdmin } = useAuth();
    useEffect(() => {
        if (isOpen && currentUser) {
            loadData();
        }
    }, [isOpen, currentUser]);
    const loadData = async () => {
        try {
            setLoading(true);
            const isAdminUser = isAdmin();
            const loginHistoryData = isAdminUser
                ? await getAllLoginHistory()
                : await getLoginHistoryForUser(currentUser.uid);
            setLoginHistory(loginHistoryData);
            const activityLogData = isAdminUser
                ? await getAllActivityLog()
                : await getActivityLogForUser(currentUser.uid);
            setActivityLog(activityLogData);
        }
        catch (error) {
            console.error('Error loading data:', error);
            setLoginHistory([]);
            setActivityLog([]);
        }
        finally {
            setLoading(false);
        }
    };
    const formatDateTime = (date) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    };
    const getActionBadgeColor = (action) => {
        switch (action) {
            case 'login':
                return 'bg-blue-100 text-blue-800';
            case 'create':
                return 'bg-green-100 text-green-800';
            case 'edit':
                return 'bg-yellow-100 text-yellow-800';
            case 'delete':
                return 'bg-red-100 text-red-800';
            case 'view':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: isAdmin() ? 'All User Activity' : 'Your Activity' }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 text-2xl cursor-pointer", children: "\u00D7" })] }), _jsxs("div", { className: "flex gap-4 mb-4 border-b border-gray-200", children: [_jsxs("button", { onClick: () => setActiveTab('login'), className: `px-4 py-2 font-medium border-b-2 transition ${activeTab === 'login'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'}`, children: ["\uD83D\uDCD6 Login History (", loginHistory.length, ")"] }), _jsxs("button", { onClick: () => setActiveTab('activity'), className: `px-4 py-2 font-medium border-b-2 transition ${activeTab === 'activity'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'}`, children: ["\uD83D\uDCCB Activity Log (", activityLog.length, ")"] })] }), loading ? (_jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-gray-500", children: "Loading..." }) })) : activeTab === 'login' ? (loginHistory.length === 0 ? (_jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-gray-500", children: "No login history available" }) })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-gray-100 border-b", children: _jsxs("tr", { children: [isAdmin() && _jsx("th", { className: "px-4 py-2 text-left font-semibold text-gray-700", children: "Email" }), _jsx("th", { className: "px-4 py-2 text-left font-semibold text-gray-700", children: "Login Time" }), _jsx("th", { className: "px-4 py-2 text-left font-semibold text-gray-700", children: "Browser" })] }) }), _jsx("tbody", { children: loginHistory.map((entry, index) => (_jsxs("tr", { className: index % 2 === 0 ? 'bg-white' : 'bg-gray-50', children: [isAdmin() && _jsx("td", { className: "px-4 py-3 text-gray-800", children: entry.email }), _jsx("td", { className: "px-4 py-3 text-gray-800", children: formatDateTime(entry.loginTime) }), _jsx("td", { className: "px-4 py-3 text-gray-600 text-xs truncate", children: entry.userAgent || 'Unknown' })] }, entry.id))) })] }) }))) : (activityLog.length === 0 ? (_jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-gray-500", children: "No activity log available" }) })) : (_jsx("div", { className: "space-y-2", children: activityLog.map((entry) => (_jsx("div", { className: "border border-gray-200 rounded-lg p-4", children: _jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { className: "flex-1", children: [isAdmin() && (_jsx("p", { className: "text-xs text-gray-500 mb-1", children: entry.email })), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `px-2 py-1 rounded text-xs font-semibold ${getActionBadgeColor(entry.action)}`, children: entry.action.toUpperCase() }), _jsx("span", { className: "text-sm text-gray-700", children: entry.description })] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: formatDateTime(entry.timestamp) })] }) }) }, entry.id))) }))), _jsx("div", { className: "mt-6 pt-4 border-t border-gray-200", children: _jsx("button", { onClick: onClose, className: "w-full px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors", children: "Close" }) })] }) }));
};
