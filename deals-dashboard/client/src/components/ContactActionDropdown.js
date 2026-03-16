import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit2, Trash2, Eye, Copy } from 'lucide-react';

const ContactActionDropdown = ({ contact, onEdit, onDelete, onPreview, onClone, entityName = 'item', variant = 'default' }) => {
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

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(contact);
    setIsOpen(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete this ${entityName}?`)) {
      onDelete(contact.id);
      setIsOpen(false);
    }
  };

  const handlePreview = (e) => {
    e.stopPropagation();
    onPreview(contact);
    setIsOpen(false);
  };

  const handleClone = (e) => {
    e.stopPropagation();
    if (onClone) {
      onClone(contact);
    }
    setIsOpen(false);
  };

  const triggerClasses = variant === 'red' 
    ? " text-gray-900 p-1 rounded hover:bg-red-600 transition flex-shrink-0 hover:text-white"
    : "text-[#9CA3AF] hover:bg-gray-100 p-1 rounded transition flex-shrink-0 hover:text-gray-700";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={triggerClasses}
      >
        <MoreVertical size={16} strokeWidth={2} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-[#E5E7EB] rounded  shadow-lg z-50 py-1">
          <button
            onClick={handleEdit}
            className="w-full flex items-center gap-2 p-2 px-3 text-xs text-gray-700 hover:bg-gray-50 transition"
          >
            <Edit2 size={14} strokeWidth={2} />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-2 p-2 px-3 text-xs text-red hover:bg-red-50 transition"
          >
            <Trash2 size={14} strokeWidth={2} />
            Delete
          </button>
          {onClone && (
            <button
              onClick={handleClone}
              className="w-full flex items-center gap-2 p-2 px-3 text-xs text-gray-700 hover:bg-gray-50 transition"
            >
              <Copy size={14} strokeWidth={2} />
              Clone
            </button>
          )}
          {onPreview && (
            <button
              onClick={handlePreview}
              className="w-full flex items-center gap-2 p-2 px-3 text-xs text-gray-700 hover:bg-gray-50 transition"
            >
              <Eye size={14} strokeWidth={2} />
              Preview
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactActionDropdown;
