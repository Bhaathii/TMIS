import React from 'react';
import { TMISLayer } from '../types';

interface LayersGalleryProps {
  layers: TMISLayer[];
  isEditable: boolean;
  onAdd?: () => void;
  onUpdate?: (index: number, layer: TMISLayer) => void;
  onDelete?: (index: number) => void;
  maxLayers?: number;
}

export const LayersGallery: React.FC<LayersGalleryProps> = ({
  layers,
  isEditable,
  onAdd,
  onUpdate,
  onDelete,
  maxLayers = 5,
}) => {
  const handleInputChange = (index: number, field: string, value: any) => {
    if (onUpdate) {
      const updatedLayer = { ...layers[index], [field]: value };
      onUpdate(index, updatedLayer);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Layers</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {layers.length} / {maxLayers}
          </span>
          {isEditable && layers.length < maxLayers && (
            <button
              type="button"
              onClick={onAdd}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition"
            >
              + Add Layer
            </button>
          )}
        </div>
      </div>

      {layers.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No layers added yet</p>
      ) : (
        <div className="space-y-4">
          {layers.map((layer, index) => (
            <div
              key={layer.id || index}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Layer No */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Layer No
                  </label>
                  {isEditable ? (
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={layer.LayerNo}
                      onChange={(e) =>
                        handleInputChange(index, 'LayerNo', parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{layer.LayerNo}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  {isEditable ? (
                    <input
                      type="text"
                      value={layer.LayerDescription}
                      onChange={(e) => handleInputChange(index, 'LayerDescription', e.target.value)}
                      placeholder="Layer description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-600">{layer.LayerDescription}</p>
                  )}
                </div>

                {/* Weight or Thickness */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Weight / Thickness
                  </label>
                  {isEditable ? (
                    <input
                      type="text"
                      value={layer.WeightOrThickness || ''}
                      onChange={(e) =>
                        handleInputChange(index, 'WeightOrThickness', e.target.value)
                      }
                      placeholder="e.g., 50µm, 200gsm"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-600">{layer.WeightOrThickness}</p>
                  )}
                </div>

                {/* Item Code */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Item Code
                  </label>
                  {isEditable ? (
                    <input
                      type="text"
                      value={layer.ItemCode || ''}
                      onChange={(e) => handleInputChange(index, 'ItemCode', e.target.value)}
                      placeholder="Item code"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-600">{layer.ItemCode}</p>
                  )}
                </div>

                {/* Note */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Note</label>
                  {isEditable ? (
                    <textarea
                      value={layer.Note || ''}
                      onChange={(e) => handleInputChange(index, 'Note', e.target.value)}
                      placeholder="Additional notes"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      rows={2}
                    />
                  ) : (
                    <p className="text-gray-600">{layer.Note}</p>
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
