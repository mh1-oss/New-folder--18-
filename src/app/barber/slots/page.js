"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export const runtime = 'edge';

const WEEK_DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

// --- SVG Icons ---
const SvgClock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const SvgPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const SvgTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);
const SvgEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);
const SvgCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const SvgHome = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
);
const SvgChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
);
const SvgMenu = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);
const SvgX = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const SvgLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
);

export default function SlotsManagement() {
  const [theme, setTheme] = useState("dark");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [barber, setBarber] = useState(null);
  const [selectedBarberId, setSelectedBarberId] = useState("");
  const [activeTab, setActiveTab] = useState("weekly"); // weekly, overrides
  const [selectedDay, setSelectedDay] = useState("الأحد");
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Slots states
  const [weeklyConfigs, setWeeklyConfigs] = useState([]);
  const [dateOverrides, setDateOverrides] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dialogs
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSlotTime, setNewSlotTime] = useState("10:00");
  const [editingSlotIndex, setEditingSlotIndex] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editSlotTime, setEditSlotTime] = useState("");

  // Overrides helper states
  const [overrideDate, setOverrideDate] = useState("");
  const [activeOverrideSlots, setActiveOverrideSlots] = useState([]);
  const [selectedOverrideDate, setSelectedOverrideDate] = useState(null);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

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
      const activeId = localStorage.getItem("adminSelectedBarberId") || "1";
      setSelectedBarberId(activeId);
    }
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem("adminIsLoggedIn");
    setIsLoggedIn(false);
    triggerToast("تم تسجيل الخروج بنجاح", "success");
  };

  useEffect(() => {
    if (!selectedBarberId || !isLoggedIn) return;
    loadBarberAndSlots();
  }, [selectedBarberId, isLoggedIn]);

  const loadBarberAndSlots = async () => {
    setLoading(true);
    try {
      // Fetch barbers to find the active one
      const barbersRes = await fetch("/api/barbers");
      const barbersData = await barbersRes.json();
      if (barbersData.success) {
        const found = barbersData.barbers.find(b => b.id.toString() === selectedBarberId);
        setBarber(found || barbersData.barbers[0]);
      }

      // Fetch slots
      const res = await fetch(`/api/barber-slots?barber_id=${selectedBarberId}`);
      const data = await res.json();
      if (data.success) {
        setWeeklyConfigs(data.weekly || []);
        setDateOverrides(data.overrides || []);
      }
    } catch (err) {
      triggerToast("فشل تحميل البيانات", "error");
    } finally {
      setLoading(false);
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
        localStorage.setItem("adminIsLoggedIn", "true");
        setIsLoggedIn(true);
        const activeId = localStorage.getItem("adminSelectedBarberId") || "1";
        setSelectedBarberId(activeId);
        triggerToast("تم تسجيل الدخول بنجاح كأدمن", "success");
      } else {
        setLoginError("اسم المستخدم أو كلمة المرور غير صحيحة.");
      }
    } catch (err) {
      setLoginError("حدث خطأ أثناء الاتصال بالخادم.");
    }
  };

  const getDaySlots = (dayName) => {
    const config = weeklyConfigs.find(c => c.day_of_week === dayName);
    return config && config.time_slots ? config.time_slots.split(",").sort() : [];
  };

  const formatTimeTo12h = (timeStr) => {
    if (!timeStr) return "";
    const [hourStr, minuteStr] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "م" : "ص";
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${hour}:${minuteStr} ${ampm}`;
  };

  // Weekly actions
  const handleAddWeeklySlot = async () => {
    if (!newSlotTime) return;
    const currentSlots = getDaySlots(selectedDay);
    if (currentSlots.includes(newSlotTime)) {
      triggerToast("هذا التوقيت موجود بالفعل!", "error");
      return;
    }
    const updated = [...currentSlots, newSlotTime].sort().join(",");
    
    try {
      const response = await fetch("/api/barber-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barber_id: parseInt(selectedBarberId),
          day_of_week: selectedDay,
          time_slots: updated
        })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast("تم إضافة التوقيت بنجاح", "success");
        loadBarberAndSlots();
        setShowAddDialog(false);
      }
    } catch (err) {
      triggerToast("فشل حفظ التعديلات", "error");
    }
  };

  const handleDeleteWeeklySlot = async (timeSlot) => {
    const currentSlots = getDaySlots(selectedDay);
    const updated = currentSlots.filter(s => s !== timeSlot).join(",");
    
    try {
      const response = await fetch("/api/barber-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barber_id: parseInt(selectedBarberId),
          day_of_week: selectedDay,
          time_slots: updated
        })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast("تم حذف التوقيت بنجاح", "success");
        loadBarberAndSlots();
      }
    } catch (err) {
      triggerToast("فشل حذف التوقيت", "error");
    }
  };

  const handleEditWeeklySlot = async () => {
    if (!editSlotTime) return;
    const currentSlots = getDaySlots(selectedDay);
    const oldTime = currentSlots[editingSlotIndex];
    if (currentSlots.includes(editSlotTime) && editSlotTime !== oldTime) {
      triggerToast("هذا التوقيت موجود بالفعل!", "error");
      return;
    }
    const updatedList = [...currentSlots];
    updatedList[editingSlotIndex] = editSlotTime;
    const updated = updatedList.sort().join(",");

    try {
      const response = await fetch("/api/barber-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barber_id: parseInt(selectedBarberId),
          day_of_week: selectedDay,
          time_slots: updated
        })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast("تم تعديل التوقيت بنجاح", "success");
        loadBarberAndSlots();
        setShowEditDialog(false);
      }
    } catch (err) {
      triggerToast("فشل تعديل التوقيت", "error");
    }
  };

  // Overrides actions
  const handleSelectOverrideDate = (dateStr) => {
    setSelectedOverrideDate(dateStr);
    const existing = dateOverrides.find(o => o.specific_date === dateStr);
    if (existing) {
      setActiveOverrideSlots(existing.time_slots ? existing.time_slots.split(",") : []);
    } else {
      // Baseline from day of week
      const [year, month, day] = dateStr.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      const dayIndex = dateObj.getDay();
      const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
      const dayName = days[dayIndex];
      const weekly = getDaySlots(dayName);
      setActiveOverrideSlots(weekly);
    }
  };

  const handleAddOverrideSlot = async () => {
    if (!newSlotTime || !selectedOverrideDate) return;
    if (activeOverrideSlots.includes(newSlotTime)) {
      triggerToast("هذا التوقيت موجود بالفعل!", "error");
      return;
    }
    const updated = [...activeOverrideSlots, newSlotTime].sort().join(",");
    
    try {
      const response = await fetch("/api/barber-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barber_id: parseInt(selectedBarberId),
          specific_date: selectedOverrideDate,
          time_slots: updated
        })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast("تم إضافة التوقيت الاستثنائي", "success");
        loadBarberAndSlots();
        setActiveOverrideSlots([...activeOverrideSlots, newSlotTime].sort());
        setShowAddDialog(false);
      }
    } catch (err) {
      triggerToast("فشل الحفظ", "error");
    }
  };

  const handleDeleteOverrideSlot = async (timeSlot) => {
    const updated = activeOverrideSlots.filter(s => s !== timeSlot).join(",");
    
    try {
      const response = await fetch("/api/barber-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barber_id: parseInt(selectedBarberId),
          specific_date: selectedOverrideDate,
          time_slots: updated
        })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast("تم حذف التوقيت الاستثنائي", "success");
        loadBarberAndSlots();
        setActiveOverrideSlots(activeOverrideSlots.filter(s => s !== timeSlot));
      }
    } catch (err) {
      triggerToast("فشل حذف التوقيت", "error");
    }
  };

  const handleEditOverrideSlot = async () => {
    if (!editSlotTime || !selectedOverrideDate) return;
    const oldTime = activeOverrideSlots[editingSlotIndex];
    if (activeOverrideSlots.includes(editSlotTime) && editSlotTime !== oldTime) {
      triggerToast("هذا التوقيت موجود بالفعل!", "error");
      return;
    }
    const updatedList = [...activeOverrideSlots];
    updatedList[editingSlotIndex] = editSlotTime;
    const updated = updatedList.sort().join(",");

    try {
      const response = await fetch("/api/barber-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barber_id: parseInt(selectedBarberId),
          specific_date: selectedOverrideDate,
          time_slots: updated
        })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast("تم تعديل التوقيت الاستثنائي", "success");
        loadBarberAndSlots();
        setActiveOverrideSlots(updatedList.sort());
        setShowEditDialog(false);
      }
    } catch (err) {
      triggerToast("فشل تعديل التوقيت", "error");
    }
  };

  const handleToggleOverrideHoliday = async (isHoliday) => {
    if (!selectedOverrideDate) return;
    
    let updatedSlots = "";
    if (isHoliday) {
      updatedSlots = "holiday";
    } else {
      // Restore from weekly baseline
      const [year, month, day] = selectedOverrideDate.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      const dayIndex = dateObj.getDay();
      const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
      const dayName = days[dayIndex];
      const weekly = getDaySlots(dayName);
      updatedSlots = weekly.join(",");
    }

    try {
      const response = await fetch("/api/barber-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barber_id: parseInt(selectedBarberId),
          specific_date: selectedOverrideDate,
          time_slots: updatedSlots
        })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast(isHoliday ? "تم تعيين اليوم كعطلة استثنائية" : "تم تفعيل العمل وتعيين فترات اليوم", "success");
        loadBarberAndSlots();
        setActiveOverrideSlots(isHoliday ? ["holiday"] : updatedSlots.split(",").filter(Boolean));
      }
    } catch (err) {
      triggerToast("فشل تحديث حالة اليوم", "error");
    }
  };

  const handleDeleteOverrideConfig = async (dateStr) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف الاستثناء الخاص بهذا اليوم والعودة للجدول الأسبوعي الافتراضي؟")) return;
    try {
      const res = await fetch(`/api/barber-slots?barber_id=${selectedBarberId}&specific_date=${dateStr}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("تم حذف الاستثناء والعودة للجدول الأسبوعي", "success");
        loadBarberAndSlots();
        if (selectedOverrideDate === dateStr) {
          setSelectedOverrideDate(null);
          setActiveOverrideSlots([]);
        }
      }
    } catch (err) {
      triggerToast("فشل حذف الاستثناء", "error");
    }
  };

  const handleToggleRestDay = async (dayName) => {
    if (!barber) return;
    const activeRestDays = barber.rest_days ? barber.rest_days.split(",") : [];
    let updatedRestDays = [];
    if (activeRestDays.includes(dayName)) {
      updatedRestDays = activeRestDays.filter(d => d !== dayName);
    } else {
      updatedRestDays = [...activeRestDays, dayName];
    }
    const updatedRestDaysString = updatedRestDays.join(",");

    setBarber(prev => prev ? { ...prev, rest_days: updatedRestDaysString } : null);

    try {
      const response = await fetch("/api/barbers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barber_id: parseInt(selectedBarberId),
          rest_days: updatedRestDaysString
        })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast(`تم تحديث إجازة يوم ${dayName} بنجاح!`, "success");
      } else {
        triggerToast(data.error || "فشل تحديث الإجازات.", "error");
        loadBarberAndSlots();
      }
    } catch (err) {
      triggerToast("فشل الاتصال بالخادم.", "error");
      loadBarberAndSlots();
    }
  };

  if (!isLoggedIn) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", background: "var(--md-sys-color-surface-container-low)", color: "var(--md-sys-color-on-surface)", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
        <div style={{ background: "var(--md-sys-color-surface)", border: "1px solid var(--md-sys-color-outline)", padding: "32px", width: "100%", maxWidth: "400px", borderRadius: "24px", backdropFilter: "blur(12px)", boxShadow: "var(--md-sys-elevation-3)" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <span style={{ fontSize: "48px" }}>🔑</span>
            <h1 style={{ color: "var(--md-sys-color-primary)", fontWeight: "900", marginTop: "12px", fontSize: "24px" }}>بوابة المسؤول</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "12px", marginTop: "6px" }}>سجل دخولك لتتمكن من إدارة مواعيد وأوقات العمل</p>
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
          background: toast.type === "success" ? "var(--status-serving-bg)" : "var(--md-sys-color-error-container)",
          color: toast.type === "success" ? "var(--status-serving-text)" : "var(--md-sys-color-on-error-container)",
          padding: "12px 24px",
          borderRadius: "16px",
          zIndex: 9999,
          backdropFilter: "blur(8px)",
          boxShadow: "var(--md-sys-elevation-2)",
          border: "1px solid var(--md-sys-color-outline)",
          fontWeight: "700",
          fontSize: "14px"
        }}>
          {toast.message}
        </div>
      )}

      {/* Modern Premium Header with Hamburger Menu */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid var(--md-sys-color-outline)", maxWidth: "1100px", margin: "0 auto 24px auto", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/barber" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--md-sys-color-surface-container)", border: "1px solid var(--md-sys-color-outline)", color: "var(--md-sys-color-primary)", padding: "8px", borderRadius: "50%", width: "40px", height: "40px" }}>
            <SvgChevronRight />
          </Link>
          <div>
            <h1 style={{ fontWeight: "900", color: "var(--md-sys-color-primary)", fontSize: "22px", margin: 0 }}>
              {barber ? `مواعيد الحلاق ${barber.name}` : "إدارة مواعيد الكراسي"}
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "12px", margin: "2px 0 0 0" }}>تخصيص أوقات العمل والاستثناءات الطارئة</p>
          </div>
        </div>
        {/* Hamburger Menu Container */}
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
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            title="القائمة"
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
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "13px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  color: "var(--md-sys-color-on-surface)",
                  background: "var(--md-sys-color-surface-container)",
                  border: "1px solid var(--md-sys-color-outline)",
                  textDecoration: "none",
                  fontWeight: "700"
                }}
              >
                <SvgHome />
                <span>لوحة التحكم الرئيسية</span>
              </Link>

              <Link 
                href="/barber/queue"
                onClick={() => setMenuOpen(false)}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "13px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  color: "var(--md-sys-color-primary)",
                  background: "transparent",
                  border: "1px solid var(--md-sys-color-outline)",
                  textDecoration: "none",
                  fontWeight: "700"
                }}
              >
                <span>📋 طابور الانتظار الفعلي</span>
              </Link>

              <button 
                onClick={() => { toggleTheme(); setMenuOpen(false); }}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "13px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  background: "transparent",
                  border: "1px solid var(--md-sys-color-outline)",
                  color: "var(--md-sys-color-primary)",
                  fontWeight: "700"
                }}
              >
                <span>تبديل المظهر ({theme === "dark" ? "فاتح" : "داكن"})</span>
              </button>

              <hr style={{ border: 0, borderTop: "1px solid var(--md-sys-color-outline)", margin: "4px 0" }} />

              <button 
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "13px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  background: "var(--md-sys-color-error-container)",
                  border: "1px solid var(--md-sys-color-error)",
                  color: "var(--md-sys-color-on-error-container)",
                  fontWeight: "700"
                }}
              >
                <SvgLogout />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Single-Barber Area */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        


        {/* Tab Buttons */}
        <div style={{ display: "flex", gap: "8px", background: "var(--md-sys-color-surface-container-low)", border: "1px solid var(--md-sys-color-outline)", padding: "4px", borderRadius: "16px" }}>
          <button
            onClick={() => setActiveTab("weekly")}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: "12px",
              fontWeight: "800",
              fontSize: "14px",
              cursor: "pointer",
              border: "none",
              background: activeTab === "weekly" ? "var(--md-sys-color-primary)" : "transparent",
              color: activeTab === "weekly" ? "var(--md-sys-color-on-primary)" : "var(--md-sys-color-on-surface)",
              transition: "all 0.2s ease"
            }}
          >
            الجدول الأسبوعي الافتراضي
          </button>
          <button
            onClick={() => setActiveTab("overrides")}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: "12px",
              fontWeight: "800",
              fontSize: "14px",
              cursor: "pointer",
              border: "none",
              background: activeTab === "overrides" ? "var(--md-sys-color-primary)" : "transparent",
              color: activeTab === "overrides" ? "var(--md-sys-color-on-primary)" : "var(--md-sys-color-on-surface)",
              transition: "all 0.2s ease"
            }}
          >
            تعديل مواعيد ليوم محدد (استثناء)
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "var(--text-secondary)", fontSize: "15px" }}>
            جاري تحميل تفاصيل المواعيد...
          </div>
        ) : activeTab === "weekly" ? (
          /* Weekly Panel */
          <div style={{ background: "var(--md-sys-color-surface)", border: "1px solid var(--md-sys-color-outline)", padding: "20px", borderRadius: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--md-sys-color-primary)", margin: 0 }}>تنظيم أوقات الكرسي بحسب أيام الأسبوع</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "12px", margin: "4px 0 0 0" }}>اختر اليوم من القائمة لتعديل أوقات العمل المفعلة فيه بشكل افتراضي.</p>
            </div>

            {/* Day Selector Pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {WEEK_DAYS.map(day => {
                const slotsCount = getDaySlots(day).length;
                const isSelected = selectedDay === day;
                const isRest = (barber?.rest_days !== undefined && barber?.rest_days !== null) ? barber.rest_days.split(",").includes(day) : false;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "50px",
                      background: isSelected 
                        ? "var(--md-sys-color-primary)" 
                        : (isRest ? "rgba(239, 68, 68, 0.08)" : "var(--md-sys-color-surface-container)"),
                      color: isSelected 
                        ? "var(--md-sys-color-on-primary)" 
                        : (isRest ? "var(--md-sys-color-error)" : "var(--md-sys-color-on-surface)"),
                      border: isSelected 
                        ? "1px solid var(--md-sys-color-primary)" 
                        : (isRest ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid var(--md-sys-color-outline)"),
                      cursor: "pointer",
                      fontWeight: "700",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <span>{day}</span>
                    {isRest ? (
                      <span style={{ fontSize: "10px" }}>🏖️</span>
                    ) : (
                      <span style={{ 
                        fontSize: "10px", 
                        background: isSelected ? "rgba(0,0,0,0.15)" : "var(--md-sys-color-primary-container)",
                        padding: "2px 6px",
                        borderRadius: "8px",
                        color: isSelected ? "black" : "var(--md-sys-color-primary)"
                      }}>{slotsCount}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* حالة يوم العمل المختار */}
            {(() => {
              const isSelectedDayRest = (barber?.rest_days !== undefined && barber?.rest_days !== null) ? barber.rest_days.split(",").includes(selectedDay) : false;
              return (
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  background: "var(--md-sys-color-surface-container-low)", 
                  border: "1px solid var(--md-sys-color-outline)", 
                  padding: "16px 20px", 
                  borderRadius: "16px",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginTop: "8px"
                }}>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "14px", fontWeight: "800", color: "var(--md-sys-color-primary)", display: "block" }}>
                      حالة العمل ليوم {selectedDay}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px", display: "block" }}>
                      حدد ما إذا كان الحلاق يعمل في هذا اليوم أو يعتبره عطلة أسبوعية رسمية.
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (isSelectedDayRest) {
                          handleToggleRestDay(selectedDay);
                        }
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "12px",
                        fontWeight: "800",
                        fontSize: "12px",
                        cursor: "pointer",
                        border: !isSelectedDayRest ? "2px solid var(--md-sys-color-primary)" : "1px solid var(--md-sys-color-outline)",
                        background: !isSelectedDayRest ? "var(--md-sys-color-primary-container)" : "transparent",
                        color: !isSelectedDayRest ? "var(--md-sys-color-primary)" : "var(--md-sys-color-on-surface)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      🟢 يوم عمل شغال
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isSelectedDayRest) {
                          handleToggleRestDay(selectedDay);
                        }
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "12px",
                        fontWeight: "800",
                        fontSize: "12px",
                        cursor: "pointer",
                        border: isSelectedDayRest ? "2px solid var(--md-sys-color-error)" : "1px solid var(--md-sys-color-outline)",
                        background: isSelectedDayRest ? "var(--md-sys-color-error-container)" : "transparent",
                        color: isSelectedDayRest ? "var(--md-sys-color-error)" : "var(--md-sys-color-on-surface)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      🏖️ عطلة أسبوعية
                    </button>
                  </div>
                </div>
              );
            })()}

            <hr style={{ border: 0, borderTop: "1px solid var(--md-sys-color-outline)", margin: 0 }} />

            {/* Time Slots Grid */}
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)" }}>
                <SvgClock />
                <span>أوقات العمل المتاحة ليوم {selectedDay}:</span>
              </h4>

              {(() => {
                const isSelectedDayRest = (barber?.rest_days !== undefined && barber?.rest_days !== null) ? barber.rest_days.split(",").includes(selectedDay) : false;
                if (isSelectedDayRest) {
                  return (
                    <div style={{
                      background: "rgba(239, 68, 68, 0.05)",
                      border: "1.5px dashed var(--md-sys-color-error)",
                      borderRadius: "16px",
                      padding: "32px 16px",
                      textAlign: "center",
                      color: "var(--md-sys-color-error)"
                    }}>
                      <span style={{ fontSize: "36px", display: "block", marginBottom: "8px" }}>🏖️</span>
                      <h4 style={{ fontWeight: "800", fontSize: "15px", margin: 0 }}>هذا اليوم عطلة أسبوعية رسمية للحلاق</h4>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", margin: "6px 0 0 0" }}>
                        لن يستطيع الزوار حجز أي موعد في هذا اليوم. لتفعيل العمل وإضافة فترات، يرجى تغيير حالة اليوم إلى "يوم عمل شغال" أعلاه.
                      </p>
                    </div>
                  );
                }

                return (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "10px" }}>
                    {getDaySlots(selectedDay).map((time, idx) => (
                      <div 
                        key={time} 
                        style={{
                          borderRadius: "16px",
                          border: "1px solid var(--md-sys-color-outline)",
                          background: "var(--md-sys-color-surface-container)",
                          padding: "12px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative"
                        }}
                      >
                        <span style={{ fontSize: "15px", fontWeight: "800", color: "var(--md-sys-color-primary)" }}>
                          {formatTimeTo12h(time)}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
                          {time}
                        </span>
                        
                        {/* Action buttons */}
                        <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                          <button 
                            onClick={() => {
                              setEditingSlotIndex(idx);
                              setEditSlotTime(time);
                              setShowEditDialog(true);
                            }}
                            style={{ color: "var(--md-sys-color-primary)", background: "var(--md-sys-color-surface-container-high)", border: "none", cursor: "pointer", padding: "6px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
                            title="تعديل"
                          >
                            <SvgEdit />
                          </button>
                          <button 
                            onClick={() => handleDeleteWeeklySlot(time)}
                            style={{ color: "var(--md-sys-color-error, #ef4444)", background: "var(--md-sys-color-surface-container-high)", border: "none", cursor: "pointer", padding: "6px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
                            title="حذف"
                          >
                            <SvgTrash />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add New Slot Card */}
                    <button 
                      onClick={() => {
                        setNewSlotTime("10:00");
                        setShowAddDialog(true);
                      }}
                      style={{
                        borderRadius: "16px",
                        border: "1px dashed var(--md-sys-color-primary)",
                        background: "var(--md-sys-color-primary-container)",
                        cursor: "pointer",
                        minHeight: "82px",
                        color: "var(--md-sys-color-primary)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        outline: "none"
                      }}
                    >
                      <SvgPlus />
                      <span style={{ fontSize: "12px", fontWeight: "700" }}>إضافة توقيت</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        ) : (
          /* Specific Date Overrides Panel */
          <div style={{ background: "var(--md-sys-color-surface)", border: "1px solid var(--md-sys-color-outline)", padding: "20px", borderRadius: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--md-sys-color-primary)", margin: 0 }}>تخصيص مواعيد استثنائية ليوم حدد</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "12px", margin: "4px 0 0 0" }}>تخصيص أوقات عمل استثنائية ليوم محدد دون التأثير على الجدول الأسبوعي.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
              {/* Row 1: Select Date */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "var(--md-sys-color-surface-container-low)", border: "1px solid var(--md-sys-color-outline)", padding: "16px", borderRadius: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", fontWeight: "700" }}>اختر التاريخ لإنشاء أو تعديل التخصيص الاستثنائي:</label>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <input 
                    type="date" 
                    value={overrideDate}
                    onChange={e => setOverrideDate(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: "200px",
                      background: "var(--md-sys-color-surface-container)",
                      border: "1px solid var(--md-sys-color-outline)",
                      color: "var(--md-sys-color-on-surface)",
                      padding: "10px",
                      borderRadius: "12px",
                      outline: "none",
                      fontSize: "14px"
                    }}
                  />
                  <button 
                    onClick={() => {
                      if (overrideDate) handleSelectOverrideDate(overrideDate);
                    }}
                    disabled={!overrideDate}
                    style={{ 
                      padding: "10px 20px", 
                      borderRadius: "12px", 
                      background: "var(--md-sys-color-primary)", 
                      color: "var(--md-sys-color-on-primary)", 
                      border: "none", 
                      fontWeight: "700", 
                      cursor: overrideDate ? "pointer" : "not-allowed",
                      opacity: overrideDate ? 1 : 0.6
                    }}
                  >
                    عرض وتعديل فترات هذا التاريخ
                  </button>
                </div>
              </div>

              {/* Dynamic Override Editor Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr lg:grid-cols-3", gap: "20px" }}>
                {/* Existing Date Overrides List */}
                <div style={{ background: "var(--md-sys-color-surface-container-low)", border: "1px solid var(--md-sys-color-outline)", padding: "16px", borderRadius: "16px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-secondary)", marginBottom: "12px" }}>قائمة الأيام المخصصة حالياً:</h4>
                  {dateOverrides.length === 0 ? (
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", margin: 0 }}>لا توجد استثناءات مضافة حالياً.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "250px", overflowY: "auto" }}>
                      {dateOverrides.map(override => (
                        <div 
                          key={override.id} 
                          style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center", 
                            padding: "10px 12px", 
                            background: selectedOverrideDate === override.specific_date ? "rgba(197,160,89,0.1)" : "var(--md-sys-color-surface-container)", 
                            border: selectedOverrideDate === override.specific_date ? "1px solid var(--md-sys-color-primary)" : "1px solid var(--md-sys-color-outline)",
                            borderRadius: "12px"
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: "700", fontSize: "13px", color: "var(--md-sys-color-on-surface)" }}>{override.specific_date}</span>
                            <span style={{ fontSize: "11px", color: override.time_slots === "holiday" ? "var(--md-sys-color-error)" : "var(--text-secondary)", marginRight: "6px", fontWeight: override.time_slots === "holiday" ? "700" : "normal" }}>
                              {override.time_slots === "holiday" ? "🏖️ عطلة استثنائية" : `(${override.time_slots ? override.time_slots.split(",").length : 0} أوقات)`}
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button 
                              onClick={() => handleSelectOverrideDate(override.specific_date)}
                              style={{ background: "var(--md-sys-color-surface-container-high)", border: "none", cursor: "pointer", color: "var(--md-sys-color-on-surface)", padding: "5px 10px", borderRadius: "8px", fontSize: "11px" }}
                            >
                              تعديل
                            </button>
                            <button 
                              onClick={() => handleDeleteOverrideConfig(override.specific_date)}
                              style={{ background: "rgba(239,68,68,0.1)", border: "none", cursor: "pointer", color: "#ef4444", padding: "5px", borderRadius: "8px", display: "flex", alignItems: "center" }}
                            >
                              <SvgTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Editor Box */}
                <div style={{ background: "var(--md-sys-color-surface)", border: "1px solid var(--md-sys-color-outline)", padding: "16px", borderRadius: "16px" }}>
                  {selectedOverrideDate ? (
                    <>
                      <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--md-sys-color-primary)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                        <SvgCalendar />
                        <span>فترات يوم {selectedOverrideDate}:</span>
                      </h4>

                      {/* حالة يوم العمل المختار */}
                      {(() => {
                        const isOverrideHoliday = activeOverrideSlots.includes("holiday");
                        return (
                          <div style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center", 
                            background: "var(--md-sys-color-surface-container-low)", 
                            border: "1px solid var(--md-sys-color-outline)", 
                            padding: "16px 20px", 
                            borderRadius: "16px",
                            gap: "12px",
                            marginBottom: "16px"
                          }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <span style={{ fontSize: "14px", fontWeight: "800", color: "var(--md-sys-color-on-surface)" }}>حالة هذا التاريخ:</span>
                              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                                حدد إذا كان هذا التاريخ يوم عمل أو عطلة استثنائية.
                              </span>
                            </div>

                            {/* Toggle Button Group */}
                            <div style={{ display: "flex", background: "var(--md-sys-color-surface-container-high)", padding: "4px", borderRadius: "12px", border: "1px solid var(--md-sys-color-outline)" }}>
                              <button
                                onClick={() => {
                                  if (isOverrideHoliday) {
                                    handleToggleOverrideHoliday(false);
                                  }
                                }}
                                style={{
                                  padding: "8px 16px",
                                  borderRadius: "8px",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  border: "none",
                                  cursor: "pointer",
                                  background: !isOverrideHoliday ? "var(--md-sys-color-primary)" : "transparent",
                                  color: !isOverrideHoliday ? "var(--md-sys-color-on-primary)" : "var(--md-sys-color-on-surface)",
                                  transition: "all 0.2s ease"
                                }}
                              >
                                🟢 يوم عمل
                              </button>
                              <button
                                onClick={() => {
                                  if (!isOverrideHoliday) {
                                    handleToggleOverrideHoliday(true);
                                  }
                                }}
                                style={{
                                  padding: "8px 16px",
                                  borderRadius: "8px",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  border: "none",
                                  cursor: "pointer",
                                  background: isOverrideHoliday ? "var(--md-sys-color-error)" : "transparent",
                                  color: isOverrideHoliday ? "var(--md-sys-color-on-error, #ffffff)" : "var(--md-sys-color-on-surface)",
                                  transition: "all 0.2s ease"
                                }}
                              >
                                🏖️ عطلة استثنائية
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      {(() => {
                        const isOverrideHoliday = activeOverrideSlots.includes("holiday");
                        if (isOverrideHoliday) {
                          return (
                            <div style={{
                              background: "rgba(239, 68, 68, 0.05)",
                              border: "1.5px dashed var(--md-sys-color-error)",
                              borderRadius: "16px",
                              padding: "32px 16px",
                              textAlign: "center",
                              color: "var(--md-sys-color-error)"
                            }}>
                              <span style={{ fontSize: "36px", display: "block", marginBottom: "8px" }}>🏖️</span>
                              <h4 style={{ fontWeight: "800", fontSize: "15px", margin: 0 }}>هذا التاريخ عطلة استثنائية للحلاق</h4>
                              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", margin: "6px 0 0 0" }}>
                                لن يستطيع الزوار حجز أي موعد في هذا التاريخ المحدد. لتفعيل العمل وإضافة فترات، يرجى تغيير حالة اليوم إلى "يوم عمل" أعلاه.
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: "8px" }}>
                            {activeOverrideSlots.map((time, idx) => (
                              <div 
                                key={time} 
                                style={{
                                  borderRadius: "12px",
                                  border: "1px solid var(--md-sys-color-outline)",
                                  background: "var(--md-sys-color-surface-container)",
                                  padding: "10px",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  position: "relative"
                                }}
                              >
                                <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--md-sys-color-primary)" }}>
                                  {formatTimeTo12h(time)}
                                </span>
                                <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>
                                  {time}
                                </span>
                                
                                <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
                                  <button 
                                    onClick={() => {
                                      setEditingSlotIndex(idx);
                                      setEditSlotTime(time);
                                      setShowEditDialog(true);
                                    }}
                                    style={{ color: "var(--md-sys-color-primary)", background: "var(--md-sys-color-surface-container-high)", border: "none", cursor: "pointer", padding: "4px", borderRadius: "6px", display: "flex" }}
                                  >
                                    <SvgEdit />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteOverrideSlot(time)}
                                    style={{ color: "#ef4444", background: "var(--md-sys-color-surface-container-high)", border: "none", cursor: "pointer", padding: "4px", borderRadius: "6px", display: "flex" }}
                                  >
                                    <SvgTrash />
                                  </button>
                                </div>
                              </div>
                            ))}

                            <button 
                              onClick={() => {
                                setNewSlotTime("10:00");
                                setShowAddDialog(true);
                              }}
                              style={{
                                borderRadius: "12px",
                                border: "1px dashed var(--md-sys-color-primary)",
                                background: "var(--md-sys-color-primary-container)",
                                cursor: "pointer",
                                minHeight: "72px",
                                color: "var(--md-sys-color-primary)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "4px",
                                outline: "none"
                              }}
                            >
                              <SvgPlus />
                              <span style={{ fontSize: "11px", fontWeight: "700" }}>إضافة توقيت</span>
                            </button>
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-secondary)" }}>
                      <span style={{ fontSize: "36px", display: "block", marginBottom: "8px" }}>📅</span>
                      <p style={{ fontSize: "13px", margin: 0 }}>الرجاء اختيار تاريخ من الأعلى أو قائمة التخصيصات لتعديل مواعيد العمل المحددة له.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modern Add Slot Dialog */}
      {showAddDialog && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(5px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{ background: "var(--md-sys-color-surface)", border: "1px solid var(--md-sys-color-primary)", borderRadius: "24px", padding: "24px", width: "100%", maxWidth: "320px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontWeight: "800", color: "var(--md-sys-color-primary)", margin: 0, fontSize: "16px" }}>إضافة توقيت عمل جديد</h3>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>اختر الوقت:</label>
              <input 
                type="time" 
                value={newSlotTime} 
                onChange={e => setNewSlotTime(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--md-sys-color-surface-container-low)",
                  border: "1px solid var(--md-sys-color-outline)",
                  color: "var(--md-sys-color-on-surface)",
                  padding: "12px",
                  borderRadius: "12px",
                  fontSize: "16px",
                  outline: "none"
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                onClick={activeTab === "weekly" ? handleAddWeeklySlot : handleAddOverrideSlot}
                style={{ flex: 1, padding: "10px", background: "var(--md-sys-color-primary)", color: "var(--md-sys-color-on-primary)", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}
              >
                إضافة الفترة
              </button>
              <button 
                onClick={() => setShowAddDialog(false)}
                style={{ flex: 1, padding: "10px", background: "var(--md-sys-color-surface-container-high)", color: "var(--md-sys-color-on-surface)", border: "none", borderRadius: "10px", cursor: "pointer" }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Edit Slot Dialog */}
      {showEditDialog && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(5px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{ background: "var(--md-sys-color-surface)", border: "1px solid var(--md-sys-color-primary)", borderRadius: "24px", padding: "24px", width: "100%", maxWidth: "320px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontWeight: "800", color: "var(--md-sys-color-primary)", margin: 0, fontSize: "16px" }}>تعديل توقيت العمل</h3>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>اختر الوقت الجديد:</label>
              <input 
                type="time" 
                value={editSlotTime} 
                onChange={e => setEditSlotTime(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--md-sys-color-surface-container-low)",
                  border: "1px solid var(--md-sys-color-outline)",
                  color: "var(--md-sys-color-on-surface)",
                  padding: "12px",
                  borderRadius: "12px",
                  fontSize: "16px",
                  outline: "none"
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                onClick={activeTab === "weekly" ? handleEditWeeklySlot : handleEditOverrideSlot}
                style={{ flex: 1, padding: "10px", background: "var(--md-sys-color-primary)", color: "var(--md-sys-color-on-primary)", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}
              >
                حفظ التعديل
              </button>
              <button 
                onClick={() => setShowEditDialog(false)}
                style={{ flex: 1, padding: "10px", background: "var(--md-sys-color-surface-container-high)", color: "var(--md-sys-color-on-surface)", border: "none", borderRadius: "10px", cursor: "pointer" }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
