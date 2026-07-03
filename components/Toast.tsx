"use client";

import { useApp } from "@/context/AppContext";

const iconMap = {
  success: (
    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  ),
  error: (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-sm shadow-red-200">
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  ),
  info: (
    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shadow-sm shadow-secondary/20">
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    </div>
  ),
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-[380px] w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3.5 pl-4 pr-3 py-3.5 rounded-2xl bg-white shadow-xl shadow-gray-900/10 border border-gray-100 animate-slideIn"
        >
          <span className="shrink-0">{iconMap[toast.type]}</span>
          <p className="text-[13px] font-medium text-gray-700 flex-1 leading-snug">{toast.message}</p>
          <button
            onClick={() => dismissToast(toast.id)}
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
