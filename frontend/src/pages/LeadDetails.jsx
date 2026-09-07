import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../services/api";
import LeadModal from "../components/LeadModal";

const stageStyles = {
  New: "bg-slate-100 text-slate-700",
  Contacted: "bg-blue-100 text-blue-700",
  "Site Visit": "bg-purple-100 text-purple-700",
  Interested: "bg-yellow-100 text-yellow-700",
  Negotiation: "bg-orange-100 text-orange-700",
  Booked: "bg-green-100 text-green-700",
  Lost: "bg-red-100 text-red-700",
};

export default function LeadDetails() {
  const { id } = useParams();

  const [lead, setLead] = useState(null);
  const [notes, setNotes] = useState([]);

  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [noteLoading, setNoteLoading] = useState(false);

  const [error, setError] = useState("");

  const [showEdit, setShowEdit] = useState(false);

  const fetchLead = async () => {
    try {
      setLoading(true);
      setError("");

      const [leadResponse, notesResponse] = await Promise.all([
        api.get(`/leads/${id}`),
        api.get(`/leads/${id}/notes`),
      ]);

      setLead(leadResponse.data);
      setNotes(notesResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load lead"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [id]);

  const addNote = async (e) => {
    e.preventDefault();

    if (!note.trim()) return;

    try {
      setNoteLoading(true);
      setError("");

      await api.post(`/leads/${id}/notes`, {
        note: note.trim(),
      });

      setNote("");

      await fetchLead();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to add note"
      );
    } finally {
      setNoteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />

        <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error && !lead) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
        {error}
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-500">
        Lead not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>

          <Link
            to="/leads"
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            ← Back to Leads
          </Link>

          <h1 className="text-2xl font-bold text-slate-900 mt-2">
            {lead.name}
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Lead #{lead.id}
          </p>

        </div>

        <button
          onClick={() => setShowEdit(true)}
          className="px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
        >
          Edit Lead
        </button>

      </div>


      {/* Lead Information */}

      <div className="bg-white border border-slate-200 rounded-xl p-6">

        <div className="flex items-center justify-between mb-6">

          <h2 className="text-lg font-semibold text-slate-900">
            Lead Information
          </h2>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              stageStyles[lead.stage] ||
              "bg-slate-100 text-slate-700"
            }`}
          >
            {lead.stage}
          </span>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Name */}

          <div>

            <p className="text-xs text-slate-500 mb-1">
              Name
            </p>

            <p className="font-medium text-slate-900">
              {lead.name}
            </p>

          </div>


          {/* Email */}

          <div>

            <p className="text-xs text-slate-500 mb-1">
              Email
            </p>

            <p className="font-medium text-slate-900">
              {lead.email || "—"}
            </p>

          </div>


          {/* Phone */}

          <div>

            <p className="text-xs text-slate-500 mb-1">
              Phone
            </p>

            <p className="font-medium text-slate-900">
              {lead.phone}
            </p>

          </div>


          {/* Assigned Employee */}

          <div>

            <p className="text-xs text-slate-500 mb-1">
              Assigned Employee
            </p>

            <p className="font-medium text-slate-900">
              {lead.assigned_employee_name ||
                (lead.assigned_to
                  ? `Employee #${lead.assigned_to}`
                  : "Unassigned")}
            </p>

          </div>


          {/* Follow-up */}

          <div>

            <p className="text-xs text-slate-500 mb-1">
              Follow-up Date
            </p>

            <p className="font-medium text-slate-900">
              {lead.follow_up_date ||
                "No follow-up scheduled"}
            </p>

          </div>


          {/* Created */}

          <div>

            <p className="text-xs text-slate-500 mb-1">
              Created
            </p>

            <p className="font-medium text-slate-900">
              {lead.created_at
                ? new Date(
                    lead.created_at
                  ).toLocaleDateString("en-IN")
                : "—"}
            </p>

          </div>

        </div>

      </div>


      {/* Notes */}

      <div className="bg-white border border-slate-200 rounded-xl p-6">

        <h2 className="text-lg font-semibold text-slate-900 mb-5">
          Notes & Activity
        </h2>


        <form
          onSubmit={addNote}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >

          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900"
          />

          <button
            type="submit"
            disabled={noteLoading || !note.trim()}
            className="px-5 py-3 bg-slate-900 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {noteLoading ? "Adding..." : "Add Note"}
          </button>

        </form>


        {/* Error */}

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}


        {/* Notes */}

        {notes.length === 0 ? (

          <div className="text-center py-10 text-slate-500 text-sm">
            No notes yet.
          </div>

        ) : (

          <div className="space-y-4">

            {notes.map((item) => (

              <div
                key={item.id}
                className="border border-slate-200 rounded-lg p-4"
              >

                <p className="text-sm text-slate-700">
                  {item.note}
                </p>

                <p className="text-xs text-slate-400 mt-2">
                  {item.created_at
                    ? new Date(
                        item.created_at
                      ).toLocaleString("en-IN")
                    : ""}
                </p>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* Edit Lead Modal */}

      {showEdit && (

        <LeadModal
          lead={lead}
          onClose={() => setShowEdit(false)}
          onSuccess={() => {
            setShowEdit(false);
            fetchLead();
          }}
        />

      )}

    </div>
  );
}