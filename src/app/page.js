"use client";

import { useState, useEffect } from "react";

// تمكين تشغيل الصفحة على بيئة Edge المتوافقة مع Cloudflare Pages
export const runtime = 'edge';

const SERVICES = [
  { id: "s1", name: "قص شعر كلاسيكي", price: 0, duration: "30 دقيقة", desc: "قص وتصفيف الشعر بالطريقة التقليدية أو الحديثة مع غسيل خفيف وسشوار" },
  { id: "s2", name: "حلاقة لحية وتحديد", price: 0, duration: "20 دقيقة", desc: "تحديد اللحية بالموس الحاد التقليدي مع استخدام كريم ترطيب بالصبار" },
  { id: "s3", name: "باقة الخدمات المتكاملة", price: 0, duration: "60 دقيقة", desc: "قص شعر + حلاقة لحية + حمام كريم بالبروتين + صنفرة للوجه مع فوطة معطرة" },
  { id: "s4", name: "صبغة شعر أو لحية احترافية", price: 0, duration: "45 دقيقة", desc: "صبغ الشعر أو اللحية بألوان طبيعية خالية من الأمونيا ومواد آمنة تماماً" },
  { id: "s5", name: "تنظيف البشرة والعناية بالوجه", price: 0, duration: "30 دقيقة", desc: "تنظيف عميق بجهاز البخار لإزالة الرؤوس السوداء مع ماسك الفحم النشط والترطيب" }
];

const TIME_SLOTS = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", 
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", 
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", 
  "20:00", "20:30", "21:00", "21:30"
];

// --- أيقونات متجهة SVG عالية الجودة ---
const formatTimeTo12h = (timeStr) => {
  if (!timeStr) return "";
  const [hourStr, minuteStr] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "م" : "ص";
  hour = hour % 12;
  hour = hour ? hour : 12;
  return `${hour}:${minuteStr} ${ampm}`;
};

const SvgScissors = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>
);
const SvgClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const SvgUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const SvgCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const SvgSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const SvgCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const SvgCancel = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
);
const SvgWhatsapp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
);
const SvgStar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);

