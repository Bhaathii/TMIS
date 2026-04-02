import React, { useState, useEffect } from 'react';
import { downloadBackup, getBackupStats, formatBytes, backupAllData } from '../utils/backupUtils';

interface BackupStats {
  headers: number;
  layers: number;
  processes: number;
  slittings: number;
  total: number;
  lastBackup: string;
}

export const BackupModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<BackupStats | null>(null);
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
    } catch (error) {
      setMessage('Error loading backup stats');
    } finally {
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
    } catch (error) {
      setMessage('❌ Error downloading backup');
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Data Backup & Recovery</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading backup information...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Backup Statistics */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Current Data</h3>
              {stats && (
                <div className="space-y-1 text-sm text-blue-800">
                  <p>📋 TMIS Records: {stats.headers}</p>
                  <p>📑 Layers: {stats.layers}</p>
                  <p>⚙️ Processes: {stats.processes}</p>
                  <p>✂️ Slittings: {stats.slittings}</p>
                  <p className="font-semibold mt-2 text-blue-900">Total Items: {stats.total}</p>
                  <p className="text-xs text-blue-600 mt-1">Backup Size: {backupSize}</p>
                </div>
              )}
            </div>

            {/* Warning Box */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Important:</strong> Regular backups protect your data from loss. Download backups
                weekly or after major changes.
              </p>
            </div>

            {/* Firebase Backup Info */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h3 className="text-sm font-semibold text-green-900 mb-2">✅ Automatic Backup</h3>
              <p className="text-sm text-green-800">
                Firebase automatically backs up your data daily with 30-day retention. This backup is also kept
                in Google Cloud.
              </p>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownloadBackup}
              disabled={downloading}
              className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {downloading ? 'Preparing Backup...' : '📥 Download Backup Now'}
            </button>

            {/* Message */}
            {message && (
              <div
                className={`p-3 rounded-lg text-sm text-center ${
                  message.includes('✅')
                    ? 'bg-green-100 text-green-800'
                    : message.includes('❌')
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                }`}
              >
                {message}
              </div>
            )}

            {/* Instructions */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">📖 How to Use Backup</h3>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Download backup to your computer</li>
                <li>Store in a safe location (cloud drive, external drive)</li>
                <li>Test restore periodically (keep a test copy)</li>
                <li>Download new backups after major changes</li>
              </ol>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
