"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import hospitalService, { Patient, MedicalRecord, Doctor } from "@/lib/hospitalService";
import { authStorage, HospitalInfo } from "@/lib/auth";

// --- Types ---
export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface AppState {
  auth: { isLoggedIn: boolean; phone: string; hospital: HospitalInfo | null };
  patients: Patient[];
  doctors: Doctor[];
  appointments: any[];
  toasts: ToastMessage[];
  loading: boolean;
  setAuthData: (data: { isLoggedIn: boolean; phone: string; hospital: HospitalInfo | null }) => void;
  logout: () => void;
  refreshData: () => Promise<void>;
  addPatient: (name: string, phone: string) => Promise<Patient>;
  searchPatients: (query: string) => Patient[];
  getPatient: (id: string) => Patient | undefined;
  addRecord: (patientPhone: string, file: File, date: string, type: string, aiSummary?: any) => Promise<any>;
  addDoctor: (name: string, specialization: string, phone: string) => Promise<void>;
  updateAppointmentStatus: (id: string, status: string) => Promise<void>;
  removeDoctor: (id: string, name: string) => Promise<void>;
  removePatient: (id: string, name: string) => Promise<void>;
  deleteRecord: (recordId: string) => Promise<void>;
  showToast: (type: "success" | "error" | "info", message: string) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<{ isLoggedIn: boolean; phone: string; hospital: HospitalInfo | null }>({
    isLoggedIn: false,
    phone: "",
    hospital: null
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Loop detection
  const fetchCount = useRef(0);
  const lastFetchTime = useRef(Date.now());

  const showToast = useCallback((type: "success" | "error" | "info", message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /**
   * lightweight data refresh (patients and doctors only)
   */
  const refreshData = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token) {
      console.log("[CONTEXT] No token found, skipping refresh.");
      setLoading(false);
      return;
    }

    // Loop detection: if more than 5 fetches in 2 seconds, warn/stop
    const now = Date.now();
    if (now - lastFetchTime.current < 2000) {
      fetchCount.current++;
    } else {
      fetchCount.current = 1;
    }
    lastFetchTime.current = now;

    if (fetchCount.current > 7) { 
      console.warn("[SECURITY] Possible infinite re-render detected in refreshData. Aborting fetch.");
      return;
    }

    setLoading(true);
    try {
      console.log("[CONTEXT] Refreshing hospital data...");
      const [patientsData, doctorsData, appointmentsData] = await Promise.all([
        hospitalService.getPatients(),
        hospitalService.getDoctors(),
        hospitalService.getHospitalAppointments()
      ]);
      
      console.log(`[CONTEXT] Refresh complete. Found ${patientsData.length} patients, ${doctorsData.length} doctors, ${appointmentsData.length} appointments.`);
      setPatients(patientsData);
      setDoctors(doctorsData);
      setAppointments(appointmentsData);
    } catch (err) {
      console.error("Failed to refresh hospital data", err);
      showToast("error", "Failed to sync data with server");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Handle Authentication transitions
  useEffect(() => {
    const hospital = authStorage.getHospital();
    const token = authStorage.getToken();
    
    // 1. Handle initial mount (hydration from storage)
    if (hospital && token && !auth.isLoggedIn) {
      console.log("[CONTEXT] Hydrating auth from storage...");
      setAuth({ isLoggedIn: true, phone: hospital.phone, hospital });
      // The refreshData will be triggered by the watch-useEffect below
    } else if (!token) {
      setLoading(false);
    }
  }, [auth.isLoggedIn]);

  // 2. Watch for login transition to trigger fetch
  useEffect(() => {
    if (auth.isLoggedIn) {
      refreshData();
    }
  }, [auth.isLoggedIn, refreshData]);

  const logout = useCallback(() => {
    authStorage.clear();
    setAuth({ isLoggedIn: false, phone: "", hospital: null });
    setPatients([]);
    setDoctors([]);
    setAppointments([]);
    window.location.href = "/";
  }, []);

  const addPatient = useCallback(async (name: string, phone: string): Promise<Patient> => {
    const newPatient = await hospitalService.addPatient(name, phone);
    setPatients(prev => [newPatient, ...prev]);
    showToast("success", `Patient added successfully`);
    return newPatient;
  }, [showToast]);

  const searchPatients = useCallback((query: string): Patient[] => {
    if (!query.trim()) return patients;
    const q = query.toLowerCase();
    return patients.filter(
      (p) => p.phone.includes(q) || p.name.toLowerCase().includes(q)
    );
  }, [patients]);

  const getPatient = useCallback((id: string): Patient | undefined => {
    return patients.find((p) => p.id === id);
  }, [patients]);

  const addRecord = useCallback(async (patientPhone: string, file: File, date: string, type: string, aiSummary?: any): Promise<any> => {
    const res = await hospitalService.addRecord(patientPhone, file, date, type, aiSummary);
    showToast("success", "Record uploaded successfully");
    return res;
  }, [showToast]);

  const addDoctor = useCallback(async (name: string, specialization: string, phone: string) => {
    await hospitalService.addDoctor(name, specialization, phone);
    // After adding, we trigger a refresh to ensure consistency with backend
    await refreshData();
    showToast("success", `${name} added to the team`);
  }, [refreshData, showToast]);

  const updateAppointmentStatus = useCallback(async (id: string, status: string) => {
    try {
      await hospitalService.updateAppointmentStatus(id, status);
      await refreshData();
      showToast("success", `Appointment marked as ${status}`);
    } catch (err) {
      console.error("Failed to update appointment status", err);
      showToast("error", `Failed to update status`);
    }
  }, [refreshData, showToast]);

  const removeDoctor = useCallback(async (id: string, name: string) => {
    try {
      await hospitalService.removeDoctor(id);
      setDoctors((prev) => prev.filter((d) => d.id !== id));
      showToast("success", `${name} removed from the team`);
    } catch (err) {
      console.error("Failed to remove doctor", err);
      showToast("error", `Failed to remove ${name}`);
    }
  }, [showToast]);

  const removePatient = useCallback(async (id: string, name: string) => {
    try {
      await hospitalService.removePatient(id);
      setPatients((prev) => prev.filter((p) => p.id !== id));
      showToast("success", `${name} record unlinked`);
    } catch (err) {
      console.error("Failed to remove patient", err);
      showToast("error", `Failed to unlink ${name}`);
    }
  }, [showToast]);

  const deleteRecord = useCallback(async (recordId: string) => {
    try {
      await hospitalService.deleteRecord(recordId);
      showToast("success", "Record deleted successfully");
    } catch (err) {
      console.error("Failed to delete record", err);
      showToast("error", "Failed to delete record");
      throw err;
    }
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        auth, patients, doctors, appointments, toasts, loading,
        setAuthData: setAuth, logout, refreshData,
        addPatient, searchPatients, getPatient,
        addRecord, addDoctor, updateAppointmentStatus, showToast, dismissToast,
        removeDoctor, removePatient, deleteRecord
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}

export type { Patient, MedicalRecord, Doctor };
