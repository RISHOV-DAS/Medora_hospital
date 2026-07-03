"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import Sidebar from "@/components/Sidebar";
import DoctorCard from "@/components/DoctorCard";

export default function DoctorsPage() {
  const { doctors, addDoctor, loading } = useApp();
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [phone, setPhone] = useState("");
  const [adding, setAdding] = useState(false);
  const [doctorQuery, setDoctorQuery] = useState("");

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen gradient-mesh">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium text-gray-400">Loading team members...</p>
        </main>
      </div>
    );
  }

  const filteredDoctors = doctors.filter((d) => {
    if (!doctorQuery.trim()) return true;
    const q = doctorQuery.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.phone.includes(q);
  });

  const canSubmit = name.trim() && /^\d{10}$/.test(phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || adding) return;
    setAdding(true);
    try {
      await addDoctor(`Dr. ${name.trim()}`, specialization.trim() || "", phone);
      setName("");
      setSpecialization("");
      setPhone("");
    } catch (err) {
      console.error("Failed to add doctor", err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="flex min-h-screen gradient-mesh">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-auto animate-fadeIn">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-extrabold text-secondary">Doctors</h1>
            <span className="px-2.5 py-0.5 rounded-lg bg-tertiary/10 text-[11px] font-semibold text-tertiary">{doctors.length} members</span>
          </div>
          <p className="text-sm text-secondary-light/60">Manage your hospital&apos;s medical team</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Add Doctor Form */}
          <div className="lg:col-span-2">
            <div className="card-elevated rounded-3xl overflow-hidden sticky top-6">
              {/* Gradient header */}
              <div className="h-20 bg-secondary-gradient relative flex items-end px-6 pb-4">
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: `radial-gradient(circle at 30% 50%, white 1px, transparent 1px)`,
                  backgroundSize: "20px 20px"
                }} />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Add Doctor</h2>
                    <p className="text-[11px] text-white/60">New team member</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 text-sm font-semibold select-none">
                      Dr.
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className="w-full pl-11 pr-3 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Specialization</label>
                  <input
                    type="text"
                    list="specializations"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Cardiologist (optional)"
                    className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                  />
                  <datalist id="specializations">
                    <option value="General Physician" />
                    <option value="Cardiologist" />
                    <option value="Dermatologist" />
                    <option value="Neurologist" />
                    <option value="Orthopedist" />
                    <option value="Pediatrician" />
                    <option value="Psychiatrist" />
                    <option value="Surgeon" />
                    <option value="Dentist" />
                    <option value="Gynecologist" />
                    <option value="Ophthalmologist" />
                    <option value="ENT Specialist" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="10-digit number"
                    className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit || adding}
                  className="btn-glow w-full py-3 px-4 text-sm font-bold text-white bg-secondary rounded-2xl shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {adding ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Add Doctor
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Doctor List */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.1em]">Team Members</h2>
              <span className="px-2.5 py-0.5 rounded-lg bg-gray-100 text-[11px] font-semibold text-gray-500">
                {filteredDoctors.length} of {doctors.length} doctor{doctors.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Doctor search bar */}
            <div className="card-elevated rounded-2xl overflow-hidden mb-5">
              <div className="flex items-center">
                <div className="pl-4 flex items-center">
                  <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={doctorQuery}
                  onChange={(e) => setDoctorQuery(e.target.value)}
                  placeholder="Filter doctors by name or phone..."
                  className="w-full px-3 py-3.5 bg-transparent text-gray-900 placeholder-gray-300 focus:outline-none text-sm font-medium"
                />
                {doctorQuery && (
                  <button
                    onClick={() => setDoctorQuery("")}
                    className="pr-3 flex items-center text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
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

            <div className="space-y-3 stagger-children">
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="animate-slideUp">
                  <DoctorCard doctor={doctor} />
                </div>
              ))}
            </div>

            {filteredDoctors.length === 0 && doctorQuery && (
              <div className="card-elevated rounded-2xl text-center py-14">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100/60 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-500 mb-1">No matching doctors</p>
                <p className="text-xs text-gray-400">Try a different name or specialization</p>
              </div>
            )}

            {doctors.length === 0 && (
              <div className="card-elevated rounded-2xl text-center py-20">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-violet-50 flex items-center justify-center mb-5">
                  <svg className="w-10 h-10 text-violet-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-500 mb-1">No doctors yet</p>
                <p className="text-xs text-gray-400">Use the form to add your first team member</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
