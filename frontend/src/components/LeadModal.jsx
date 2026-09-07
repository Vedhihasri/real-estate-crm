import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const stages = [
  "New",
  "Contacted",
  "Site Visit",
  "Interested",
  "Negotiation",
  "Booked",
  "Lost",
];

export default function LeadModal({ lead, onClose, onSuccess }) {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: lead?.name || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    stage: lead?.stage || "New",
    assigned_to: lead?.assigned_to || "",
    follow_up_date: lead?.follow_up_date || "",
  });

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [error, setError] = useState("");

  // Admin gets employee list
  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchEmployees();
    } else if (!lead) {
      // Sales employee automatically assigned to themselves
      setForm((prev) => ({
        ...prev,
        assigned_to: user?.sub || "",
      }));
    }
  }, [user, lead]);

  const fetchEmployees = async () => {
    try {
      setEmployeesLoading(true);

      const response = await api.get("/auth/employees");

      setEmployees(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load employees"
      );
    } finally {
      setEmployeesLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        email: form.email || null,
        phone: form.phone,
        stage: form.stage,
        assigned_to: form.assigned_to
          ? Number(form.assigned_to)
          : null,
        follow_up_date: form.follow_up_date || null,
      };

      if (lead) {
        await api.put(`/leads/${lead.id}`, payload);
      } else {
        await api.post("/leads/", payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to save lead"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl">

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {lead ? "Edit Lead" : "Add New Lead"}
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              {lead
                ? "Update lead information"
                : "Create a new sales lead"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Customer name"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="customer@email.com"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone
            </label>

            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="9876543210"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Stage */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Stage
            </label>

            <select
              name="stage"
              value={form.stage}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none"
            >
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>

          {/* Assignment */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Assigned Employee
            </label>

            {user?.role === "ADMIN" ? (
              <select
                name="assigned_to"
                value={form.assigned_to}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none"
              >
                <option value="">
                  {employeesLoading
                    ? "Loading employees..."
                    : "Unassigned"}
                </option>

                {employees.map((employee) => (
                  <option
                    key={employee.id}
                    value={employee.id}
                  >
                    {employee.name} — {employee.email}
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
                Automatically assigned to you
              </div>
            )}
          </div>

          {/* Follow-up */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Follow-up Date
            </label>

            <input
              type="date"
              name="follow_up_date"
              value={form.follow_up_date}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : lead
                ? "Update Lead"
                : "Create Lead"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}