import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit2, Trash2, Eye } from 'lucide-react';

const ContactActionDropdown = ({ contact, onEdit, onDelete, onPreview }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEdit = () => {
    onEdit(contact);
    setIsOpen(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
      onDelete(contact.id);
      setIsOpen(false);
    }
  };

  const handlePreview = () => {
    onPreview(contact);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-[#9CA3AF] hover:bg-gray-100 p-1 rounded-md transition flex-shrink-0 hover:text-gray-700"
      >
        <MoreVertical size={16} strokeWidth={2} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-10">
          <button
            onClick={handlePreview}
            className="w-full flex items-center gap-2 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition border-b border-[#E5E7EB]"
          >
            <Eye size={14} strokeWidth={2} />
            Preview
          </button>
          <button
            onClick={handleEdit}
            className="w-full flex items-center gap-2 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition border-b border-[#E5E7EB]"
          >
            <Edit2 size={14} strokeWidth={2} />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-2 px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 transition"
          >
            <Trash2 size={14} strokeWidth={2} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ContactActionDropdown;
