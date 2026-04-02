import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import {
  getTMISHeader,
  getLayersByHeaderId,
  getProcessesByHeaderId,
  getSlittingsByHeaderId,
  deleteTMISHeader,
} from '../utils/firebaseUtils';
import { TMISHeader, TMISLayer, TMISProcess, TMISSlitting } from '../types';
import { LayersGallery } from '../components/LayersGallery';
import { ProcessesGallery } from '../components/ProcessesGallery';
import { SlittingGallery } from '../components/SlittingGallery';

export const ViewDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canEdit, canDelete, logout } = useAuth();

  const [header, setHeader] = useState<TMISHeader | null>(null);
  const [layers, setLayers] = useState<TMISLayer[]>([]);
  const [processes, setProcesses] = useState<TMISProcess[]>([]);
  const [slittings, setSlittings] = useState<TMISSlitting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (headerId: string) => {
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
      } else {
        setError('Record not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load record');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!header || !id) return;

    if (
      confirm('Are you sure you want to delete this record and all associated data?')
    ) {
      try {
        await deleteTMISHeader(id);
        navigate('/dashboard');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete record');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error || !header) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700 mb-4">{error || 'Record not found'}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">TMIS Record Details</h1>
            <p className="text-xs text-gray-500">Tape Code: {header.TapeCode}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Header Information</h2>
            <div className="flex gap-2">
              {canEdit() && (
                <button
                  onClick={() => navigate(`/edit/${header.id}`)}
                  className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
                >
                  Edit
                </button>
              )}
              {canDelete() && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Tape Code */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Tape Code</p>
              <p className="text-lg font-semibold text-gray-900">{header.TapeCode}</p>
            </div>

            {/* Issue Date */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Issue Date</p>
              <p className="text-md text-gray-900">
                {header.TMISIssueDate ? new Date(header.TMISIssueDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            {/* Revision Number */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Revision No</p>
              <p className="text-md text-gray-900">{header.RevNo}</p>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  header.Status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {header.Status}
              </span>
            </div>
          </div>

          {/* Additional Info */}
          {header.AdditionalInfo && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Additional Info</p>
              <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                {header.AdditionalInfo}
              </p>
            </div>
          )}

          {/* Comments */}
          {header.TMISComments && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">TMIS Comments</p>
              <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                {header.TMISComments}
              </p>
            </div>
          )}
        </div>

        {/* Child Tables */}
        <LayersGallery layers={layers} isEditable={false} maxLayers={5} />

        <div className="my-6" />

        <ProcessesGallery processes={processes} isEditable={false} />

        <div className="my-6" />

        <SlittingGallery slittings={slittings} isEditable={false} maxSlittings={3} />
      </div>
    </div>
  );
};
