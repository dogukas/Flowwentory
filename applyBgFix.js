const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src', 'app', 'dashboard', 'page.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Change background from #fafafa to a much cleaner slate-50 and remove the dirty blobs completely
content = content.replace(
  'className="dashboard-container relative min-h-screen bg-[#fafafa] pb-20 overflow-x-hidden text-slate-800"',
  'className="dashboard-container relative min-h-screen bg-slate-50 pb-20 overflow-x-hidden text-slate-900"'
);

// Completely remove the decorative blobs html block to make it ultra clean
content = content.replace(
  /<div className="absolute top-0 left-0 w-full h-\[600px\] bg-gradient-to-b from-indigo-900\/20 to-transparent overflow-hidden pointer-events-none -z-10">[\s\S]*?<\/div>/,
  ''
);

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Background updated to slate-50 and blobs removed.');
