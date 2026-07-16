const fs = require('fs');

const path = 'ITIssueDetailsPanel.js';
const lines = fs.readFileSync(path, 'utf8').split('\n');

const activityStart = lines.findIndex(l => l.includes('{/* ACTIVITY SECTION */}'));
const activityEnd = lines.findIndex((l, i) => i > activityStart && l.includes('{activeTab !== \'Comments\' && ('));

// Activity ends a few lines after activityEnd. Let's find it precisely.
// Look at line 1375:         </div>
// It's the closing div of the ACTIVITY SECTION.
let actualEnd = activityEnd;
while (!lines[actualEnd].includes('        </div>')) {
    actualEnd++;
}

// So the Activity section is lines[activityStart] to lines[actualEnd]
const activityLines = lines.slice(activityStart, actualEnd + 1);

// Remove Activity from its current place
lines.splice(activityStart, actualEnd - activityStart + 1);

// Now, find the end of Left Column. It's before the Right Column opens.
const rightColumnStart = lines.findIndex(l => l.includes('{/* Right Column (Details) */}'));

// Insert Activity before Right Column
lines.splice(rightColumnStart, 0, ...activityLines);

fs.writeFileSync(path, lines.join('\n'));
console.log("Moved Activity section to Left Column!");
