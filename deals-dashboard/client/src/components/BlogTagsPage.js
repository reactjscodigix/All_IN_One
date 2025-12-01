import React, { useState } from "react";
import { Search, MoreVertical, Calendar } from "lucide-react";

const BlogTagsPage = () => {
  const [tags] = useState([
    { name: "Productivity", date: "17 Dec 2025", status: "Active" },
    { name: "Integration", date: "11 Dec 2025", status: "Active" },
    { name: "Integration", date: "23 Nov 2025", status: "Active" },
    { name: "Security", date: "12 Nov 2025", status: "Active" },
    { name: "Data Insights", date: "07 Nov 2025", status: "Active" },
    { name: "Automation", date: "15 Oct 2025", status: "Inactive" },
    { name: "Marketing", date: "04 Oct 2025", status: "Inactive" },
    { name: "Marketing", date: "29 Sep 2025", status: "Active" },
    { name: "User Training", date: "25 Sep 2025", status: "Inactive" },
    { name: "Security", date: "17 Sep 2025", status: "Active" }
  ]);

  const statusClasses = (status) =>
    status === "Active"
      ? "bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-medium"
      : "bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-medium";

  return (
    <div className="p-6 bg-[#F8F9FA] min-h-screen">
      <h2 className="text-xl font-semibold mb-1">Blog Tags</h2>
      <p className="text-sm text-gray-500 mb-6">Home / Blogs / Blog Tags</p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              className="border rounded-lg pl-10 pr-3 py-2 text-sm w-60"
              placeholder="Search"
            />
          </div>

          <button className="flex items-center gap-2 text-sm border rounded-lg px-3 py-2 bg-white">
            <Calendar className="w-4 h-4" />
            1 Dec 25 - 1 Dec 25
          </button>
        </div>

        <button className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">
          + Add Blog Tag
        </button>
      </div>

      <div className="bg-white rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-100 text-gray-600 text-sm">
              <th className="p-3 text-left w-8">
                <input type="checkbox" />
              </th>
              <th className="p-3 text-left">Tag Name</th>
              <th className="p-3 text-left">Created Date</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {tags.map((item, i) => (
              <tr
                key={i}
                className="border-b hover:bg-gray-50 transition cursor-pointer"
              >
                <td className="p-3">
                  <input type="checkbox" />
                </td>
                <td className="p-3">{item.name}</td>
                <td className="p-3">{item.date}</td>
                <td className="p-3">
                  <span className={statusClasses(item.status)}>
                    {item.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <MoreVertical className="text-gray-600 cursor-pointer w-4 h-4" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-2 text-sm">
          Show
          <select className="border rounded px-2 py-1 text-sm">
            <option>10</option>
            <option>20</option>
          </select>
          entries
        </div>

        <div className="flex gap-2">
          <button className="border rounded px-3 py-1">‹</button>
          <button className="bg-red-500 text-white px-3 py-1 rounded">1</button>
          <button className="border rounded px-3 py-1">›</button>
        </div>
      </div>

      <footer className="mt-6 text-sm text-gray-500">
        Copyright © 2025 <span className="text-red-500">Preadmin</span>
      </footer>
    </div>
  );
};

export default BlogTagsPage;
