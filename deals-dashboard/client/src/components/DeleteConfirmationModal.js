import React from 'react';
import { Trash2 } from 'lucide-react';

const DeleteConfirmationModal = ({ isOpen, onConfirm, onCancel, userName, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <Trash2 size={32} className="text-red-600" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          Delete Confirmation
        </h2>

        <p className="text-sm text-gray-600 text-center mb-6">
          Are you sure you want to remove user <span className="font-semibold text-gray-900">"{userName}"</span> you selected.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-6 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
