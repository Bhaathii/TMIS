import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { getLoginHistoryForUser, getAllLoginHistory, getActivityLogForUser, getAllActivityLog } from '../utils/firebaseUtils';
import { LoginHistory, ActivityLog } from '../types';

interface LoginHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginHistoryModal: React.FC<LoginHistoryModalProps> = ({ isOpen, onClose }) => {
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'activity'>('login');
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
        : await getLoginHistoryForUser(currentUser!.uid);
      setLoginHistory(loginHistoryData);
      
      const activityLogData = isAdminUser
        ? await getAllActivityLog()
        : await getActivityLogForUser(currentUser!.uid);
      setActivityLog(activityLogData);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoginHistory([]);
      setActivityLog([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date: Date) => {
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

  const getActionBadgeColor = (action: string) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {isAdmin() ? 'All User Activity' : 'Your Activity'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('login')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'login'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📖 Login History ({loginHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'activity'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 Activity Log ({activityLog.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : activeTab === 'login' ? (
          loginHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No login history available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    {isAdmin() && <th className="px-4 py-2 text-left font-semibold text-gray-700">Email</th>}
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Login Time</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Browser</th>
                  </tr>
                </thead>
                <tbody>
                  {loginHistory.map((entry, index) => (
                    <tr key={entry.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {isAdmin() && <td className="px-4 py-3 text-gray-800">{entry.email}</td>}
                      <td className="px-4 py-3 text-gray-800">{formatDateTime(entry.loginTime)}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs truncate">
                        {entry.userAgent || 'Unknown'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          activityLog.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No activity log available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activityLog.map((entry) => (
                <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {isAdmin() && (
                        <p className="text-xs text-gray-500 mb-1">{entry.email}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getActionBadgeColor(entry.action)}`}>
                          {entry.action.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-700">{entry.description}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{formatDateTime(entry.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
