const fs = require('fs');

// 1. Update SignupPage.js
let signupContent = fs.readFileSync('client/src/components/SignupPage.js', 'utf8');
signupContent = signupContent.replace(
  /'Marketing Department': \['Graphics Designer', 'Video Editor', 'Social Media Marketing', 'SEO & GMB', 'Manager', 'PPC Manager'\],/,
  `'Marketing Department': ['Graphics Designer', 'Video Editor', 'Social Media Marketing', 'SEO & GMB', 'Manager', 'PPC Manager', 'Wordpress Developer'],`
);
fs.writeFileSync('client/src/components/SignupPage.js', signupContent, 'utf8');

// 2. Update Sidebar.js
let sidebarContent = fs.readFileSync('client/src/components/Sidebar.js', 'utf8');

const renderMarketingPagesRegex = /const showCreative = isSuperAdmin \|\| isManager \|\| userRole === 'Graphics Designer' \|\| userRole === 'Video Editor';\s*const showSocial = isSuperAdmin \|\| isManager \|\| userRole === 'Social Media Marketing';/;

sidebarContent = sidebarContent.replace(
  renderMarketingPagesRegex,
  `const showCreative = isSuperAdmin || isManager || userRole === 'Graphics Designer' || userRole === 'Video Editor';\n    const showSocial = isSuperAdmin || isManager || userRole === 'Social Media Marketing';\n    const showWordpress = isSuperAdmin || isManager || userRole === 'Wordpress Developer';`
);

// We need to add the wordpress block inside the return statement of renderMarketingPages.
// Let's insert it right after the showCreative block.

const showCreativeBlock = `{showCreative && (
          <>
            <div className="p-2 text-xs  text-[#1F2020]  tracking-wider bg-gray-50/50 mt-2">Creative & Media</div>
            <SubmenuItem label="Creative Assets" page="media-management" icon={Image} prefix="/marketing" />
            <SubmenuItem label="Content Library" page="content-library" icon={BookOpen} prefix="/marketing" />
          </>
        )}`;

const showWordpressBlock = `

        {showWordpress && (
          <>
            <div className="p-2 text-xs text-[#1F2020]  tracking-wider bg-gray-50/50 mt-2">Wordpress</div>
            <SubmenuItem label="Dashboard" page="dashboard" icon={Gauge} prefix="/marketing" />
            <SubmenuItem label="Task Management" page="tasks" icon={CheckCircle} prefix="/marketing" />
            <SubmenuItem label="Projects" page="projects" icon={FolderOpen} prefix="/marketing" />
            <SubmenuItem label="File Manager" page="file-manager" icon={FileText} prefix="/marketing" />
            <SubmenuItem label="Team Chat" page="chat" icon={MessageCircle} prefix="/marketing" />
            <SubmenuItem label="Activities" page="activities" icon={Activity} prefix="/marketing" />
          </>
        )}`;

// Wait, the regex replace must match exactly how it looks in Sidebar.js.
// Let's use string splitting or replace.

const targetBlock = `{showCreative && (
          <>
            <div className="p-2 text-xs  text-[#1F2020]  tracking-wider bg-gray-50/50 mt-2">Creative & Media</div>
            <SubmenuItem label="Creative Assets" page="media-management" icon={Image} prefix="/marketing" />
            <SubmenuItem label="Content Library" page="content-library" icon={BookOpen} prefix="/marketing" />
          </>
        )}`;

if (sidebarContent.includes(targetBlock)) {
  sidebarContent = sidebarContent.replace(targetBlock, targetBlock + showWordpressBlock);
} else {
  // Try regex if exact match fails due to spaces
  const regex = /\{showCreative && \([\s\S]*?<\/>\s*\)\}/;
  sidebarContent = sidebarContent.replace(regex, match => match + showWordpressBlock);
}

// Ensure FolderOpen is imported from lucide-react if not already
if (!sidebarContent.includes('FolderOpen')) {
  sidebarContent = sidebarContent.replace(/import \{([\s\S]*?)\} from 'lucide-react';/, "import { FolderOpen, $1} from 'lucide-react';");
}

fs.writeFileSync('client/src/components/Sidebar.js', sidebarContent, 'utf8');
console.log('Patched Sidebar.js and SignupPage.js successfully.');
