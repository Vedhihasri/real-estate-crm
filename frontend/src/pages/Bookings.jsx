import { useEffect, useState } from "react";
import api from "../services/api";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [leads, setLeads] = useState([]);
  const [units, setUnits] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const [leadId, setLeadId] = useState("");
  const [unitId, setUnitId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [bookingsRes, leadsRes, unitsRes] = await Promise.all([
        api.get("/bookings/"),
        api.get("/leads/"),
        api.get("/properties/units?status_filter=AVAILABLE"),
      ]);

      // IMPORTANT: Store bookings in state
      setBookings(bookingsRes.data);

      setLeads(
        leadsRes.data.filter(
          (lead) => lead.stage !== "Lost" && lead.stage !== "Booked"
        )
      );

      setUnits(unitsRes.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createBooking = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await api.post("/bookings/", {
        lead_id: Number(leadId),
        unit_id: Number(unitId),
      });

      setSuccess("Booking created successfully.");

      setLeadId("");
      setUnitId("");
      setShowModal(false);

      // Refresh bookings, leads and available units
      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to create booking"
      );
    } finally {
      setSaving(false);
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

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Bookings
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage property bookings
          </p>
        </div>

        <button
          onClick={() => {
            setError("");
            setSuccess("");
            setShowModal(true);
          }}
          className="px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
        >
          + New Booking
        </button>

      </div>


      {/* Messages */}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}


      {/* Booking Table */}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">
            All Bookings
          </h2>
        </div>


        {bookings.length === 0 ? (

          <div className="py-16 text-center">

            <p className="text-slate-500 text-sm">
              No bookings yet.
            </p>

            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-sm font-medium text-slate-900"
            >
              Create your first booking →
            </button>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-slate-50 border-b border-slate-200">

                <tr>

                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">
                    Booking
                  </th>

                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">
                    Customer
                  </th>

                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">
                    Unit
                  </th>

                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">
                    Price
                  </th>

                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">
                    Booked By
                  </th>

                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">
                    Date
                  </th>

                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">
                    Status
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {bookings.map((booking) => (

                  <tr
                    key={booking.id}
                    className="hover:bg-slate-50"
                  >

                    {/* Booking */}

                    <td className="px-6 py-4 font-medium text-slate-900">
                      #{booking.id}
                    </td>


                    {/* Customer */}

                    <td className="px-6 py-4">

                      <div className="font-medium text-slate-900">
                        {booking.lead_name}
                      </div>

                      <div className="text-xs text-slate-500 mt-0.5">
                        {booking.lead_phone}
                      </div>

                    </td>


                    {/* Unit */}

                    <td className="px-6 py-4">

                      <div className="font-medium text-slate-900">
                        {booking.unit_number}
                      </div>

                      <div className="text-xs text-slate-500 mt-0.5">
                        {booking.unit_type}
                      </div>

                    </td>


                    {/* Price */}

                    <td className="px-6 py-4 font-medium text-slate-900">
                      ₹
                      {Number(
                        booking.unit_price
                      ).toLocaleString("en-IN")}
                    </td>


                    {/* Booked By */}

                    <td className="px-6 py-4 text-slate-600">
                      {booking.booked_by_name}
                    </td>


                    {/* Date */}

                    <td className="px-6 py-4 text-slate-600">

                      {booking.booking_date
                        ? new Date(
                            booking.booking_date
                          ).toLocaleDateString("en-IN")
                        : "—"}

                    </td>


                    {/* Status */}

                    <td className="px-6 py-4">

                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        CONFIRMED
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* New Booking Modal */}

      {showModal && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="w-full max-w-md bg-white rounded-xl shadow-xl">

            {/* Modal Header */}

            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">

              <div>

                <h2 className="font-semibold text-slate-900">
                  New Booking
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Connect a lead with an available unit
                </p>

              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-xl text-slate-400 hover:text-slate-900"
              >
                ×
              </button>

            </div>


            {/* Form */}

            <form
              onSubmit={createBooking}
              className="p-6 space-y-5"
            >

              {/* Lead */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Lead
                </label>

                <select
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900"
                >

                  <option value="">
                    Select a lead
                  </option>

                  {leads.map((lead) => (

                    <option
                      key={lead.id}
                      value={lead.id}
                    >
                      {lead.name} — {lead.phone}
                    </option>

                  ))}

                </select>

                {leads.length === 0 && (

                  <p className="text-xs text-red-500 mt-2">
                    No eligible leads available.
                  </p>

                )}

              </div>


              {/* Unit */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Available Unit
                </label>

                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900"
                >

                  <option value="">
                    Select a unit
                  </option>

                  {units.map((unit) => (

                    <option
                      key={unit.id}
                      value={unit.id}
                    >
                      Unit {unit.unit_number} — {unit.type} — ₹
                      {Number(
                        unit.price
                      ).toLocaleString("en-IN")}
                    </option>

                  ))}

                </select>

                {units.length === 0 && (

                  <p className="text-xs text-red-500 mt-2">
                    No available units.
                  </p>

                )}

              </div>


              {/* Booking Information */}

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600">

                Once confirmed, this unit will automatically be marked
                as <strong>BOOKED</strong> and the lead stage will become
                <strong> Booked</strong>.

              </div>


              {/* Submit */}

              <button
                type="submit"
                disabled={
                  saving ||
                  !leadId ||
                  !unitId
                }
                className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-medium disabled:opacity-50"
              >

                {saving
                  ? "Creating Booking..."
                  : "Confirm Booking"}

              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}