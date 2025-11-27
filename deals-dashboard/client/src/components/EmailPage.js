import React, { useState } from 'react';
import { Mail, Send, MessageCircle } from 'lucide-react';

const EmailPage = () => {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [activeFolder, setActiveFolder] = useState('inbox');

  const emails = [
    {
      id: 1,
      avatar: 'JL',
      avatarColor: 'bg-red-500',
      name: 'Justin Lapoint',
      subject: 'Client Dashboard',
      preview: 'It seems that recipients are receiving...',
      time: '3:13 PM',
      read: false,
      attachments: 3,
      tags: ['Projects']
    },
    {
      id: 2,
      avatar: 'RJ',
      avatarColor: 'bg-blue-500',
      name: 'Rufana Joe',
      subject: 'UI project',
      preview: 'Regardless, you can usually expect an increase',
      time: '3:13 PM',
      read: false,
      attachments: 0,
      tags: ['Applications']
    },
    {
      id: 3,
      avatar: 'CD',
      avatarColor: 'bg-purple-500',
      name: 'Cameron Drake',
      subject: "You're missing",
      preview: 'Here are a few catchy email subject line examples',
      time: '3:13 PM',
      read: false,
      attachments: 1,
      tags: ['External']
    },
    {
      id: 4,
      avatar: 'SH',
      avatarColor: 'bg-green-500',
      name: 'Sean Hill',
      subject: 'How Have You Progressed',
      preview: 'You can write effective retargeting subject',
      time: '3:13 PM',
      read: false,
      attachments: 1,
      tags: ['Team Events']
    },
    {
      id: 5,
      avatar: 'KA',
      avatarColor: 'bg-indigo-500',
      name: 'Kevin Alley',
      subject: 'Flash. Sale. Alert.',
      preview: 'You can also use casual language,',
      time: '3:13 PM',
      read: false,
      attachments: 1,
      tags: ['External']
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Email</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
            <button className="text-gray-600 hover:text-gray-900">Home</button>
            <span>›</span>
            <button className="text-gray-600 hover:text-gray-900">Applications</button>
            <span>›</span>
            <span>Email</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-border-light">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-sm font-bold">
                  JH
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">James Hong</p>
                  <p className="text-xs text-gray-600">james@example.com</p>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-smooth font-medium text-sm flex items-center justify-center gap-2">
                <Mail size={16} />
                Compose
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-border-light">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Emails</h3>
              <div className="space-y-2">
                {[
                  { label: 'Inbox', count: '56', isActive: activeFolder === 'inbox' },
                  { label: 'Starred', count: '46', isActive: activeFolder === 'starred' },
                  { label: 'Sent', count: '14', isActive: activeFolder === 'sent' },
                  { label: 'Drafts', count: '12', isActive: activeFolder === 'drafts' },
                  { label: 'Deleted', count: '08', isActive: activeFolder === 'deleted' },
                  { label: 'Spam', count: '0', isActive: activeFolder === 'spam' },
                ].map((folder) => (
                  <button 
                    key={folder.label}
                    onClick={() => setActiveFolder(folder.label.toLowerCase())}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-smooth ${
                      folder.isActive 
                        ? 'bg-red-50 text-red-600 font-semibold' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{folder.label}</span>
                    <span className={`text-xs font-bold ${folder.isActive ? 'bg-red-200' : 'bg-gray-200'} px-2 py-1 rounded-full`}>
                      {folder.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-border-light">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Labels</h3>
              <div className="space-y-2">
                {['Team Events', 'Work', 'External', 'Projects', 'Applications', 'Desgin'].map((label) => (
                  <button 
                    key={label}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button className="w-full text-center text-sm text-gray-600 hover:text-gray-900 font-medium py-2">
              Show More
            </button>
          </div>

          <div className="lg:col-span-4">
            {selectedEmail ? (
              <div className="bg-white rounded-lg shadow-sm border border-border-light p-6">
                <button 
                  onClick={() => setSelectedEmail(null)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4"
                >
                  ← Back to Inbox
                </button>
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedEmail.subject}</h2>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${selectedEmail.avatarColor} flex items-center justify-center text-white text-sm font-bold`}>
                      {selectedEmail.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedEmail.name}</p>
                      <p className="text-sm text-gray-600">{selectedEmail.time}</p>
                    </div>
                  </div>
                </div>
                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700">{selectedEmail.preview}</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth text-sm">
                    <MessageCircle size={16} />
                    Reply
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth text-sm">
                    <MessageCircle size={16} />
                    Reply All
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth text-sm">
                    <Send size={16} />
                    Forward
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-border-light overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Inbox</h2>
                  <p className="text-sm text-gray-600">2345 Emails • <span className="font-semibold text-red-600">56 Unread</span></p>
                </div>

                <div className="divide-y divide-gray-200">
                  {emails.map((email) => (
                    <div 
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-smooth border-l-4 border-transparent hover:border-l-4 hover:border-red-500"
                    >
                      <div className="flex items-start gap-4">
                        <input type="checkbox" className="mt-1" />
                        <div className={`w-10 h-10 rounded-full ${email.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {email.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`font-semibold ${email.read ? 'text-gray-700' : 'text-gray-900'}`}>
                              {email.name}
                            </p>
                            <span className="text-xs text-gray-600 flex-shrink-0">{email.time}</span>
                          </div>
                          <p className={`text-sm ${email.read ? 'text-gray-600' : 'text-gray-900 font-medium'} truncate`}>
                            {email.subject}
                          </p>
                          <p className="text-xs text-gray-600 line-clamp-1 mt-1">{email.preview}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {email.attachments > 0 && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                +{email.attachments}
                              </span>
                            )}
                            {email.tags.map(tag => (
                              <span key={tag} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailPage;
