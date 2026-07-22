const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src', 'app', 'dashboard', 'page.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Catch any remaining dark backgrounds and convert to clean white cards
content = content.replace(/bg-\[#1e293b\]\/[0-9]* /g, 'bg-white ');
content = content.replace(/backdrop-blur-xl /g, '');
content = content.replace(/border-white\/5 /g, 'border-slate-100 ');
content = content.replace(/shadow-lg hover:shadow-xl/g, 'shadow-sm rounded-2xl hover:shadow-md');
content = content.replace(/shadow-2xl hover:bg-\[#1e293b\]\/80/g, 'shadow-sm rounded-2xl hover:shadow-md');
content = content.replace(/shadow-lg hover:bg-[a-z]+-[0-9]+\/20/g, 'shadow-sm rounded-2xl hover:shadow-md');

// The graph cards in the bottom
content = content.replace(/bg-slate-500/g, 'bg-white'); // If any

// To be extremely safe, let's just replace all 'dashboard-card' classes with a standard clean light theme class
content = content.replace(/className="dashboard-card[^"]*"/g, 'className="dashboard-card h-full flex flex-col bg-white border border-slate-100 shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-300"');

// Fix text colors in cards that might be white/slate-500
// Note: We already fixed main text-white to text-slate-900 earlier. Let's make sure the card titles are visible.
content = content.replace(/text-slate-500/g, 'text-slate-500'); // already good
content = content.replace(/text-slate-800/g, 'text-slate-800'); // already good

// Let's refine the inner padding of lists as suggested by the AI agent
content = content.replace(/className="flex items-center justify-between p-3 /g, 'className="flex items-center justify-between p-4 ');

// Make sure backgrounds of the bottom lists don't have weird dark themes
content = content.replace(/bg-slate-800/g, 'bg-white');
content = content.replace(/text-gray-200/g, 'text-slate-600');
content = content.replace(/text-gray-400/g, 'text-slate-400');

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Final comprehensive light UI modernization applied.');
