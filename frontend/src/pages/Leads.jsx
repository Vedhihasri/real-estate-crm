import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import LeadModal from "../components/LeadModal";
const stages = [
  "New",
  "Contacted",
  "Site Visit",
  "Interested",
  "Negotiation",
  "Booked",
  "Lost",
];

const stageStyles = {
  New: "bg-slate-100 text-slate-700",
  Contacted: "bg-blue-50 text-blue-700",
  "Site Visit": "bg-purple-50 text-purple-700",
  Interested: "bg-cyan-50 text-cyan-700",
  Negotiation: "bg-amber-50 text-amber-700",
  Booked: "bg-emerald-50 text-emerald-700",
  Lost: "bg-red-50 text-red-700",
};

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) params.search = search.trim();
      if (stage) params.stage = stage;

      const response = await api.get("/leads/", { params });

      setLeads(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Failed to load leads."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [stage]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLeads();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 font-medium">
            Sales Management
          </p>

          <h1 className="text-3xl font-bold text-slate-900 mt-1">
            Leads
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Manage prospects, follow-ups and sales progress.
          </p>
        </div>

<button
  onClick={() => {
    setSelectedLead(null);
    setShowModal(true);
  }}
  className="bg-slate-900 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-slate-800 transition"
>
  + Add Lead
</button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-3"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="">All stages</option>

            {stages.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200"
          >
            Search
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

        <div className="px-6 py-4 border-b border-slate-200 flex justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              All Leads
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              {leads.length} lead{leads.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-12 bg-slate-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">👥</div>

            <h3 className="font-semibold text-slate-900">
              No leads found
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-slate-500">
                    Lead
                  </th>

                  <th className="text-left px-6 py-3 font-medium text-slate-500">
                    Phone
                  </th>

                  <th className="text-left px-6 py-3 font-medium text-slate-500">
                    Stage
                  </th>

                  <th className="text-left px-6 py-3 font-medium text-slate-500">
                    Follow-up
                  </th>

                  <th className="text-right px-6 py-3 font-medium text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {lead.name}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {lead.email || "No email"}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {lead.phone}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          stageStyles[lead.stage] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {lead.stage}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {lead.follow_up_date || "—"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/leads/${lead.id}`}
                        className="text-sm font-medium text-slate-900 hover:underline"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>
      {showModal && (
  <LeadModal
    lead={selectedLead}
    onClose={() => setShowModal(false)}
    onSuccess={fetchLeads}
  />
)}
    </div>
  );
}