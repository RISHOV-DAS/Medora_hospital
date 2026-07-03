"use client";

import { Doctor, useApp } from "@/context/AppContext";

interface DoctorCardProps {
  doctor: Doctor;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const { removeDoctor } = useApp();

  return (
    <div className="card-elevated rounded-2xl p-5 group">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-2xl bg-secondary-gradient flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-secondary/10 shrink-0">
          {doctor.name.replace("Dr. ", "").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-800 truncate group-hover:text-primary transition-colors">{doctor.name}</h3>
          <p className="text-[11px] text-primary font-bold tracking-tight mt-0.5">{doctor.specialization || "General Physician"}</p>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Team Member
          </p>
        </div>

        {/* Action (Phone + Delete) */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            <span className="text-xs text-gray-500 font-medium">{doctor.phone}</span>
          </div>
          
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to remove ${doctor.name}?`)) {
                removeDoctor(doctor.id, doctor.name);
              }
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 hover:shadow-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
            title="Remove Doctor"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
