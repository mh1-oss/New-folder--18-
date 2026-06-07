"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export const runtime = 'edge';

const BARBERS = [
  {
    id: "1",
    name: "عمر",
    avatar: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=150&auto=format&fit=crop&q=80",
    role: "VIP - خبير القصات والتسريحات العصرية",
    passcode: "1001"
  },
  {
    id: "2",
    name: "مصطفى",
    avatar: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=150&auto=format&fit=crop&q=80",
    role: "خبير حلاقة وتحديد اللحية والعناية بالبشرة",
    passcode: "1002"
  },
  {
    id: "3",
    name: "محمد",
    avatar: "https://images.unsplash.com/photo-1605497746444-ac9dbd324ce8?w=150&auto=format&fit=crop&q=80",
    role: "خبير الصبغات والعلاجات المتكاملة للشعر",
    passcode: "1003"
  }
];

const getDurationByService = (serviceName) => {
  if (!serviceName) return "30 دقيقة";
  if (serviceName.includes("VIP") || serviceName.includes("الخدمات المتكاملة")) return "60 دقيقة";
  if (serviceName.includes("صبغة")) return "45 دقيقة";
  if (serviceName.includes("قص شعر")) return "30 دقيقة";
  if (serviceName.includes("تنظيف بشرة")) return "30 دقيقة";
  if (serviceName.includes("لحية") || serviceName.includes("تحديد")) return "20 دقيقة";
  return "30 دقيقة";
};

// --- SVG Icons ---
const SvgHome = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
);
const SvgMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);
const SvgX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const SvgLock = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);
const SvgLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
);
const SvgBell = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
);
const SvgWhatsapp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
);
const SvgCancel = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
);
const SvgCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

