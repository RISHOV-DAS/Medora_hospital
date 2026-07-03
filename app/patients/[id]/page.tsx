"use client";

import { useState, useEffect, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import hospitalService, { MedicalRecord } from "@/lib/hospitalService";
import Sidebar from "@/components/Sidebar";
import RecordCard from "@/components/RecordCard";
import UploadModal from "@/components/UploadModal";

export default function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getPatient, showToast, addRecord, deleteRecord } = useApp();
  const router = useRouter();
  
  const [showUpload, setShowUpload] = useState(false);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  
  const patient = getPatient(id);

  // Lazy load records on mount or when patient changes
  useEffect(() => {
    let isMounted = true;
    
    async function fetchRecords() {
      if (!patient) return;
      
      setRecordsLoading(true);
      try {
        console.log(`[PROFILE] Lazy loading records for patient ${patient.name}`);
        const data = await hospitalService.getPatientRecords(patient.phone);
        if (isMounted) {
          setRecords(data);
        }
      } catch (err) {
        console.error("Failed to fetch records", err);
        if (isMounted) {
          showToast("error", "Failed to load medical records");
        }
      } finally {
        if (isMounted) {
          setRecordsLoading(false);
        }
      }
    }

    fetchRecords();
    
    return () => {
      isMounted = false;
    };
  }, [patient, showToast]);

  const groupedRecords = useMemo(() => {
    const groups: Record<string, typeof records> = {};
    records.forEach((r) => {
      if (!groups[r.date]) groups[r.date] = [];
      groups[r.date].push(r);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [records]);

  // Check if any record is currently processing
  const hasProcessingRecords = useMemo(() => {
    return records.some((record) => {
      const ai = record.aiSummary;
      if (!ai) return false;
      const hasContent = (ai.simple_summary && ai.simple_summary.length > 0) || 
                         (ai.complaints && ai.complaints.length > 0) ||
                         (ai.medications && ai.medications.length > 0);
      return !hasContent;
    });
  }, [records]);

  // Polling for updates if there are processing records
  useEffect(() => {
    if (!hasProcessingRecords || !patient) return;

    const intervalId = setInterval(async () => {
      try {
        console.log(`[PROFILE] Polling records for patient ${patient.name} for AI summary updates...`);
        const data = await hospitalService.getPatientRecords(patient.phone);
        setRecords(data);
      } catch (err) {
        console.error("Failed to poll records", err);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(intervalId);
  }, [hasProcessingRecords, patient]);

  if (!patient) {
    if (recordsLoading) {
      return (
        <div className="flex min-h-screen gradient-mesh">
          <Sidebar />
          <main className="flex-1 p-6 md:p-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm font-medium text-gray-400">Loading patient data...</p>
            </div>
          </main>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen gradient-mesh">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 flex items-center justify-center">
          <div className="text-center animate-fadeIn">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-red-50 flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-base font-bold text-gray-700 mb-1">Patient not found</p>
            <p className="text-sm text-gray-400 mb-4">The patient record may have been removed</p>
            <button
              onClick={() => router.push("/patients")}
              className="text-sm text-primary hover:text-primary-dark font-semibold cursor-pointer"
            >
              ← Back to search
            </button>
          </div>
        </main>
      </div>
    );
  }

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
    <div className="flex min-h-screen gradient-mesh">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-auto animate-fadeIn">
        {/* Back */}
        <button
          onClick={() => router.push("/patients")}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover:border-gray-200 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </div>
          <span className="font-medium">Back to patients</span>
        </button>

        {/* Patient Header Card */}
        <div className="card-elevated rounded-3xl overflow-hidden mb-8">
          <div className="px-6 pt-6 pb-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-5">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-primary/10 border border-gray-100 shrink-0">
                  {initials}
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-secondary tracking-tight leading-none">{patient.name}</h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5">
                    <span className="flex items-center gap-1.5 text-sm text-gray-500">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                      {patient.phone}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="flex items-center gap-1.5 text-sm text-gray-500">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      Registered {new Date(patient.createdAt).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowUpload(true)}
                className="btn-glow inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-primary rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Upload Record
              </button>
            </div>

            {/* Mini stats row */}
            <div className="flex items-center gap-6 mt-6 pt-5 border-t border-gray-100">
              <div>
                <p className="text-2xl font-extrabold text-secondary">{records.length}</p>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">Total Records</p>
              </div>
              <div className="w-px h-10 bg-gray-100" />
              <div>
                <p className="text-2xl font-extrabold text-secondary">{groupedRecords.length}</p>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">Visit Days</p>
              </div>
              <div className="w-px h-10 bg-gray-100" />
              <div>
                <p className="text-2xl font-extrabold text-secondary">
                  {records.length > 0 ? new Date(records[0].uploadedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "—"}
                </p>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">Last Upload</p>
              </div>
            </div>
          </div>
        </div>

        {/* Records */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.1em]">Medical Records</h2>
            <span className="px-2.5 py-0.5 rounded-lg bg-gray-100 text-[11px] font-semibold text-gray-500">
              {records.length} file{records.length !== 1 ? "s" : ""}
            </span>
          </div>

          {recordsLoading ? (
            <div className="card-elevated rounded-2xl p-12 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Loading records...</p>
              </div>
            </div>
          ) : records.length === 0 ? (
            <div className="card-elevated rounded-2xl text-center py-20">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gray-50 flex items-center justify-center mb-5">
                <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-500 mb-1">No records yet</p>
              <p className="text-xs text-gray-400 mb-5">Upload the first medical record for this patient</p>
              <button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark cursor-pointer"
              >
                Upload first record
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {groupedRecords.map(([date, dateRecords]) => (
                <div key={date} className="animate-slideUp">
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-3 flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                    </div>
                    {new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                  <div className="space-y-2">
                    {dateRecords.map((record) => (
                      <RecordCard 
                        key={record.id} 
                        record={record} 
                        onDelete={async () => {
                          if (!patient) return;
                          try {
                            await deleteRecord(record.id);
                            // Refresh records
                            const data = await hospitalService.getPatientRecords(patient.phone);
                            setRecords(data);
                          } catch (err) {
                            console.error("Deletion failed", err);
                            showToast("error", "Failed to delete record");
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showUpload && patient && (
        <UploadModal 
          patientPhone={patient.phone} 
          onClose={() => {
            setShowUpload(false);
            // Refresh records after upload
            hospitalService.getPatientRecords(patient.phone).then(setRecords);
          }} 
        />
      )}
    </div>
  );
}
