import React from 'react';
import { TMISProcess } from '../types';

interface ProcessesGalleryProps {
  processes: TMISProcess[];
  isEditable: boolean;
  onAdd?: () => void;
  onUpdate?: (index: number, process: TMISProcess) => void;
  onDelete?: (index: number) => void;
}

const PROCESS_LETTERS: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

export const ProcessesGallery: React.FC<ProcessesGalleryProps> = ({
  processes,
  isEditable,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const handleInputChange = (index: number, field: string, value: any) => {
    if (onUpdate) {
      const updatedProcess = { ...processes[index], [field]: value };
      onUpdate(index, updatedProcess);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Processes</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {processes.length} / 4
          </span>
          {isEditable && processes.length < 4 && (
            <button
              type="button"
              onClick={onAdd}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition"
            >
              + Add Process
            </button>
          )}
        </div>
      </div>

      {processes.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No processes added yet</p>
      ) : (
        <div className="space-y-4">
          {processes.map((process, index) => (
            <div
              key={process.id || index}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
            >
              {/* Process Letter */}
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Process Letter
                  </label>
                  {isEditable ? (
                    <select
                      value={process.ProcessLetter}
                      onChange={(e) =>
                        handleInputChange(index, 'ProcessLetter', e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    >
                      <option value="">Select Process</option>
                      {PROCESS_LETTERS.map((letter) => (
                        <option key={letter} value={letter}>
                          Process {letter}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900 font-medium text-lg">Process {process.ProcessLetter}</p>
                  )}
                </div>
                {isEditable && (
                  <button                    type="button"                    onClick={() => onDelete && onDelete(index)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium transition"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Grid for smaller fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {/* Machine Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Machine Type
                  </label>
                  {isEditable ? (
                    <input
                      type="text"
                      value={process.MachineType || ''}
                      onChange={(e) => handleInputChange(index, 'MachineType', e.target.value)}
                      placeholder="Machine type"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">{process.MachineType}</p>
                  )}
                </div>

                {/* Heat */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Heat</label>
                  {isEditable ? (
                    <input
                      type="number"
                      value={process.Heat || ''}
                      onChange={(e) => handleInputChange(index, 'Heat', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="Temperature"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">{process.Heat}</p>
                  )}
                </div>

                {/* Speed */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Speed</label>
                  {isEditable ? (
                    <input
                      type="number"
                      value={process.Speed || ''}
                      onChange={(e) => handleInputChange(index, 'Speed', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="Speed"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">{process.Speed}</p>
                  )}
                </div>

                {/* A Flow */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">AFlow</label>
                  {isEditable ? (
                    <input
                      type="text"
                      value={process.AFlow || ''}
                      onChange={(e) => handleInputChange(index, 'AFlow', e.target.value)}
                      placeholder="AFlow"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">{process.AFlow}</p>
                  )}
                </div>

                {/* Press */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Press</label>
                  {isEditable ? (
                    <input
                      type="number"
                      value={process.Press || ''}
                      onChange={(e) => handleInputChange(index, 'Press', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="Press"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">{process.Press}</p>
                  )}
                </div>

                {/* Setup Time */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Setup Time
                  </label>
                  {isEditable ? (
                    <input
                      type="text"
                      value={process.SetupTime || ''}
                      onChange={(e) => handleInputChange(index, 'SetupTime', e.target.value)}
                      placeholder="e.g., 30min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">{process.SetupTime}</p>
                  )}
                </div>

                {/* Processing Time */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Processing Time
                  </label>
                  {isEditable ? (
                    <input
                      type="text"
                      value={process.ProcessingTime || ''}
                      onChange={(e) =>
                        handleInputChange(index, 'ProcessingTime', e.target.value)
                      }
                      placeholder="e.g., 2h"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">{process.ProcessingTime}</p>
                  )}
                </div>

                {/* Cleaning Time */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Cleaning Time
                  </label>
                  {isEditable ? (
                    <input
                      type="text"
                      value={process.CleaningTime || ''}
                      onChange={(e) => handleInputChange(index, 'CleaningTime', e.target.value)}
                      placeholder="e.g., 15min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">{process.CleaningTime}</p>
                  )}
                </div>

                {/* Other */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Other</label>
                  {isEditable ? (
                    <input
                      type="text"
                      value={process.Other || ''}
                      onChange={(e) => handleInputChange(index, 'Other', e.target.value)}
                      placeholder="Other info"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">{process.Other}</p>
                  )}
                </div>
              </div>

              {/* Describe Process */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Describe Process
                </label>
                {isEditable ? (
                  <textarea
                    value={process.DescribeProcess || ''}
                    onChange={(e) => handleInputChange(index, 'DescribeProcess', e.target.value)}
                    placeholder="Detailed process description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">
                    {process.DescribeProcess}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
