import React from 'react';
import { TMISSlitting } from '../types';

interface SlittingGalleryProps {
  slittings: TMISSlitting[];
  isEditable: boolean;
  onAdd?: () => void;
  onUpdate?: (index: number, slitting: TMISSlitting) => void;
  onDelete?: (index: number) => void;
  maxSlittings?: number;
}

export const SlittingGallery: React.FC<SlittingGalleryProps> = ({
  slittings,
  isEditable,
  onAdd,
  onUpdate,
  onDelete,
  maxSlittings = 3,
}) => {
  const handleInputChange = (index: number, field: string, value: any) => {
    if (onUpdate) {
      const updatedSlitting = { ...slittings[index], [field]: value };
      onUpdate(index, updatedSlitting);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Slitting</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {slittings.length} / {maxSlittings}
          </span>
          {isEditable && slittings.length < maxSlittings && (
            <button              type="button"              onClick={onAdd}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition"
            >
              + Add Row
            </button>
          )}
        </div>
      </div>

      {slittings.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No slitting rows added yet</p>
      ) : (
        <div className="space-y-4">
          {slittings.map((slitting, index) => (
            <div
              key={slitting.id || index}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Row No */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Row No</label>
                  {isEditable ? (
                    <input
                      type="number"
                      min="1"
                      max="3"
                      value={slitting.RowNo}
                      onChange={(e) => handleInputChange(index, 'RowNo', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{slitting.RowNo}</p>
                  )}
                </div>

                {/* Processing */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Processing
                  </label>
                  {isEditable ? (
                    <input
                      type="text"
                      value={slitting.Processing || ''}
                      onChange={(e) => handleInputChange(index, 'Processing', e.target.value)}
                      placeholder="Processing method"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-600">{slitting.Processing}</p>
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
                      value={slitting.ProcessingTime || ''}
                      onChange={(e) => handleInputChange(index, 'ProcessingTime', e.target.value)}
                      placeholder="e.g., 1.5h"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-600">{slitting.ProcessingTime}</p>
                  )}
                </div>

                {/* Cleaning */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cleaning</label>
                  {isEditable ? (
                    <textarea
                      value={slitting.Cleaning || ''}
                      onChange={(e) => handleInputChange(index, 'Cleaning', e.target.value)}
                      placeholder="Cleaning details"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      rows={2}
                    />
                  ) : (
                    <p className="text-gray-600">{slitting.Cleaning}</p>
                  )}
                </div>
              </div>

              {/* Delete Button */}
              {isEditable && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onDelete && onDelete(index)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium transition"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
