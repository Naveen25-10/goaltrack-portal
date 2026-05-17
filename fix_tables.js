const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('client/src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('<table')) {
    // Check if it already has a wrapper to prevent double wrapping
    if (!content.includes('overflow-x-auto w-full')) {
      content = content.replace(/<table/g, '<div className="overflow-x-auto w-full"><table').replace(/<\/table>/g, '</table></div>');
      fs.writeFileSync(file, content);
      console.log('Fixed tables in ' + file);
    }
  }
});
