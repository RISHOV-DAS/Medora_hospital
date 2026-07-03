import { apiRequest } from "./api";

export interface Patient {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  fileName: string;
  fileSize: string;
  date: string;
  uploadedAt: string;
  type: string;
  aiSummary?: AiSummary;
}

export interface AiSummary {
  complaints?: string[];
  medications?: { name: string; dosage: string; frequency: string }[];
  allergies?: string[];
  findings?: string[];
  simple_summary?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  phone: string;
  addedAt: string;
}

const hospitalService = {
  /**
   * Fetches the list of patients.
   * lightweight: /hospital/patients
   */
  async getPatients(): Promise<Patient[]> {
    console.log("[API] Fetching patients...");
    try {
      const res: any = await apiRequest("/hospital/patients");
      
      // Handle different possible response shapes
      const patientsRaw = Array.isArray(res) ? res : (res.patients || res.data || []);
      
      return patientsRaw.map((p: any) => ({
        id: p.user_id || p.id || String(Math.random()),
        name: p.name || "Unknown Patient",
        phone: p.phone || "",
        createdAt: p.joined_at || p.created_at || new Date().toISOString(),
      }));
    } catch (err) {
      console.error("[API] Failed to fetch patients:", err);
      throw err;
    }
  },

  /**
   * Fetches the list of doctors.
   * lightweight: /hospital/doctors
   */
  async getDoctors(): Promise<Doctor[]> {
    console.log("[API] Fetching doctors...");
    try {
      const res: any = await apiRequest("/hospital/doctors");
      console.log("[API] Doctors raw response:", res);
      
      // Handle variations: some backends might return { staff: [...] } or { doctors: [...] } or just [...]
      const doctorsRaw = Array.isArray(res) ? res : (res.doctors || res.staff || res.data || []);
      
      return doctorsRaw.map((d: any) => ({
        id: d.user_id || d.id || String(Math.random()),
        name: d.name || "Unknown Doctor",
        specialization: d.specialization || "General",
        phone: d.phone || "",
        addedAt: d.added_at || d.created_at || new Date().toISOString(),
      }));
    } catch (err) {
      console.error("[API] Failed to fetch doctors:", err);
      throw err;
    }
  },

  /**
   * Fetches records for a specific patient.
   * Fallback: Uses /hospital/info as the backend lacks a granular GET records endpoint.
   */
  async getPatientRecords(patientPhone: string): Promise<MedicalRecord[]> {
    console.log(`[API] Fetching records for patient: ${patientPhone}`);
    const phone = patientPhone.startsWith("+") ? patientPhone : `+91${patientPhone}`;
    
    try {
      // We use the aggregate endpoint as a fallback for missing granular records API
      console.log("[API] Using aggregate /hospital/info for records fallback...");
      const res: any = await apiRequest("/hospital/info");
      
      const patientsRaw = Array.isArray(res.patients) ? res.patients : [];
      const targetPatient = patientsRaw.find((p: any) => p.phone === phone || p.user_id === phone);

      if (!targetPatient || !targetPatient.visits) {
        console.warn(`[API] No records found for patient ${phone} in aggregate data.`);
        return [];
      }

      // Flatten visits -> records
      const allRecords: MedicalRecord[] = [];
      targetPatient.visits.forEach((visit: any) => {
        const visitDate = visit.date || "Unknown Date";
        if (Array.isArray(visit.records)) {
          visit.records.forEach((r: any) => {
            allRecords.push({
              id: r.id || String(Math.random()),
              patientId: targetPatient.user_id || "",
              fileName: r.file_url?.split("/").pop() || "Record",
              fileSize: "",
              date: visitDate,
              uploadedAt: r.uploaded_at || r.created_at || visitDate,
              type: r.type || "Medical Record",
              aiSummary: r.ai_summary,
            });
          });
        }
      });

      return allRecords.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
    } catch (err) {
      console.error(`[API] Failed to fetch aggregate records for ${patientPhone}:`, err);
      return [];
    }
  },

  /**
   * Adds a new patient by phone.
   */
  async addPatient(name: string, phone: string): Promise<Patient> {
    const res: any = await apiRequest("/hospital/patients/add", {
      method: "POST",
      body: JSON.stringify({ phone: `+91${phone}` }),
    });
    const p = res.patient || res;
    return {
      id: p.id || p.user_id,
      name: p.name,
      phone: p.phone,
      createdAt: p.joined_at || new Date().toISOString(),
    };
  },

  /**
   * Adds a new doctor.
   */
  async addDoctor(name: string, specialization: string, phone: string) {
    console.log(`[API] Adding doctor: ${name}`);
    return apiRequest("/hospital/doctors/add", {
      method: "POST",
      body: JSON.stringify({
        name,
        phone: phone.startsWith("+") ? phone : `+91${phone}`,
        specialization,
      }),
    });
  },

  /**
   * Removes a doctor from the hospital.
   */
  async removeDoctor(doctorId: string) {
    console.log(`[API] Removing doctor: ${doctorId}`);
    return apiRequest(`/hospital/doctors/${doctorId}`, {
      method: "DELETE",
    });
  },

  /**
   * Removes a patient from the hospital.
   */
  async removePatient(patientId: string) {
    console.log(`[API] Removing patient: ${patientId}`);
    return apiRequest(`/hospital/patients/${encodeURIComponent(patientId)}`, {
      method: "DELETE",
    });
  },

  /**
   * Initiates summarization for documents.
   */
  async summarizeDocuments(files: File[]): Promise<any> {
    const formData = new FormData();
    files.forEach(file => formData.append("documents", file));
    
    return apiRequest("/ai/summarize", {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Polls for AI status.
   */
  async getAiStatus(jobId: string): Promise<any> {
    return apiRequest(`/ai/status/${jobId}`);
  },

  /**
   * Helper to get AI summary with polling.
   */
  async getAiSummary(file: File, onProgress?: (msg: string, progress: number) => void): Promise<AiSummary | undefined> {
    try {
      if (onProgress) onProgress("Analyzing document...", 10);
      const summaryRes = await this.summarizeDocuments([file]);
      const fileResult = summaryRes.data?.[0];

      if (fileResult?.fromCache) {
        if (onProgress) onProgress("Retrieving cached summary...", 100);
        return {
          complaints: fileResult.complaints,
          medications: fileResult.medications,
          allergies: fileResult.allergies,
          findings: fileResult.findings,
          simple_summary: fileResult.simple_summary,
        };
      } else if (fileResult?.jobId) {
        if (onProgress) onProgress("Processing with AI...", 30);
        let completed = false;
        let attempts = 0;
        const maxAttempts = 45; // 1.5 minutes max

        while (!completed && attempts < maxAttempts) {
          attempts++;
          const statusRes = await this.getAiStatus(fileResult.jobId);
          
          if (statusRes.state === "completed") {
            if (onProgress) onProgress("Summary complete", 100);
            return statusRes.data;
          } else if (statusRes.state === "failed") {
            console.error("AI summarization failed", statusRes.error);
            return undefined;
          } else {
            if (onProgress) {
               const progress = statusRes.progress || 0;
               onProgress(`Summarizing... ${progress}%`, 30 + (progress * 0.6));
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
    } catch (err) {
      console.error("AI summarization error", err);
    }
    return undefined;
  },

  /**
   * Uploads a record for a patient.
   */
  async addRecord(patientPhone: string, file: File, date: string, type: string, aiSummary?: AiSummary) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("visit_date", date);
    formData.append("type", type);
    
    if (aiSummary) {
      // Append AI summary fields to formData
      if (aiSummary.complaints) formData.append("complaints", JSON.stringify(aiSummary.complaints));
      if (aiSummary.medications) formData.append("medications", JSON.stringify(aiSummary.medications));
      if (aiSummary.allergies) formData.append("allergies", JSON.stringify(aiSummary.allergies));
      if (aiSummary.findings) formData.append("findings", JSON.stringify(aiSummary.findings));
      if (aiSummary.simple_summary) formData.append("simple_summary", aiSummary.simple_summary);
    }
    
    const phone = patientPhone.startsWith("+") ? patientPhone : `+91${patientPhone}`;
    return apiRequest(`/hospital/patients/${encodeURIComponent(phone)}/records`, {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Deletes a specific record.
   */
  async deleteRecord(recordId: string) {
    console.log(`[API] Deleting record: ${recordId}`);
    return apiRequest(`/records/${recordId}`, {
      method: "DELETE",
    });
  },

  /**
   * Fetches the hospital's appointments
   */
  async getHospitalAppointments(): Promise<any[]> {
    console.log("[API] Fetching hospital appointments...");
    try {
      const res: any = await apiRequest("/appointments/hospital");
      return res.appointments || [];
    } catch (err) {
      console.error("[API] Failed to fetch hospital appointments:", err);
      return [];
    }
  },

  /**
   * Updates an appointment's status
   */
  async updateAppointmentStatus(id: string, status: string): Promise<any> {
    console.log(`[API] Updating appointment ${id} status to ${status}`);
    return apiRequest(`/appointments/hospital/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};

export default hospitalService;
