import React from 'react';
import { MessageSquare, History, Clock, Sparkles, Trash2 } from 'lucide-react';

const ITIssueActivityTabs = ({
  activeTab,
  setActiveTab,
  comments,
  newCommentText,
  setNewCommentText,
  isCommenting,
  setIsCommenting,
  handleAddComment,
  deleteComment,
  commentInputRef,
  docsData
}) => {
  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-700 tracking-wide">Activity</label>
        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded text-[11px] font-medium text-gray-600">
          {['Comments', 'History', 'Work log', 'AI Docs'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'hover:text-gray-900'
              }`}
            >
              {tab === 'Comments' && <MessageSquare size={11} className="inline mr-1" />}
              {tab === 'History' && <History size={11} className="inline mr-1" />}
              {tab === 'Work log' && <Clock size={11} className="inline mr-1" />}
              {tab === 'AI Docs' && <Sparkles size={11} className="inline mr-1 text-indigo-500" />}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* COMMENTS TAB */}
      {activeTab === 'Comments' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
              CI
            </div>
            <div className="flex-1 space-y-2">
              {isCommenting ? (
                <div className="border border-blue-500 ring-1 ring-blue-500 rounded p-2 bg-white space-y-2">
                  <textarea
                    ref={commentInputRef}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full text-xs outline-none resize-none h-16 font-sans leading-relaxed text-gray-800"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        handleAddComment();
                      }
                    }}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-normal">
                      Pro tip: press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-[9px] font-mono">Ctrl + Enter</kbd> to save
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddComment}
                        disabled={!newCommentText.trim()}
                        className={`px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition cursor-pointer ${!newCommentText.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setNewCommentText(''); setIsCommenting(false); }}
                        className="px-3 py-1 border border-gray-300 hover:bg-gray-100 rounded text-xs font-medium transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => {
                    setIsCommenting(true);
                    setTimeout(() => commentInputRef.current?.focus(), 50);
                  }}
                  className="border border-gray-200 hover:border-gray-300 rounded p-2 text-xs text-gray-400 cursor-text transition"
                >
                  Add a comment...
                </div>
              )}
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3 pt-2">
            {comments.map((c, i) => (
              <div key={i} className="flex gap-2 group text-xs">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                  {c.author ? c.author.slice(0, 2).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{c.author || 'User'}</span>
                    <span className="text-[10px] text-gray-400">{c.time || 'Just now'}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed bg-gray-50/50 p-2 rounded border border-gray-100">
                    {c.text}
                  </p>
                </div>
                <button
                  onClick={() => deleteComment(i)}
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 p-1 self-start transition cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI DOCS TAB */}
      {activeTab === 'AI Docs' && docsData && (
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-indigo-50/30 border border-indigo-100 rounded-lg space-y-3">
            <div>
              <h4 className="font-semibold text-indigo-900 mb-1">Implementation Plan</h4>
              <div className="bg-white border border-gray-200 rounded p-2.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: docsData.implementation_plan }} />
            </div>
            <div>
              <h4 className="font-semibold text-indigo-900 mb-1">QA Testing Checklist</h4>
              <div className="bg-white border border-gray-200 rounded p-2.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: docsData.qa_checklist }} />
            </div>
          </div>
        </div>
      )}

      {activeTab !== 'Comments' && activeTab !== 'AI Docs' && (
        <p className="text-xs text-gray-400 text-center py-4">No activity to show in {activeTab}.</p>
      )}
    </div>
  );
};

export default ITIssueActivityTabs;
