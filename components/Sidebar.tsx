"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    href: "/patients",
    label: "Patients",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    href: "/doctors",
    label: "Doctors",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  {
    href: "/appointments",
    label: "Appointments",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, auth } = useApp();

  return (
    <aside className="hidden md:flex flex-col w-[260px] bg-white/80 backdrop-blur-xl border-r border-secondary/8 min-h-screen">
      {/* Logo */}
      <div className="px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <Image
            src="/logo.png"
            alt="Medora Logo"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <div>
            <span className="text-[17px] font-extrabold text-secondary tracking-tight font-heading">Medora</span>
            <span className="block text-[9px] font-medium text-secondary-light/60 -mt-0.5 tracking-wider uppercase">Medical Report Summarizer</span>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-secondary/10 to-transparent" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="px-3 mb-2 text-[10px] font-semibold text-secondary-light/50 uppercase tracking-[0.08em]">Menu</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group relative ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-secondary-light hover:text-secondary hover:bg-neutral-dark"
              }`}
            >
              <span className={`transition-colors ${isActive ? "text-white/90" : "text-secondary-light/60 group-hover:text-secondary"}`}>
                {item.icon}
              </span>
              {item.label}
              {isActive && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-4 space-y-2">
        <div className="mx-2 h-px bg-gradient-to-r from-transparent via-secondary/10 to-transparent mb-2" />
        
        {/* User badge */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-neutral-dark">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
            {auth.hospital?.name?.[0] || "H"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-secondary truncate">
              {auth.hospital?.name || "Hospital Staff"}
            </p>
            <p className="text-[10px] text-secondary-light/50 truncate">
              {auth.hospital?.phone || auth.phone || "Active Session"}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-[13px] font-medium text-secondary-light/50 hover:text-red-500 hover:bg-red-50/80 transition-all cursor-pointer"
        >
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
