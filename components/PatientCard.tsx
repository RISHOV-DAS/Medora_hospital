import Link from "next/link";
import { Patient, useApp } from "@/context/AppContext";

interface PatientCardProps {
  patient: Patient;
}

export default function PatientCard({ patient }: PatientCardProps) {
  const { removePatient } = useApp();
  
  const initials = patient.name
    ? patient.name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <div className="group relative">
      <Link href={`/patients/${patient.id}`} className="block">
        <div className="card-elevated rounded-2xl p-4 cursor-pointer">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20 group-hover:shadow-primary/35 transition-shadow">
                {initials}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full border-2 border-white" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-secondary truncate group-hover:text-primary transition-colors">
                {patient.name}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  {patient.phone}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">
                  {new Date(patient.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                </span>
              </div>
            </div>

            {/* Arrow */}
            <div className="w-8 h-8 rounded-xl bg-neutral-dark group-hover:bg-primary/10 flex items-center justify-center transition-colors shrink-0">
              <svg className="w-4 h-4 text-secondary/25 group-hover:text-primary group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Absolute Delete Button — outside the Link area but positioned relative to group */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (window.confirm(`Are you sure you want to unlink ${patient.name}?`)) {
            removePatient(patient.id, patient.name);
          }
        }}
        className="absolute right-12 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10"
        title="Unlink Patient"
      >
        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </button>
    </div>
  );
}
