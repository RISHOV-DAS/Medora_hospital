"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import Sidebar from "@/components/Sidebar";

export default function AppointmentsPage() {
  const { appointments, updateAppointmentStatus, loading } = useApp();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Sort and group appointments
  const { pending, other } = useMemo(() => {
    // Sort all by appointment_date (closest first) and then time_slot
    const sorted = [...appointments].sort((a, b) => {
      const dateA = new Date(a.appointment_date).getTime();
      const dateB = new Date(b.appointment_date).getTime();
      if (dateA === dateB) {
        return a.time_slot.localeCompare(b.time_slot);
      }
      return dateA - dateB;
    });

    return {
      pending: sorted.filter((a) => a.status === "pending"),
      other: sorted.filter((a) => a.status !== "pending"),
    };
  }, [appointments]);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen gradient-mesh">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium text-gray-400">Loading appointments...</p>
        </main>
      </div>
    );
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdatingId(id);
    await updateAppointmentStatus(id, status);
    setUpdatingId(null);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Unknown Date";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">Accepted</span>;
      case "pending":
        return <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider">Pending</span>;
      case "rejected":
      case "cancelled":
        return <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider">{status}</span>;
      case "completed":
        return <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">Completed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const renderAppointmentCard = (appt: any) => (
    <div key={appt.id} className="card-elevated rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slideUp">
      {/* Info Section */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          {getStatusBadge(appt.status)}
          <span className="text-sm font-bold text-gray-500">
            {formatDate(appt.appointment_date)} at {appt.time_slot}
          </span>
        </div>
        
        <div className="flex items-center gap-4 mt-3">
          {/* Patient Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{appt.patient?.name || "Unknown Patient"}</p>
              <p className="text-xs text-gray-500">{appt.patient?.phone || "No phone"}</p>
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200 hidden md:block" />

          {/* Doctor Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {appt.doctor?.name?.startsWith('Dr.') ? appt.doctor.name : `Dr. ${appt.doctor?.name || "Unknown"}`}
              </p>
              <p className="text-xs text-gray-500">Requested Doctor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 shrink-0 md:border-l md:border-gray-100 md:pl-6">
        {appt.status === "pending" && (
          <>
            <button
              onClick={() => handleStatusUpdate(appt.id, "accepted")}
              disabled={updatingId === appt.id}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              Accept
            </button>
            <button
              onClick={() => handleStatusUpdate(appt.id, "rejected")}
              disabled={updatingId === appt.id}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              Reject
            </button>
          </>
        )}
        {appt.status === "accepted" && (
          <button
            onClick={() => handleStatusUpdate(appt.id, "completed")}
            disabled={updatingId === appt.id}
            className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            Mark Completed
          </button>
        )}
        {updatingId === appt.id && (
          <span className="flex items-center text-xs text-gray-400 font-medium">Updating...</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen gradient-mesh">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-auto animate-fadeIn">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-extrabold text-secondary">Appointments</h1>
            <span className="px-2.5 py-0.5 rounded-lg bg-primary/10 text-[11px] font-semibold text-primary">{appointments.length} total</span>
          </div>
          <p className="text-sm text-secondary-light/60">Manage patient booking requests</p>
        </div>

        {/* Pending Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.1em]">Pending Requests</h2>
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-[11px] font-semibold text-amber-700">
              {pending.length} action{pending.length !== 1 ? "s" : ""} needed
            </span>
          </div>

          <div className="space-y-4">
            {pending.length > 0 ? (
              pending.map(renderAppointmentCard)
            ) : (
              <div className="card-elevated rounded-2xl text-center py-10">
                <p className="text-sm font-semibold text-gray-500 mb-1">No pending requests</p>
                <p className="text-xs text-gray-400">All caught up!</p>
              </div>
            )}
          </div>
        </div>

        {/* Other Appointments Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.1em]">Appointment History</h2>
          </div>

          <div className="space-y-4">
            {other.length > 0 ? (
              other.map(renderAppointmentCard)
            ) : (
              <div className="card-elevated rounded-2xl text-center py-10">
                <p className="text-sm font-semibold text-gray-500 mb-1">No appointment history</p>
                <p className="text-xs text-gray-400">Accepted and completed appointments will appear here.</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
