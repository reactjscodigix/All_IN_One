const fs = require('fs');

// 1. Update SignupPage.js
let signupContent = fs.readFileSync('client/src/components/SignupPage.js', 'utf8');

if (!signupContent.includes("'Management'")) {
  signupContent = signupContent.replace(
    /const DEPARTMENTS = \[\s*'Sales Department',\s*'IT Department',\s*'Marketing Department'/,
    `const DEPARTMENTS = [\n    'Management',\n    'Sales Department',\n    'IT Department',\n    'Marketing Department'`
  );
  
  signupContent = signupContent.replace(
    /const DESIGNATIONS = \{/,
    `const DESIGNATIONS = {\n    'Management': ['Super Admin'],`
  );
  
  fs.writeFileSync('client/src/components/SignupPage.js', signupContent, 'utf8');
}

// 2. Update Sidebar.js
let sidebarContent = fs.readFileSync('client/src/components/Sidebar.js', 'utf8');

// Ensure LayoutDashboard and Package are imported
if (!sidebarContent.includes('LayoutDashboard')) {
  sidebarContent = sidebarContent.replace(/import \{([\s\S]*?)\} from 'lucide-react';/, "import { LayoutDashboard, Package, $1} from 'lucide-react';");
}

const renderAdminPagesFunc = `  const renderAdminPages = () => (
    <>
      <div className="p-2 text-xs text-[#1F2020] uppercase tracking-wider bg-gray-50/50 mt-2">Admin Panel</div>
      <SubmenuItem label="Dashboard" page="" icon={LayoutDashboard} prefix="/super-admin" />
      <SubmenuItem label="Companies" page="companies" icon={Building2} prefix="/super-admin" />
      <SubmenuItem label="Subscriptions" page="subscriptions" icon={CreditCard} prefix="/super-admin" />
      <SubmenuItem label="Packages" page="packages" icon={Package} prefix="/super-admin" />
      <SubmenuItem label="Domain" page="domain" icon={Globe} prefix="/super-admin" />
      <SubmenuItem label="Transactions" page="purchase-transaction" icon={Receipt} prefix="/super-admin" />
    </>
  );\n\n  const renderSalesPages =`;

if (!sidebarContent.includes('renderAdminPages')) {
  sidebarContent = sidebarContent.replace(/const renderSalesPages =/, renderAdminPagesFunc);
  
  // Insert the renderAdminPages call
  const callAdminPages = `{isSuperAdmin && renderAdminPages()}`;
  sidebarContent = sidebarContent.replace(/\{\(isSuperAdmin \|\| userDept === 'Sales Department'\) && renderSalesPages\(\)\}/, callAdminPages + '\n        {(isSuperAdmin || userDept === \'Sales Department\') && renderSalesPages()}');
  
  fs.writeFileSync('client/src/components/Sidebar.js', sidebarContent, 'utf8');
}

console.log('Admin wiring completed.');
