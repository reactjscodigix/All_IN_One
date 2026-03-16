
const fs = require('fs');

function countColumns(sql) {
    let count = 0;
    let depth = 0;
    for (let i = 0; i < sql.length; i++) {
        if (sql[i] === '(') depth++;
        else if (sql[i] === ')') depth--;
        else if (sql[i] === ',' && depth === 0) count++;
    }
    return count + 1;
}

const content = fs.readFileSync('d:/projects/All_IN_One/deals-dashboard/server/routes/entities-routes.js', 'utf8');

const firstSelectMatch = content.match(/\(SELECT\s+([\s\S]*?)\s+FROM\s+deals\s+d/);
const secondSelectMatch = content.match(/UNION\s+ALL\s+\(SELECT\s+([\s\S]*?)\s+FROM\s+leads\s+l/);

if (firstSelectMatch && secondSelectMatch) {
    const firstCount = countColumns(firstSelectMatch[1].trim());
    const secondCount = countColumns(secondSelectMatch[1].trim());

    console.log('First SELECT column count:', firstCount);
    console.log('Second SELECT column count:', secondCount);
} else {
    console.log('Could not find both SELECT statements');
}
