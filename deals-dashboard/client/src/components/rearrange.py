import re

with open('d:\\projects\\All_IN_One\\deals-dashboard\\client\\src\\components\\ITIssueDetailsPanel.js', 'r') as f:
    lines = f.readlines()

assignee = lines[681:761]
parent = lines[761:808]
due_date = lines[808:913]
labels = lines[913:930]
team = lines[930:993]
start_date = lines[993:999]
reporter = lines[999:1047]

sprint = """              {/* Sprint */}
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
              </div>\n\n"""

# Target order:
# Assignee, Labels, Parent, Sprint, Start Date, Due Date, Reporter, Team

new_body = "".join(assignee) + "".join(labels) + "".join(parent) + sprint + "".join(start_date) + "".join(due_date) + "".join(reporter) + "".join(team)

new_lines = lines[:681] + [new_body] + lines[1047:]

with open('d:\\projects\\All_IN_One\\deals-dashboard\\client\\src\\components\\ITIssueDetailsPanel.js', 'w') as f:
    f.writelines(new_lines)

print("Rearrangement complete")
