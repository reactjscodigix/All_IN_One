
const fs = require('fs');

function extractSelect(content, startRegex, endRegex) {
    const match = content.match(new RegExp(startRegex.source + '([\\s\\S]*?)' + endRegex.source));
    if (!match) return null;
    let sql = match[1].trim();
    let cols = [];
    let current = '';
    let depth = 0;
    for (let i = 0; i < sql.length; i++) {
        if (sql[i] === '(') depth++;
        else if (sql[i] === ')') depth--;
        else if (sql[i] === ',' && depth === 0) {
            cols.push(current.trim());
            current = '';
            continue;
        }
        current += sql[i];
    }
    if (current) cols.push(current.trim());
    return cols;
}

const content = fs.readFileSync('d:/projects/All_IN_One/deals-dashboard/server/routes/entities-routes.js', 'utf8');

const firstCols = extractSelect(content, /\(SELECT\s+/, /\s+FROM\s+deals\s+d/);
const secondCols = extractSelect(content, /UNION\s+ALL\s+\(SELECT\s+/, /\s+FROM\s+leads\s+l/);

if (firstCols && secondCols) {
    console.log(`First: ${firstCols.length}, Second: ${secondCols.length}`);
    const max = Math.max(firstCols.length, secondCols.length);
    for (let i = 0; i < max; i++) {
        console.log(`${i + 1}: [1] ${firstCols[i] || 'MISSING'}`);
        console.log(`${i + 1}: [2] ${secondCols[i] || 'MISSING'}`);
        console.log('---');
    }
} else {
    console.log('Could not find SELECTs');
}
