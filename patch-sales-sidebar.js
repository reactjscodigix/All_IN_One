const fs = require('fs');

let content = fs.readFileSync('client/src/components/Sidebar.js', 'utf8');

// Ensure all required icons are imported from lucide-react
const requiredIcons = ['LayoutDashboard', 'CheckCircle', 'Phone', 'Calendar', 'Activity', 'MessageCircle', 'Users', 'Briefcase', 'Users2', 'UserCircle', 'FileText', 'FileCheck', 'FileStack', 'ClipboardList', 'CreditCard', 'Banknote', 'Target', 'TrendingUp', 'Percent', 'ShieldCheck', 'BarChart3'];

const importMatch = content.match(/import \{([\s\S]*?)\} from 'lucide-react';/);
if (importMatch) {
  let existingImports = importMatch[1];
  let newImports = [];
  requiredIcons.forEach(icon => {
    if (!existingImports.includes(icon)) {
      newImports.push(icon);
    }
  });
  if (newImports.length > 0) {
    content = content.replace(importMatch[1], existingImports + ', ' + newImports.join(', '));
  }
}

const newRenderSalesPages = `  const renderSalesPages = () => (
    <>
      <div className="p-2 text-xs text-[#1F2020]  tracking-wider bg-gray-50/50 mt-2">Sales Workspace</div>
      <SubmenuItem label="Dashboard" page="dashboard" icon={LayoutDashboard} prefix="/sales" />
      <SubmenuItem label="My Tasks" page="tasks" icon={CheckCircle} prefix="/sales" />
      <SubmenuItem label="Follow-ups" page="followups" icon={Phone} prefix="/sales" />
      <SubmenuItem label="Calendar" page="calendar" icon={Calendar} prefix="/sales" />
      <SubmenuItem label="Activities" page="activities" icon={Activity} prefix="/sales" />
      <SubmenuItem label="Team Chat" page="chat" icon={MessageCircle} prefix="/sales" />

      <div className="p-2 text-xs text-[#1F2020]  tracking-wider bg-gray-50/50 mt-2">Sales Operations</div>
      <SubmenuItem label="All Leads" page="leads" icon={Users} prefix="/sales" />
      <SubmenuItem label="All Deals" page="deals-list" icon={Briefcase} prefix="/sales" />
      <SubmenuItem label="Contacts" page="contacts" icon={Users2} prefix="/sales" />
      <SubmenuItem label="Customers" page="customers" icon={UserCircle} prefix="/sales" />

      <div className="p-2 text-xs text-[#1F2020]  tracking-wider bg-gray-50/50 mt-2">Financials & Docs</div>
      <SubmenuItem label="Proposals" page="proposals" icon={FileText} prefix="/sales" />
      <SubmenuItem label="Estimations" page="estimations" icon={FileCheck} prefix="/sales" />
      <SubmenuItem label="Quotations" page="quotations" icon={FileStack} prefix="/sales" />
      <SubmenuItem label="Contracts" page="contracts" icon={ClipboardList} prefix="/sales" />
      <SubmenuItem label="Invoices" page="invoices" icon={CreditCard} prefix="/sales" />
      <SubmenuItem label="Payments" page="payments" icon={Banknote} prefix="/sales" />

      {isManager && (
        <>
          <div className="p-2 text-xs text-[#1F2020]  tracking-wider bg-gray-50/50 mt-2">Sales Management</div>
          <SubmenuItem label="Lead Distribution" page="distribution" icon={Users2} prefix="/sales" />
          <SubmenuItem label="Targets & KPI" page="targets" icon={Target} prefix="/sales" />
          <SubmenuItem label="Performance" page="performance" icon={TrendingUp} prefix="/sales" />
          <SubmenuItem label="Commission" page="commission" icon={Percent} prefix="/sales" />
          <SubmenuItem label="Approvals" page="approvals" icon={ShieldCheck} prefix="/sales" />
          <SubmenuItem label="Reports" page="reports" icon={BarChart3} prefix="/sales" />
        </>
      )}
    </>
  );`;

// We'll replace the existing renderSalesPages block completely.
// Since it spans multiple lines, we can use a regex that matches from `const renderSalesPages = () => \(` to the end of that arrow function.
const regex = /const renderSalesPages = \(\) => \([\s\S]*?^\s*\);\n/m;
content = content.replace(regex, newRenderSalesPages + '\n');

fs.writeFileSync('client/src/components/Sidebar.js', content, 'utf8');
console.log('Patched renderSalesPages successfully.');
