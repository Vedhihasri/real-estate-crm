import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard/");
        setData(response.data);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 bg-white border border-slate-200 rounded-2xl"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white border border-red-200 rounded-2xl p-6">
        <h2 className="font-semibold text-red-600">
          Unable to load dashboard
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Please check your backend connection and try again.
        </p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Leads",
      value: data.total_leads,
      description: "All leads",
      icon: "👥",
    },
    {
      title: "New Leads",
      value: data.new_leads,
      description: "Need attention",
      icon: "✨",
    },
    {
      title: "Site Visits",
      value: data.site_visits,
      description: "Scheduled / completed",
      icon: "📍",
    },
    {
      title: "Negotiations",
      value: data.negotiation_leads,
      description: "Active negotiations",
      icon: "🤝",
    },
    {
      title: "Booked Leads",
      value: data.booked_leads,
      description: "Successful conversions",
      icon: "✓",
    },
    {
      title: "Available Units",
      value: data.available_units,
      description: "Ready to sell",
      icon: "🏠",
    },
    {
      title: "Booked Units",
      value: data.booked_units,
      description: "Already booked",
      icon: "🔑",
    },
    {
      title: "Total Bookings",
      value: data.total_bookings,
      description: "All bookings",
      icon: "📄",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">
          Overview
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>

        <p className="text-slate-500 mt-2">
          Track leads, properties and bookings from one place.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>

                <p className="text-3xl font-bold text-slate-900 mt-3">
                  {card.value}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                {card.icon}
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-4">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Lead Pipeline */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-slate-900">
                Lead Pipeline
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Current lead distribution
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <PipelineRow
              label="New"
              value={data.new_leads}
              total={data.total_leads}
            />

            <PipelineRow
              label="Site Visits"
              value={data.site_visits}
              total={data.total_leads}
            />

            <PipelineRow
              label="Negotiation"
              value={data.negotiation_leads}
              total={data.total_leads}
            />

            <PipelineRow
              label="Booked"
              value={data.booked_leads}
              total={data.total_leads}
            />
          </div>
        </div>

        {/* Property Overview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-900">
            Property Overview
          </h2>

          <p className="text-sm text-slate-500 mt-1 mb-6">
            Current inventory status
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-5">
              <p className="text-sm text-slate-500">
                Projects
              </p>

              <p className="text-2xl font-bold text-slate-900 mt-2">
                {data.total_projects}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-5">
              <p className="text-sm text-slate-500">
                Total Units
              </p>

              <p className="text-2xl font-bold text-slate-900 mt-2">
                {data.total_units}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-5">
              <p className="text-sm text-slate-500">
                Available
              </p>

              <p className="text-2xl font-bold text-emerald-600 mt-2">
                {data.available_units}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-5">
              <p className="text-sm text-slate-500">
                Booked
              </p>

              <p className="text-2xl font-bold text-slate-900 mt-2">
                {data.booked_units}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Follow-ups */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-300">
            Upcoming follow-ups
          </p>

          <p className="text-3xl font-bold mt-1">
            {data.upcoming_followups}
          </p>

          <p className="text-sm text-slate-400 mt-1">
            Leads requiring follow-up
          </p>
        </div>

        <div className="text-4xl">
          📅
        </div>
      </div>

    </div>
  );
}

function PipelineRow({ label, value, total }) {
  const percentage =
    total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-600">{label}</span>

        <span className="font-medium text-slate-900">
          {value}
        </span>
      </div>

      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-slate-900 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}