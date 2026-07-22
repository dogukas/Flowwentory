const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src', 'app', 'dashboard', 'page.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Keep background very subtle
content = content.replace(
  'className="dashboard-container relative min-h-screen bg-slate-50/50 pb-20 overflow-x-hidden"',
  'className="dashboard-container relative min-h-screen bg-[#fafafa] pb-20 overflow-x-hidden text-slate-800"'
);

// We keep the decorative blobs but make them extremely faint
content = content.replace(/bg-purple-200\/30/g, 'bg-slate-200/40');
content = content.replace(/bg-orange-200\/30/g, 'bg-slate-200/40');

// 2. Main Metric Cards -> Clean white, rounded-2xl, subtle shadow
content = content.replace(/bg-white\/80 backdrop-blur-md border border-slate-200\/60 shadow-lg hover:shadow-xl transition-all duration-300/g, 'bg-white border-slate-100 shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-300');
content = content.replace(/bg-orange-50\/50 backdrop-blur-md border border-orange-100 shadow-lg hover:shadow-orange-100\/50 hover:border-orange-200 transition-all duration-300/g, 'bg-orange-50/30 border-orange-100/50 shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-300');
content = content.replace(/bg-emerald-50\/50 backdrop-blur-md border border-emerald-100 shadow-lg hover:shadow-emerald-100\/50 hover:border-emerald-200 transition-all duration-300/g, 'bg-emerald-50/30 border-emerald-100/50 shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-300');
content = content.replace(/bg-sky-50\/50 backdrop-blur-md border border-sky-100 shadow-lg hover:shadow-sky-100\/50 hover:border-sky-200 transition-all duration-300/g, 'bg-sky-50/30 border-sky-100/50 shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-300');

// 3. Middle Section List Containers -> Keep them clean white instead of colored backgrounds, let the internal items have color
content = content.replace(/bg-orange-50\/30 backdrop-blur-md border border-orange-100 shadow-md hover:shadow-lg transition-all duration-300/g, 'bg-white border-slate-100 shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-300');
content = content.replace(/bg-green-50\/30 backdrop-blur-md border border-green-100 shadow-md hover:shadow-lg transition-all duration-300/g, 'bg-white border-slate-100 shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-300');
content = content.replace(/bg-blue-50\/30 backdrop-blur-md border border-blue-100 shadow-md hover:shadow-lg transition-all duration-300/g, 'bg-white border-slate-100 shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-300');
content = content.replace(/bg-purple-50\/30 backdrop-blur-md border border-purple-100 shadow-md hover:shadow-lg transition-all duration-300/g, 'bg-white border-slate-100 shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-300');

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Clean light modernization applied.');
