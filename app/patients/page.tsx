"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Sidebar from "@/components/Sidebar";
import PatientCard from "@/components/PatientCard";

function PatientsContent() {
  const { searchPatients, addPatient, loading } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const searching = query !== debouncedQuery;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPhone, setNewPhone] = useState(initialQuery);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Loading state check
  if (loading) {
    return (
      <main className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-400">Fetching patients...</p>
      </main>
    );
  }

  const results = searchPatients(debouncedQuery);
  const allPatients = searchPatients("");
  const hasQuery = debouncedQuery.trim().length > 0;
  const displayList = hasQuery ? results : allPatients;
  const noResults = hasQuery && results.length === 0;

  const handleCreate = async () => {
    if (!/^\d{10}$/.test(newPhone)) return;
    setIsCreating(true);
    try {
      const patient = await addPatient("", newPhone);
      setShowCreateModal(false);
      setNewPhone("");
      router.push(`/patients/${patient.id}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-auto animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-extrabold text-secondary">Patients</h1>
              <span className="px-2.5 py-0.5 rounded-lg bg-primary/10 text-[11px] font-semibold text-primary">{allPatients.length} total</span>
            </div>
            <p className="text-sm text-secondary-light/60">Browse all patients or search by phone / name</p>
          </div>
          <button
            onClick={() => { setNewPhone(""); setShowCreateModal(true); }}
            className="btn-glow inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Patient
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-2xl mb-8">
          <div className="card-elevated rounded-2xl overflow-hidden">
            <div className="flex items-center">
              <div className="pl-5 flex items-center">
                {searching ? (
                  <svg className="w-5 h-5 text-teal-500 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                )}
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter by phone number or name..."
                autoFocus
                className="w-full px-4 py-4 bg-transparent text-gray-900 placeholder-gray-300 focus:outline-none text-sm font-medium"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="pr-4 flex items-center text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          {!searching && displayList.length > 0 && (
            <div className="animate-slideUp">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.1em] mb-4">
                {hasQuery
                  ? `${displayList.length} patient${displayList.length !== 1 ? "s" : ""} found`
                  : `All patients · ${displayList.length}`}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger-children">
                {displayList.map((patient) => (
                  <div key={patient.id} className="animate-slideUp">
                    <PatientCard patient={patient} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {noResults && !searching && (
            <div className="text-center py-16 animate-fadeInScale">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-50 flex items-center justify-center mb-5">
                <svg className="w-12 h-12 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                </svg>
              </div>
              <p className="text-base font-bold text-gray-600 mb-1">No patient found</p>
              <p className="text-sm text-gray-400 mb-6">Would you like to create a new patient record?</p>
              <button
                onClick={() => {
                  setNewPhone(debouncedQuery.replace(/\D/g, ""));
                  setShowCreateModal(true);
                }}
                className="btn-glow inline-flex items-center gap-2.5 px-7 py-3 text-sm font-bold text-white bg-primary rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create Patient
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Create Patient Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-md" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md animate-modalIn overflow-hidden">
            <div className="h-1 bg-primary-gradient" />
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              <div>
                <h2 className="text-lg font-bold text-gray-900">New Patient</h2>
                <p className="text-xs text-gray-400 mt-0.5">Register a new patient record</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                  className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!/^\d{10}$/.test(newPhone)}
                className="btn-glow px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-xl shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Create & View
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function PatientsPage() {
  return (
    <div className="flex min-h-screen gradient-mesh">
      <Sidebar />
      <Suspense fallback={
        <main className="flex-1 p-6 md:p-8 lg:p-10">
          <div className="skeleton h-8 w-40 mb-6" />
          <div className="skeleton h-14 w-full max-w-2xl mb-8" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 w-full rounded-2xl" />
            ))}
          </div>
        </main>
      }>
        <PatientsContent />
      </Suspense>
    </div>
  );
}
