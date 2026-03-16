import React, { useState } from 'react';
import { ChevronDown, Search, Bell, Settings, LogOut, Menu, X, MoreVertical, Download, Filter as FilterIcon, Eye, Trash2 } from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  clientIcon: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Unpaid' | 'Partial';
  issueDate: string;
}

const InvoicesPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['crm']);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterOpen, setFilterOpen] = useState(false);

  const invoices: Invoice[] = [
    { id: '1', invoiceNumber: '#INV-001', client: 'NovaWave LLC', clientIcon: '🔵', amount: 5500, dueDate: '15 Oct 2025', status: 'Paid', issueDate: '01 Oct 2025' },
    { id: '2', invoiceNumber: '#INV-002', client: 'BlueSky Industries', clientIcon: '🔴', amount: 3200, dueDate: '19 Oct 2025', status: 'Unpaid', issueDate: '05 Oct 2025' },
    { id: '3', invoiceNumber: '#INV-003', client: 'Silver Hawk', clientIcon: '🟢', amount: 4100, dueDate: '24 Oct 2025', status: 'Partial', issueDate: '10 Oct 2025' },
    { id: '4', invoiceNumber: '#INV-004', client: 'Summit Peak', clientIcon: '🔷', amount: 6500, dueDate: '10 Nov 2025', status: 'Paid', issueDate: '15 Oct 2025' },
    { id: '5', invoiceNumber: '#INV-005', client: 'RiverStone Ventur', clientIcon: '⬛', amount: 3950, dueDate: '18 Nov 2025', status: 'Unpaid', issueDate: '20 Oct 2025' },
    { id: '6', invoiceNumber: '#INV-006', client: 'CoastalStar Co.', clientIcon: '🔵', amount: 7200, dueDate: '20 Nov 2025', status: 'Paid', issueDate: '25 Oct 2025' },
    { id: '7', invoiceNumber: '#INV-007', client: 'HarborView', clientIcon: '🟢', amount: 2450, dueDate: '07 Dec 2025', status: 'Unpaid', issueDate: '01 Nov 2025' },
    { id: '8', invoiceNumber: '#INV-008', client: 'Golden Gate Ltd', clientIcon: '🔴', amount: 5800, dueDate: '14 Dec 2025', status: 'Partial', issueDate: '05 Nov 2025' },
    { id: '9', invoiceNumber: '#INV-009', client: 'Redwood Inc', clientIcon: '🟣', amount: 6900, dueDate: '22 Dec 2025', status: 'Paid', issueDate: '10 Nov 2025' },
    { id: '10', invoiceNumber: '#INV-010', client: 'NovaWave LLC', clientIcon: '🔵', amount: 8200, dueDate: '28 Dec 2025', status: 'Unpaid', issueDate: '15 Nov 2025' },
  ];

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev =>
      prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
    );
  };

  const toggleInvoiceSelection = (id: string) => {
    setSelectedInvoices(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleAllInvoices = () => {
    if (selectedInvoices.length === invoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(invoices.map(i => i.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-700';
      case 'Unpaid':
        return 'bg-red-100 text-red-700';
      case 'Partial':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const SidebarMenu = () => (
    <div className="flex flex-col gap-8">
      {/* MAIN MENU */}
      <div>
        <h3 className="text-xs  text-gray-500  tracking-wider mb-4 px-4">Main Menu</h3>
        <nav className="space-y-1">
          <MenuItem icon="📊" label="Dashboard" expanded={expandedMenus.includes('dashboard')} toggle={() => toggleMenu('dashboard')}>
            <SubMenu label="Deals Dashboard" />
            <SubMenu label="Leads Dashboard" />
            <SubMenu label="Project Dashboard" />
          </MenuItem>
          <MenuItem icon="⚙️" label="Applications" expanded={expandedMenus.includes('apps')} toggle={() => toggleMenu('apps')}>
            <SubMenu label="Chat" />
            <SubMenu label="Calendar" />
            <SubMenu label="Email" />
            <SubMenu label="To Do" />
            <SubMenu label="Notes" />
            <SubMenu label="File Manager" />
            <SubMenu label="Kanban" />
            <SubMenu label="Invoices" />
          </MenuItem>
          <MenuItem icon="👑" label="Super Admin" expanded={expandedMenus.includes('admin')} toggle={() => toggleMenu('admin')}>
            <SubMenu label="Dashboard" />
            <SubMenu label="Companies" />
            <SubMenu label="Subscriptions" />
            <SubMenu label="Packages" />
          </MenuItem>
          <MenuItem icon="📋" label="Layouts" expanded={expandedMenus.includes('layouts')} toggle={() => toggleMenu('layouts')}>
            <SubMenu label="Mini" />
            <SubMenu label="Hover View" />
            <SubMenu label="Hidden" />
            <SubMenu label="Full Width" />
          </MenuItem>
        </nav>
      </div>

      {/* CRM */}
      <div>
        <h3 className="text-xs  text-gray-500  tracking-wider mb-4 px-4">CRM</h3>
        <nav className="space-y-1">
          <SimpleMenuItem icon="👥" label="Contacts" />
          <SimpleMenuItem icon="🏢" label="Companies" />
          <SimpleMenuItem icon="💼" label="Deals" />
          <SimpleMenuItem icon="🎯" label="Leads" />
          <SimpleMenuItem icon="📈" label="Pipeline" />
          <SimpleMenuItem icon="📢" label="Campaign" />
          <SimpleMenuItem icon="📁" label="Projects" />
          <SimpleMenuItem icon="✓" label="Tasks" />
          <SimpleMenuItem icon="📄" label="Proposals" />
          <SimpleMenuItem icon="📋" label="Contracts" />
          <SimpleMenuItem icon="💰" label="Estimations" />
          <SimpleMenuItem icon="🧾" label="Invoices" active />
          <SimpleMenuItem icon="💳" label="Payments" />
          <SimpleMenuItem icon="📊" label="Analytics" />
          <SimpleMenuItem icon="⚡" label="Activities" />
        </nav>
      </div>
    </div>
  );

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 hidden lg:flex flex-col ${!sidebarOpen && 'items-center'}`}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className={`text-2xl  text-red  ${!sidebarOpen && 'hidden'}`}>🎨 Preadmin</div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded ">
            {sidebarOpen ? <Menu size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
        <div className={`flex-1 overflow-y-auto p-2 ${!sidebarOpen && 'hidden'}`}>
          <SidebarMenu />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* TOP HEADER */}
        <header className="bg-white border-b border-gray-200 p-2 ">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1F2020]" />
                <input
                  type="text"
                  placeholder="Search Keyword"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded  focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded  relative">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded "><Settings size={20} className="text-gray-600" /></button>
              <button className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white  text-xs ">JD</button>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1p-3 ">
          {/* PAGE HEADER */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-[500] text-gray-900 ">
                  Invoices
                  <span className="bg-blue-100 text-blue-700 text-xs  px-3 py-1 rounded-full">348</span>
                </h1>
                <div className="flex gap-2 text-xs  text-gray-600 mt-2">
                  <span>Home</span>
                  <span>›</span>
                  <span>Invoices</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 p-2  bg-white border border-gray-200 rounded  hover:bg-gray-50   text-xs ">
                  <Download size={18} /> Export
                </button>
                <button className="p-2 hover:bg-gray-100 rounded "><MoreVertical size={20} /></button>
              </div>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="bg-white rounded  border border-gray-200 p-2 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs  text-gray-600">Sort By</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-gray-200 rounded  px-3 py-2 text-xs ">
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="amount">Amount High to Low</option>
                  <option value="due">Due Date</option>
                </select>
              </div>
              <div className="flex items-center gap-2 text-xs  text-gray-600 border-l border-gray-200 pl-4">
                📅 29 Nov 25 - 29 Nov 25
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button onClick={() => setFilterOpen(!filterOpen)} className="flex items-center gap-2 p-2  border border-gray-200 rounded  hover:bg-gray-50 text-xs ">
                  <FilterIcon size={16} /> Filter
                </button>
                <button className="p-2  border border-gray-200 rounded  hover:bg-gray-50 text-xs ">
                  Manage Columns
                </button>
              </div>
            </div>

            {filterOpen && (
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs   text-gray-700 mb-2 block">Status</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs ">
                      <input type="checkbox" className="rounded" defaultChecked /> Paid
                    </label>
                    <label className="flex items-center gap-2 text-xs ">
                      <input type="checkbox" className="rounded" defaultChecked /> Unpaid
                    </label>
                    <label className="flex items-center gap-2 text-xs ">
                      <input type="checkbox" className="rounded" defaultChecked /> Partial
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-xs   text-gray-700 mb-2 block">Amount Range</label>
                  <input type="range" className="w-full" min="0" max="10000" />
                </div>
                <div>
                  <label className="text-xs   text-gray-700 mb-2 block">Due Date</label>
                  <input type="date" className="w-full border border-gray-200 rounded  px-3 py-2 text-xs " />
                </div>
              </div>
            )}
          </div>

          {/* TABLE */}
          <div className="bg-white rounded  border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-2 text-left">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.length === invoices.length}
                        onChange={toggleAllInvoices}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="p-2 text-left text-xs   text-gray-700">Invoice #</th>
                    <th className="p-2 text-left text-xs   text-gray-700">Client</th>
                    <th className="p-2 text-left text-xs   text-gray-700">Amount</th>
                    <th className="p-2 text-left text-xs   text-gray-700">Issue Date</th>
                    <th className="p-2 text-left text-xs   text-gray-700">Due Date</th>
                    <th className="p-2 text-left text-xs   text-gray-700">Status</th>
                    <th className="p-2 text-left text-xs   text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={() => toggleInvoiceSelection(invoice.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="p-2 text-xs   text-red ">{invoice.invoiceNumber}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{invoice.clientIcon}</span>
                          <span className="text-xs    text-gray-900">{invoice.client}</span>
                        </div>
                      </td>
                      <td className="p-2 text-xs   text-gray-900">₹{invoice.amount}</td>
                      <td className="p-2 text-xs  text-gray-600">{invoice.issueDate}</td>
                      <td className="p-2 text-xs  text-gray-600">{invoice.dueDate}</td>
                      <td className="p-4">
                        <span className={`text-xs  px-3 py-1 rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-gray-200 rounded  text-gray-600 hover:text-gray-900" title="View">
                            <Eye size={16} />
                          </button>
                          <button className="p-2 hover:bg-red-100 rounded  text-gray-600 hover:text-red " title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAGINATION */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-xs  text-gray-600">
            <div className="flex items-center gap-2 mb-4 sm:mb-0">
              <span>Show</span>
              <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="border border-gray-200 rounded px-3 py-1">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <span>entries</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="border border-gray-200 px-3 py-1 rounded hover:bg-gray-50">&lt;</button>
              <button className="border border-gray-200 px-3 py-1 rounded bg-red-500 text-white ">1</button>
              <button className="border border-gray-200 px-3 py-1 rounded hover:bg-gray-50">2</button>
              <button className="border border-gray-200 px-3 py-1 rounded hover:bg-gray-50">3</button>
              <button className="border border-gray-200 px-3 py-1 rounded hover:bg-gray-50">&gt;</button>
            </div>
          </div>

          {/* SUMMARY STATS */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded  p-2 border border-green-200">
              <p className="text-xs  text-green-700 ">Total Paid</p>
              <p className="text-2xl  text-green-900 mt-2">$28,550</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded  p-2 border border-red-200">
              <p className="text-xs  text-red-700 ">Total Unpaid</p>
              <p className="text-2xl  text-red-900 mt-2">$12,250</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded  p-2 border border-yellow-200">
              <p className="text-xs  text-yellow-700 ">Total Partial</p>
              <p className="text-2xl  text-yellow-900 mt-2">$9,950</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded  p-2 border border-blue-200">
              <p className="text-xs  text-blue-700 ">Grand Total</p>
              <p className="text-2xl  text-blue-900 mt-2">$50,750</p>
            </div>
          </div>

          {/* FOOTER */}
          <footer className="mt-12 pt-6 border-t border-gray-200 text-xs  text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>Copyright © 2025 <span className="text-red-500 ">Preadmin</span></div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-700">About</a>
              <a href="#" className="hover:text-gray-700">Terms</a>
              <a href="#" className="hover:text-gray-700">Contact Us</a>
            </div>
          </footer>
        </main>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden">
          <div className="absolute left-0 top-0 w-64 h-full bg-white border-r border-gray-200 p-2 overflow-y-auto">
            <button onClick={() => setMobileMenuOpen(false)} className="mb-4">
              <X size={24} />
            </button>
            <SidebarMenu />
          </div>
        </div>
      )}
    </div>
  );
};

const MenuItem: React.FC<{ icon: string; label: string; expanded: boolean; toggle: () => void; children: React.ReactNode }> = ({ icon, label, expanded, toggle, children }) => (
  <div>
    <button onClick={toggle} className="w-full flex items-center justify-between p-2  text-gray-700 hover:bg-gray-100 rounded   ">
      <span className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        {label}
      </span>
      <ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
    </button>
    {expanded && (
      <div className="pl-8 mt-1 space-y-1">
        {children}
      </div>
    )}
  </div>
);

const SimpleMenuItem: React.FC<{ icon: string; label: string; active?: boolean }> = ({ icon, label, active }) => (
  <button className={`w-full flex items-center gap-3 p-2  rounded    ${active ? 'bg-red-50 text-red ' : 'text-gray-700 hover:bg-gray-100'}`}>
    <span className="text-lg">{icon}</span>
    {label}
  </button>
);

const SubMenu: React.FC<{ label: string }> = ({ label }) => (
  <button className="w-full text-left px-4 py-1 text-xs  text-gray-600 hover:text-gray-900">
    {label}
  </button>
);

export default InvoicesPage;
