"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function DashboardPage() {
  const { patients, doctors, auth, loading, addPatient } = useApp();
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Branding
  const hospitalName = auth.hospital?.name || "Medora Hospital";

  // Chart Data: Patient Growth (Last 7 Days)
  const patientGrowthData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });

    return last7Days.map((date) => {
      const count = patients.filter((p) => p.createdAt?.startsWith(date)).length;
      return {
        date: new Date(date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        patients: count,
      };
    });
  }, [patients]);

  // Chart Data: Hospital Composition
  const compositionData = useMemo(() => [
    { name: "Patients", value: patients.length, color: "#2E5BFF" },
    { name: "Doctors", value: doctors.length, color: "#8B5CF6" },
  ], [patients.length, doctors.length]);

  // Stats calculation
  const todayStr = new Date().toISOString().split("T")[0];
  const patientsToday = useMemo(() => 
    patients.filter((p) => p.createdAt?.startsWith(todayStr)).length,
  [patients, todayStr]);

  // Recent activity feed — focus on patients since records are lazy loaded
  const recentActivity = useMemo(() => {
    return patients
      .slice(0, 10)
      .map((p) => ({
        id: `pa-${p.id}`,
        type: "patient",
        title: `${p.name} registered`,
        subtitle: p.phone,
        time: p.createdAt,
        icon: "patient",
      }))
      .sort((a, b) => b.time.localeCompare(a.time));
  }, [patients]);

  const handleSearch = (query: string) => {
    if (query.trim().length >= 2) {
      router.push(`/patients?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleAddPatient = async () => {
    if (!/^\d{10}$/.test(newPhone)) return;
    setIsAdding(true);
    try {
      const patient = await addPatient("", newPhone);
      setShowAddModal(false);
      setNewPhone("");
      router.push(`/patients/${patient.id}`);
    } finally {
      setIsAdding(false);
    }
  }

  const stats = useMemo(() => [
    {
      label: "Total Patients",
      value: patients.length,
      change: `+${patientsToday} today`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a5.971 5.971 0 00-.941 3.197m0 0l.002.031c0 .225.012.447.037.666A11.944 11.944 0 0112 21c2.17 0 4.207-.576-5.963-1.584A6.062 6.062 0 0118 18.722zm-12 0V18.75a9.094 9.094 0 013.741.479 3 3 0 01-4.682 2.72m.94-3.198l.002.031c0 .225.012.447.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.722z" />
        </svg>
      ),
      bgIcon: "bg-primary/10", textIcon: "text-primary",
    },
    {
      label: "Doctors",
      value: doctors.length,
      change: "Active",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
        </svg>
      ),
      bgIcon: "bg-violet-100", textIcon: "text-violet-600",
    },
    {
      label: "Patients Today",
      value: patientsToday,
      change: todayStr,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      bgIcon: "bg-teal-100", textIcon: "text-teal-600",
    },
  ], [patients.length, doctors.length, patientsToday, todayStr]);

  const quickActions = [
    {
      title: "Add Patient", desc: "Register a new patient",
      onClick: () => setShowAddModal(true),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
        </svg>
      ),
      bg: "bg-primary/10 hover:bg-primary/15", iconColor: "text-primary",
    },
    {
      title: "Add Doctor", desc: "Expand the team",
      onClick: () => router.push("/doctors"),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
        </svg>
      ),
      bg: "bg-violet-100 hover:bg-violet-200", iconColor: "text-violet-600",
    },
    {
      title: "Search Patients", desc: "Find records fast",
      onClick: () => router.push("/patients"),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      ),
      bg: "bg-teal-100 hover:bg-teal-200", iconColor: "text-teal-600",
    },
  ];

  function timeAgo(dateStr: string) {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "recently";
      const diff = Date.now() - date.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return `${Math.max(mins, 0)}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    } catch {
      return "recently";
    }
  }

  // Loading state (moved after all hook calls)
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-400">Loading hospital dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen gradient-mesh">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-auto animate-fadeIn">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-extrabold text-secondary tracking-tight">{hospitalName}</h1>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Online</span>
          </div>
          <p className="text-sm text-secondary-light/60 font-medium">Healthcare Administration Dashboard</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <SearchBar placeholder="Quick search patients by phone or name..." onSearch={handleSearch} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="card-elevated rounded-2xl p-6 relative overflow-hidden group">
              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${stat.bgIcon} flex items-center justify-center ${stat.textIcon} shadow-sm group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">{stat.change}</span>
              </div>
              <div className="relative z-10">
                <p className="text-3xl font-black text-secondary tracking-tight">{stat.value}</p>
                <p className="text-[11px] text-gray-400 mt-1 font-bold uppercase tracking-widest leading-none">{stat.label}</p>
              </div>
              {/* Subtle background decoration */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-gray-50 opacity-50 group-hover:scale-150 transition-transform duration-700" />
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action) => (
            <button
              key={action.title}
              onClick={action.onClick}
              className={`flex items-center gap-4 p-4 rounded-2xl ${action.bg} border border-transparent hover:border-current/10 transition-all text-left group cursor-pointer`}
            >
              <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center ${action.iconColor} shadow-sm group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-secondary">{action.title}</p>
                <p className="text-[11px] text-secondary-light/60">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Visual Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Patient Growth Area Chart */}
          <div className="lg:col-span-2 card-elevated rounded-3xl p-6 h-[380px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-bold text-secondary uppercase tracking-wider">Patient Registrations</h2>
                <p className="text-[11px] text-gray-400 font-medium">Daily trends over the last 7 days</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/5 text-primary">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.5 4.5L21.75 7.5" />
                </svg>
                <span className="text-[11px] font-bold">Growth</span>
              </div>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={patientGrowthData}>
                  <defs>
                    <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2E5BFF" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2E5BFF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                    cursor={{ stroke: '#2E5BFF', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="patients" 
                    stroke="#2E5BFF" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorPatients)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hospital Composition Pie Chart */}
          <div className="card-elevated rounded-3xl p-6 h-[380px] flex flex-col">
            <div className="mb-6">
              <h2 className="text-sm font-bold text-secondary uppercase tracking-wider">Hospital Composition</h2>
              <p className="text-[11px] text-gray-400 font-medium">Distribution of staff and patients</p>
            </div>
            <div className="flex-1 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={compositionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={8}
                    dataKey="value"
                    animationDuration={1500}
                    animationBegin={200}
                  >
                    {compositionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-6 flex justify-center gap-6">
                {compositionData.map((item) => (
                  <div key={item.name} className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.name}</span>
                    </div>
                    <p className="text-xl font-black text-secondary">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="max-w-3xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.1em]">Recent Activity</h2>
            <button onClick={() => router.push("/patients")} className="text-[11px] font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer">
              View all patients →
            </button>
          </div>
          <div className="card-elevated rounded-2xl overflow-hidden divide-y divide-gray-50">
            {recentActivity.length > 0 ? (
              recentActivity.map((item) => (
                <button
                  key={item.id}
                  onClick={() => router.push(`/patients/${item.id.replace("pa-", "")}`)}
                  className="flex items-center gap-3.5 w-full p-4 text-left hover:bg-gray-50/60 transition-colors cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-700 truncate group-hover:text-primary transition-colors">{item.title}</p>
                    <p className="text-[11px] text-gray-400 truncate">{item.subtitle}</p>
                  </div>
                  <span className="text-[10px] text-gray-300 font-medium shrink-0 whitespace-nowrap">{timeAgo(item.time)}</span>
                  <svg className="w-3.5 h-3.5 text-secondary/20 group-hover:text-primary transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-400">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md animate-modalIn overflow-hidden">
            <div className="h-1 bg-primary-gradient" />
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              <div>
                <h2 className="text-lg font-bold text-gray-900">New Patient</h2>
                <p className="text-xs text-gray-400 mt-0.5">Register a patient into the system</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-secondary-light/70 uppercase tracking-wider mb-2">Phone Number</label>
                <input type="tel" maxLength={10} value={newPhone} onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ""))} autoFocus className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all font-medium" />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">Cancel</button>
              <button onClick={handleAddPatient} disabled={!/^\d{10}$/.test(newPhone)} className="btn-glow px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-xl shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all">Create Patient</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
