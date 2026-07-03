const TOKEN_KEY = "medora_token";
const HOSPITAL_KEY = "medora_hospital";

export interface HospitalInfo {
  id: string;
  name: string;
  phone: string;
}

export const authStorage = {
  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },
  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },
  setHospital: (hospital: HospitalInfo) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(HOSPITAL_KEY, JSON.stringify(hospital));
    }
  },
  getHospital: (): HospitalInfo | null => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem(HOSPITAL_KEY);
      return data ? JSON.parse(data) : null;
    }
    return null;
  },
  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(HOSPITAL_KEY);
    }
  },
};
