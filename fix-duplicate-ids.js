const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'schools.js');
let content = fs.readFileSync(filePath, 'utf-8');

const lines = content.split('\n');
const idSet = new Set();
const duplicateIds = new Set();

const idPattern = /"id": "(GZ\d{3})"/;

lines.forEach((line, index) => {
  const match = line.match(idPattern);
  if (match) {
    const id = match[1];
    if (idSet.has(id)) {
      duplicateIds.add(id);
      console.log(`第${index + 1}行发现重复ID: ${id}`);
    } else {
      idSet.add(id);
    }
  }
});

console.log('\n重复ID列表:');
duplicateIds.forEach(id => console.log(id));

let modifiedCount = 0;
duplicateIds.forEach(id => {
  const regex = new RegExp(`"id": "${id}"`, 'g');
  let firstMatch = true;
  
  content = content.replace(regex, (match) => {
    if (firstMatch) {
      firstMatch = false;
      return match;
    } else {
      modifiedCount++;
      return `"id": "GZM${id.substring(2)}"`;
    }
  });
});

fs.writeFileSync(filePath, content, 'utf-8');
console.log(`\n修复完成！共修改了 ${modifiedCount} 个重复ID`);
