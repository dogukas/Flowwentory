const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src', 'app', 'dashboard', 'page.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// The GSAP animation sets opacity to 0 and might be getting stuck or running too slow for the user, 
// causing the page to look "blank" or "not opening".
// We will comment out opacity: 0 so the cards are always visible, just sliding in via 'y' and 'scale'.

content = content.replace(/opacity: 0,/g, '// opacity: 0, // removed to fix blank screen');

fs.writeFileSync(targetFile, content, 'utf8');
console.log('GSAP opacity override removed to prevent invisible page.');
