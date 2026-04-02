import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { getAllTMISHeaders, searchTMISByTapeCode, filterTMISByStatus } from '../utils/firebaseUtils';
import { TMISHeader } from '../types';

export const BrowsePage: React.FC = () => {
  const [headers, setHeaders] = useState<TMISHeader[]>([]);
  const [filteredHeaders, setFilteredHeaders] = useState<TMISHeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTape, setSearchTape] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Obsolete'>('All');
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
    } catch (error) {
      console.error('Error loading headers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    setSearchTape(value);
    await applyFilters(value, statusFilter);
  };

  const handleStatusFilter = async (status: 'All' | 'Active' | 'Obsolete') => {
    setStatusFilter(status);
    await applyFilters(searchTape, status);
  };

  const applyFilters = async (tape: string, status: 'All' | 'Active' | 'Obsolete') => {
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
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">TMIS</h1>
            <p className="text-xs text-gray-500">Tape Management Information System</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{currentUser?.email}</p>
              <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Title and Action Button */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">TMIS Records</h2>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/ftr')}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              📋 FTR
            </button>
            {(currentUser?.role?.trim() === 'admin' || currentUser?.role?.trim() === 'editor') && (
              <button
                onClick={() => navigate('/create')}
                className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
              >
                + New Record
              </button>
            )}
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search by Tape Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Tape Code
              </label>
              <input
                type="text"
                value={searchTape}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Enter tape code..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value as 'All' | 'Active' | 'Obsolete')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition bg-white"
              >
                <option>All</option>
                <option>Active</option>
                <option>Obsolete</option>
              </select>
            </div>

            {/* Results count */}
            <div className="flex items-end">
              <p className="text-sm text-gray-600">
                {filteredHeaders.length} record{filteredHeaders.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading records...</p>
          </div>
        ) : filteredHeaders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-500 mb-4">No records found</p>
            {(currentUser?.role?.trim() === 'admin' || currentUser?.role?.trim() === 'editor') && (
              <button
                onClick={() => navigate('/create')}
                className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
              >
                Create First Record
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Tape Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Revision
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHeaders.map((header) => {
                  const isAdmin = currentUser?.role?.trim() === 'admin';
                  const isEditor = currentUser?.role?.trim() === 'editor';
                  const canUserEdit = isAdmin || isEditor;
                  const canUserDelete = isAdmin;
                  return (
                    <tr key={header.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {header.TapeCode}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                      {header.TMISIssueDate ? new Date(header.TMISIssueDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{header.RevNo}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            header.Status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {header.Status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/view/${header.id}`)}
                            className="px-3 py-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            View
                          </button>
                          {canUserEdit && (
                            <button
                              onClick={() => navigate(`/edit/${header.id}`)}
                              className="px-3 py-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                              Edit
                            </button>
                          )}
                          {canUserDelete && (
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this record?')) {
                                  // Handle delete
                                }
                              }}
                              className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
