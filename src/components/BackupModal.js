import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { downloadBackup, getBackupStats, formatBytes, backupAllData } from '../utils/backupUtils';
export const BackupModal = ({ isOpen, onClose }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [backupSize, setBackupSize] = useState('0 KB');
    const [message, setMessage] = useState('');
    useEffect(() => {
        if (isOpen) {
            loadStats();
        }
    }, [isOpen]);
    const loadStats = async () => {
        try {
            setLoading(true);
            const backupStats = await getBackupStats();
            setStats(backupStats);
            // Calculate backup size
            const backup = await backupAllData();
            const json = JSON.stringify(backup);
            const bytes = new Blob([json]).size;
            setBackupSize(formatBytes(bytes));
        }
        catch (error) {
            setMessage('Error loading backup stats');
        }
        finally {
            setLoading(false);
        }
    };
    const handleDownloadBackup = async () => {
        try {
            setDownloading(true);
            setMessage('Preparing backup...');
            await downloadBackup();
            setMessage('✅ Backup downloaded successfully!');
            setTimeout(() => setMessage(''), 3000);
        }
        catch (error) {
            setMessage('❌ Error downloading backup');
        }
        finally {
            setDownloading(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-md w-full p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Data Backup & Recovery" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 text-2xl", children: "\u00D7" })] }), loading ? (_jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-gray-500", children: "Loading backup information..." }) })) : (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-blue-50 rounded-lg p-4 border border-blue-200", children: [_jsx("h3", { className: "text-sm font-semibold text-blue-900 mb-2", children: "Current Data" }), stats && (_jsxs("div", { className: "space-y-1 text-sm text-blue-800", children: [_jsxs("p", { children: ["\uD83D\uDCCB TMIS Records: ", stats.headers] }), _jsxs("p", { children: ["\uD83D\uDCD1 Layers: ", stats.layers] }), _jsxs("p", { children: ["\u2699\uFE0F Processes: ", stats.processes] }), _jsxs("p", { children: ["\u2702\uFE0F Slittings: ", stats.slittings] }), _jsxs("p", { className: "font-semibold mt-2 text-blue-900", children: ["Total Items: ", stats.total] }), _jsxs("p", { className: "text-xs text-blue-600 mt-1", children: ["Backup Size: ", backupSize] })] }))] }), _jsx("div", { className: "bg-yellow-50 rounded-lg p-4 border border-yellow-200", children: _jsxs("p", { className: "text-sm text-yellow-800", children: [_jsx("strong", { children: "\u26A0\uFE0F Important:" }), " Regular backups protect your data from loss. Download backups weekly or after major changes."] }) }), _jsxs("div", { className: "bg-green-50 rounded-lg p-4 border border-green-200", children: [_jsx("h3", { className: "text-sm font-semibold text-green-900 mb-2", children: "\u2705 Automatic Backup" }), _jsx("p", { className: "text-sm text-green-800", children: "Firebase automatically backs up your data daily with 30-day retention. This backup is also kept in Google Cloud." })] }), _jsx("button", { onClick: handleDownloadBackup, disabled: downloading, className: "w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors", children: downloading ? 'Preparing Backup...' : '📥 Download Backup Now' }), message && (_jsx("div", { className: `p-3 rounded-lg text-sm text-center ${message.includes('✅')
                                ? 'bg-green-100 text-green-800'
                                : message.includes('❌')
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'}`, children: message })), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 border border-gray-200", children: [_jsx("h3", { className: "text-sm font-semibold text-gray-900 mb-2", children: "\uD83D\uDCD6 How to Use Backup" }), _jsxs("ol", { className: "text-sm text-gray-700 space-y-1 list-decimal list-inside", children: [_jsx("li", { children: "Download backup to your computer" }), _jsx("li", { children: "Store in a safe location (cloud drive, external drive)" }), _jsx("li", { children: "Test restore periodically (keep a test copy)" }), _jsx("li", { children: "Download new backups after major changes" })] })] }), _jsx("button", { onClick: onClose, className: "w-full px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors", children: "Close" })] }))] }) }));
};
