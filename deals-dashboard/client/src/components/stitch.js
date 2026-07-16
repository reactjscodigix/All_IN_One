const fs = require('fs');
const readline = require('readline');

const logPath = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\72117494-99d0-4496-9ce1-274748c310ec\\.system_generated\\logs\\transcript_full.jsonl';

const fileLines = {};

async function processLineByLine() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const data = JSON.parse(line);
      
      // Also check the tool_calls for write_to_file code content!
      if (data.tool_calls) {
        for (let call of data.tool_calls) {
          if (call.name === 'write_to_file' && call.args && call.args.TargetFile && call.args.TargetFile.includes('ITIssueDetailsPanel.js')) {
            const outLines = call.args.CodeContent.split('\n');
            outLines.forEach((ol, idx) => {
               fileLines[idx + 1] = ol;
            });
          }
        }
      }

      if (data.type === 'TOOL_RESPONSE' && data.tool_responses) {
        for (let resp of data.tool_responses) {
          if (resp.name === 'view_file' && typeof resp.output === 'string' && resp.output.includes('ITIssueDetailsPanel.js')) {
            const outLines = resp.output.split('\n');
            for (let ol of outLines) {
              const match = ol.match(/^(\d+):\s(.*)/);
              if (match) {
                fileLines[parseInt(match[1], 10)] = match[2];
              }
            }
          }
        }
      }
    } catch(e) {}
  }

  const keys = Object.keys(fileLines).map(Number).sort((a,b) => a-b);
  if (keys.length > 0) {
    const maxLine = keys[keys.length - 1];
    let output = '';
    for (let i = 1; i <= maxLine; i++) {
      output += (fileLines[i] !== undefined ? fileLines[i] : `// MISSING LINE ${i}`) + '\n';
    }
    fs.writeFileSync('stitched.js', output);
    console.log(`Stitched file up to line ${maxLine}`);
  } else {
    console.log("No lines found");
  }
}

processLineByLine();
