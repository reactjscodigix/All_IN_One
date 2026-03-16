import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const companyReportData = {
  yearLine: [
    { month: "Jan", value: 18000 },
    { month: "Feb", value: 20000 },
    { month: "Mar", value: 25000 },
    { month: "Apr", value: 38000 },
    { month: "May", value: 32000 },
    { month: "Jun", value: 42000 },
    { month: "Jul", value: 37000 },
    { month: "Aug", value: 31000 },
    { month: "Sep", value: 56000 },
    { month: "Oct", value: 33000 },
    { month: "Nov", value: 24000 },
    { month: "Dec", value: 28000 },
  ],
  sourceDonut: [
    { name: "Campaigns", value: 44, color: "#1f93ff" },
    { name: "Google", value: 55, color: "#6a15ff" },
    { name: "Referrals", value: 41, color: "#ff3b30" },
    { name: "Paid Social", value: 17, color: "#ff9800" },
  ],
  companies: [
    {
      id: 1,
      name: "NovaWave LLC",
      email: "robertson@example.com",
      tag: "Collab",
      owner: { name: "Hendry Milner", avatar: "https://i.pravatar.cc/100?img=32" },
      status: "Active",
      color: "#4F46E5",
    },
    {
      id: 2,
      name: "BlueSky Industries",
      email: "sharon@example.com",
      tag: "Collab",
      owner: { name: "Guillory Berggren", avatar: "https://i.pravatar.cc/100?img=12" },
      status: "Inactive",
      color: "#DC2626",
    },
    {
      id: 3,
      name: "SilverHawk",
      email: "vaughan12@example.com",
      tag: "Collab",
      owner: { name: "Jami Carlile", avatar: "https://i.pravatar.cc/100?img=47" },
      status: "Active",
      color: "#059669",
    },
    {
      id: 4,
      name: "SummitPeak",
      email: "jessica13@example.com",
      tag: "Collab",
      owner: { name: "Theresa Nelson", avatar: "https://i.pravatar.cc/100?img=22" },
      status: "Active",
      color: "#7C3AED",
    },
    {
      id: 5,
      name: "RiverStone Ventur",
      email: "caroltho3@example.com",
      tag: "Collab",
      owner: { name: "Smith Cooper", avatar: "https://i.pravatar.cc/100?img=3" },
      status: "Active",
      color: "#000000",
    },
    {
      id: 6,
      name: "Bright Bridge Grp",
      email: "dawnmercha@example.com",
      tag: "Collab",
      owner: { name: "Martin Lewis", avatar: "https://i.pravatar.cc/100?img=11" },
      status: "Active",
      color: "#06B6D4",
    },
    {
      id: 7,
      name: "CoastalStar Co.",
      email: "rachel@example.com",
      tag: "Collab",
      owner: { name: "Newell Egan", avatar: "https://i.pravatar.cc/100?img=14" },
      status: "Active",
      color: "#8B5CF6",
    },
    {
      id: 8,
      name: "HarborView",
      email: "jonelle@example.com",
      tag: "Promotion",
      owner: { name: "Janet Carlson", avatar: "https://i.pravatar.cc/100?img=9" },
      status: "Active",
      color: "#1F2937",
    },
    {
      id: 9,
      name: "Golden Gate Ltd",
      email: "jonathan@example.com",
      tag: "Promotion",
      owner: { name: "Craig Brown", avatar: "https://i.pravatar.cc/100?img=16" },
      status: "Active",
      color: "#EA580C",
    },
    {
      id: 10,
      name: "Redwood Inc",
      email: "brook@example.com",
      tag: "Promotion",
      owner: { name: "Daniel Byrne", avatar: "https://i.pravatar.cc/100?img=18" },
      status: "Active",
      color: "#DB2777",
    },
  ],
};

const CompanyLogo = ({ name, color }) => (
  <div className="w-8 h-8 rounded flex items-center justify-center text-white text-xs " style={{ backgroundColor: color }}>
    {name.charAt(0)}
  </div>
);

const Tag = ({ text }) => {
  const tagColors = {
    Collab: "bg-green-50 text-green-700 border-green-200",
    Promotion: "bg-orange-50 text-orange-700 border-orange-200",
    VIP: "bg-purple-50 text-purple-700 border-purple-200",
  };
  const classes = tagColors[text] || "bg-gray-50 text-gray-700 border-gray-200";
  return <span className={`text-xs  p-1  rounded border ${classes}`}>{text}</span>;
};

const StatusPill = ({ status }) => {
  const map = {
    Active: "bg-green-500 text-white",
    Inactive: "bg-red-500 text-white",
  };
  return <span className={`text-xs  p-1  rounded ${map[status] || "bg-gray-500 text-white"}`}>{status}</span>;
};

const ContactIcon = ({ type, title }) => {
  const icons = {
    email: "✉",
    phone: "☎",
    chat: "💬",
    notes: "📝",
  };
  return (
    <span title={title} className="inline-flex items-center justify-center w-6 h-6 hover:bg-gray-100 rounded cursor-pointer text-gray-600 text-xs ">
      {icons[type] || "○"}
    </span>
  );
};

