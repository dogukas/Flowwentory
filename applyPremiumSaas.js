const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src', 'app', 'dashboard', 'page.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Re-enable and enhance GSAP animation
content = content.replace(
  /\/\/ opacity: 0, \/\/ Removed to prevent visibility issues on error/g,
  'opacity: 0,'
);
// Add a slightly softer ease and a scale effect to cards
content = content.replace(
  'y: 30,',
  'y: 40,\n        scale: 0.98,'
);

// 2. Mesh Gradient Background
// The container currently looks something like:
// <div ref={containerRef} className="dashboard-container relative min-h-screen bg-[#f8fafc] pb-20 overflow-x-hidden text-slate-900">
content = content.replace(
  '<div ref={containerRef} className="dashboard-container relative min-h-screen bg-[#f8fafc] pb-20 overflow-x-hidden text-slate-900">',
  `<div ref={containerRef} className="dashboard-container relative min-h-screen bg-[#f8fafc] pb-20 overflow-x-hidden text-slate-900">
      {/* 🔮 Soft Mesh Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-indigo-300/20 blur-[100px]" />
        <div className="absolute top-[20%] -right-[5%] w-[40vw] h-[40vw] rounded-full bg-blue-300/20 blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-violet-300/20 blur-[100px]" />
      </div>`
);

// 3. Apple-esque Glassmorphism Cards
const oldCardClass = 'className="dashboard-card h-full flex flex-col bg-white border border-slate-100 shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-300"';
const newCardClass = 'className="dashboard-card h-full flex flex-col bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-400"';

const altOldCardClass = 'className="dashboard-card h-full flex flex-col bg-white border border-slate-100 shadow-sm rounded-2xl hover:shadow-md"';
const altNewCardClass = 'className="dashboard-card h-full flex flex-col bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-400"';

content = content.replace(new RegExp(oldCardClass, 'g'), newCardClass);
content = content.replace(new RegExp(altOldCardClass, 'g'), altNewCardClass);

// Also apply to plain 'bg-white' list boxes
content = content.replace(
  /className="col-span-1 dashboard-card h-full flex flex-col bg-white border border-slate-100 shadow-sm rounded-2xl hover:shadow-md"/g,
  'className="col-span-1 dashboard-card h-full flex flex-col bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:-translate-y-1 transition-all duration-400"'
);


// 4. Progress Bars and Lists
// Let\'s space out the lists inside cards slightly more
content = content.replace(/className="flex items-center justify-between p-4 /g, 'className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors ');

// 5. Critical Stock Pulse
// Add a pinging red dot for low stock
// We can find the "Düşük Stok (0-3)" header and add a pulse
content = content.replace(
  '<AlertCircle className="h-4 w-4 text-orange-500" />',
  '<div className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span></div>'
);

// 6. Fix "Rounded-2xl" on charts which might just have `bg-white` and `rounded-xl`
// Let's sweep up any standard `rounded-xl` container that isn't already updated to `rounded-3xl`
content = content.replace(/className="bg-white rounded-xl /g, 'className="bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl ');

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Premium SaaS UI applied.');
