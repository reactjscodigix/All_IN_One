import json
import re

log_path = r"C:\Users\Admin\.gemini\antigravity-ide\brain\72117494-99d0-4496-9ce1-274748c310ec\.system_generated\logs\transcript_full.jsonl"

file_lines = {}

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 'content' in data and isinstance(data['content'], str):
                # But view_file output is in the tool response!
                pass
            
            # Check for tool responses
            if data.get('type') == 'TOOL_RESPONSE' and 'tool_responses' in data:
                for resp in data['tool_responses']:
                    if resp.get('name') == 'view_file' and 'ITIssueDetailsPanel.js' in resp.get('output', ''):
                        out = resp['output']
                        # parse the lines
                        for out_line in out.split('\n'):
                            match = re.match(r'^(\d+):\s(.*)', out_line)
                            if match:
                                line_num = int(match.group(1))
                                line_content = match.group(2)
                                file_lines[line_num] = line_content
        except Exception as e:
            pass

# Save the stitched file
if file_lines:
    max_line = max(file_lines.keys())
    with open('stitched.js', 'w', encoding='utf-8') as out:
        for i in range(1, max_line + 1):
            out.write(file_lines.get(i, f"// MISSING LINE {i}") + '\n')
    print(f"Stitched file up to line {max_line}")
else:
    print("No lines found!")
