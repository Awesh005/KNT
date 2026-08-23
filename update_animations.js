const fs = require('fs');
const path = require('path');

const homeSectionsDir = path.join(__dirname, 'frontend/src/components/sections/home');

const oldFadeInUp = `const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};`;

const newFadeInUp = `const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};`;

const oldStaggerContainer = `const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};`;

const newStaggerContainer = `const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};`;

function updateFiles() {
  const files = fs.readdirSync(homeSectionsDir);
  let updatedCount = 0;
  
  files.forEach(file => {
    if (file.endsWith('.tsx')) {
      const filePath = path.join(homeSectionsDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      let changed = false;
      
      if (content.includes(oldFadeInUp)) {
        content = content.replace(oldFadeInUp, newFadeInUp);
        changed = true;
      }
      if (content.includes(oldStaggerContainer)) {
        content = content.replace(oldStaggerContainer, newStaggerContainer);
        changed = true;
      }
      
      // Fix margins in viewport
      if (content.includes('margin: "-50px"')) {
        content = content.replace(/margin: "-50px"/g, 'amount: 0.1');
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(filePath, content);
        updatedCount++;
        console.log(`Updated animations in ${file}`);
      }
    }
  });
  console.log(`Finished updating ${updatedCount} files.`);
}

updateFiles();
