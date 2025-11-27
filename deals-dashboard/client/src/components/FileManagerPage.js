import React, { useState } from 'react';
import { Plus, FileText, MoreVertical, Folder, Star, ChevronDown, Music } from 'lucide-react';

const FileManagerPage = () => {
  const [files] = useState([
    { id: 1, name: 'Secret', size: '7.6 MB', type: 'Doc', date: 'Mar 15, 2025 05:00:14 PM', icon: 'file-01.svg' },
    { id: 2, name: 'Sophie Headrick', size: '7.4 MB', type: 'PDF', date: 'Jan 8, 2025 08:20:13 PM', icon: 'file-02.svg' },
    { id: 3, name: 'Gallery', size: '6.1 MB', type: 'Image', date: 'Aug 6, 2025 04:10:12 PM', icon: 'file-03.svg' },
    { id: 4, name: 'Doris Crowley', size: '5.2 MB', type: 'Folder', date: 'Jan 6, 2025 03:40:14 PM', icon: 'file-04.svg' },
    { id: 5, name: 'Cheat_codez', size: '8 MB', type: 'Xml', date: 'Oct 12, 2025 05:00:14 PM', icon: 'file-05.svg' }
  ]);

  const [storages] = useState([
    { name: 'Dropbox', files: 200, size: '28GB', icon: 'dropbox.svg' },
    { name: 'Google Drive', files: 144, size: '54GB', icon: 'drive.svg' },
    { name: 'Cloud Storage', files: 144, size: '54GB', icon: 'cloud.svg' },
    { name: 'Internal Storage', files: 144, size: '54GB', icon: 'storage.svg' }
  ]);

  const [recentFolders] = useState([
    { id: 1, name: 'Assets', size: '2.4 GB', files: '35 files' },
    { id: 2, name: 'Document', size: '4 GB', files: '15 files' },
    { id: 3, name: 'Handyimages', size: '1.4 GB', files: '115 files' }
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">File Manager</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <button className="text-gray-600 hover:text-gray-900">Home</button>
              <span>›</span>
              <button className="text-gray-600 hover:text-gray-900">Applications</button>
              <span>›</span>
              <span>File Manager</span>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-smooth font-medium text-sm">
            <Plus size={18} />
            Create Folder
          </button>
        </div>

        <div className="flex gap-6">
          <div className="w-64 flex-shrink-0">
            <div className="mb-4">
              <div className="relative">
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-gray-400 appearance-none cursor-pointer">
                  <option>All Files</option>
                  <option>Music</option>
                  <option>Video</option>
                  <option>Documents</option>
                  <option>Photos</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              {storages.map((storage) => (
                <div key={storage.name} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{storage.name}</h3>
                      <p className="text-xs text-gray-600">{storage.files} Files</p>
                      <p className="text-xs text-gray-600">{storage.size}</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-3 mb-3">
                <img src="https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-01.jpg" alt="James Hong" className="w-10 h-10 rounded-full" />
                <div>
                  <p className="text-sm font-bold text-gray-900">James Hong</p>
                  <p className="text-xs text-gray-600">jameshong@example.com</p>
                </div>
              </div>
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-sm font-medium text-gray-700">Drop files here</p>
                <p className="text-xs text-gray-600 mt-1">Select files to upload</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2">
                <Folder size={16} />
                All Folder / Files
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2">
                <Folder size={16} />
                Drive
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2">
                <Folder size={16} />
                Dropbox
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2">
                <Folder size={16} />
                Shared with Me
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2">
                <Folder size={16} />
                Document
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2">
                <Folder size={16} />
                Recent File
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2">
                <Star size={16} />
                Important
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2">
                <Music size={16} />
                Media
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-gray-900">Storage Details</h4>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">Used 77%</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Music</span>
                  <span className="text-gray-900 font-medium">8.5 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Video</span>
                  <span className="text-gray-900 font-medium">2 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Documents</span>
                  <span className="text-gray-900 font-medium">24.5 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Photos</span>
                  <span className="text-gray-900 font-medium">8.5 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Other</span>
                  <span className="text-gray-900 font-medium">16.2 GB</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Quick Access</h2>
                <button className="text-sm text-red-600 hover:text-red-700 font-medium">View All</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="text-center">
                    <div className="bg-gray-100 rounded-lg p-4 mb-2 hover:bg-gray-200 cursor-pointer transition-colors">
                      <FileText size={24} className="mx-auto text-gray-600" />
                    </div>
                    <p className="text-xs text-gray-700 font-medium">Final.doc</p>
                    <p className="text-xs text-red-600">2.4 GB</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Recent Folders</h2>
                <div className="relative">
                  <select className="px-3 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white appearance-none cursor-pointer">
                    <option>Last 7 Days</option>
                    <option>Last Month</option>
                    <option>Last Year</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentFolders.map((folder) => (
                  <div key={folder.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <Folder size={24} className="text-blue-600" />
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">{folder.name}</h3>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{folder.size}</span>
                      <span>{folder.files}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <img src="https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-07.jpg" alt="user" className="w-6 h-6 rounded-full" />
                      <img src="https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-02.jpg" alt="user" className="w-6 h-6 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Recent Files</h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select className="px-3 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white appearance-none cursor-pointer">
                      <option>Last Modified</option>
                      <option>Newest to Oldest</option>
                      <option>Oldest to Newest</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  <button className="text-sm text-red-600 hover:text-red-700 font-medium">View All</button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Modified</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Share</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((file) => (
                      <tr key={file.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-2">
                          <FileText size={16} className="text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">{file.name}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{file.size}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{file.type}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{file.date}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <img src="https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-03.jpg" alt="user" className="w-6 h-6 rounded-full" />
                            <img src="https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-04.jpg" alt="user" className="w-6 h-6 rounded-full" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                              <Star size={16} />
                            </button>
                            <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileManagerPage;
