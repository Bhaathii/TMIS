import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import {
  getTMISHeader,
  updateTMISHeader,
  addTMISHeader,
  getLayersByHeaderId,
  getProcessesByHeaderId,
  getSlittingsByHeaderId,
  addTMISLayer,
  updateTMISLayer,
  deleteTMISLayer,
  addTMISProcess,
  updateTMISProcess,
  deleteTMISProcess,
  addTMISSlitting,
  updateTMISSlitting,
  deleteTMISSlitting,
} from '../utils/firebaseUtils';
import { TMISHeader, TMISLayer, TMISProcess, TMISSlitting } from '../types';
import { LayersGallery } from '../components/LayersGallery';
import { ProcessesGallery } from '../components/ProcessesGallery';
import { SlittingGallery } from '../components/SlittingGallery';

export const CreateEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { currentUser, canEdit } = useAuth();

  const [header, setHeader] = useState<Partial<TMISHeader>>({
    TMISIssueDate: new Date(),
    RevNo: 0,
    Status: 'Active',
    TapeCode: '',
  });

  const [layers, setLayers] = useState<TMISLayer[]>([]);
  const [processes, setProcesses] = useState<TMISProcess[]>([]);
  const [slittings, setSlittings] = useState<TMISSlitting[]>([]);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canEdit()) {
      navigate('/dashboard');
      return;
    }

    if (isEditMode && id) {
      loadData(id);
    }
  }, [id, isEditMode, canEdit, navigate]);

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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleHeaderChange = (field: string, value: any) => {
    setHeader((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddLayer = () => {
    const newLayer: TMISLayer = {
      id: `temp-${Date.now()}`,
      headerId: header.id || '',
      LayerNo: layers.length + 1,
      LayerDescription: '',
    };
    setLayers([...layers, newLayer]);
  };

  const handleUpdateLayer = (index: number, layer: TMISLayer) => {
    const newLayers = [...layers];
    newLayers[index] = layer;
    setLayers(newLayers);
  };

  const handleDeleteLayer = (index: number) => {
    const newLayers = layers.filter((_, i) => i !== index);
    setLayers(newLayers);
  };

  const handleAddProcess = () => {
    const newProcess: TMISProcess = {
      id: `temp-${Date.now()}`,
      headerId: header.id || '',
      ProcessLetter: 'A',
    };
    setProcesses([...processes, newProcess]);
  };

  const handleUpdateProcess = (index: number, process: TMISProcess) => {
    const newProcesses = [...processes];
    newProcesses[index] = process;
    setProcesses(newProcesses);
  };

  const handleDeleteProcess = (index: number) => {
    const newProcesses = processes.filter((_, i) => i !== index);
    setProcesses(newProcesses);
  };

  const handleAddSlitting = () => {
    const newSlitting: TMISSlitting = {
      id: `temp-${Date.now()}`,
      headerId: header.id || '',
      RowNo: slittings.length + 1,
    };
    setSlittings([...slittings, newSlitting]);
  };

  const handleUpdateSlitting = (index: number, slitting: TMISSlitting) => {
    const newSlittings = [...slittings];
    newSlittings[index] = slitting;
    setSlittings(newSlittings);
  };

  const handleDeleteSlitting = (index: number) => {
    const newSlittings = slittings.filter((_, i) => i !== index);
    setSlittings(newSlittings);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      let headerId = header.id;

      if (isEditMode && headerId) {
        // Update existing header
        await updateTMISHeader(headerId, header as TMISHeader);

        // Handle layers
        for (const layer of layers) {
          if (layer.id.startsWith('temp-')) {
            const { id: _, ...layerData } = layer;
            await addTMISLayer({
              ...layerData,
              headerId,
            });
          } else {
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
          } else {
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
          } else {
            await updateTMISSlitting(slitting.id, slitting);
          }
        }
      } else {
        // Create new header
        headerId = await addTMISHeader({
          ...(header as TMISHeader),
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Record' : 'Create New Record'}
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Header Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Tape Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tape Code *
                </label>
                <input
                  type="text"
                  value={header.TapeCode || ''}
                  onChange={(e) => handleHeaderChange('TapeCode', e.target.value)}
                  required
                  placeholder="Enter tape code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                />
              </div>

              {/* Issue Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date *
                </label>
                <input
                  type="date"
                  value={
                    header.TMISIssueDate instanceof Date
                      ? header.TMISIssueDate.toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(e) =>
                    handleHeaderChange('TMISIssueDate', new Date(e.target.value))
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                />
              </div>

              {/* Revision Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Revision No
                </label>
                <input
                  type="number"
                  value={header.RevNo || 0}
                  onChange={(e) => handleHeaderChange('RevNo', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={header.Status || 'Active'}
                  onChange={(e) => handleHeaderChange('Status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Obsolete">Obsolete</option>
                </select>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Info
              </label>
              <textarea
                value={header.AdditionalInfo || ''}
                onChange={(e) => handleHeaderChange('AdditionalInfo', e.target.value)}
                placeholder="Additional information..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none"
                rows={3}
              />
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TMIS Comments
              </label>
              <textarea
                value={header.TMISComments || ''}
                onChange={(e) => handleHeaderChange('TMISComments', e.target.value)}
                placeholder="Enter comments..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Child Tables */}
          <LayersGallery
            layers={layers}
            isEditable={true}
            onAdd={handleAddLayer}
            onUpdate={handleUpdateLayer}
            onDelete={handleDeleteLayer}
            maxLayers={5}
          />

          <ProcessesGallery
            processes={processes}
            isEditable={true}
            onAdd={handleAddProcess}
            onUpdate={handleUpdateProcess}
            onDelete={handleDeleteProcess}
          />

          <SlittingGallery
            slittings={slittings}
            isEditable={true}
            onAdd={handleAddSlitting}
            onUpdate={handleUpdateSlitting}
            onDelete={handleDeleteSlitting}
            maxSlittings={3}
          />

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : isEditMode ? 'Update Record' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
