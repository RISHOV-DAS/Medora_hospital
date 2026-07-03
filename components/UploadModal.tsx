"use client";

import { useState, useRef } from "react";
import { useApp } from "@/context/AppContext";
import hospitalService, { AiSummary } from "@/lib/hospitalService";

interface UploadModalProps {
  patientPhone: string;
  onClose: () => void;
}

export default function UploadModal({ patientPhone, onClose }: UploadModalProps) {
  const { addRecord } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState("Lab Report");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const fileSizeStr = selectedFile 
    ? selectedFile.size > 1048576
      ? `${(selectedFile.size / 1048576).toFixed(1)} MB`
      : `${(selectedFile.size / 1024).toFixed(0)} KB`
    : "";

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setProgress(30);

    try {
      await addRecord(patientPhone, selectedFile, date, type);
      setProgress(100);
      setTimeout(() => { onClose(); }, 600);
    } catch (err) {
      console.error("Upload failed", err);
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md animate-modalIn overflow-hidden">
        {/* Decorative top bar */}
        <div className="h-1 bg-primary-gradient" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Upload Record</h2>
            <p className="text-xs text-gray-400 mt-0.5">Add a medical document to patient file</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-5">
          {/* File picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">File</label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all group ${
                selectedFile
                  ? "border-primary/40 bg-primary/5"
                  : "border-gray-200 hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} />
              {selectedFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400">{fileSizeStr}</p>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                    <svg className="w-7 h-7 text-gray-300 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500">Click to select a file</p>
                  <p className="text-xs text-gray-300 mt-1">PDF, JPG, DICOM supported</p>
                </>
              )}
            </div>
          </div>

          {/* Type & Date grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
              >
                <option>Lab Report</option>
                <option>Imaging</option>
                <option>Prescription</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Progress */}
          {uploading && (
            <div className="space-y-2 animate-fadeIn">
              <div className="flex justify-between items-end text-xs">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-600">
                    Uploading...
                  </span>
                </div>
                <span className="font-bold text-primary">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="btn-glow px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        </div>
      </div>
    </div>
  );
}
