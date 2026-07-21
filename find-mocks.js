const fs = require('fs');
const path = require('path');

function findMockData(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findMockData(fullPath, fileList);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // Look for things like `const BACKLINK_TREND = [`
      // or `const mockData = `
      // or `const testData = `
      if (
        /const [A-Z_]+ = \[\s*\{/.test(content) ||
        /const (init|mock|dummy|test)[A-Za-z0-9_]+ = \[\s*\{/.test(content) ||
        /res\.json\(\s*\{.*(?:1256|8923|42|100).*\}\s*\)/.test(content) // random hardcoded numbers in res.json
      ) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

const clientDir = path.join(__dirname, 'client', 'src');
const serverDir = path.join(__dirname, 'server', 'routes');

const clientMocks = findMockData(clientDir);
const serverMocks = findMockData(serverDir);

console.log('--- Client files with potential mock data ---');
clientMocks.forEach(f => console.log(f.replace(__dirname, '')));
console.log(`\nTotal client files: ${clientMocks.length}`);

console.log('\n--- Server files with potential mock data ---');
serverMocks.forEach(f => console.log(f.replace(__dirname, '')));
console.log(`\nTotal server files: ${serverMocks.length}`);
