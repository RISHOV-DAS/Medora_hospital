"use client";

import { useRef, useState } from "react";
import { MedicalRecord } from "@/context/AppContext";

interface RecordCardProps {
  record: MedicalRecord;
  onDelete?: () => Promise<void>;
}

const typeConfig: Record<string, { icon: React.ReactNode; gradient: string; bg: string }> = {
  "Lab Report": {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    gradient: "from-emerald-400 to-green-500",
    bg: "bg-emerald-50",
  },
  Imaging: {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
      </svg>
    ),
    gradient: "from-blue-400 to-indigo-500",
    bg: "bg-blue-50",
  },
  Prescription: {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    gradient: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
  },
};

export default function RecordCard({ record, onDelete }: RecordCardProps) {
  const config = typeConfig[record.type] || typeConfig["Lab Report"];
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const aiSummary = record.aiSummary;
  const hasAiContent = aiSummary && (
    (aiSummary.simple_summary && aiSummary.simple_summary.length > 0) || 
    (Array.isArray(aiSummary.complaints) && aiSummary.complaints.length > 0) ||
    (Array.isArray(aiSummary.medications) && aiSummary.medications.length > 0)
  );
  
  // If aiSummary exists but has no content, it's processing
  const isAiProcessing = aiSummary && !hasAiContent;

  return (
    <div className={`card-flat rounded-xl overflow-hidden transition-all duration-300 ${isExpanded ? 'bg-white shadow-lg ring-1 ring-primary/5' : 'hover:bg-white hover:shadow-md hover:border-transparent'}`}>
      <div className="p-3.5 flex items-center gap-3.5">
        {/* Icon */}
        <div className={`w-11 h-11 rounded-xl ${config.bg} flex items-center justify-center shrink-0 text-gray-600`}>
          {isDeleting ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
          ) : (
            config.icon
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-semibold text-gray-800 truncate">{record.fileName}</p>
            {hasAiContent ? (
              <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-tight">AI Summary</span>
            ) : isAiProcessing ? (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-[10px] font-bold text-amber-500 uppercase tracking-tight">
                <div className="w-1.5 h-1.5 border border-amber-300 border-t-amber-500 rounded-full animate-spin" />
                Processing
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-gray-400 font-medium">{record.type}</span>
            {record.fileSize && record.fileSize !== "N/A" && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-200" />
                <span className="text-[11px] text-gray-400">{record.fileSize}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:block text-[11px] text-gray-400 font-medium mr-2">
            {record.uploadedAt ? new Date(record.uploadedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
          </span>
          
          {hasAiContent && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 rounded-lg transition-all cursor-pointer ${isExpanded ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/5'}`}
              title={isExpanded ? "Hide Summary" : "View AI Summary"}
            >
              <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          )}

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer group/btn"
            title="Delete Record"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* AI Summary Content */}
      {isExpanded && record.aiSummary && (
        <div className="px-3.5 pb-4 pt-1 animate-slideDown">
          <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
            {record.aiSummary.simple_summary && (
              <div className="mb-4">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Simple Summary</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{record.aiSummary.simple_summary}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.isArray(record.aiSummary.complaints) && record.aiSummary.complaints.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Complaints</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {record.aiSummary.complaints.map((c: any, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-xs text-gray-600">
                        {typeof c === 'object' ? (c.text || c.name || c.complaint || JSON.stringify(c)) : c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(record.aiSummary.findings) && record.aiSummary.findings.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Key Findings</h4>
                  <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                    {record.aiSummary.findings.map((f: any, i) => (
                      <li key={i}>
                        {typeof f === 'object' ? (
                          <span>
                            <strong>{f.finding || f.name || f.test || ""}:</strong> {f.value || f.result || ""} {f.unit || ""} 
                            {!f.finding && !f.value && JSON.stringify(f)}
                          </span>
                        ) : f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(record.aiSummary.medications) && record.aiSummary.medications.length > 0 && (
                <div className="md:col-span-2">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Medications</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {record.aiSummary.medications.map((m: any, i) => (
                      <div key={i} className="bg-white p-2.5 rounded-lg border border-gray-100 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-gray-800">{m.name || "Unknown Medication"}</p>
                          <p className="text-[10px] text-gray-400">{m.dosage || m.dose || ""}</p>
                        </div>
                        <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">{m.frequency || m.timing || ""}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(record.aiSummary.allergies) && record.aiSummary.allergies.length > 0 && (
                <div className="md:col-span-2">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Allergies</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {record.aiSummary.allergies.map((a: any, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-red-50 border border-red-100 text-xs text-red-600 font-medium">
                        {typeof a === 'object' ? (a.allergen || a.name || JSON.stringify(a)) : a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
