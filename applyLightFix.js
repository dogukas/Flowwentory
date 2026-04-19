const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src', 'app', 'dashboard', 'page.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Container Background mapping (Dark to Light)
content = content.replace(
  'className="dashboard-container relative min-h-screen bg-[#0f172a] pb-20 overflow-x-hidden text-slate-200"',
  'className="dashboard-container relative min-h-screen bg-[#f8fafc] pb-20 overflow-x-hidden text-slate-900"'
);
content = content.replace(
  'className="dashboard-container relative min-h-screen bg-slate-50 pb-20 overflow-x-hidden text-slate-900"',
  'className="dashboard-container relative min-h-screen bg-[#f8fafc] pb-20 overflow-x-hidden text-slate-900"'
); // Just in case bg-slate-50 worked

// 2. Headings
content = content.replace(
  '<h1 className="text-4xl font-light tracking-tight text-white">',
  '<h1 className="text-4xl font-light tracking-tight text-slate-900">'
);
content = content.replace(
  '<p className="text-slate-400 mt-2">Güncel stok durumları ve analiz raporları</p>',
  '<p className="text-slate-500 mt-2">Güncel stok durumları ve analiz raporları</p>'
);

// 3. Main Metric Cards (Dark to Clean Light)
content = content.replace(/bg-\[#1e293b\]\/60 backdrop-blur-xl border border-white\/5 shadow-2xl hover:bg-\[#1e293b\]\/80/g, 'bg-white border-slate-100 shadow-sm rounded-2xl hover:shadow-md');
content = content.replace(/bg-orange-500\/10 backdrop-blur-xl border border-orange-500\/20 shadow-lg hover:bg-orange-500\/20/g, 'bg-white border-slate-100 shadow-sm rounded-2xl hover:shadow-md');
content = content.replace(/bg-emerald-500\/10 backdrop-blur-xl border border-emerald-500\/20 shadow-lg hover:bg-emerald-500\/20/g, 'bg-white border-slate-100 shadow-sm rounded-2xl hover:shadow-md');
content = content.replace(/bg-sky-500\/10 backdrop-blur-xl border border-sky-500\/20 shadow-lg hover:bg-sky-500\/20/g, 'bg-white border-slate-100 shadow-sm rounded-2xl hover:shadow-md');

// 4. Middle Section List Containers (Dark to Clean Light)
content = content.replace(/bg-\[#1e293b\]\/40 backdrop-blur-xl border border-white\/5/g, 'bg-white border-slate-100 shadow-sm rounded-2xl hover:shadow-md');

// 5. General Text Reversions
content = content.replace(/text-white/g, 'text-slate-900'); // Note: some icons might be affected, but text-white is usually main headings
content = content.replace(/<div className="text-3xl font-light text-slate-900">/g, '<div className="text-3xl font-light text-slate-800">');

// 6. Remove Nivo Theme Dark Props
const nivoTheme = `
                    theme={{
                      textColor: '#94a3b8',
                      tooltip: {
                        container: {
                          background: '#1e293b',
                          color: '#f1f5f9',
                          fontSize: 12,
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }
                      }
                    }}
`;
content = content.replace(nivoTheme, '');

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully reverted dark theme to modern light theme.');