export default function QueuePage() {
  const [selectedBarberId, setSelectedBarberId] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [isBarberView, setIsBarberView] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    if (savedTheme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
    const savedLogin = localStorage.getItem("adminIsLoggedIn");
    if (savedLogin === "true") {
      setIsLoggedIn(true);
    }

    const savedBarber = localStorage.getItem("adminSelectedBarberId");
    const savedMode = localStorage.getItem("adminDashboardMode");
    if (savedMode === "barber" && savedBarber) {
      setSelectedBarberId(savedBarber);
      setIsBarberView(true);
    } else {
      setSelectedBarberId("all");
      setIsBarberView(false);
    }

    const today = new Date(new Date().getTime() + (3 * 60 * 60 * 1000));
    const todayStr = today.toISOString().split('T')[0];
    setSelectedDate(todayStr);
  }, []);

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const response = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });
      const data = await response.json();
      if (data.success) {
        setIsLoggedIn(true);
        localStorage.setItem("adminIsLoggedIn", "true");
        triggerToast("تم تسجيل الدخول بنجاح!", "success");
      } else {
        setLoginError(data.error || "خطأ في اسم المستخدم أو كلمة المرور");
      }
    } catch (err) {
      setLoginError("فشل الاتصال بالخادم");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminIsLoggedIn");
    setIsLoggedIn(false);
    triggerToast("تم تسجيل الخروج بنجاح", "success");
  };

  const fetchQueue = async () => {
    if (!selectedDate || !isLoggedIn) return;
    setLoading(true);
    try {
      const queryId = selectedBarberId === "all" ? "all" : selectedBarberId;
      const response = await fetch(`/api/barber-dashboard?barber_id=${queryId}&date=${selectedDate}`);
      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (err) {
      triggerToast("فشل جلب قائمة المواعيد", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [selectedBarberId, selectedDate, isLoggedIn]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const response = await fetch("/api/barber-dashboard", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointment_id: appointmentId, status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast("تم تحديث حالة الموعد بنجاح", "success");
        fetchQueue();
      } else {
        triggerToast(data.error || "فشل التحديث", "error");
      }
    } catch (err) {
      triggerToast("فشل الاتصال بالخادم", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const getWhatsAppLink = (phone, customMsg = "") => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '966' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('966')) {
      cleanPhone = '966' + cleanPhone;
    }
    const msg = customMsg || "السلام عليكم، تفضل دورك قرب، الرجاء الحضور للكرسي.";
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  if (!isLoggedIn) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", background: "var(--md-sys-color-surface-container-low)", color: "var(--md-sys-color-on-surface)", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
        <div style={{ background: "var(--md-sys-color-surface)", border: "1px solid var(--md-sys-color-outline)", padding: "32px", width: "100%", maxWidth: "400px", borderRadius: "24px", boxShadow: "var(--md-sys-elevation-3)" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <span style={{ fontSize: "48px" }}>🔑</span>
            <h1 style={{ color: "var(--md-sys-color-primary)", fontWeight: "900", marginTop: "12px", fontSize: "24px" }}>بوابة المسؤول</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "12px", marginTop: "6px" }}>سجل دخولك لعرض وإدارة طابور الانتظار الفعلي</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>اسم المستخدم</label>
              <input 
                type="text" 
                value={adminUsername}
                onChange={e => setAdminUsername(e.target.value)}
                required
                style={{ width: "100%", background: "var(--md-sys-color-surface-container-low)", border: "1px solid var(--md-sys-color-outline)", color: "var(--md-sys-color-on-surface)", padding: "12px", borderRadius: "12px", outline: "none" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>كلمة المرور</label>
              <input 
                type="password" 
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                required
                style={{ width: "100%", background: "var(--md-sys-color-surface-container-low)", border: "1px solid var(--md-sys-color-outline)", color: "var(--md-sys-color-on-surface)", padding: "12px", borderRadius: "12px", outline: "none" }}
              />
            </div>

            {loginError && <p style={{ color: "var(--md-sys-color-error)", fontSize: "12px", textAlign: "center", margin: 0 }}>{loginError}</p>}

            <button 
              type="submit" 
              style={{ width: "100%", marginTop: "12px", fontWeight: "700", background: "var(--md-sys-color-primary)", color: "var(--md-sys-color-on-primary)", border: "none", padding: "12px", borderRadius: "12px", cursor: "pointer" }}
            >
              تسجيل الدخول
            </button>

            <Link href="/" style={{ width: "100%", textDecoration: "none", display: "block", textAlign: "center", padding: "10px", color: "var(--text-secondary)", fontSize: "13px" }}>
              العودة للرئيسية
            </Link>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--md-sys-color-surface-container-low)", color: "var(--md-sys-color-on-surface)", padding: "16px", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      {/* Toast Alert */}
      {toast.show && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          background: toast.type === "success" ? "var(--status-serving-bg, #c5a059)" : "var(--md-sys-color-error-container)",
          color: toast.type === "success" ? "var(--status-serving-text, #ffffff)" : "var(--md-sys-color-on-error-container)",
          padding: "12px 24px",
          borderRadius: "16px",
          zIndex: 9999,
          boxShadow: "var(--md-sys-elevation-2)",
          border: "1px solid var(--md-sys-color-outline)",
          fontWeight: "700",
          fontSize: "14px"
        }}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid var(--md-sys-color-outline)", maxWidth: "1200px", margin: "0 auto 24px auto", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/barber" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--md-sys-color-surface-container)", border: "1px solid var(--md-sys-color-outline)", color: "var(--md-sys-color-primary)", padding: "8px", borderRadius: "50%", width: "40px", height: "40px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </Link>
          <div>
            <h1 style={{ fontWeight: "900", color: "var(--md-sys-color-primary)", fontSize: "22px", margin: 0 }}>
              طابور الانتظار الفعلي
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "12px", margin: "2px 0 0 0" }}>عرض وإدارة الزبائن المصطفين وتفاصيل الجلسات الحالية</p>
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "var(--md-sys-color-surface-container)",
              border: "1px solid var(--md-sys-color-outline)",
              color: "var(--md-sys-color-primary)",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer"
            }}
          >
            {menuOpen ? <SvgX /> : <SvgMenu />}
          </button>

          {menuOpen && (
            <div style={{
              position: "absolute",
              top: "50px",
              left: "0",
              background: "var(--md-sys-color-surface)",
              border: "1px solid var(--md-sys-color-outline)",
              borderRadius: "16px",
              padding: "16px",
              boxShadow: "var(--md-sys-elevation-3)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              minWidth: "220px",
              zIndex: 1000
            }}>
              <Link 
                href="/barber"
                onClick={() => setMenuOpen(false)}
                style={{ width: "100%", padding: "10px", fontSize: "13px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "var(--md-sys-color-on-surface)", background: "var(--md-sys-color-surface-container)", border: "1px solid var(--md-sys-color-outline)", textDecoration: "none", fontWeight: "700" }}
              >
                <SvgHome />
                <span>لوحة التحكم الرئيسية</span>
              </Link>
              <Link 
                href="/barber/slots"
                onClick={() => setMenuOpen(false)}
                style={{ width: "100%", padding: "10px", fontSize: "13px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "var(--md-sys-color-primary)", background: "transparent", border: "1px solid var(--md-sys-color-outline)", textDecoration: "none", fontWeight: "700" }}
              >
                <span>📅 إدارة مواعيد الكراسي</span>
              </Link>
              <button 
                onClick={() => { toggleTheme(); setMenuOpen(false); }}
                style={{ width: "100%", padding: "10px", fontSize: "13px", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", gap: "8px", background: "transparent", border: "1px solid var(--md-sys-color-outline)", color: "var(--md-sys-color-primary)", fontWeight: "700" }}
              >
                <span>تبديل المظهر ({theme === "dark" ? "فاتح" : "داكن"})</span>
              </button>
              <hr style={{ border: 0, borderTop: "1px solid var(--md-sys-color-outline)", margin: "4px 0" }} />
              <button 
                onClick={handleLogout}
                style={{ width: "100%", padding: "10px", fontSize: "13px", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "var(--md-sys-color-error-container)", color: "var(--md-sys-color-error)", border: "1px solid var(--md-sys-color-error)", fontWeight: "700" }}
              >
                <SvgLogout />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Selector Panel */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", background: "var(--md-sys-color-surface)", border: "1px solid var(--md-sys-color-outline)", padding: "16px 20px", borderRadius: "20px", gap: "16px" }}>
          {!isBarberView ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "14px", fontWeight: "800" }}>عرض طابور:</span>
              <div style={{ display: "flex", background: "var(--md-sys-color-surface-container-high)", padding: "4px", borderRadius: "12px", border: "1px solid var(--md-sys-color-outline)", gap: "2px" }}>
                <button 
                  onClick={() => setSelectedBarberId("all")}
                  style={{ padding: "6px 12px", borderRadius: "8px", border: "none", fontSize: "12px", fontWeight: "700", cursor: "pointer", background: selectedBarberId === "all" ? "var(--md-sys-color-primary)" : "transparent", color: selectedBarberId === "all" ? "var(--md-sys-color-on-primary)" : "var(--md-sys-color-on-surface)" }}
                >
                  الكل مجتمعاً
                </button>
                {BARBERS.map(b => (
                  <button 
                    key={b.id}
                    onClick={() => setSelectedBarberId(b.id)}
                    style={{ padding: "6px 12px", borderRadius: "8px", border: "none", fontSize: "12px", fontWeight: "700", cursor: "pointer", background: selectedBarberId === b.id ? "var(--md-sys-color-primary)" : "transparent", color: selectedBarberId === b.id ? "var(--md-sys-color-on-primary)" : "var(--md-sys-color-on-surface)" }}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: "800", color: "var(--md-sys-color-primary)" }}>
                طابور الانتظار للحلاق: {BARBERS.find(b => b.id.toString() === selectedBarberId.toString())?.name} ✂️
              </span>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>تاريخ الطابور:</span>
            <input 
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: "8px", borderRadius: "10px", border: "1px solid var(--md-sys-color-outline)", fontSize: "13px", cursor: "pointer", margin: 0 }}
            />
          </div>
        </div>

        {/* Queues Display */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ border: '3px solid var(--md-sys-color-outline)', borderTop: '3px solid var(--md-sys-color-primary)', borderRadius: '50%', width: '36px', height: '36px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>جاري تحميل طابور الانتظار...</span>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: selectedBarberId === "all" ? "repeat(auto-fit, minmax(340px, 1fr))" : "1fr", gap: "24px" }}>
            {BARBERS.filter(barber => selectedBarberId === "all" || selectedBarberId === barber.id).map(barber => {
              const barberApps = appointments.filter(app => app.barber_id.toString() === barber.id.toString());
              const activeApps = barberApps.filter(app => app.status === 'pending');
              const servingApp = barberApps.find(app => app.status === 'serving');

              return (
                <div key={barber.id} className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px", borderRadius: "24px", border: "1px solid var(--md-sys-color-outline)" }}>
                  
                  {/* Barber Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1.5px dashed var(--md-sys-color-outline)", paddingBottom: "16px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--md-sys-color-primary-container)", color: "var(--md-sys-color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "800", border: "2px solid var(--md-sys-color-primary)" }}>
                      {barber.name.charAt(0)}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: "900", margin: 0 }}>كرسي الحلاق {barber.name}</h3>
                      <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{activeApps.length} زبائن بانتظار الخدمة</span>
                    </div>
                  </div>

                  {/* Serving Client Hero Card */}
                  <div style={{
                    background: servingApp ? "linear-gradient(135deg, var(--md-sys-color-primary) 0%, var(--accent-gold-dark, #c5a059) 100%)" : "var(--md-sys-color-surface-container)",
                    borderRadius: "16px",
                    padding: "16px 20px",
                    color: servingApp ? "var(--md-sys-color-on-primary)" : "var(--md-sys-color-on-surface-variant)",
                    minHeight: "100px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "12px",
                    boxShadow: "var(--md-sys-elevation-1)"
                  }}>
                    <div>
                      <span style={{ fontSize: "9px", fontWeight: "900", background: "rgba(0,0,0,0.15)", padding: "2px 8px", borderRadius: "10px", display: "inline-block" }}>
                        على الكرسي الآن ✂️
                      </span>
                      {servingApp ? (
                        <h4 style={{ fontSize: "18px", fontWeight: "900", marginTop: "6px", margin: "6px 0 0 0" }}>{servingApp.customer_name}</h4>
                      ) : (
                        <h4 style={{ fontSize: "13px", fontWeight: "700", marginTop: "6px", margin: "6px 0 0 0" }}>لا يوجد زبائن على الكرسي حالياً</h4>
                      )}
                    </div>

                    {servingApp && (
                      <button
                        onClick={() => handleStatusUpdate(servingApp.id, 'completed')}
                        disabled={actionLoading}
                        style={{
                          background: "#ffffff",
                          color: "var(--md-sys-color-primary)",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "800",
                          cursor: "pointer",
                          width: "fit-content"
                        }}
                      >
                        إكمال الخدمة
                      </button>
                    )}
                  </div>

                  {/* Waiting List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-secondary)" }}>طابور المصطفين:</span>
                    
                    {activeApps.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 16px", border: "1px dashed var(--md-sys-color-outline)", borderRadius: "16px" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>لا يوجد زبائن قيد الانتظار حالياً</span>
                      </div>
                    ) : (
                      activeApps.map((app, index) => (
                        <div 
                          key={app.id}
                          style={{
                            background: "var(--md-sys-color-surface-container-low)",
                            border: "1px solid var(--md-sys-color-outline)",
                            borderRadius: "16px",
                            padding: "16px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "var(--md-sys-color-primary-container)", color: "var(--md-sys-color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "12px" }}>
                                {index + 1}
                              </div>
                              <span style={{ fontWeight: "800", fontSize: "14px" }}>{app.customer_name}</span>
                            </div>
                            <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--md-sys-color-primary)" }}>{app.appointment_time}</span>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                              {app.service_name} • ⏱️ {getDurationByService(app.service_name)}
                            </span>

                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                onClick={() => handleStatusUpdate(app.id, 'serving')}
                                style={{ background: "var(--md-sys-color-primary)", color: "#ffffff", border: "none", padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "800", cursor: "pointer" }}
                              >
                                ابدأ دور الخدمة
                              </button>
                              
                              <a 
                                href={getWhatsAppLink(app.customer_phone, `السلام عليكم يا غالي، تفضل دورك وصل للكرسي عند الحلاق ${barber.name}.`)}
                                target="_blank"
                                rel="noreferrer"
                                style={{ background: "rgba(212,175,55,0.1)", color: "var(--md-sys-color-primary)", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
                                title="إشعار وصلك السرة"
                              >
                                <SvgBell />
                              </a>

                              <a 
                                href={getWhatsAppLink(app.customer_phone)}
                                target="_blank"
                                rel="noreferrer"
                                style={{ background: "rgba(5, 150, 105, 0.1)", color: "#059669", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
                                title="تواصل واتساب"
                              >
                                <SvgWhatsapp />
                              </a>

                              <button
                                onClick={() => handleStatusUpdate(app.id, 'cancelled')}
                                style={{ background: "var(--md-sys-color-error-container)", color: "var(--md-sys-color-error)", border: "none", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                                title="إلغاء الموعد"
                              >
                                <SvgCancel />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
