"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// تمكين تشغيل الصفحة على بيئة Edge المتوافقة مع Cloudflare Pages
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

const WEEK_DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const ALL_TIME_SLOTS = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", 
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", 
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", 
  "20:00", "20:30", "21:00", "21:30"
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

// --- أيقونات متجهة SVG عالية الجودة ---
const SvgLock = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);
const SvgClock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const SvgLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
);
const SvgUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const SvgCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const SvgQrCode = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
);
const SvgCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const SvgScissors = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>
);
const SvgCancel = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
);
const SvgPhone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
);
const SvgWhatsapp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
);
const SvgGrid = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
);
const SvgBell = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
);
const SvgMenu = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);
const SvgX = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);



export default function BarberDashboard() {
  const [selectedBarberId, setSelectedBarberId] = useState("1"); // 1: عمر، 2: مصطفى، 3: محمد
  const [selectedDate, setSelectedDate] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [barberStats, setBarberStats] = useState({ pending: 0, serving: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    if (savedTheme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
    const savedPinSetting = localStorage.getItem("requireBarberPin");
    if (savedPinSetting !== null) {
      setRequireBarberPin(savedPinSetting === "true");
    }
    const savedLogin = localStorage.getItem("adminIsLoggedIn");
    if (savedLogin === "true") {
      setIsLoggedIn(true);
      const savedMode = localStorage.getItem("adminDashboardMode") || "select";
      setDashboardMode(savedMode);
      const savedBarber = localStorage.getItem("adminSelectedBarberId");
      if (savedBarber) {
        setSelectedBarberId(savedBarber);
      }
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

  const SvgThemeToggle = () => (
    theme === "dark" ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
    )
  );
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDbMock, setIsDbMock] = useState(false);
  const [filterTab, setFilterTab] = useState("active"); // active, completed

  const [barbersList, setBarbersList] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [dashboardMode, setDashboardMode] = useState("select"); // select, combined, barber
  const [requireBarberPin, setRequireBarberPin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);


  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinBarberId, setPinBarberId] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");


  const [showQrModal, setShowQrModal] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const handlePrintQr = () => {
    if (!qrUrl) return;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>طباعة لافتة الحجز الذاتي</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800;900&display=swap');
            
            /* تهيئة الصفحة للطباعة */
            @page {
              size: auto;
              margin: 0mm;
            }
            
            body {
              font-family: 'Cairo', sans-serif;
              background-color: #ffffff;
              color: #1a1a1a;
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              direction: rtl;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .sign-card {
              width: 90%;
              max-width: 460px;
              border: 8px double #e9c176;
              border-radius: 32px;
              padding: 40px 30px;
              text-align: center;
              box-sizing: border-box;
              background: #fafafa;
              position: relative;
            }
            
            .logo-icon {
              font-size: 48px;
              margin-bottom: 12px;
              display: inline-block;
            }
            
            h1 {
              font-size: 28px;
              font-weight: 900;
              margin: 0 0 8px 0;
              color: #121414;
              letter-spacing: -0.5px;
            }
            
            .subtitle {
              font-size: 14px;
              color: #555;
              margin: 0 0 28px 0;
              font-weight: 600;
              line-height: 1.6;
              padding: 0 10px;
            }
            
            .qr-wrapper {
              background: #ffffff;
              border: 3px dashed #e9c176;
              border-radius: 24px;
              padding: 16px;
              display: inline-block;
              box-shadow: 0 8px 20px rgba(0,0,0,0.04);
              margin-bottom: 28px;
            }
            
            .qr-wrapper img {
              width: 240px;
              height: 240px;
              display: block;
            }
            
            .instruction-step {
              font-size: 14px;
              color: #333;
              font-weight: 700;
              margin: 8px 0;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            }
            
            .instruction-step span {
              background: #e9c176;
              color: #121414;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: 900;
            }

            .footer-welcome {
              font-size: 16px;
              font-weight: 800;
              color: #c5a059;
              margin-top: 28px;
              border-top: 1.5px dashed #e9c176;
              padding-top: 18px;
            }
          </style>
        </head>
        <body>
          <div class="sign-card">
            <div class="logo-icon">✂️💈</div>
            <h1>احجز دورك بالهاتف</h1>
            <p class="subtitle">امسح الرمز أدناه للتسجيل مباشرة والدخول في طابور الانتظار دون الحاجة للانتظار الطويل</p>
            
            <div class="qr-wrapper">
              <img src="${qrUrl}" alt="QR Code" />
            </div>
            
            <div class="instruction-step">
              <span>١</span>
              افتح كاميرا هاتفك وامسح الرمز
            </div>
            <div class="instruction-step">
              <span>٢</span>
              سجل اسمك ورقمك واحجز فوراً
            </div>
            
            <div class="footer-welcome">
              أهلاً وسهلاً بكم ✨
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 800);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleToggleRestDay = async (dayName) => {
    if (!currentBarber) return;
    const activeRestDays = currentBarber.rest_days ? currentBarber.rest_days.split(",") : [];
    let updatedRestDays = [];
    if (activeRestDays.includes(dayName)) {
      updatedRestDays = activeRestDays.filter(d => d !== dayName);
    } else {
      updatedRestDays = [...activeRestDays, dayName];
    }
    const updatedRestDaysString = updatedRestDays.join(",");

    setBarbersList(prev => prev.map(b => b.id.toString() === currentBarber.id.toString() ? { ...b, rest_days: updatedRestDaysString } : b));

    try {
      const response = await fetch("/api/barbers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barber_id: parseInt(currentBarber.id),
          rest_days: updatedRestDaysString
        })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast(`تم تحديث إجازة يوم ${dayName} بنجاح!`, "success");
      } else {
        triggerToast(data.error || "فشل تحديث الإجازات.", "error");
        fetchAppointments();
      }
    } catch (err) {
      triggerToast("فشل الاتصال بالخادم.", "error");
      fetchAppointments();
    }
  };

  const handleToggleCustomSlot = async (timeSlot) => {
    if (!currentBarber) return;
    const activeSlots = currentBarber.custom_slots 
      ? currentBarber.custom_slots.split(",") 
      : ALL_TIME_SLOTS;
    
    let updatedSlots = [];
    if (activeSlots.includes(timeSlot)) {
      updatedSlots = activeSlots.filter(s => s !== timeSlot);
      triggerToast(`تم وضع فترة ${timeSlot} كفترة استراحة`, "success");
    } else {
      updatedSlots = [...activeSlots, timeSlot];
      triggerToast(`تم تفعيل فترة ${timeSlot} لاستقبال الحجوزات`, "success");
    }
    const updatedSlotsString = updatedSlots.join(",");

    setBarbersList(prev => prev.map(b => b.id.toString() === currentBarber.id.toString() ? { ...b, custom_slots: updatedSlotsString } : b));

    try {
      const response = await fetch("/api/barbers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barber_id: parseInt(currentBarber.id),
          custom_slots: updatedSlotsString
        })
      });
      const data = await response.json();
      if (!data.success) {
        triggerToast(data.error || "فشل حفظ تعديل الوقت.", "error");
        fetchAppointments();
      }
    } catch (err) {
      triggerToast("فشل الاتصال بالخادم لتحديث الأوقات.", "error");
      fetchAppointments();
    }
  };

  useEffect(() => {
    const now = new Date();
    const saudiTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    const todayStr = saudiTime.toISOString().split('T')[0];
    setSelectedDate(todayStr);

    if (typeof window !== "undefined") {
      const bookUrl = window.location.origin + "/";
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(bookUrl)}&color=121414`);
    }
  }, []);

  useEffect(() => {
    if (!selectedDate || !isLoggedIn) return;
    fetchAppointments();
  }, [selectedBarberId, selectedDate, isLoggedIn, dashboardMode]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const setupRes = await fetch("/api/setup");
      const setupData = await setupRes.json();
      setIsDbMock(setupData.mock);

      try {
        const barbersRes = await fetch("/api/barbers");
        const barbersData = await barbersRes.json();
        if (barbersData.success && barbersData.barbers) {
          const merged = BARBERS.map(b => {
            const dbB = barbersData.barbers.find(db => db.name === b.name || db.id.toString() === b.id.toString());
            return {
              ...b,
              rest_days: dbB ? (dbB.rest_days !== null && dbB.rest_days !== undefined ? dbB.rest_days : "الجمعة") : (b.rest_days || "الجمعة"),
              custom_slots: dbB ? dbB.custom_slots : (b.custom_slots || "10:00,10:30,11:00,11:30,12:00,12:30,14:00,14:30,15:00,15:30,16:00,16:30,17:00,17:30,18:00,18:30,19:00,19:30,20:00,20:30,21:00,21:30")
            };
          });
          setBarbersList(merged);
        }
      } catch (errBarbers) {
        console.error("Failed to load dynamic barbers:", errBarbers);
      }

      const queryId = dashboardMode === "combined" ? "all" : selectedBarberId;
      const response = await fetch(`/api/barber-dashboard?barber_id=${queryId}&date=${selectedDate}`);
      const data = await response.json();

      if (data.success) {
        setAppointments(data.appointments);
        calculateStats(data.appointments);
      } else {
        setError("فشل جلب الحجوزات من قاعدة البيانات.");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (appsList) => {
    const stats = { pending: 0, serving: 0, completed: 0 };
    appsList.forEach(app => {
      if (app.status === 'pending') stats.pending += 1;
      if (app.status === 'serving') stats.serving += 1;
      if (app.status === 'completed') stats.completed += 1;
    });
    setBarberStats(stats);
  };

  const changeDashboardMode = (mode) => {
    setDashboardMode(mode);
    localStorage.setItem("adminDashboardMode", mode);
  };

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setIsLoggedIn(true);
        localStorage.setItem("adminIsLoggedIn", "true");
        setLoginError("");
        changeDashboardMode("select");
        triggerToast("تم تسجيل دخول الأدمن بنجاح", "success");
      } else {
        setLoginError(data.error || "اسم المستخدم أو رمز المرور غير صحيح.");
        triggerToast("فشل تسجيل الدخول", "error");
      }
    } catch (err) {
      setLoginError("حدث خطأ في الاتصال بالخادم.");
      triggerToast("خطأ في الاتصال", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("adminIsLoggedIn");
    localStorage.removeItem("adminDashboardMode");
    localStorage.removeItem("adminSelectedBarberId");
    setAdminUsername("");
    setAdminPassword("");
    setLoginError("");
    setAppointments([]);
    changeDashboardMode("select");
    triggerToast("تم تسجيل الخروج بنجاح.", "success");
  };

  const toggleRequireBarberPin = () => {
    const newVal = !requireBarberPin;
    setRequireBarberPin(newVal);
    localStorage.setItem("requireBarberPin", newVal.toString());
    triggerToast(newVal ? "تم تفعيل التحقق من الرمز السري للحلاقين" : "تم إلغاء التحقق من الرمز السري للحلاقين", "success");
  };

  const handleSelectBarber = (barberId) => {
    if (requireBarberPin) {
      setPinBarberId(barberId);
      setPinInput("");
      setPinError("");
      setPinModalOpen(true);
    } else {
      setSelectedBarberId(barberId);
      localStorage.setItem("adminSelectedBarberId", barberId);
      changeDashboardMode("barber");
    }
  };

  const handlePinSubmit = (e) => {
    if (e) e.preventDefault();
    setPinError("");
    const targetBarber = BARBERS.find(b => b.id === pinBarberId);
    if (targetBarber && pinInput.trim() === targetBarber.passcode) {
      setSelectedBarberId(pinBarberId);
      localStorage.setItem("adminSelectedBarberId", pinBarberId);
      changeDashboardMode("barber");
      setPinModalOpen(false);
      setPinInput("");
      triggerToast(`تم الدخول بنجاح للوحة الحلاق ${targetBarber.name}`, "success");
    } else {
      setPinError("رمز الـ PIN غير صحيح.");
      triggerToast("رمز PIN خاطئ", "error");
    }
  };


  const getWhatsAppLink = (phone, text = "") => {
    let cleanPhone = phone.trim();
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "966" + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith("+") && !cleanPhone.startsWith("966")) {
      cleanPhone = "966" + cleanPhone;
    }
    cleanPhone = cleanPhone.replace("+", "");
    
    if (text) {
      return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    }
    return `https://wa.me/${cleanPhone}`;
  };


  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setActionLoading(true);
    try {
      const response = await fetch("/api/barber-dashboard", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_id: appointmentId,
          status: newStatus
        })
      });

      const data = await response.json();
      if (data.success) {
        const updatedApps = appointments.map(app => {
          if (app.id === appointmentId) {
            return { ...app, status: newStatus };
          }
          if (newStatus === 'serving' && app.status === 'serving') {
            return { ...app, status: 'completed' };
          }
          return app;
        });

        if (newStatus === 'serving') {
          const activeServing = appointments.find(a => a.status === 'serving');
          if (activeServing) {
            await fetch("/api/barber-dashboard", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ appointment_id: activeServing.id, status: 'completed' })
            });
          }
        }

        setAppointments(updatedApps);
        calculateStats(updatedApps);
        
        const statusText = newStatus === 'serving' 
          ? 'تم وضع الزبون في وضع الخدمة النشطة' 
          : newStatus === 'completed' 
            ? 'اكتملت الخدمة بنجاح' 
            : 'تم إلغاء الحجز بنجاح';
        
        triggerToast(statusText, "success");
      } else {
        triggerToast(data.error || "فشل تحديث الحالة.", "error");
      }
    } catch (err) {
      triggerToast("فشل الاتصال بالخادم لتحديث الحالة.", "error");
    } finally {
      setActionLoading(false);
      fetchAppointments();
    }
  };

  const currentBarber = barbersList.find(b => b.id.toString() === selectedBarberId.toString()) || BARBERS.find(b => b.id.toString() === selectedBarberId.toString());

  const activeAppointments = appointments.filter(app => app.status === 'pending');
  const servingAppointment = appointments.find(app => app.status === 'serving');
  const pastAppointments = appointments.filter(app => app.status === 'completed' || app.status === 'cancelled');

  return (
    <div style={{ direction: "rtl", minHeight: "100vh", display: "flex", background: "var(--bg-primary)" }}>
      
      {/* Toast Noti      {/* شاشة تسجيل الدخول المبسطة والنظيفة */}
      {!isLoggedIn ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          flex: 1, 
          padding: '40px 16px',
          width: '100%'
        }} className="animate-fade">
          
          <div className="login-split-container" style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            maxWidth: '900px',
            minHeight: '450px',
            background: 'var(--md-sys-color-surface)',
            borderRadius: '20px',
            border: '1px solid var(--md-sys-color-outline)',
            overflow: 'hidden',
            boxShadow: 'var(--md-sys-elevation-2)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            flexWrap: 'wrap-reverse'
          }}>
            
            {/* النصف الأيمن: تسجيل الدخول */}
            <div className="login-split-form" style={{
              flex: '1 1 450px',
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              textAlign: 'right'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ 
                  color: 'var(--md-sys-color-on-surface-variant)', 
                  fontSize: '11px', 
                  fontWeight: '700', 
                  background: 'var(--md-sys-color-primary-container)', 
                  padding: '4px 12px', 
                  borderRadius: '24px',
                  display: 'inline-block',
                  border: '1px solid var(--md-sys-color-outline)'
                }}>
                  بوابة الإدارة
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: '800', marginTop: '12px', color: 'var(--md-sys-color-on-surface)' }}>تسجيل دخول الأدمن</h2>
                <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '13px', marginTop: '4px' }}>
                  يرجى إدخال اسم المستخدم وكلمة المرور الخاصة بمسؤول النظام لإدارة طوابير الصالون.
                </p>
              </div>

              {loginError && (
                <div style={{ 
                  background: 'var(--md-sys-color-error-container)', 
                  border: '1px solid var(--md-sys-color-error)', 
                  color: 'var(--md-sys-color-on-error-container)', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  marginBottom: '20px', 
                  fontSize: '12px', 
                  textAlign: 'center', 
                  fontWeight: '700' 
                }}>
                  {loginError}
                </div>
              )}

              {/* اسم المستخدم للأدمن */}
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="username-input" style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '8px' }}>اسم المستخدم:</label>
                <input 
                  type="text" 
                  id="username-input"
                  className="form-control"
                  placeholder="أدخل اسم المستخدم"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  required
                  style={{ 
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(0,0,0,0.1)',
                    borderColor: 'var(--md-sys-color-outline)',
                    width: '100%',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* كلمة المرور للأدمن */}
              <div style={{ marginBottom: '24px' }}>
                <label htmlFor="password-input" style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '8px' }}>كلمة المرور:</label>
                <input 
                  type="password" 
                  id="password-input"
                  className="form-control"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  style={{ 
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(0,0,0,0.1)',
                    borderColor: 'var(--md-sys-color-outline)',
                    width: '100%',
                    fontSize: '14px'
                  }}
                />
              </div>

              <button 
                type="button" 
                onClick={handleLoginSubmit}
                className="btn-gold" 
                style={{ width: '100%', padding: '14px', fontSize: '14px', borderRadius: '12px' }}
              >
                <SvgLock />
                <span>تسجيل الدخول</span>
              </button>
            </div>

            {/* النصف الأيسر: الخدمة الذاتية */}
            <div className="login-split-kiosk" style={{
              flex: '1 1 400px',
              padding: '40px',
              background: 'var(--md-sys-color-surface-container-low)',
              borderLeft: '1px solid var(--md-sys-color-outline)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              position: 'relative'
            }}>
              
              <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ 
                  color: 'var(--md-sys-color-on-surface-variant)', 
                  fontSize: '10px', 
                  fontWeight: '700', 
                  background: 'var(--md-sys-color-surface-container-high)', 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  marginBottom: '16px',
                  display: 'inline-block'
                }}>
                  حجز المواعيد
                </span>
                
                <h1 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px', color: 'var(--md-sys-color-on-surface)' }}>بوابة صالون الحلاقة</h1>
                <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '13px', marginBottom: '24px', maxWidth: '280px', lineHeight: '1.6' }}>
                  امسح رمز الاستجابة السريعة (QR) للتسجيل والإنضمام لطابور الانتظار.
                </p>
                
                {qrUrl ? (
                  <div style={{ 
                    background: '#ffffff', 
                    padding: '10px', 
                    borderRadius: '16px', 
                    border: '1px solid var(--md-sys-color-outline)', 
                    display: 'inline-block', 
                    marginBottom: '24px',
                    boxShadow: 'var(--md-sys-elevation-1)'
                  }}>
                    <img src={qrUrl} alt="QR Code" style={{ width: '150px', height: '150px', display: 'block' }} />
                  </div>
                ) : (
                  <div style={{ 
                    width: '170px', 
                    height: '170px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    border: '1px dashed var(--md-sys-color-outline)', 
                    borderRadius: '16px', 
                    marginBottom: '24px' 
                  }}>
                    جاري التهيِئة...
                  </div>
                )}

                <a 
                  href="/" 
                  className="btn-outline" 
                  style={{ 
                    width: '200px', 
                    textDecoration: 'none', 
                    padding: '10px 0', 
                    fontSize: '13px', 
                    borderRadius: '12px'
                  }}
                >
                  <span>الانتقال لصفحة الحجز</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* ================= لوحة الماتريال ديزاين 3 للموظفين بعد تسجيل الدخول ================= */
        <div style={{ display: "flex", flex: 1, flexDirection: "column" }} className="animate-fade">
          
          {/* شريط التطبيقات العلوي الماتريال (Material Top App Bar) */}
          <header style={{
            background: "var(--md-sys-color-surface)",
            borderBottom: "1px solid var(--md-sys-color-outline)",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 990,
            gap: "12px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
              {/* أيقونة مهنية للملف الشخصي للحلاق */}
              <div style={{ 
                width: "40px", 
                height: "40px", 
                borderRadius: "50%", 
                border: "2px solid var(--md-sys-color-primary)", 
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "800",
                fontSize: "14px",
                color: "var(--md-sys-color-primary)",
                background: "var(--md-sys-color-primary-container)",
                flexShrink: 0 
              }}>
                {dashboardMode === "combined" ? "ج" : (dashboardMode === "barber" ? currentBarber?.name?.charAt(0) : "أ")}
              </div>
              <div style={{ textAlign: "right" }}>
                <h1 style={{ fontSize: "16px", fontWeight: "800", color: "var(--md-sys-color-on-surface)", whiteSpace: "nowrap" }}>
                  {dashboardMode === "combined" ? "لوحة التحكم المجتمعة" : (dashboardMode === "barber" ? `لوحة الحلاق ${currentBarber?.name}` : "بوابة إدارة الصالون")}
                </h1>
              </div>
            </div>

            {/* زر همبرجر منيو للموبايل والشاشات */}
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

              {/* القائمة المنسدلة (Dropdown Menu) */}
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
                }} className="animate-fade">
                  {dashboardMode !== "select" && (
                    <button 
                      onClick={() => { changeDashboardMode("select"); setMenuOpen(false); }}
                      className="btn-outline"
                      style={{
                        width: "100%",
                        padding: "10px",
                        fontSize: "13px",
                        borderRadius: "12px",
                        justifyContent: "center"
                      }}
                    >
                      <span>القائمة الرئيسية</span>
                    </button>
                  )}
                  {dashboardMode !== "select" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-secondary)", textAlign: "right" }}>تاريخ المواعيد:</span>
                      <input 
                        type="date"
                        className="form-control"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '12px', cursor: 'pointer', width: "100%", margin: 0 }}
                      />
                    </div>
                  )}
                  <button 
                    onClick={() => { toggleTheme(); setMenuOpen(false); }}
                    className="btn-outline"
                    style={{
                      width: "100%",
                      padding: "10px",
                      fontSize: "13px",
                      borderRadius: "12px",
                      justifyContent: "center",
                      color: "var(--md-sys-color-primary)"
                    }}
                  >
                    <span>تبديل المظهر ({theme === "dark" ? "فاتح" : "داكن"})</span>
                  </button>
                  <Link 
                    href="/barber/queue"
                    className="btn-outline"
                    style={{
                      width: "100%",
                      padding: "10px",
                      fontSize: "13px",
                      borderRadius: "12px",
                      justifyContent: "center",
                      color: "var(--md-sys-color-primary)",
                      textAlign: "center",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <span>📋 طابور الانتظار الفعلي</span>
                  </Link>
                  <Link 
                    href="/barber/slots"
                    className="btn-outline"
                    style={{
                      width: "100%",
                      padding: "10px",
                      fontSize: "13px",
                      borderRadius: "12px",
                      justifyContent: "center",
                      color: "var(--md-sys-color-primary)",
                      textAlign: "center",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <span>📅 إدارة مواعيد الكراسي</span>
                  </Link>
                  <hr style={{ border: 0, borderTop: "1px solid var(--md-sys-color-outline)", margin: "4px 0" }} />
                  <button 
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="btn-outline"
                    style={{
                      width: "100%",
                      padding: "10px",
                      fontSize: "13px",
                      borderRadius: "12px",
                      justifyContent: "center",
                      background: "var(--md-sys-color-error-container)",
                      color: "var(--md-sys-color-error)",
                      borderColor: "var(--md-sys-color-error)"
                    }}
                  >
                    <SvgLogout />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* تخطيط الصفحة (Responsive Dashboard Grid) */}
          <div className="container" style={{ padding: "32px 20px", flex: 1 }}>
            
            {/* 1. قائمة الخيارات الرئيسية (Select Mode Selector) */}
            {dashboardMode === "select" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--md-sys-color-primary)' }}>بوابة إدارة الصالون</h2>
                  <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '14px', marginTop: '6px' }}>
                    مرحباً بك في لوحة الإدارة العامة. اختر طريقة عرض الطوابير أو قم بإدارة حلاق محدد.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                  {/* خيار 1: عرض التسلسلات مجتمعة */}
                  <div 
                    className="glass-card clickable-card animate-scale"
                    onClick={() => changeDashboardMode("combined")}
                    style={{
                      padding: '32px',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(0, 0, 0, 0.2) 100%)',
                      border: '2px solid var(--md-sys-color-primary)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '48px' }}>📊</span>
                    <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--md-sys-color-primary)' }}>عرض التسلسلات مجتمعة</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '400px' }}>
                      شاشة موحدة تعرض طوابير الحلاقين الثلاثة (عمر، مصطفى، محمد) جنباً إلى جنب مع أزرار الاتصال وإشعارات السرة بالواتساب.
                    </p>
                  </div>

                  {/* خيار 2: إدارة حلاق منفصل */}
                  <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '16px', borderBottom: '1px solid var(--md-sys-color-outline)', paddingBottom: '12px' }}>إدارة حلاق منفصل</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      {BARBERS.map((barber) => (
                        <div 
                          key={barber.id}
                          onClick={() => handleSelectBarber(barber.id)}
                          style={{
                            padding: '20px',
                            borderRadius: '16px',
                            border: '1px solid var(--md-sys-color-outline)',
                            background: 'rgba(255,255,255,0.02)',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px'
                          }}
                          className="barber-select-item"
                        >
                          <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: 'var(--md-sys-color-primary-container)',
                            color: 'var(--md-sys-color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            fontWeight: '800',
                            border: '2px solid var(--md-sys-color-primary)'
                          }}>
                            {barber.name.charAt(0)}
                          </div>
                          <div>
                            <h4 style={{ fontWeight: '900', fontSize: '16px' }}>كرسي الحلاق {barber.name}</h4>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>{barber.role}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* خيار 3: طباعة لافتة رمز الاستجابة السريعة (QR Code Signage) */}
                  <div 
                    className="glass-card clickable-card animate-scale"
                    onClick={handlePrintQr}
                    style={{
                      padding: '24px 32px',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, rgba(233, 193, 118, 0.04) 0%, rgba(0, 0, 0, 0.1) 100%)',
                      border: '1.5px dashed var(--md-sys-color-primary)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-1)';
                    }}
                  >
                    <span style={{ fontSize: '36px' }}>🖨️</span>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--md-sys-color-primary)' }}>طباعة رمز الاستجابة السريعة (QR Code) للحجوزات</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px', maxWidth: '500px', margin: 0 }}>
                      اضغط هنا لفتح واجهة جاهزة للطباعة تحتوي على رمز الـ QR الخاص بصفحة حجز الزبائن لتتمكن من تعليقها كلوحة إرشادية داخل الصالون.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. شاشة الطوابير المشتركة (Combined Dashboard) */}
            {dashboardMode === "combined" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }} className="animate-fade">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--md-sys-color-outline)', paddingBottom: '16px' }}>
                  <div style={{ textAlign: "right" }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--md-sys-color-primary)' }}>التسلسلات المجتمعة (كافة الصالون)</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>طوابير الانتظار والعملاء النشطين على الكراسي لجميع الحلاقين معاً.</p>
                  </div>
                </div>

                {loading ? (
                  <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <div style={{ border: '3px solid var(--md-sys-color-outline)', borderTop: '3px solid var(--md-sys-color-primary)', borderRadius: '50%', width: '36px', height: '36px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>جاري جلب طوابير الحلاقين...</span>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                    {BARBERS.map(barber => {
                      const barberApps = appointments.filter(app => app.barber_id.toString() === barber.id.toString());
                      const activeApps = barberApps.filter(app => app.status === 'pending');
                      const servingApp = barberApps.find(app => app.status === 'serving');
                      
                      return (
                        <div key={barber.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '400px' }}>
                          {/* رأس العمود */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1.5px dashed var(--md-sys-color-outline)', paddingBottom: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: 'var(--md-sys-color-primary-container)',
                              color: 'var(--md-sys-color-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px',
                              fontWeight: '800',
                              border: '2px solid var(--md-sys-color-primary)'
                            }}>
                              {barber.name.charAt(0)}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <h3 style={{ fontSize: '16px', fontWeight: '900' }}>كرسي الحلاق {barber.name}</h3>
                              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{activeApps.length} زبائن بالانتظار</span>
                            </div>
                          </div>

                          {/* العميل النشط على الكرسي */}
                          <div style={{
                            background: servingApp ? 'linear-gradient(135deg, var(--md-sys-color-primary) 0%, var(--accent-gold-dark) 100%)' : 'var(--md-sys-color-surface-container)',
                            borderRadius: '12px',
                            padding: '16px',
                            color: servingApp ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
                            minHeight: '80px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '12px'
                          }}>
                            <div>
                              <span style={{ fontSize: '9px', fontWeight: '800', background: 'rgba(0,0,0,0.15)', padding: '2px 8px', borderRadius: '10px', display: 'inline-block' }}>الكرسي النشط ✂️</span>
                              {servingApp ? (
                                <h4 style={{ fontSize: '16px', fontWeight: '900', marginTop: '8px' }}>{servingApp.customer_name}</h4>
                              ) : (
                                <h4 style={{ fontSize: '12px', fontWeight: '700', marginTop: '8px' }}>لا يوجد زبائن على الكرسي</h4>
                              )}
                            </div>
                            {servingApp && (
                              <button
                                onClick={() => handleStatusUpdate(servingApp.id, 'completed')}
                                disabled={actionLoading}
                                style={{
                                  background: '#ffffff',
                                  color: 'var(--md-sys-color-primary)',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  cursor: 'pointer',
                                  width: 'fit-content'
                                }}
                              >
                                إكمال الخدمة
                              </button>
                            )}
                          </div>

                          {/* قائمة الانتظار */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)' }}>طابور الانتظار:</span>
                            {activeApps.length === 0 ? (
                              <div style={{ textAlign: 'center', padding: '32px 0', border: '1px dashed var(--md-sys-color-outline)', borderRadius: '12px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>الطابور فارغ اليوم</span>
                              </div>
                            ) : (
                              activeApps.map((app, index) => (
                                <div 
                                  key={app.id}
                                  style={{
                                    background: 'var(--md-sys-color-surface-container-low)',
                                    border: '1px solid var(--md-sys-color-outline)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px'
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: 'var(--md-sys-color-primary-container)',
                                        color: 'var(--md-sys-color-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '800',
                                        fontSize: '11px'
                                      }}>
                                        {index + 1}
                                      </div>
                                      <span style={{ fontWeight: '800', fontSize: '13px' }}>{app.customer_name}</span>
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--md-sys-color-primary)' }}>{app.appointment_time}</span>
                                  </div>

                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{app.service_name}</span>
                                    
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                      {/* زر ابدأ الجلسة */}
                                      <button
                                        onClick={() => handleStatusUpdate(app.id, 'serving')}
                                        title="ابدأ الجلسة"
                                        style={{
                                          background: 'var(--md-sys-color-primary)',
                                          color: '#ffffff',
                                          border: 'none',
                                          padding: '4px 10px',
                                          borderRadius: '8px',
                                          fontSize: '11px',
                                          fontWeight: '800',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        ابدأ
                                      </button>

                                      {/* زر إرسال السرة */}
                                      <a
                                        href={getWhatsAppLink(app.customer_phone, "السلام عليكم وصلك السرة على الواتساب للزبون")}
                                        target="_blank"
                                        rel="noreferrer"
                                        title="إرسال رسالة وصلك السرة"
                                        style={{
                                          background: 'rgba(212, 175, 55, 0.1)',
                                          color: 'var(--md-sys-color-primary)',
                                          width: '28px',
                                          height: '28px',
                                          borderRadius: '50%',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                      >
                                        <SvgBell />
                                      </a>

                                      {/* زر الاتصال بالواتساب */}
                                      <a
                                        href={getWhatsAppLink(app.customer_phone)}
                                        target="_blank"
                                        rel="noreferrer"
                                        title="مراسلة واتساب"
                                        style={{
                                          background: 'rgba(5, 150, 105, 0.1)',
                                          color: '#059669',
                                          width: '28px',
                                          height: '28px',
                                          borderRadius: '50%',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                      >
                                        <SvgWhatsapp />
                                      </a>

                                      {/* إلغاء الحجز */}
                                      <button
                                        onClick={() => handleStatusUpdate(app.id, 'cancelled')}
                                        title="إلغاء الموعد"
                                        style={{
                                          background: 'var(--md-sys-color-error-container)',
                                          color: 'var(--md-sys-color-error)',
                                          border: 'none',
                                          width: '28px',
                                          height: '28px',
                                          borderRadius: '50%',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          cursor: 'pointer'
                                        }}
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
            )}

            {/* 3. لوحة التحكم الفردية للحلاق (Barber View) */}
            {dashboardMode === "barber" && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "32px",
              }} className="dashboard-grid-responsive animate-fade">
                
                {/* العمود الأيمن: إدارة الكرسي وطابور الانتظار النشط (Main Panel) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                  
                  {/* كارت 1: العميل النشط حالياً على الكرسي (M3 Hero Card) */}
                  <div style={{
                    background: "linear-gradient(135deg, var(--md-sys-color-primary) 0%, var(--accent-gold-dark) 100%)",
                    borderRadius: "var(--md-sys-shape-corner-extra-large)",
                    padding: "24px",
                    color: "var(--md-sys-color-on-primary)",
                    boxShadow: "var(--md-sys-elevation-2)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "160px",
                    position: "relative",
                    overflow: "hidden"
                  }}>
                    <div style={{ zIndex: 2 }}>
                      <span style={{ fontSize: "10px", textTransform: "uppercase", fontWeight: "900", background: "rgba(18, 20, 20, 0.15)", padding: "4px 10px", borderRadius: "12px", display: "inline-block", color: "var(--md-sys-color-on-primary)" }}>
                        الحالة الحالية على الكرسي ✂️
                      </span>
                      {servingAppointment ? (
                        <div style={{ marginTop: "16px" }}>
                          <h3 style={{ fontSize: "24px", fontWeight: "900", color: "var(--md-sys-color-on-primary)" }}>{servingAppointment.customer_name}</h3>
                          <p style={{ fontSize: "13px", opacity: 0.9, marginTop: "4px", color: "var(--md-sys-color-on-primary)" }}>{servingAppointment.service_name}</p>
                        </div>
                      ) : (
                        <div style={{ marginTop: "18px" }}>
                          <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--md-sys-color-on-primary)" }}>لا يوجد زبائن على الكرسي حالياً</h3>
                          <p style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px", color: "var(--md-sys-color-on-primary)" }}>قم ببدء الجلسة لأول عميل في طابور الانتظار.</p>
                        </div>
                      )}
                    </div>

                    {servingAppointment && (
                      <button
                        onClick={() => handleStatusUpdate(servingAppointment.id, 'completed')}
                        disabled={actionLoading}
                        style={{
                          background: "var(--md-sys-color-on-primary)",
                          color: "var(--md-sys-color-primary)",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "var(--md-sys-shape-corner-full)",
                          fontSize: "13px",
                          fontWeight: "900",
                          cursor: "pointer",
                          width: "fit-content",
                          marginTop: "16px",
                          zIndex: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          transition: "transform 0.2s ease"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <SvgCheck />
                        <span>إكمال الجلسة وتفريغ الكرسي</span>
                      </button>
                    )}
                    
                    {/* تأثير بيكسل جمالي خلفي */}
                    <div style={{ position: "absolute", bottom: "-20px", left: "-20px", opacity: 0.15, transform: "rotate(30deg)", pointerEvents: "none" }}>
                      <SvgScissors />
                    </div>
                  </div>

                  {/* قائمة الانتظار النشطة */}
                  <div className="glass-card" style={{ padding: "28px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px dashed var(--md-sys-color-outline)", paddingBottom: "16px", marginBottom: "20px" }}>
                      <div style={{ textAlign: "right" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: "900" }}>طابور الانتظار الفعلي للكرسي ({activeAppointments.length} زبائن)</h3>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>العملاء المصطفين والذين ينتظرون دورهم الفعلي للصعود.</p>
                      </div>
                    </div>

                    {loading ? (
                      <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div style={{ border: '3px solid var(--md-sys-color-outline)', borderTop: '3px solid var(--md-sys-color-primary)', borderRadius: '50%', width: '28px', height: '28px', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}></div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>مزامنة الطوابير والاتصال بالخادم...</span>
                      </div>
                    ) : activeAppointments.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '48px 16px', border: '1.5px dashed var(--md-sys-color-outline)', borderRadius: '20px' }}>
                        <span style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }}>📭</span>
                        <h4 style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: "800" }}>لا يوجد زبائن قيد الانتظار في طابور اليوم</h4>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {activeAppointments.map((app, index) => {
                          return (
                            <div 
                              key={app.id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                background: "var(--md-sys-color-surface-container-low)",
                                border: "1px solid var(--md-sys-color-outline)",
                                borderRadius: "16px",
                                padding: "16px 20px",
                                transition: "all 0.2s ease"
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <div style={{
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "50%",
                                  background: "var(--md-sys-color-primary-container)",
                                  color: "var(--md-sys-color-primary)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: "900",
                                  fontSize: "15px"
                                }}>
                                  {index + 1}
                                </div>
                                <div style={{ textAlign: "right" }}>
                                  <h5 style={{ fontSize: "15px", fontWeight: "900" }}>{app.customer_name}</h5>
                                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>{app.service_name} • ⏱️ {getDurationByService(app.service_name)}</span>
                                </div>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <div style={{ textAlign: "left" }}>
                                  <span style={{ fontSize: "14px", fontWeight: "800", color: "var(--md-sys-color-primary)" }}>{app.appointment_time}</span>
                                  <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block", marginTop: "2px" }}>رمز: {app.booking_code}</span>
                                </div>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  <button 
                                    onClick={() => handleStatusUpdate(app.id, 'serving')}
                                    style={{
                                      background: "var(--md-sys-color-primary)",
                                      color: "#ffffff",
                                      border: "none",
                                      padding: "8px 16px",
                                      borderRadius: "12px",
                                      fontSize: "12px",
                                      fontWeight: "800",
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "6px"
                                    }}
                                  >
                                    <SvgScissors />
                                    <span>ابدأ الجلسة</span>
                                  </button>
                                  
                                  {/* زر إشعار السرة بالواتساب */}
                                  <a 
                                    href={getWhatsAppLink(app.customer_phone, "السلام عليكم وصلك السرة على الواتساب للزبون")} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    style={{ 
                                      background: "var(--md-sys-color-surface-container)", 
                                      color: "var(--md-sys-color-primary)", 
                                      width: "36px", 
                                      height: "36px", 
                                      borderRadius: "50%", 
                                      display: "flex", 
                                      alignItems: "center", 
                                      justifyContent: "center",
                                      transition: "background 0.2s ease"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--md-sys-color-surface-container)'}
                                    title="إرسال إشعار السرة للزبون"
                                  >
                                    <SvgBell />
                                  </a>

                                  <a 
                                    href={getWhatsAppLink(app.customer_phone)} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    style={{ 
                                      background: "var(--md-sys-color-surface-container)", 
                                      color: "#059669", 
                                      width: "36px", 
                                      height: "36px", 
                                      borderRadius: "50%", 
                                      display: "flex", 
                                      alignItems: "center", 
                                      justifyContent: "center",
                                      transition: "background 0.2s ease"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(5, 150, 105, 0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--md-sys-color-surface-container)'}
                                    title="مراسلة العميل"
                                  >
                                    <SvgWhatsapp />
                                  </a>
                                  
                                  <button 
                                    onClick={() => handleStatusUpdate(app.id, 'cancelled')}
                                    style={{ 
                                      background: "var(--md-sys-color-error-container)", 
                                      color: "var(--md-sys-color-error)", 
                                      border: "none", 
                                      width: "36px", 
                                      height: "36px", 
                                      borderRadius: "50%", 
                                      display: "flex", 
                                      alignItems: "center", 
                                      justifyContent: "center",
                                      cursor: "pointer",
                                      transition: "opacity 0.2s ease"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                    title="إلغاء الموعد"
                                  >
                                    <SvgCancel />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
                
                {/* العمود الأيسر: الإحصائيات والإعدادات والعمليات المكتملة (Sidebar Panel) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                  
                  {/* كارت طباعة رمز الاستجابة السريعة */}
                  <div 
                    className="glass-card clickable-card" 
                    onClick={handlePrintQr}
                    style={{ 
                      padding: "20px",
                      cursor: "pointer",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                      background: 'linear-gradient(135deg, rgba(233, 193, 118, 0.04) 0%, rgba(0, 0, 0, 0.1) 100%)',
                      border: "1.5px dashed var(--md-sys-color-primary)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-1)';
                    }}
                  >
                    <span style={{ fontSize: "28px" }}>🖨️</span>
                    <span style={{ fontSize: "14px", fontWeight: "900", color: "var(--md-sys-color-primary)" }}>طباعة رمز QR للحجز</span>
                    <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: 0 }}>اطبع لافتة الحجز الخاصة بالزبائن وعلقها بالصالون</p>
                  </div>

                  {/* كارت 2: الإحصائيات (Bento block) */}
                  <div className="glass-card" style={{ padding: "24px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--md-sys-color-primary)" }}>حالة طابور الكراسي اليوم</span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", margin: "16px 0", textAlign: "center" }}>
                      <div style={{ background: "var(--md-sys-color-surface-container)", padding: "10px 6px", borderRadius: "14px" }}>
                        <div style={{ fontSize: "20px", fontWeight: "900", color: "var(--status-pending-text)" }}>{barberStats.pending}</div>
                        <div style={{ fontSize: "10px", color: "var(--text-secondary)", marginTop: "2px" }}>بالانتظار</div>
                      </div>
                      <div style={{ background: "var(--md-sys-color-surface-container)", padding: "10px 6px", borderRadius: "14px" }}>
                        <div style={{ fontSize: "20px", fontWeight: "900", color: "var(--status-serving-text)" }}>{barberStats.serving}</div>
                        <div style={{ fontSize: "10px", color: "var(--text-secondary)", marginTop: "2px" }}>على الكرسي</div>
                      </div>
                      <div style={{ background: "var(--md-sys-color-surface-container)", padding: "10px 6px", borderRadius: "14px" }}>
                        <div style={{ fontSize: "20px", fontWeight: "900", color: "var(--status-completed-text)" }}>{barberStats.completed}</div>
                        <div style={{ fontSize: "10px", color: "var(--text-secondary)", marginTop: "2px" }}>مكتملة</div>
                      </div>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", textAlign: "right" }}>إجمالي مواعيد اليوم: {appointments.length} مواعيد</span>
                  </div>


                  {/* بطاقة المواعيد السابقة والمكتملة */}
                  <div className="glass-card" style={{ padding: "24px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "900", borderBottom: "1.5px dashed var(--md-sys-color-outline)", paddingBottom: "12px", marginBottom: "16px" }}>سجل ومكتملات اليوم ({pastAppointments.length} عمليات)</h3>
                    
                    {pastAppointments.length === 0 ? (
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", padding: "16px 0" }}>لا يوجد عمليات مكتملة أو ملغاة بعد لليوم.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {pastAppointments.map((app) => (
                          <div 
                            key={app.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "12px 16px",
                              borderRadius: "14px",
                              background: "var(--md-sys-color-surface-container)",
                              fontSize: "13px"
                            }}
                          >
                            <div style={{ textAlign: "right" }}>
                              <span style={{ fontWeight: "800", color: "var(--text-primary)" }}>{app.customer_name}</span>
                              <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>{app.service_name}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <span style={{ fontWeight: "700" }}>{app.appointment_time}</span>
                              <span className={`status-badge ${app.status}`} style={{ fontSize: "10px", padding: "3px 10px" }}>
                                {app.status === 'completed' ? "مكتملة" : "ملغاة"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
                
              </div>
            )}

          </div>
        </div>
      )}

      {/* نافذة الـ QR المنبثقة الماتريال */}
      {showQrModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '380px', textAlign: 'center', borderRadius: "var(--md-sys-shape-corner-extra-large)" }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', color: 'var(--md-sys-color-primary)', fontWeight: "900" }}>واجهة حجز الزوار</h3>
              <button className="modal-close" onClick={() => setShowQrModal(false)}>&times;</button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '20px', lineHeight: '1.5' }}>
              اعرض الرمز التالي لزوار الصالون لتمكينهم من الحجز اللحظي مباشرة من هواتفهم والدخول التلقائي في طابور الانتظار للكرسي.
            </p>

            {qrUrl ? (
              <div style={{ 
                background: '#ffffff', 
                padding: '12px', 
                borderRadius: 'var(--radius-lg)', 
                border: '2px solid var(--md-sys-color-primary)', 
                display: 'inline-block', 
                marginBottom: '20px' 
              }}>
                <img src={qrUrl} alt="QR Code" style={{ width: '180px', height: '180px', display: 'block' }} />
              </div>
            ) : (
              <div style={{ width: '180px', height: '180px', background: "var(--md-sys-color-surface-container)", borderRadius: "12px", marginBottom: "20px" }}></div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <a href="/book" target="_blank" rel="noreferrer" className="btn-gold" style={{ flex: 1.2, textDecoration: 'none', padding: '10px 0', fontSize: '12px', borderRadius: "20px" }}>
                تجربة الحجز الذاتي
              </a>
              <button className="btn-outline" onClick={() => setShowQrModal(false)} style={{ flex: 0.8, padding: '10px 0', fontSize: '12px', borderRadius: "20px" }}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة إدخال الرمز السري للحلاق (Barber PIN Modal) */}
      {pinModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '380px', textAlign: 'center', borderRadius: "var(--md-sys-shape-corner-extra-large)" }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', color: 'var(--md-sys-color-primary)', fontWeight: "900" }}>التحقق من الرمز المهني (PIN)</h3>
              <button className="modal-close" onClick={() => setPinModalOpen(false)}>&times;</button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '20px', lineHeight: '1.5' }}>
              يرجى إدخال الرمز السري للحلاق {BARBERS.find(b => b.id === pinBarberId)?.name} لتتمكن من الوصول للوحة التحكم الخاصة بكريسه.
            </p>

            {pinError && (
              <div style={{ 
                background: 'var(--md-sys-color-error-container)', 
                border: '1px solid var(--md-sys-color-error)', 
                color: 'var(--md-sys-color-on-error-container)', 
                padding: '10px', 
                borderRadius: '10px', 
                marginBottom: '15px', 
                fontSize: '11px' 
              }}>
                {pinError}
              </div>
            )}

            <form onSubmit={handlePinSubmit}>
              <input 
                type="password" 
                placeholder="••••"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                required
                style={{ 
                  letterSpacing: '8px', 
                  textAlign: 'center', 
                  fontSize: '20px', 
                  fontWeight: '800',
                  padding: '10px',
                  borderRadius: '12px',
                  background: 'rgba(0,0,0,0.1)',
                  borderColor: 'var(--md-sys-color-outline)',
                  width: '150px',
                  margin: '0 auto 20px',
                  display: 'block'
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="btn-gold" style={{ flex: 1.2, padding: '10px 0', fontSize: '12px', borderRadius: "20px" }}>
                  تأكيد الدخول
                </button>
                <button type="button" className="btn-outline" onClick={() => setPinModalOpen(false)} style={{ flex: 0.8, padding: '10px 0', fontSize: '12px', borderRadius: "20px" }}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
