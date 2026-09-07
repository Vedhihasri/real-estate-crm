import { useEffect, useState } from "react";
import api from "../services/api";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/auth/employees");
      setEmployees(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load employees"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Employees
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage sales team members
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {employees.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">
            No sales employees found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">
                    Employee
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">
                    Email
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">
                    Role
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">
                    Employee ID
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
                          {employee.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <span className="font-medium text-slate-900">
                          {employee.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {employee.email}
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {employee.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      #{employee.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}