function CompaniesByYearChart({ data }) {
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} />
          <YAxis tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} tick={{ fontSize: 12, fill: "#6B7280" }} />
          <Tooltip formatter={(v) => new Intl.NumberFormat().format(v)} />
          <Line type="monotone" dataKey="value" stroke="#ff9800" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ContactsBySourceDonut({ data }) {
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} innerRadius={60} outerRadius={95} dataKey="value" paddingAngle={3}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Legend verticalAlign="bottom" height={30} />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function CompaniesTable({ rows }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    if (!query) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => `${r.name} ${r.email} ${r.tag} ${r.owner.name}`.toLowerCase().includes(q));
  }, [rows, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs ">
          <thead>
            <tr className="text-xs text-gray-600 bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 text-left w-8">
                <input type="checkbox" className="cursor-pointer" />
              </th>
              <th className="py-3 px-4 text-left ">Name</th>
              <th className="py-3 px-4 text-left ">Email</th>
              <th className="py-3 px-4 text-left ">Tags</th>
              <th className="py-3 px-4 text-left ">Owner</th>
              <th className="py-3 px-4 text-left ">Contact</th>
              <th className="py-3 px-4 text-left ">Status</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((r) => (
              <tr key={r.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <input type="checkbox" className="cursor-pointer" />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <CompanyLogo name={r.name} color={r.color} />
                    <span className="text-gray-800  ">{r.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-600">{r.email}</td>
                <td className="py-3 px-4">
                  <Tag text={r.tag} />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <img src={r.owner.avatar} alt={r.owner.name} className="w-7 h-7 rounded-full object-cover" />
                    <span className="text-gray-700">{r.owner.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <ContactIcon type="email" title="Email" />
                    <ContactIcon type="phone" title="Phone" />
                    <ContactIcon type="chat" title="Chat" />
                    <ContactIcon type="notes" title="Notes" />
                  </div>
                </td>
                <td className="py-3 px-4">
                  <StatusPill status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-xs  text-gray-600">
        <div>
          Show <select className="border border-gray-300 rounded p-1  text-xs  inline-block" defaultValue="10">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select> entries
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ◀
          </button>
          <span className="text-gray-600">
            {page} / {pages}
          </span>
          <button
            className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompanyReports() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <aside className="w-56 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-8">
              <div className="text-2xl  text-teal-600">Preadmin</div>
            </div>

            <nav className="space-y-0.5 text-xs ">
              <div className="px-3 py-2 text-xs   text-[#1F2020] tracking-wide">Main Menu</div>
              <div className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100 cursor-pointer">Dashboard</div>
              <div className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100 cursor-pointer">Applications</div>
              <div className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100 cursor-pointer">Super Admin</div>
              <div className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100 cursor-pointer">Layouts</div>

              <div className="px-3 py-3 text-xs   text-[#1F2020] tracking-wide">CRM</div>
              <div className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100 cursor-pointer">Contacts</div>
              <div className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100 cursor-pointer">Companies</div>
              <div className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100 cursor-pointer">Deals</div>
              <div className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100 cursor-pointer">Leads</div>
              <div className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100 cursor-pointer">Pipeline</div>
              <div className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100 cursor-pointer">Campaign</div>
            </nav>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-2  bg-white border-b border-gray-200">
            <div>
              <h1 className="text-2xl  text-gray-800">
                Company Reports <span className="ml-3 inline-block bg-red-100 text-red-700 text-xs  px-3 py-1 rounded">125</span>
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                <span className="hover:text-gray-700 cursor-pointer">Home</span> &gt; <span>Company Reports</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 border border-gray-300 rounded hover:bg-gray-50">📊</button>
              <button className="p-2 border border-gray-300 rounded hover:bg-gray-50">⚙️</button>
            </div>
          </div>

          <div className="flex-1 overflow-auto px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-3">
              <div className="lg:col-span-2">
                <div className="bg-white border border-gray-200 rounded  p-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs   text-gray-800">Companies By Year</h3>
                    <div className="flex items-center gap-2">
                      <select className="border border-gray-300 rounded p-1  text-xs  bg-white">
                        <option>2025</option>
                      </select>
                      <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">⋯</button>
                    </div>
                  </div>
                  <CompaniesByYearChart data={companyReportData.yearLine} />
                </div>
              </div>

              <div>
                <div className="bg-white border border-gray-200 rounded  p-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs   text-gray-800">Contacts By Source</h3>
                    <select className="border border-gray-300 rounded p-1  text-xs  bg-white">
                      <option>2025</option>
                    </select>
                  </div>
                  <ContactsBySourceDonut data={companyReportData.sourceDonut} />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded  p-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                  <input placeholder="Search" className="border border-gray-300 rounded px-3 py-2 text-xs  w-64" />
                  <button className="px-3 py-2 border border-gray-300 rounded text-xs  text-gray-700 hover:bg-gray-50">Filter</button>
                  <span className="text-xs text-gray-500">1 Dec 25 - 1 Dec 25</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-2 border border-gray-300 rounded text-xs  text-gray-700 hover:bg-gray-50">Sort By</button>
                  <button className="px-3 py-2 border border-gray-300 rounded text-xs  text-gray-700 hover:bg-gray-50">Manage Columns</button>
                </div>
              </div>

              <CompaniesTable rows={companyReportData.companies} />
            </div>

            <footer className="mt-8 text-xs text-[#1F2020]">
              Copyright © 2025 <span className="text-teal-600">Preadmin</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
