const fs = require('fs');

const path = 'd:\\projects\\All_IN_One\\deals-dashboard\\client\\src\\components\\ITIssueDetailsPanel.js';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// 0-indexed line numbers
// assignee 681-760 (inclusive) -> lines[681] to lines[760] -> slice(681, 761)
const assignee = lines.slice(681, 761);
const parent = lines.slice(761, 808);
const dueDate = lines.slice(808, 913);
const labels = lines.slice(913, 930);
const team = lines.slice(930, 993);
const startDate = lines.slice(993, 999);
const reporter = lines.slice(999, 1047);

const sprintStr = `              {/* Sprint */}
              <div className="grid grid-cols-3 items-center min-h-[30px]">
                <span className="text-gray-500 font-medium">Sprint</span>
                <div className="col-span-2 interactive-dropdown relative">
                  {openDropdown === 'details-sprint' ? (
                    <div className="w-full">
                      <div 
                        onClick={() => toggleDropdown('details-sprint')}
                        className="flex items-center justify-between border border-blue-500 ring-1 ring-blue-500 rounded px-2.5 py-1.5 bg-white text-gray-800 text-xs font-semibold cursor-pointer shadow-sm"
                      >
                        <span>{sprint}</span>
                        <ChevronDown size={12} className="text-gray-500" />
                      </div>
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded shadow-lg py-1 z-50 text-xs text-gray-800">
                        {SPRINTS.map(s => (
                          <div 
                            key={s} 
                            onClick={() => { setSprint(s); setOpenDropdown(null); }}
                            className="px-3 py-1.5 hover:bg-gray-50 cursor-pointer"
                          >
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => toggleDropdown('details-sprint')}
                      className="hover:bg-gray-50 p-1 -ml-1 rounded cursor-pointer transition text-gray-400 font-semibold w-fit flex items-center gap-1"
                    >
                      <span>{sprint}</span>
                      <ChevronDown size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>
              </div>\n`;

const sprint = sprintStr.split('\n');
sprint.pop(); // remove trailing empty string

// Target order:
// Assignee, Labels, Parent, Sprint, Start Date, Due Date, Reporter, Team
const newBody = [
  ...assignee,
  ...labels,
  ...parent,
  ...sprint,
  ...startDate,
  ...dueDate,
  ...reporter,
  ...team
];

const newLines = [
  ...lines.slice(0, 681),
  ...newBody,
  ...lines.slice(1047)
];

fs.writeFileSync(path, newLines.join('\n'), 'utf8');
console.log("Rearrangement complete");
