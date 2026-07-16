const fs = require('fs');

const logPath = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\72117494-99d0-4496-9ce1-274748c310ec\\.system_generated\\logs\\transcript_full.jsonl';
const content = fs.readFileSync(logPath, 'utf8');

const lines = content.split('\n');
let foundContent = null;

for (let line of lines) {
    if (!line.trim()) continue;
    try {
        const data = JSON.parse(line);
        if (data.tool_calls) {
            for (let call of data.tool_calls) {
                if (call.name === 'write_to_file') {
                    if (call.args && call.args.TargetFile && call.args.TargetFile.includes('ITIssueDetailsPanel.js')) {
                        foundContent = call.args.CodeContent;
                    }
                }
            }
        }
    } catch(e) {}
}

if (foundContent) {
    fs.writeFileSync('recovered.js', foundContent);
    console.log("Recovered file from write_to_file tool!");
} else {
    console.log("Could not find full write_to_file. Will try to reconstruct from multi_replace_file_content calls...");
    
    // Instead of reconstructing, maybe we can search the most recent view_file that showed the end of the file?
}
