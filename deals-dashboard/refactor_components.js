const fs = require('fs');
const path = require('path');

const srcDir = path.join('client', 'src');
const compDir = path.join(srcDir, 'components');
const files = fs.readdirSync(compDir).filter(f => f.endsWith('.js') || f.endsWith('.jsx'));

const categories = {
  it: ['IT'],
  'seo-gmb': ['SeoGmb'],
  marketing: ['Marketing', 'Campaign', 'Blog', 'AllBlogs'],
  'super-admin': ['SuperAdmin', 'Packages', 'Domain', 'PurchaseTransaction', 'Subscriptions', 'CompanyPlans', 'Membership'],
  sales: ['Sales', 'Deal', 'Lead', 'Quotation', 'Commission', 'Approvals', 'ConvertLead', 'Performance', 'Target', 'Pipeline', 'RevenueForecast', 'LostDeals', 'WonDeals'],
};

const fileMap = {};
const allFiles = {};

files.forEach(file => {
  if (file === 'rearrange.js' || file === 'rearrange.py' || file.startsWith('stitch') || file.startsWith('recover') || file === 'fix.js' || file === 'move_activity.js' || file === 'test.js' || file === 'preview-categories.js') return;

  let folder = 'common';
  for (let cat in categories) {
    if (categories[cat].some(prefix => file.startsWith(prefix) || file.includes(prefix))) {
      folder = cat;
      break;
    }
  }
  
  if (file.startsWith('IT')) folder = 'it';
  if (file.includes('CrmDeals') || file.includes('CrmLeads')) folder = 'sales';
  if (file.includes('CrmCompanies') || file.includes('CrmCampaign')) folder = 'common';
  
  if (!fileMap[folder]) fileMap[folder] = [];
  fileMap[folder].push(file);
  
  const baseName = file.replace('.jsx', '').replace('.js', '');
  allFiles[baseName] = folder;
});

// 1. Create folders
Object.keys(fileMap).forEach(folder => {
  const targetDir = path.join(compDir, folder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
  }
});

// 2. Move files
Object.entries(fileMap).forEach(([folder, folderFiles]) => {
  const targetDir = path.join(compDir, folder);
  folderFiles.forEach(file => {
    const oldPath = path.join(compDir, file);
    const newPath = path.join(targetDir, file);
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
    }
  });
});

// 3. Update App.js imports
const appJsPath = path.join(srcDir, 'App.js');
let appJsContent = fs.readFileSync(appJsPath, 'utf8');

Object.entries(allFiles).forEach(([fileName, folder]) => {
  const regex = new RegExp(`from\\s+['"]\\./components/${fileName}['"]`, 'g');
  appJsContent = appJsContent.replace(regex, `from './components/${folder}/${fileName}'`);
});
fs.writeFileSync(appJsPath, appJsContent, 'utf8');

// 4. Update component internal imports
Object.entries(fileMap).forEach(([currentFolder, folderFiles]) => {
  folderFiles.forEach(file => {
    const filePath = path.join(compDir, currentFolder, file);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix imports that go UP out of components (e.g. '../utils', '../../utils')
    // Since we moved the file ONE directory deeper, we add one '../'
    content = content.replace(/from\s+['"](\.\.\/)+([^'"]+)['"]/g, (match, p1, p2) => {
      // If it was importing another component that was ALSO in parent dir (e.g. '../Sidebar'),
      // we handle component imports separately. We only do this for non-component paths
      // Wait, simpler approach: replace ALL `../` with `../../`, and then handle component imports properly.
      return `from '../${p1}${p2}'`;
    });

    // Fix inter-component imports (which were `./FileName` or `../FileName`)
    Object.entries(allFiles).forEach(([importFileName, importFolder]) => {
      // the original import was probably `./FileName`
      const regex1 = new RegExp(`from\\s+['"]\\./${importFileName}['"]`, 'g');
      // or maybe it got caught in the `../` replacement above and became `.././FileName` or `../../FileName`!
      // To avoid regex chaos, let's just match any relative import ending exactly in /importFileName
      const regexAny = new RegExp(`from\\s+['"](\\.\\.?\\/)+${importFileName}['"]`, 'g');

      let relativePath;
      if (currentFolder === importFolder) {
        relativePath = `./${importFileName}`;
      } else {
        relativePath = `../${importFolder}/${importFileName}`;
      }
      
      content = content.replace(regexAny, `from '${relativePath}'`);
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
  });
});

console.log('Migration completed successfully.');
