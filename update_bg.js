const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend/src');

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  for (const [search, replace] of replacements) {
    if (content.includes(search)) {
      content = content.replace(new RegExp(escapeRegExp(search), 'g'), replace);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('Updated:', filePath);
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// Home Sections
replaceInFile(path.join(srcDir, 'components/sections/home/BannerCards.tsx'), [
  ['bg-fog-gray', 'bg-light-green'],
]);

replaceInFile(path.join(srcDir, 'components/sections/home/WhyTrustUs.tsx'), [
  ['bg-white', 'bg-soft-green'],
  ['border-charcoal/5', 'border-mint-green/30'],
  ['bg-fog-gray', 'bg-light-green'],
]);

replaceInFile(path.join(srcDir, 'components/sections/home/Testimonials.tsx'), [
  ['bg-charcoal/5', 'bg-light-green'],
]);

replaceInFile(path.join(srcDir, 'components/sections/home/UrgentCauses.tsx'), [
  ['bg-[#FCF8F7]', 'bg-white/80'],
  ['border-[#F0E6E4]', 'border-mint-green/50'],
]);

// Web Pages
replaceInFile(path.join(srcDir, 'pages/Web/About.tsx'), [
  ['bg-[#FDFBF7]', 'bg-light-green'],
]);

replaceInFile(path.join(srcDir, 'pages/Web/Career.tsx'), [
  ['bg-[#FDFBF7]', 'bg-light-green'],
  ['bg-[#E6F4EA]', 'bg-soft-green'],
]);

replaceInFile(path.join(srcDir, 'pages/Web/StudentSupport.tsx'), [
  ['bg-[#FDFBF7]', 'bg-light-green'],
  ['bg-fog-gray', 'bg-soft-green'],
]);

replaceInFile(path.join(srcDir, 'pages/Web/Certificates.tsx'), [
  ['bg-[#FDFBF7]', 'bg-light-green'],
]);

replaceInFile(path.join(srcDir, 'pages/Web/CampaignDetail.tsx'), [
  ['bg-fog-gray', 'bg-light-green'],
]);

replaceInFile(path.join(srcDir, 'pages/Web/NotFound.tsx'), [
  ['bg-[#FDFBF7]', 'bg-light-green'],
]);

console.log('Done updating backgrounds!');