export default function Home() {
  const [activeTab, setActiveTab] = useState("book"); // book, track
  const [menuOpen, setMenuOpen] = useState(false);
  const [barbers, setBarbers] = useState([]);
  const [isDbMock, setIsDbMock] = useState(false);
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
  
  // خطوة Stepper الحالية
  const [currentStep, setCurrentStep] = useState(1); // 1: Barber, 2: Date/Time, 3: Confirm

  // حالات الحجز الجديد
  const [selectedBarberId, setSelectedBarberId] = useState("");
  const [selectedService, setSelectedService] = useState({ id: "s0", name: "قص شعر وحلاقة", price: 0, duration: "30 دقيقة" });
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [reservedSlots, setReservedSlots] = useState([]);
  const [activeSlots, setActiveSlots] = useState([]);
  const [isCustomHoliday, setIsCustomHoliday] = useState(false);

  // حالات التتبع التلقائي وبحسب الحلاق
  const [trackBarberId, setTrackBarberId] = useState("");
  const [trackQueue, setTrackQueue] = useState([]);
  const [myBookingInTrack, setMyBookingInTrack] = useState(null);
  
  // حالات الاستعلام والتعديل
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newRescheduleDate, setNewRescheduleDate] = useState("");
  const [newRescheduleTime, setNewRescheduleTime] = useState("");
  const [rescheduleReservedSlots, setRescheduleReservedSlots] = useState([]);
  const [rescheduleActiveSlots, setRescheduleActiveSlots] = useState([]);
  const [rescheduleIsCustomHoliday, setRescheduleIsCustomHoliday] = useState(false);
  
  // حالات النجاح والمؤقت
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fullDayQueue, setFullDayQueue] = useState([]);

  const selectedBarber = barbers.find(b => b.id.toString() === selectedBarberId.toString());

  const getArabicDayOfWeek = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('ar-SA', { weekday: 'long' });
  };

  const selectedDayName = getArabicDayOfWeek(selectedDate);
  const isRestDay = selectedBarber?.rest_days 
    ? selectedBarber.rest_days.split(",").includes(selectedDayName) 
    : false;

  const todaySaudi = new Date(new Date().getTime() + (3 * 60 * 60 * 1000)).toISOString().split('T')[0];
  const isToday = selectedDate === todaySaudi;

  const nowSaudi = new Date(new Date().getTime() + (3 * 60 * 60 * 1000));
  const currentHour = nowSaudi.getUTCHours();
  const currentMinute = nowSaudi.getUTCMinutes();

  const rescheduleBarber = searchResult ? barbers.find(b => b.id.toString() === searchResult.appointment.barber_id.toString()) : null;
  const rescheduleDayName = getArabicDayOfWeek(newRescheduleDate);
  const isRescheduleRestDay = rescheduleBarber?.rest_days 
    ? rescheduleBarber.rest_days.split(",").includes(rescheduleDayName) 
    : false;
  const isRescheduleToday = newRescheduleDate === todaySaudi;



  const fetchFullQueue = async (barberId, date) => {
    try {
      const response = await fetch(`/api/appointments?barber_id=${barberId}&date=${date}`);
      const data = await response.json();
      if (data.success) {
        setFullDayQueue(data.appointments);
      }
    } catch (err) {
      console.error("Error fetching queue:", err);
    }
  };

  useEffect(() => {
    fetch("/api/setup")
      .then(res => res.json())
      .then(setupData => {
        setIsDbMock(setupData.mock);
        return fetch("/api/barbers");
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBarbers(data.barbers);
          if (data.barbers.length > 0) {
            setSelectedBarberId(data.barbers[0].id.toString());
            setTrackBarberId(data.barbers[0].id.toString());
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Initialization error:", err);
        setLoading(false);
      });

    const today = new Date();
    const saudiToday = new Date(today.getTime() + (3 * 60 * 60 * 1000));
    const formattedDate = saudiToday.toISOString().split("T")[0];
    setSelectedDate(formattedDate);
    setNewRescheduleDate(formattedDate);
  }, []);

  useEffect(() => {
    if (!selectedBarberId || !selectedDate) return;

    fetch(`/api/appointments?barber_id=${selectedBarberId}&date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const taken = data.appointments
            .filter(app => app.status !== 'cancelled')
            .map(app => app.appointment_time);
          setReservedSlots(taken);
        }
      })
      .catch(err => console.error("Error fetching reserved slots:", err));

    fetch(`/api/barber-slots?barber_id=${selectedBarberId}&date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setActiveSlots(data.slots || []);
          setIsCustomHoliday(!!data.isHoliday);
        }
      })
      .catch(err => console.error("Error fetching active slots:", err));
  }, [selectedBarberId, selectedDate]);

  useEffect(() => {
    if (!searchResult || !newRescheduleDate) return;

    fetch(`/api/appointments?barber_id=${searchResult.appointment.barber_id}&date=${newRescheduleDate}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const taken = data.appointments
              .filter(app => app.status !== 'cancelled' && app.booking_code !== searchResult.appointment.booking_code)
              .map(app => app.appointment_time);
          setRescheduleReservedSlots(taken);
        }
      })
      .catch(err => console.error("Error fetching reschedule slots:", err));

    fetch(`/api/barber-slots?barber_id=${searchResult.appointment.barber_id}&date=${newRescheduleDate}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRescheduleActiveSlots(data.slots || []);
          setRescheduleIsCustomHoliday(!!data.isHoliday);
        }
      })
      .catch(err => console.error("Error fetching reschedule slots:", err));
  }, [newRescheduleDate, searchResult]);

  const handleBookingSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedBarberId || !selectedTime || !customerName || !customerPhone) {
      setErrorMessage("يرجى تعبئة كافة الحقول السابقة لإكمال تأكيد الحجز.");
      return;
    }

    setErrorMessage("");
    setActionLoading(true);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barber_id: parseInt(selectedBarberId),
          customer_name: customerName,
          customer_phone: customerPhone,
          service_name: "قص شعر وحلاقة",
          service_price: 0,
          appointment_date: selectedDate,
          appointment_time: selectedTime
        })
      });

      const data = await response.json();
      if (data.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem("my_last_booking_code", data.appointment.booking_code);
        }
        setBookingSuccess({
          appointment: data.appointment,
          queue: data.queue,
          barber: barbers.find(b => b.id === parseInt(selectedBarberId))
        });
        setCustomerName("");
        setCustomerPhone("");
        setSelectedTime("");
        setReservedSlots([...reservedSlots, selectedTime]);
        setCurrentStep(1); // العودة للخطوة الأولى في المستقبل
      } else {
        setErrorMessage(data.error || "عذراً، حدثت مشكلة أثناء إرسال الحجز.");
      }
    } catch (err) {
      setErrorMessage("فشل الاتصال بالخادم. يرجى المزامنة وإعادة التجربة.");
    } finally {
      setActionLoading(false);
    }
  };

  const fetchTrackQueue = async () => {
    if (!trackBarberId) return;
    try {
      const response = await fetch(`/api/appointments?barber_id=${trackBarberId}&date=${todaySaudi}`);
      const data = await response.json();
      if (data.success) {
        setTrackQueue(data.appointments);
        
        // التحقق من كود الحجز المخزن باللوكال ستوريج
        if (typeof window !== "undefined") {
          const myCode = localStorage.getItem("my_last_booking_code");
          if (myCode) {
            const foundApp = data.appointments.find(app => app.booking_code === myCode);
            if (foundApp) {
              const activeApps = data.appointments.filter(app => app.status === 'pending' || app.status === 'serving');
              const posIndex = activeApps.findIndex(app => app.booking_code === myCode);
              setMyBookingInTrack({
                appointment: foundApp,
                position: posIndex !== -1 ? posIndex + 1 : null,
                ahead: posIndex > 0 ? posIndex : 0,
                barber: barbers.find(b => b.id.toString() === trackBarberId.toString())
              });
            } else {
              setMyBookingInTrack(null);
            }
          } else {
            setMyBookingInTrack(null);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching track queue:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "track" && trackBarberId) {
      fetchTrackQueue();
    }
  }, [activeTab, trackBarberId, barbers]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchError("");
    setSearchResult(null);
    setActionLoading(true);

    try {
      const isPhone = /^[0-9]+$/.test(searchQuery.trim());
      const param = isPhone ? `phone=${searchQuery.trim()}` : `code=${searchQuery.trim()}`;
      
      const response = await fetch(`/api/appointments?${param}`);
      const data = await response.json();

      if (data.success) {
        if (isPhone) {
          if (data.appointments.length === 0) {
            setSearchError("لا توجد مواعيد نشطة مسجلة برقم الجوال هذا.");
          } else {
            const activeApp = data.appointments[0];
            if (typeof window !== "undefined") {
              localStorage.setItem("my_last_booking_code", activeApp.booking_code);
            }
            setSearchResult({
              appointment: activeApp,
              queue: activeApp.queue,
              barber: barbers.find(b => b.id === activeApp.barber_id),
              allAppointments: data.appointments
            });
            fetchFullQueue(activeApp.barber_id, activeApp.appointment_date);
            // تحديث اختيار الحلاق في التتبع ليتوافق مع الحجز المبحوث عنه تلقائياً
            setTrackBarberId(activeApp.barber_id.toString());
          }
        } else {
          if (typeof window !== "undefined") {
            localStorage.setItem("my_last_booking_code", data.appointment.booking_code);
          }
          setSearchResult({
            appointment: data.appointment,
            queue: data.queue,
            barber: barbers.find(b => b.id === data.appointment.barber_id)
          });
          fetchFullQueue(data.appointment.barber_id, data.appointment.appointment_date);
          setTrackBarberId(data.appointment.barber_id.toString());
        }
      } else {
        setSearchError(data.error || "رمز الحجز غير متوفر أو غير مدخل بالشكل الصحيح.");
      }
    } catch (err) {
      setSearchError("حدث خطأ أثناء المزامنة.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async (bookingCode) => {
    if (!confirm("هل أنت متأكد من رغبتك في إلغاء حجز الجلسة بالكامل؟")) return;

    setActionLoading(true);
    try {
      const response = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancel",
          booking_code: bookingCode
        })
      });
      const data = await response.json();
      if (data.success) {
        alert("تم إلغاء الحجز بنجاح ونقله للأرشيف.");
        if (searchResult) {
          setSearchResult({
            ...searchResult,
            appointment: { ...searchResult.appointment, status: "cancelled" },
            queue: null
          });
          fetchFullQueue(searchResult.appointment.barber_id, searchResult.appointment.appointment_date);
        }
      } else {
        alert(data.error || "فشل إلغاء الحجز.");
      }
    } catch (err) {
      alert("فشل الاتصال بالخادم لإلغاء الحجز.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newRescheduleDate || !newRescheduleTime) {
      alert("يرجى اختيار التاريخ والوقت الجديدين أولاً.");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reschedule",
          booking_code: searchResult.appointment.booking_code,
          appointment_date: newRescheduleDate,
          appointment_time: newRescheduleTime
        })
      });

      const data = await response.json();
      if (data.success) {
        alert("تم تغيير موعد الحجز بنجاح وتحديث موقعك في الطابور المباشر!");
        setSearchResult({
          ...searchResult,
          appointment: data.appointment,
          queue: data.queue
        });
        setIsRescheduling(false);
        fetchFullQueue(data.appointment.barber_id, data.appointment.appointment_date);
      } else {
        alert(data.error || "فشل تعديل موعد الحجز.");
      }
    } catch (err) {
      alert("فشل الاتصال بالخادم لتعديل الموعد.");
    } finally {
      setActionLoading(false);
    }
  };

  const getSaudiDateFormatted = (dateStr) => {
    if (!dateStr) return "";
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('ar-SA', options);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '20px', background: 'var(--bg-primary)' }}>
        <div style={{ border: '3.5px solid var(--md-sys-color-outline)', borderTop: '3.5px solid var(--md-sys-color-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'var(--md-sys-color-primary)', fontWeight: '800', fontSize: '15px' }}>تحميل بوابة حجز المواعيد...</p>
        <style jsx>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
      
      {/* بنر المعاينة */}
      {isDbMock && (
        <div className="demo-banner">
          <span>أكشاك الحجز ونظام المحاكاة الذاتي نشط.</span>
          <a href="/barber" className="demo-banner-btn" style={{ textDecoration: 'none' }}>فتح واجهة إدارة الموظفين ✂️</a>
        </div>
      )}

      {/* الهيدر العلوي */}
      <header style={{ position: 'sticky', top: 0, zIndex: 990, borderBottom: '1px solid var(--md-sys-color-outline)', padding: '16px 24px', background: 'var(--md-sys-color-surface)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: "right" }}>
            <span style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '9px', fontWeight: '700', letterSpacing: '1px' }}>بوابة حجز المواعيد</span>
            <h1 className="gold-gradient-text" style={{ fontSize: '16px', fontWeight: '800', marginTop: '1px', lineHeight: 1 }}>حجز المواعيد والخدمات</h1>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
            {/* Hamburger Menu Button with X Animation */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                width: '32px',
                height: '32px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '4px',
                alignItems: 'center',
                flexShrink: 0
              }}
              className="hamburger-btn"
            >
              <span style={{
                display: 'block',
                width: '20px',
                height: '2px',
                background: 'var(--md-sys-color-on-surface)',
                transition: 'all 0.2s ease',
                transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none'
              }} />
              <span style={{
                display: 'block',
                width: '20px',
                height: '2px',
                background: 'var(--md-sys-color-on-surface)',
                transition: 'all 0.2s ease',
                opacity: menuOpen ? 0 : 1
              }} />
              <span style={{
                display: 'block',
                width: '20px',
                height: '2px',
                background: 'var(--md-sys-color-on-surface)',
                transition: 'all 0.2s ease',
                transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none'
              }} />
            </button>

            {/* Desktop Nav Links */}
            <div className="nav-desktop" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button 
                onClick={toggleTheme}
                style={{
                  background: "var(--md-sys-color-surface-container)",
                  border: "1px solid var(--md-sys-color-outline)",
                  color: "var(--md-sys-color-primary)",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                title="تبديل المظهر"
              >
                <SvgThemeToggle />
              </button>
              <button 
                className={`btn-outline ${activeTab === 'book' ? 'active' : ''}`}
                onClick={() => { setActiveTab('book'); setBookingSuccess(null); }}
                style={{
                  padding: '6px 12px',
                  fontSize: '11px',
                  borderRadius: '20px',
                  borderColor: activeTab === 'book' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)',
                  color: activeTab === 'book' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface)',
                  background: activeTab === 'book' ? 'var(--md-sys-color-primary-container)' : 'transparent',
                  cursor: "pointer"
                }}
              >
                <SvgScissors />
                <span>احجز الآن</span>
              </button>
              <button 
                className={`btn-outline ${activeTab === 'track' ? 'active' : ''}`}
                onClick={() => { setActiveTab('track'); setBookingSuccess(null); }}
                style={{
                  padding: '6px 12px',
                  fontSize: '11px',
                  borderRadius: '20px',
                  borderColor: activeTab === 'track' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)',
                  color: activeTab === 'track' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface)',
                  background: activeTab === 'track' ? 'var(--md-sys-color-primary-container)' : 'transparent',
                  cursor: "pointer"
                }}
              >
                <SvgSearch />
                <span>تتبع واستعلام</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav Dropdown with Slide/Fade Animation */}
      <div className="nav-mobile-menu" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: menuOpen ? '12px 16px' : '0px 16px',
        background: 'var(--md-sys-color-surface)',
        borderBottom: menuOpen ? '1px solid var(--md-sys-color-outline)' : 'none',
        textAlign: 'right',
        maxHeight: menuOpen ? '200px' : '0px',
        opacity: menuOpen ? 1 : 0,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <button 
          className={`btn-outline ${activeTab === 'book' ? 'active' : ''}`}
          onClick={() => { setActiveTab('book'); setBookingSuccess(null); setMenuOpen(false); }}
          style={{
            padding: '8px 12px',
            fontSize: '12px',
            borderRadius: '20px',
            borderColor: activeTab === 'book' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)',
            color: activeTab === 'book' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface)',
            background: activeTab === 'book' ? 'var(--md-sys-color-primary-container)' : 'transparent',
            cursor: "pointer",
            width: '100%',
            justifyContent: 'flex-start'
          }}
        >
          <SvgScissors />
          <span>احجز الآن</span>
        </button>
        <button 
          className={`btn-outline ${activeTab === 'track' ? 'active' : ''}`}
          onClick={() => { setActiveTab('track'); setBookingSuccess(null); setMenuOpen(false); }}
          style={{
            padding: '8px 12px',
            fontSize: '12px',
            borderRadius: '20px',
            borderColor: activeTab === 'track' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)',
            color: activeTab === 'track' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface)',
            background: activeTab === 'track' ? 'var(--md-sys-color-primary-container)' : 'transparent',
            cursor: "pointer",
            width: '100%',
            justifyContent: 'flex-start'
          }}
        >
          <SvgSearch />
          <span>تتبع واستعلام</span>
        </button>
        <button 
          onClick={() => { toggleTheme(); setMenuOpen(false); }}
          style={{
            background: "var(--md-sys-color-surface-container)",
            border: "1px solid var(--md-sys-color-outline)",
            color: "var(--md-sys-color-primary)",
            padding: "8px 12px",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            width: '100%',
            fontSize: '12px'
          }}
        >
          <SvgThemeToggle />
          <span>تغيير المظهر</span>
        </button>
      </div>

      {/* المحتوى الرئيسي */}
      <main className="container" style={{ padding: '24px 16px', flex: 1 }}>
        
        {/* ================= التبويب 1: حجز موعد جديد باستخدام رحلة Stepper الماتريال ================= */}
        {activeTab === 'book' && !bookingSuccess && (
          <div className="animate-fade" style={{ maxWidth: '640px', margin: '0 auto' }}>
            
            {/* مؤشر خطوات Stepper للرحلة الذكية */}
            <div className="stepper-container">
              {[
                { step: 1, label: "الحلاق" },
                { step: 2, label: "الموعد" },
                { step: 3, label: "التأكيد" }
              ].map((s, index) => (
                <div key={s.step} className="stepper-step">
                  <div className="stepper-step-inner">
                    <div className={`stepper-circle ${
                      currentStep === s.step 
                        ? "active" 
                        : currentStep > s.step 
                          ? "completed" 
                          : "inactive"
                    }`}>
                      {currentStep > s.step ? "✓" : s.step}
                    </div>
                    <span className={`stepper-label ${currentStep === s.step ? "active" : ""}`}>{s.label}</span>
                  </div>
                  {index < 2 && (
                    <span className="stepper-arrow">←</span>
                  )}
                </div>
              ))}
            </div>

            {errorMessage && (
              <div style={{ background: 'var(--md-sys-color-error-container)', border: '1px solid var(--md-sys-color-error)', color: 'var(--md-sys-color-on-error-container)', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center', fontWeight: '700', fontSize: '13px' }}>
                {errorMessage}
              </div>
            )}

            {/* محتوى خطوات Stepper */}
            <div className="glass-card" style={{ padding: "28px 24px" }}>
              
              {/* الخطوة 1: اختيار الحلاق */}
              {currentStep === 1 && (
                <div className="animate-fade" style={{ textAlign: "right" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--md-sys-color-on-surface)", marginBottom: "14px" }}>١. اختر الحلاق المفضل:</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {barbers.map((barber) => (
                      <div 
                        key={barber.id}
                        className={`barber-card ${selectedBarberId === barber.id.toString() ? 'selected' : ''}`}
                        onClick={() => setSelectedBarberId(barber.id.toString())}
                        style={{ 
                          padding: '12px 16px', 
                          display: 'flex', 
                          flexDirection: 'row', 
                          alignItems: 'center', 
                          gap: '12px', 
                          borderRadius: '12px',
                          border: selectedBarberId === barber.id.toString() ? '2px solid var(--md-sys-color-primary)' : '1px solid var(--md-sys-color-outline)',
                          background: selectedBarberId === barber.id.toString() ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface)'
                        }}
                      >
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '15px',
                          color: selectedBarberId === barber.id.toString() ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)',
                          background: selectedBarberId === barber.id.toString() ? 'var(--md-sys-color-surface-container)' : 'rgba(255,255,255,0.05)',
                          border: selectedBarberId === barber.id.toString() ? '2px solid var(--md-sys-color-primary)' : '1px solid var(--md-sys-color-outline)'
                        }}>
                          {barber.name.charAt(0)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
                          <h5 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>الحلاق {barber.name}</h5>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    type="button" 
                    className="btn-gold" 
                    style={{ width: "100%", marginTop: "24px", padding: "12px", fontSize: "13px", borderRadius: "20px" }}
                    onClick={() => {
                      if (!selectedBarberId) {
                        alert("يرجى اختيار الحلاق المفضل للاستمرار.");
                        return;
                      }
                      setCurrentStep(2);
                    }}
                  >
                    <span>تحديد موعد الجلسة</span>
                  </button>
                </div>
              )}

              {/* الخطوة 2: تاريخ ووقت الجلسة */}
              {currentStep === 2 && (
                <div className="animate-fade" style={{ textAlign: "right" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "900", color: "var(--md-sys-color-primary)", marginBottom: "14px" }}>٢. اختر تاريخ ووقت الجلسة المناسبين:</h3>
                  
                  <div className="form-group" style={{ maxWidth: "260px" }}>
                    <label htmlFor="booking-date" style={{ fontSize: "12px" }}>تاريخ الجلسة المفضل:</label>
                    <input 
                      type="date"
                      id="booking-date"
                      className="form-control"
                      value={selectedDate}
                      min={todaySaudi}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedTime("");
                      }}
                      style={{ padding: "10px", cursor: "pointer" }}
                    />
                  </div>

                  <div style={{ marginTop: "16px" }}>
                    <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>الأوقات والفتحات الزمنية المتاحة:</label>
                    
                    {isRestDay || isCustomHoliday ? (
                      <div style={{
                        background: 'var(--md-sys-color-surface-container)',
                        border: '1.5px dashed var(--md-sys-color-primary)',
                        borderRadius: '16px',
                        padding: '20px 14px',
                        textAlign: 'center'
                      }}>
                        <span style={{ fontSize: '28px', display: 'block' }}>🏖️</span>
                        <h4 style={{ color: 'var(--md-sys-color-primary)', fontWeight: '800', fontSize: '14px' }}>
                          {isCustomHoliday ? "عطلة استثنائية للحلاق" : "إجازة الحلاق الرسمية"}
                        </h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px' }}>
                          خبير العناية <strong>{selectedBarber?.name}</strong> في عطلة ليوم (<strong>{selectedDayName}{isCustomHoliday ? ` الموافق ${selectedDate}` : ""}</strong>). يرجى تحديد تاريخ عمل بديل.
                        </p>
                      </div>
                    ) : (
                      <div className="time-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '6px' }}>
                        {TIME_SLOTS.map((time) => {
                          const isBooked = reservedSlots.includes(time);
                          const [slotHour, slotMinute] = time.split(':').map(Number);
                          const isPast = isToday && (slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute));
                          const isActive = activeSlots.includes(time);
                          
                          const isSlotDisabled = isBooked || isPast || !isActive;
                          
                          return (
                            <button
                              key={time}
                              type="button"
                              className={`time-slot ${isSlotDisabled ? 'disabled' : ''} ${selectedTime === time ? 'selected' : ''}`}
                              disabled={isSlotDisabled}
                              onClick={() => setSelectedTime(time)}
                              style={{ 
                                padding: '8px 2px', 
                                fontSize: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                outline: "none"
                              }}
                            >
                              <span style={{ fontWeight: '800' }}>{formatTimeTo12h(time)}</span>
                              <span style={{ fontSize: '7px', fontWeight: '800', opacity: 0.8 }}>
                                {isBooked ? "محجوز" : isPast ? "فائت" : !isActive ? "استراحة" : "متاح"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                    <button 
                      type="button" 
                      className="btn-gold" 
                      style={{ flex: 1.2, padding: "12px", fontSize: "13px", borderRadius: "20px" }}
                      onClick={() => {
                        if (!selectedTime) {
                          alert("يرجى تحديد وقت الحجز المتاح للاستمرار.");
                          return;
                        }
                        setCurrentStep(3);
                      }}
                    >
                      <span>الاستمرار لتأكيد البيانات</span>
                    </button>
                    <button 
                      type="button" 
                      className="btn-outline" 
                      style={{ flex: 0.8, padding: "12px", fontSize: "13px", borderRadius: "20px" }}
                      onClick={() => setCurrentStep(1)}
                    >
                      <span>السابق</span>
                    </button>
                  </div>
                </div>
              )}

              {/* الخطوة 3: البيانات وتأكيد الحجز النهائي */}
              {currentStep === 3 && (
                <div className="animate-fade" style={{ textAlign: "right" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "900", color: "var(--md-sys-color-primary)", marginBottom: "14px" }}>٣. أدخل معلومات التواصل لإتمام حجز الجلسة الفاخرة:</h3>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="cust-name">اسمك الكريم:</label>
                      <input 
                        type="text"
                        id="cust-name"
                        className="form-control"
                        placeholder="مثال: أحمد عبد الله"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="cust-phone">رقم الجوال الخاص بك للمتابعة:</label>
                      <input 
                        type="tel"
                        id="cust-phone"
                        className="form-control"
                        placeholder="مثال: 0501234567"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* ملخص الموعد المحدد للتأكيد البصري للمستخدم */}
                  <div style={{
                    background: "var(--md-sys-color-surface-container)",
                    border: "1px solid var(--md-sys-color-outline)",
                    borderRadius: "14px",
                    padding: "12px 14px",
                    marginTop: "16px",
                    fontSize: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px"
                  }}>
                    <div>خبير العناية بالرجل: <strong style={{ color: "var(--md-sys-color-primary)" }}>{selectedBarber?.name}</strong></div>
                    <div>الموعد والتاريخ: <strong>{getSaudiDateFormatted(selectedDate)} في تمام {formatTimeTo12h(selectedTime)}</strong></div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                    <button 
                      type="button" 
                      className="btn-gold animate-pulse-glow" 
                      style={{ flex: 1.2, padding: "12px", fontSize: "13px", borderRadius: "20px" }}
                      onClick={handleBookingSubmit}
                      disabled={actionLoading}
                    >
                      <span>{actionLoading ? "جاري تسجيل دورك..." : "تأكيد ودخول الطابور المباشر ⚔️"}</span>
                    </button>
                    <button 
                      type="button" 
                      className="btn-outline" 
                      style={{ flex: 0.8, padding: "12px", fontSize: "13px", borderRadius: "20px" }}
                      onClick={() => setCurrentStep(2)}
                    >
                      <span>السابق</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* بطاقة نجاح الحجز (VIP Boarding ticket) */}
        {activeTab === 'book' && bookingSuccess && (
          <div className="animate-fade" style={{ textAlign: 'center' }}>
            <div style={{ background: 'var(--status-serving-bg)', border: '1px solid rgba(5, 150, 105, 0.2)', color: 'var(--status-serving-text)', padding: '12px', borderRadius: '12px', maxWidth: '440px', margin: '0 auto 16px', fontWeight: '800', fontSize: '13px' }}>
              ✓ تم تسجيل الحجز ودخول طابور صالون الحلاقة بنجاح!
            </div>

            <div className="ticket-wrapper">
              <div className="ticket">
                <div className="ticket-header">
                  <div className="ticket-logo">صالون الحلاقة الفاخر</div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px' }}>بطاقة حجز الجلسة الفاخرة VIP</p>
                  <div className="ticket-code">{bookingSuccess.appointment.booking_code}</div>
                  <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '10px', marginTop: '4px' }}>احفظ الكود لمتابعة أو تعديل الحجز لاحقاً</p>
                </div>

                <div className="ticket-body" style={{ textAlign: "right" }}>
                  <div className="ticket-row">
                    <span className="ticket-label">اسم العميل:</span>
                    <span className="ticket-value">{bookingSuccess.appointment.customer_name}</span>
                  </div>
                  <div className="ticket-row">
                    <span className="ticket-label">خبير التجميل:</span>
                    <span className="ticket-value" style={{ color: 'var(--md-sys-color-primary)' }}>{bookingSuccess.barber?.name}</span>
                  </div>
                  <div className="ticket-row">
                    <span className="ticket-label">الخدمة المجدولة:</span>
                    <span className="ticket-value">{bookingSuccess.appointment.service_name}</span>
                  </div>
                  <div className="ticket-row">
                    <span className="ticket-label">التاريخ واليوم:</span>
                    <span className="ticket-value">{getSaudiDateFormatted(bookingSuccess.appointment.appointment_date)}</span>
                  </div>
                  <div className="ticket-row">
                    <span className="ticket-label">توقيت الصعود للكرسي:</span>
                    <span className="ticket-value" style={{ fontSize: '13px', color: 'var(--md-sys-color-primary)' }}>{formatTimeTo12h(bookingSuccess.appointment.appointment_time)}</span>
                  </div>
                </div>

                <div className="ticket-queue-section">
                  <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '700' }}>تسلسلك في قائمة الانتظار الحالية</span>
                  <div className="queue-number">#{bookingSuccess.queue?.position}</div>
                  <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>
                    {bookingSuccess.queue?.ahead === 0 
                      ? "دورك الآن! يرجى الاستعداد للخدمة ✂️" 
                      : `يوجد عدد ${bookingSuccess.queue?.ahead} زبائن أمامك في الطابور المباشر`
                    }
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button 
                className="btn-gold" 
                onClick={() => { setActiveTab('book'); setBookingSuccess(null); }}
                style={{ padding: '8px 16px', fontSize: '12px', borderRadius: "20px" }}
              >
                <span>حجز جلسة جديدة</span>
              </button>
              <button 
                className="btn-outline" 
                onClick={() => { 
                  setSearchQuery(bookingSuccess.appointment.booking_code);
                  setActiveTab('track');
                  setBookingSuccess(null);
                  fetch(`/api/appointments?code=${bookingSuccess.appointment.booking_code}`)
                    .then(res => res.json())
                    .then(data => {
                      if (data.success) {
                        setSearchResult({
                          appointment: data.appointment,
                          queue: data.queue,
                          barber: barbers.find(b => b.id === data.appointment.barber_id)
                        });
                        setTrackBarberId(data.appointment.barber_id.toString());
                      }
                    });
                }}
                style={{ padding: '8px 16px', fontSize: '12px', borderRadius: "20px" }}
              >
                <span>تتبع الانتظار حياً</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'track' && (
          <div className="animate-fade" style={{ maxWidth: '600px', margin: '0 auto' }}>
            
            {/* اختيار الحلاق للتتبع التلقائي اليوم */}
            <div className="glass-card" style={{ 
              position: 'sticky', 
              top: '58px', 
              zIndex: 980, 
              marginBottom: '16px', 
              padding: "10px 16px", 
              textAlign: "right",
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }}>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', alignItems: 'center', justifyContent: 'flex-start', paddingBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--md-sys-color-primary)', whiteSpace: 'nowrap', marginLeft: '6px' }}>الحلاق:</span>
                {barbers.map((barber) => (
                  <button 
                    key={barber.id}
                    onClick={() => {
                      setTrackBarberId(barber.id.toString());
                      setSearchResult(null);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      border: trackBarberId === barber.id.toString() ? '1.5px solid var(--md-sys-color-primary)' : '1px solid var(--md-sys-color-outline)',
                      background: trackBarberId === barber.id.toString() ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface)',
                      color: trackBarberId === barber.id.toString() ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface)',
                      fontSize: '11px',
                      fontWeight: '800',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>{barber.name}</span>
                    <span style={{ fontSize: '8px', opacity: 0.8 }}>
                      {(barber.rest_days?.split(',') || []).includes(getArabicDayOfWeek(todaySaudi)) ? "🏖️" : "✂️"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* الحجز الخاص بالعميل المكتشف تلقائياً أو عبر البحث */}
            {((myBookingInTrack && trackBarberId === myBookingInTrack.appointment.barber_id.toString()) || searchResult) && !isRescheduling && (
              <div className="glass-card animate-fade" style={{ marginBottom: '16px', padding: "20px", border: '2px solid var(--md-sys-color-primary)', background: 'var(--md-sys-color-primary-container)', textAlign: "right" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--md-sys-color-outline)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div>
                    <span style={{ color: 'var(--md-sys-color-primary)', fontSize: '10px', fontWeight: '800', background: 'rgba(233,193,118,0.15)', padding: '3px 10px', borderRadius: '8px' }}>
                      حجزك النشط الحالي 🌟
                    </span>
                    <h3 style={{ fontSize: '16px', fontWeight: '900', marginTop: '8px' }}>أهلاً بك، {(searchResult?.appointment || myBookingInTrack?.appointment).customer_name}</h3>
                  </div>
                  <span className={`status-badge ${(searchResult?.appointment || myBookingInTrack?.appointment).status}`}>
                    {(searchResult?.appointment || myBookingInTrack?.appointment).status === 'pending' && "قيد الانتظار"}
                    {(searchResult?.appointment || myBookingInTrack?.appointment).status === 'serving' && "على الكرسي حالياً ✂️"}
                    {(searchResult?.appointment || myBookingInTrack?.appointment).status === 'completed' && "مكتملة"}
                    {(searchResult?.appointment || myBookingInTrack?.appointment).status === 'cancelled' && "ملغاة"}
                  </span>
                </div>

                {(searchResult?.appointment || myBookingInTrack?.appointment).status === 'pending' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '14px 0', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid var(--md-sys-color-outline)', textAlign: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>موقعك في طابور الكرسي:</div>
                      <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--md-sys-color-primary)', marginTop: '4px' }}>
                        #{searchResult?.queue?.position || myBookingInTrack?.position}
                      </div>
                    </div>
                    <div style={{ borderLeft: '1px solid var(--md-sys-color-outline)', height: '40px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>الزبائن الذين أمامك:</div>
                      <div style={{ fontSize: '28px', fontWeight: '900', marginTop: '4px' }}>
                        {searchResult?.queue?.ahead !== undefined ? searchResult.queue.ahead : myBookingInTrack?.ahead}
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--md-sys-color-outline)', paddingBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>رمز الحجز الخاص:</span>
                    <span style={{ fontWeight: '800', fontFamily: 'monospace' }}>{(searchResult?.appointment || myBookingInTrack?.appointment).booking_code}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--md-sys-color-outline)', paddingBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>خبير التجميل:</span>
                    <span style={{ fontWeight: '800', color: 'var(--md-sys-color-primary)' }}>{(searchResult?.barber || myBookingInTrack?.barber)?.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--md-sys-color-outline)', paddingBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>تاريخ الموعد:</span>
                    <span style={{ fontWeight: '700' }}>{getSaudiDateFormatted((searchResult?.appointment || myBookingInTrack?.appointment).appointment_date)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>وقت الجلسة على الكرسي:</span>
                    <span style={{ fontWeight: '800', color: 'var(--md-sys-color-primary)' }}>{formatTimeTo12h((searchResult?.appointment || myBookingInTrack?.appointment).appointment_time)}</span>
                  </div>
                </div>

                {(searchResult?.appointment || myBookingInTrack?.appointment).status === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button 
                      className="btn-gold" 
                      onClick={() => {
                        const targetApp = searchResult?.appointment || myBookingInTrack?.appointment;
                        const targetBarber = searchResult?.barber || myBookingInTrack?.barber;
                        const targetQueue = searchResult?.queue || { position: myBookingInTrack?.position, ahead: myBookingInTrack?.ahead };
                        setSearchResult({
                          appointment: targetApp,
                          queue: targetQueue,
                          barber: targetBarber
                        });
                        setNewRescheduleDate(targetApp.appointment_date);
                        setNewRescheduleTime(targetApp.appointment_time);
                        setIsRescheduling(true);
                      }}
                      style={{ flex: 1.2, padding: '8px 0', fontSize: '11px', borderRadius: '14px' }}
                    >
                      <SvgCalendar />
                      <span>إعادة جدولة وتعديل الموعد</span>
                    </button>
                    <button 
                      className="btn-danger-outline" 
                      onClick={() => handleCancelBooking((searchResult?.appointment || myBookingInTrack?.appointment).booking_code)}
                      style={{ flex: 0.8, padding: '8px 0', fontSize: '11px', borderRadius: '14px' }}
                    >
                      <SvgCancel />
                      <span>إلغاء الحجز</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* الاستعلام واسترداد حجز آخر يدوياً */}
            {!myBookingInTrack && !searchResult && !isRescheduling && (
              <div className="glass-card" style={{ marginBottom: '16px', padding: "20px" }}>
                <h3 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--md-sys-color-primary)', fontWeight: '800', textAlign: "right" }}>البحث والاستعلام عن حجز نشط:</h3>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="كود الحجز أو رقم الجوال..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1, minWidth: '180px', padding: "8px", height: "38px" }}
                    required
                  />
                  <button 
                    type="submit" 
                    className="btn-gold"
                    disabled={actionLoading}
                    style={{ padding: "8px 16px", fontSize: "12px", borderRadius: "12px", height: "38px" }}
                  >
                    <SvgSearch />
                    <span>استعلم</span>
                  </button>
                </form>
                {searchError && (
                  <p style={{ color: 'var(--md-sys-color-error)', fontSize: '12px', marginTop: '8px', fontWeight: '700', textAlign: "right" }}>
                    {searchError}
                  </p>
                )}
              </div>
            )}

            {/* نموذج تعديل الحجز النشط */}
            {isRescheduling && (
              <div className="glass-card" style={{ marginBottom: '16px', padding: "20px" }}>
                <form onSubmit={handleRescheduleSubmit} className="animate-fade" style={{ textAlign: "right" }}>
                  <h4 style={{ fontSize: '13px', color: 'var(--md-sys-color-primary)', fontWeight: '800', marginBottom: '10px' }}>
                    تعديل وتحديد تاريخ/وقت الموعد الجديد:
                  </h4>

                  <div className="form-group">
                    <label htmlFor="new-date" style={{ fontSize: "11px" }}>التاريخ المفضل الجديد:</label>
                    <input 
                      type="date"
                      id="new-date"
                      className="form-control"
                      value={newRescheduleDate}
                      min={todaySaudi}
                      onChange={(e) => {
                        setNewRescheduleDate(e.target.value);
                        setNewRescheduleTime("");
                      }}
                      style={{ cursor: "pointer", padding: "8px" }}
                      required
                    />
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>الفترات الزمنية المتوفرة حالياً:</label>
                    
                    {isRescheduleRestDay || rescheduleIsCustomHoliday ? (
                      <div style={{
                        background: 'var(--md-sys-color-surface-container)',
                        border: '1.5px dashed var(--md-sys-color-primary)',
                        borderRadius: '16px',
                        padding: '12px',
                        textAlign: 'center'
                      }}>
                        <span style={{ fontSize: '24px', display: 'block' }}>🏖️</span>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px' }}>
                          {rescheduleIsCustomHoliday ? `الحلاق في عطلة استثنائية مقررة لهذا التاريخ (${newRescheduleDate}).` : `الحلاق في إجازته الرسمية الأسبوعية المقررة ليوم (${rescheduleDayName}).`}
                        </p>
                      </div>
                    ) : (
                      <div className="time-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: '4px' }}>
                        {TIME_SLOTS.map((time) => {
                          const isBooked = rescheduleReservedSlots.includes(time);
                          const [slotHour, slotMinute] = time.split(':').map(Number);
                          const isPast = isRescheduleToday && (slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute));
                          const isActive = rescheduleActiveSlots.includes(time);
                          
                          const isSlotDisabled = isBooked || isPast || !isActive;
                          
                          return (
                            <button
                              key={time}
                              type="button"
                              className={`time-slot ${isSlotDisabled ? 'disabled' : ''} ${newRescheduleTime === time ? 'selected' : ''}`}
                              disabled={isSlotDisabled}
                              onClick={() => setNewRescheduleTime(time)}
                              style={{ 
                                padding: '6px 2px', 
                                fontSize: '11px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                outline: "none"
                              }}
                            >
                              <span style={{ fontWeight: '800' }}>{time}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button 
                      type="submit" 
                      className="btn-gold" 
                      disabled={actionLoading}
                      style={{ flex: 1.2, padding: '8px 0', fontSize: '11px', borderRadius: '12px' }}
                    >
                      <SvgCheck />
                      <span>تأكيد موعد الجلسة الجديد</span>
                    </button>
                    <button 
                      type="button" 
                      className="btn-outline" 
                      onClick={() => setIsRescheduling(false)}
                      style={{ flex: 0.8, padding: '8px 0', fontSize: '11px', borderRadius: '12px' }}
                    >
                      <span>إلغاء</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* عرض طابور الانتظار (السرة) الكامل للحلاق المختار */}
            {!isRescheduling && trackBarberId && (
              <div className="glass-card animate-fade" style={{ padding: "20px", textAlign: "right" }}>
                <h3 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '12px', borderBottom: '1px solid var(--md-sys-color-outline)', paddingBottom: '8px' }}>
                  طابور الانتظار المباشر اليوم لحلاقك المختار ({trackQueue.filter(app => app.status === 'pending' || app.status === 'serving').length} زبائن):
                </h3>
                
                {trackQueue.filter(app => app.status === 'pending' || app.status === 'serving').length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    لا يوجد زبائن مصطفين حالياً في طابور هذا الحلاق لليوم.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {trackQueue
                      .filter(app => app.status === 'pending' || app.status === 'serving')
                      .map((app, index) => {
                        const myCode = typeof window !== "undefined" ? localStorage.getItem("my_last_booking_code") : null;
                        const isOwn = myCode && app.booking_code === myCode;
                        return (
                          <div 
                            key={app.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '8px 12px',
                              borderRadius: '10px',
                              border: isOwn ? '2px solid var(--md-sys-color-primary)' : '1px solid var(--md-sys-color-outline)',
                              background: isOwn ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface)',
                              boxShadow: isOwn ? '0 0 10px rgba(233,193,118,0.15)' : 'none',
                              fontSize: '12px'
                            }}
                          >
                            <span style={{ fontWeight: '700', color: isOwn ? 'var(--md-sys-color-primary)' : 'var(--text-primary)' }}>
                              {app.status === 'serving' ? 'على الكرسي ✂️' : `تسلسل #${index + 1}`}
                            </span>
                            <span style={{ fontWeight: '800' }}>
                              {isOwn ? `${app.customer_name} (أنت 🌟)` : app.customer_name}
                            </span>
                            <span style={{ fontWeight: '700' }}>{formatTimeTo12h(app.appointment_time)}</span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer style={{ 
        borderTop: '1px solid var(--md-sys-color-outline)', 
        padding: '16px 0', 
        background: 'var(--md-sys-color-surface-container-low)', 
        fontSize: '11px', 
        color: 'var(--md-sys-color-on-surface-variant)', 
        textAlign: 'center' 
      }}>
        <div className="container">
          <p style={{ fontWeight: "700" }}>© {new Date().getFullYear()} صالون الحلاقة الفاخر - تجربة العناية الفريدة بالرجل وفق أرقى المعايير المهنية.</p>
        </div>
      </footer>
    </div>
  );
}
