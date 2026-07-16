const fs = require('fs');
const path = 'client/src/components/ITIssueDetailsPanel.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add state variables for the new stats
content = content.replace(
  /const \[parent, setParent\] = useState\('None'\);/,
  `const [parent, setParent] = useState('None');
  
  // Estimates & Time states
  const [progress, setProgress] = useState(0);
  const [originalEstimate, setOriginalEstimate] = useState('0h');
  const [remainingEstimate, setRemainingEstimate] = useState('0h');
  const [timeSpent, setTimeSpent] = useState('0h');`
);

// 2. Initialize from issue object
content = content.replace(
  /setParent\('None'\);\n\s*setStartDate\('None'\);\n\s*setTeam\('None'\);/,
  `setParent('None');
      setStartDate('None');
      setTeam('None');
      setProgress(issue.progress || 0);
      setOriginalEstimate(issue.original_estimate || '0h');
      setRemainingEstimate(issue.remaining_estimate || '0h');
      setTimeSpent(issue.time_spent || '0h');`
);

// 3. Add the collapsed section state
content = content.replace(
  /details: false,/,
  `details: false,
    estimates: false,`
);

// 4. Inject the accordion section for Estimates & Time
const estimatesAccordion = `

        {/* ESTIMATES & TIME SECTION */}
        <div className="border-b border-gray-200">
          <div 
            onClick={() => toggleSection('estimates')}
            className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition select-none"
          >
            <span className="text-xs font-bold text-gray-800 tracking-wide">Estimates & Time</span>
            <ChevronDown size={14} className={\`text-gray-500 transition-transform duration-200 \${collapsedSections.estimates ? '-rotate-90' : ''}\`} />
          </div>
          
          {!collapsedSections.estimates && (
            <div className="p-3 pt-0 space-y-4">
              
              {/* Progress */}
              <div className="grid grid-cols-3 items-center min-h-[30px]">
                <span className="text-gray-500 font-medium text-xs">Progress (%)</span>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setProgress(val);
                      handleUpdate({ progress: val });
                    }}
                    className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Original Estimate */}
              <div className="grid grid-cols-3 items-center min-h-[30px]">
                <span className="text-gray-500 font-medium text-xs">Original Est.</span>
                <div className="col-span-2">
                  <input
                    type="text"
                    value={originalEstimate}
                    onChange={(e) => setOriginalEstimate(e.target.value)}
                    onBlur={() => handleUpdate({ original_estimate: originalEstimate })}
                    className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Remaining Estimate */}
              <div className="grid grid-cols-3 items-center min-h-[30px]">
                <span className="text-gray-500 font-medium text-xs">Remaining Est.</span>
                <div className="col-span-2">
                  <input
                    type="text"
                    value={remainingEstimate}
                    onChange={(e) => setRemainingEstimate(e.target.value)}
                    onBlur={() => handleUpdate({ remaining_estimate: remainingEstimate })}
                    className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Time Spent */}
              <div className="grid grid-cols-3 items-center min-h-[30px]">
                <span className="text-gray-500 font-medium text-xs">Time Spent</span>
                <div className="col-span-2">
                  <input
                    type="text"
                    value={timeSpent}
                    onChange={(e) => setTimeSpent(e.target.value)}
                    onBlur={() => handleUpdate({ time_spent: timeSpent })}
                    className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

            </div>
          )}
        </div>
`;

content = content.replace(
  /(\s*)<\/div>\n(\s*)\/\* DESCRIPTION SECTION \*\//,
  `$1</div>\n${estimatesAccordion}\n$2/* DESCRIPTION SECTION */`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully patched ITIssueDetailsPanel.js with Estimates fields.');
