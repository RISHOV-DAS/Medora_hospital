"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { apiRequest } from "@/lib/api";
import { authStorage } from "@/lib/auth";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setAuthData, showToast } = useApp();
  const router = useRouter();

  const isPhoneValid = /^\d{10}$/.test(phone);
  const isOtpValid = /^\d{6}$/.test(otp);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneValid) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // Backend expects +91 format
      await apiRequest("/hospital/send-otp", {
        method: "POST",
        body: JSON.stringify({ phone: `+91${phone}` }),
      });
      showToast("success", "OTP sent successfully to your phone");
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOtpValid) return;
    
    setError("");
    setLoading(true);
    try {
      const response: any = await apiRequest("/hospital/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          phone: `+91${phone}`,
          otp,
          name: name || "Unknown Hospital", // Backend requires these
          address: address || "Not Provided",
        }),
      });

      authStorage.setToken(response.token);
      authStorage.setHospital(response.hospital);
      setAuthData({ isLoggedIn: true, phone: response.hospital.phone, hospital: response.hospital });
      
      showToast("success", "Authentication successful");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid OTP or authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #F8FAFA 0%, #e6f5f5 30%, #f0ebe6 60%, #F8FAFA 100%)" }} />
      
      {/* Decorative orbs */}
      <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] rounded-full blur-[100px] animate-float" style={{ background: "rgba(31,138,138,0.12)" }} />
      <div className="absolute bottom-1/4 -right-20 w-[350px] h-[350px] rounded-full blur-[100px]" style={{ background: "rgba(45,55,72,0.06)", animationDelay: "1.5s" }} />
      <div className="absolute top-2/3 left-1/3 w-[300px] h-[300px] rounded-full blur-[120px]" style={{ background: "rgba(180,105,67,0.08)" }} />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `linear-gradient(rgba(45,55,72,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(45,55,72,0.1) 1px, transparent 1px)`,
        backgroundSize: "40px 40px"
      }} />

      <div className="relative w-full max-w-[440px] px-6 animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-5">
            <div className="w-[72px] h-[72px] rounded-2xl bg-white border border-secondary/10 flex items-center justify-center shadow-xl shadow-primary/10 overflow-hidden group hover:scale-105 transition-transform duration-500">
              <img 
                src="/logo.png" 
                alt="Medora Logo" 
                className="w-full h-full object-contain p-2" 
              />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-secondary tracking-tight font-heading">Medora</h1>
          <p className="text-sm text-secondary-light/60 mt-1.5 font-medium">Medical Report Summarizer</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-secondary/5 border border-white/60 p-8 transition-all duration-500">
          {/* Mode Toggle */}
          {step === "phone" && (
            <div className="flex p-1 bg-neutral/50 rounded-2xl mb-8 border border-secondary/5">
              <button
                onClick={() => {
                  setMode("signin");
                  setError("");
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${
                  mode === "signin"
                    ? "bg-white text-primary shadow-md shadow-primary/5 ring-1 ring-black/5"
                    : "text-secondary-light/50 hover:text-secondary"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${
                  mode === "signup"
                    ? "bg-white text-primary shadow-md shadow-primary/5 ring-1 ring-black/5"
                    : "text-secondary-light/50 hover:text-secondary"
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {step === "phone" ? (
            <div className="animate-fadeIn">
              <h2 className="text-xl font-bold text-secondary mb-1 font-heading">
                {mode === "signin" ? "Healthcare Portal" : "Register Hospital"}
              </h2>
              <p className="text-[13px] text-secondary-light/60 mb-8">
                {mode === "signin" 
                  ? "Enter your phone number to receive an access code"
                  : "Create an account for your healthcare facility"}
              </p>

              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-secondary-light/70 uppercase tracking-wider mb-2">
                    Hospital Phone
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-secondary-light/50 text-sm font-semibold select-none">
                      +91
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setPhone(val);
                        if (error) setError("");
                      }}
                      autoFocus
                      className="w-full pl-14 pr-12 py-3.5 bg-neutral border border-secondary/10 rounded-2xl text-secondary font-medium placeholder-secondary-light/30 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary focus:bg-white transition-all text-sm"
                    />
                    {isPhoneValid && (
                      <span className="absolute inset-y-0 right-0 pr-4 flex items-center animate-fadeInScale">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </span>
                    )}
                  </div>
                </div>

                {mode === "signup" && (
                  <div className="space-y-4 animate-slideDown">
                    <div>
                      <label className="block text-xs font-semibold text-secondary-light/70 uppercase tracking-wider mb-2">
                        Hospital Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-5 py-3.5 bg-neutral border border-secondary/10 rounded-2xl text-secondary font-medium placeholder-secondary-light/30 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary focus:bg-white transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-secondary-light/70 uppercase tracking-wider mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-5 py-3.5 bg-neutral border border-secondary/10 rounded-2xl text-secondary font-medium placeholder-secondary-light/30 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary focus:bg-white transition-all text-sm"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2.5 text-[13px] text-red-600 bg-red-50 px-4 py-3 rounded-xl animate-slideIn">
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !isPhoneValid || (mode === "signup" && (!name || !address))}
                  className="btn-glow w-full py-4 px-4 text-sm font-bold text-white bg-primary rounded-2xl hover:shadow-lg hover:shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-md shadow-primary/15 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2.5"
                >
                  {loading ? "Sending..." : mode === "signin" ? "Send Access Code" : "Register & Send OTP"}
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-fadeIn">
              <button 
                onClick={() => setStep("phone")}
                className="mb-4 text-primary text-xs font-bold flex items-center gap-1.5 hover:underline"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Edit Phone Number
              </button>
              <h2 className="text-xl font-bold text-secondary mb-1 font-heading">Verify Code</h2>
              <p className="text-[13px] text-secondary-light/60 mb-8">We sent a 6-digit code to +91 {phone}</p>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label htmlFor="otp" className="block text-xs font-semibold text-secondary-light/70 uppercase tracking-wider mb-2">
                    Access Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    autoFocus
                    className="w-full px-5 py-3.5 bg-neutral border border-secondary/10 rounded-2xl text-secondary text-center tracking-[0.5em] text-lg font-bold placeholder-secondary-light/20 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary focus:bg-white transition-all"
                  />
                </div>

                <div className="pt-2">
                  {/* Registration details are now collected in step 1 for Sign Up mode */}
                </div>

                {error && (
                  <div className="text-[13px] text-red-600 bg-red-50 px-4 py-3 rounded-xl text-center font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !isOtpValid}
                  className="btn-glow w-full py-4 px-4 text-sm font-bold text-white bg-primary rounded-2xl hover:shadow-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-secondary-light/30 mt-8 font-medium">
          Secured access · Medora Health Network
        </p>
      </div>
    </div>
  );
}

