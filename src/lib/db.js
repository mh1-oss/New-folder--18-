import { neon } from '@neondatabase/serverless';

// 1. تحديد إن كان هناك اتصال بقاعدة بيانات Neon
const hasDbUrl = !!process.env.DATABASE_URL;
let dbPool = null;

if (hasDbUrl) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    // مغلف متوافق (Compatibility Wrapper) لتجنب تغيير استعلامات الكود الأخرى
    dbPool = {
      query: async (text, params) => {
        const rows = await sql.query(text, params);
        return { rows };
      }
    };
    console.log("Neon Database HTTP connection successfully initialized.");
  } catch (error) {
    console.error("Neon DB Init Error:", error);
  }
} else {
  console.warn("DATABASE_URL is not set. Elite Salon will run in Mock Database Mode.");
}

export const isMockMode = !dbPool;

// 2. إعداد قاعدة البيانات الافتراضية في الذاكرة المؤقتة (Persisted on Global Object for local testing)
if (!global.mockBarbers) {
  global.mockBarbers = [
    {
      id: 1,
      name: "عمر",
      avatar: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&auto=format&fit=crop&q=80",
      specialty: "VIP - خبير القصات والتسريحات العصرية",
      rating: "4.9",
      status: "available",
      rest_days: "الجمعة",
      custom_slots: "10:00,10:30,11:00,11:30,12:00,12:30,14:00,14:30,15:00,15:30,16:00,16:30,17:00,17:30,18:00,18:30,19:00,19:30,20:00,20:30,21:00,21:30"
    },
    {
      id: 2,
      name: "مصطفى",
      avatar: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300&auto=format&fit=crop&q=80",
      specialty: "خبير حلاقة وتحديد اللحية والعناية بالبشرة",
      rating: "4.8",
      status: "available",
      rest_days: "الجمعة",
      custom_slots: "10:00,10:30,11:00,11:30,12:00,12:30,14:00,14:30,15:00,15:30,16:00,16:30,17:00,17:30,18:00,18:30,19:00,19:30,20:00,20:30,21:00,21:30"
    },
    {
      id: 3,
      name: "محمد",
      avatar: "https://images.unsplash.com/photo-1605497746444-ac9dbd324ce8?w=300&auto=format&fit=crop&q=80",
      specialty: "خبير الصبغات والعلاجات المتكاملة للشعر",
      rating: "4.7",
      status: "available",
      rest_days: "الجمعة",
      custom_slots: "10:00,10:30,11:00,11:30,12:00,12:30,14:00,14:30,15:00,15:30,16:00,16:30,17:00,17:30,18:00,18:30,19:00,19:30,20:00,20:30,21:00,21:30"
    }
  ];
}

if (!global.mockBarberSlots) {
  global.mockBarberSlots = [];
  const defaultSlots = "10:00,10:30,11:00,11:30,12:00,12:30,14:00,14:30,15:00,15:30,16:00,16:30,17:00,17:30,18:00,18:30,19:00,19:30,20:00,20:30,21:00,21:30";
  const weekDays = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
  let idCounter = 1;
  [1, 2, 3].forEach(barberId => {
    weekDays.forEach(day => {
      global.mockBarberSlots.push({
        id: idCounter++,
        barber_id: barberId,
        day_of_week: day,
        specific_date: null,
        time_slots: defaultSlots
      });
    });
  });
}


if (!global.mockAppointments) {
  global.mockAppointments = [
    {
      id: 101,
      booking_code: "OMR-99A1",
      barber_id: 1,
      customer_name: "أحمد العتيبي",
      customer_phone: "0501234567",
      service_name: "باقة الخدمات المتكاملة",
      service_price: 0,
      appointment_date: new Date().toISOString().split('T')[0],
      appointment_time: "15:00",
      status: "pending",
      created_at: new Date()
    },
    {
      id: 102,
      booking_code: "MST-88B2",
      barber_id: 2,
      customer_name: "خالد الشمري",
      customer_phone: "0557654321",
      service_name: "قص شعر كلاسيكي",
      service_price: 0,
      appointment_date: new Date().toISOString().split('T')[0],
      appointment_time: "15:30",
      status: "serving",
      created_at: new Date()
    },
    {
      id: 103,
      booking_code: "OMR-77C3",
      barber_id: 1,
      customer_name: "سلطان الحربي",
      customer_phone: "0539876543",
      service_name: "حلاقة لحية وتحديد فاخر",
      service_price: 0,
      appointment_date: new Date().toISOString().split('T')[0],
      appointment_time: "16:00",
      status: "pending",
      created_at: new Date()
    }
  ];
}

// 3. مساعدة توليد الأكواد الفريدة للحجوزات
export function generateBookingCode(barberName) {
  const prefix = barberName === "عمر" ? "OMR" : barberName === "مصطفى" ? "MST" : "MHD";
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${randomChars}`;
}

// 4. العمليات البرمجية لقاعدة البيانات

// تهيئة جداول قاعدة بيانات Neon وإدخال الحلاقين الأساسيين
export async function initDatabase() {
  if (isMockMode) {
    return { success: true, message: "Initialized Mock Database Mode.", mock: true };
  }

  try {
    // إنشاء جدول الحلاقين
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS barbers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        avatar VARCHAR(255),
        specialty VARCHAR(255) NOT NULL,
        rating DECIMAL(2,1) DEFAULT 4.9,
        status VARCHAR(20) DEFAULT 'available'
      );
    `);

    // إنشاء جدول الحجوزات
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        booking_code VARCHAR(20) UNIQUE NOT NULL,
        barber_id INT NOT NULL,
        customer_name VARCHAR(150) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        service_name VARCHAR(150) NOT NULL,
        service_price DECIMAL(10,2) NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // منع الحجوزات المزدوجة المتزامنة تحت الضغط العالي عبر مؤشر فريد جزئي
    try {
      await dbPool.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS unique_active_appointment 
        ON appointments (barber_id, appointment_date, appointment_time) 
        WHERE status != 'cancelled';
      `);
    } catch (idxErr) {
      console.warn("Could not create unique active appointment index (might have legacy duplicates):", idxErr.message || idxErr);
    }
    // إنشاء جدول المسؤولين (Admins)
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL
      );
    `);

    // إدخال مستخدم المسؤول الافتراضي إذا لم يكن موجوداً (مع كلمة مرور مشفرة بـ SHA-256)
    await dbPool.query(`
      INSERT INTO admins (username, password) 
      VALUES ('admin', '240be518fabd2724ddb6f04eeb1da1415b43b32c3b22ab1a0847beba18451897') 
      ON CONFLICT (username) DO NOTHING;
    `);

    // فحص إذا كان هناك حلاق سليم لإزاحته أو عدم توفر الحلاقين
    const checkSalim = await dbPool.query("SELECT COUNT(*) FROM barbers WHERE name = 'سليم'");
    const totalCount = await dbPool.query("SELECT COUNT(*) FROM barbers");
    if (parseInt(checkSalim.rows[0].count) > 0 || parseInt(totalCount.rows[0].count) === 0) {
      // إعادة تأسيس الحلاقين بالأسماء الجديدة عمر ومصطفى ومحمد
      await dbPool.query("TRUNCATE TABLE barbers RESTART IDENTITY CASCADE");
      await dbPool.query(`
        INSERT INTO barbers (name, avatar, specialty, rating, status) VALUES
        ('عمر', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&auto=format&fit=crop&q=80', 'VIP - خبير القصات والتسريحات العصرية', 4.9, 'available'),
        ('مصطفى', 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300&auto=format&fit=crop&q=80', 'خبير حلاقة وتحديد اللحية والعناية بالبشرة', 4.8, 'available'),
        ('محمد', 'https://images.unsplash.com/photo-1605497746444-ac9dbd324ce8?w=300&auto=format&fit=crop&q=80', 'خبير الصبغات والعلاجات المتكاملة للشعر', 4.7, 'available')
      `);
    }

    // إضافة عمود أيام الاستراحة إذا لم يكن موجوداً
    await dbPool.query(`
      ALTER TABLE barbers ADD COLUMN IF NOT EXISTS rest_days VARCHAR(150) DEFAULT 'الجمعة';
    `);

    // إضافة عمود الفترات الزمنية المخصصة إذا لم يكن موجوداً
    await dbPool.query(`
      ALTER TABLE barbers ADD COLUMN IF NOT EXISTS custom_slots TEXT;
    `);

    // إنشاء جدول فترات العمل المتقدمة
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS barber_slots (
        id SERIAL PRIMARY KEY,
        barber_id INT NOT NULL,
        day_of_week VARCHAR(50),
        specific_date DATE,
        time_slots TEXT NOT NULL
      );
    `);

    // تعبئة البيانات التلقائية لجدول فترات العمل إن كان فارغاً
    const countSlots = await dbPool.query("SELECT COUNT(*) FROM barber_slots");
    if (parseInt(countSlots.rows[0].count) === 0) {
      const defaultSlots = "10:00,10:30,11:00,11:30,12:00,12:30,14:00,14:30,15:00,15:30,16:00,16:30,17:00,17:30,18:00,18:30,19:00,19:30,20:00,20:30,21:00,21:30";
      const weekDays = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
      for (const barberId of [1, 2, 3]) {
        for (const day of weekDays) {
          await dbPool.query(
            "INSERT INTO barber_slots (barber_id, day_of_week, specific_date, time_slots) VALUES ($1, $2, NULL, $3)",
            [barberId, day, defaultSlots]
          );
        }
      }
    }


    return { success: true, message: "Neon tables initialized and seeded successfully." };
  } catch (error) {
    console.error("Neon DB Setup Error:", error);
    throw error;
  }
}

// جلب قائمة الحلاقين
export async function getBarbers() {
  if (isMockMode) {
    return global.mockBarbers;
  }

  const res = await dbPool.query("SELECT * FROM barbers ORDER BY id ASC");
  return res.rows;
}

// جلب الحجوزات النشطة لحلاق معين في تاريخ محدد
export async function getAppointmentsForBarber(barberId, dateString) {
  if (isMockMode) {
    return global.mockAppointments
      .filter(app => app.barber_id === parseInt(barberId) && app.appointment_date === dateString)
      .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  }

  const res = await dbPool.query(
    `SELECT id, booking_code, customer_name, customer_phone, service_name, service_price, 
            appointment_date::text as appointment_date, 
            TO_CHAR(appointment_time, 'HH24:MI') as appointment_time, 
            status, created_at 
     FROM appointments 
     WHERE barber_id = $1 AND appointment_date = $2 
     ORDER BY appointment_time ASC`,
    [barberId, dateString]
  );
  return res.rows;
}

// جلب كافة المواعيد في تاريخ محدد لجميع الحلاقين معاً
export async function getAllAppointments(dateString) {
  if (isMockMode) {
    return global.mockAppointments
      .filter(app => app.appointment_date === dateString)
      .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  }

  const res = await dbPool.query(
    `SELECT id, booking_code, barber_id, customer_name, customer_phone, service_name, service_price, 
            appointment_date::text as appointment_date, 
            TO_CHAR(appointment_time, 'HH24:MI') as appointment_time, 
            status, created_at 
     FROM appointments 
     WHERE appointment_date = $1 
     ORDER BY appointment_time ASC`,
    [dateString]
  );
  return res.rows;
}


// جلب تفاصيل حجز معين باستخدام الكود
export async function getAppointmentByCode(bookingCode) {
  const code = bookingCode.trim().toUpperCase();

  if (isMockMode) {
    const app = global.mockAppointments.find(app => app.booking_code === code);
    return app || null;
  }

  const res = await dbPool.query(
    `SELECT id, booking_code, barber_id, customer_name, customer_phone, service_name, service_price, 
            appointment_date::text as appointment_date, 
            TO_CHAR(appointment_time, 'HH24:MI') as appointment_time, 
            status, created_at 
     FROM appointments 
     WHERE booking_code = $1`,
    [code]
  );
  return res.rows[0] || null;
}

// جلب حجوزات عميل باستخدام رقم الهاتف
export async function getAppointmentsByPhone(phone) {
  const cleanPhone = phone.trim();

  if (isMockMode) {
    return global.mockAppointments
      .filter(app => app.customer_phone === cleanPhone)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const res = await dbPool.query(
    `SELECT id, booking_code, barber_id, customer_name, customer_phone, service_name, service_price, 
            appointment_date::text as appointment_date, 
            TO_CHAR(appointment_time, 'HH24:MI') as appointment_time, 
            status, created_at 
     FROM appointments 
     WHERE customer_phone = $1 
     ORDER BY created_at DESC`,
    [cleanPhone]
  );
  return res.rows;
}

// إضافة حجز جديد مع التحقق
export async function createAppointment({
  barber_id,
  customer_name,
  customer_phone,
  service_name,
  service_price,
  appointment_date,
  appointment_time
}) {
  const barbersList = await getBarbers();
  const selectedBarber = barbersList.find(b => b.id === parseInt(barber_id));
  const barberName = selectedBarber ? selectedBarber.name : "BARB";
  const booking_code = generateBookingCode(barberName);

  if (isMockMode) {
    const isTaken = global.mockAppointments.some(
      app => app.barber_id === parseInt(barber_id) && 
             app.appointment_date === appointment_date && 
             app.appointment_time === appointment_time && 
             app.status !== 'cancelled'
    );
    if (isTaken) {
      const err = new Error("Unique constraint violation mock");
      err.code = '23505';
      throw err;
    }

    const newApp = {
      id: global.mockAppointments.length + 101,
      booking_code,
      barber_id: parseInt(barber_id),
      customer_name,
      customer_phone,
      service_name,
      service_price: parseFloat(service_price),
      appointment_date,
      appointment_time,
      status: "pending",
      created_at: new Date()
    };
    global.mockAppointments.push(newApp);
    return newApp;
  }

  const res = await dbPool.query(
    `INSERT INTO appointments 
     (booking_code, barber_id, customer_name, customer_phone, service_name, service_price, appointment_date, appointment_time, status) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending') 
     RETURNING id, booking_code, barber_id, customer_name, customer_phone, service_name, service_price, 
               appointment_date::text as appointment_date, 
               TO_CHAR(appointment_time, 'HH24:MI') as appointment_time, 
               status, created_at`,
    [booking_code, barber_id, customer_name, customer_phone, service_name, service_price, appointment_date, appointment_time]
  );
  return res.rows[0];
}

// تعديل موعد الحجز
export async function updateAppointmentTime(bookingCode, dateString, timeString) {
  const code = bookingCode.trim().toUpperCase();

  if (isMockMode) {
    const appIndex = global.mockAppointments.findIndex(app => app.booking_code === code);
    if (appIndex === -1) return null;
    
    const targetBarberId = global.mockAppointments[appIndex].barber_id;
    const isTaken = global.mockAppointments.some(
      app => app.barber_id === targetBarberId && 
             app.appointment_date === dateString && 
             app.appointment_time === timeString && 
             app.booking_code !== code &&
             app.status !== 'cancelled'
    );
    if (isTaken) {
      const err = new Error("Unique constraint violation mock");
      err.code = '23505';
      throw err;
    }

    global.mockAppointments[appIndex].appointment_date = dateString;
    global.mockAppointments[appIndex].appointment_time = timeString;
    return global.mockAppointments[appIndex];
  }

  const res = await dbPool.query(
    `UPDATE appointments 
     SET appointment_date = $1, appointment_time = $2 
     WHERE booking_code = $3 
     RETURNING id, booking_code, barber_id, customer_name, customer_phone, service_name, service_price, 
               appointment_date::text as appointment_date, 
               TO_CHAR(appointment_time, 'HH24:MI') as appointment_time, 
               status, created_at`,
    [dateString, timeString, code]
  );
  return res.rows[0] || null;
}

// تحديث حالة الحجز (مثل الإلغاء أو إكمال الخدمة)
export async function updateAppointmentStatus(idOrCode, status) {
  const isId = typeof idOrCode === 'number' || !isNaN(idOrCode) && !idOrCode.toString().includes('-');

  if (isMockMode) {
    let appIndex = -1;
    if (isId) {
      appIndex = global.mockAppointments.findIndex(app => app.id === parseInt(idOrCode));
    } else {
      appIndex = global.mockAppointments.findIndex(app => app.booking_code === idOrCode.trim().toUpperCase());
    }

    if (appIndex === -1) return null;
    global.mockAppointments[appIndex].status = status;
    return global.mockAppointments[appIndex];
  }

  let queryText = '';
  let queryParams = [status, idOrCode];

  if (isId) {
    queryText = `UPDATE appointments SET status = $1 WHERE id = $2 `;
  } else {
    queryText = `UPDATE appointments SET status = $1 WHERE booking_code = $2 `;
    queryParams[1] = idOrCode.trim().toUpperCase();
  }

  queryText += `RETURNING id, booking_code, barber_id, customer_name, customer_phone, service_name, service_price, 
                           appointment_date::text as appointment_date, 
                           TO_CHAR(appointment_time, 'HH24:MI') as appointment_time, 
                           status, created_at`;

  const res = await dbPool.query(queryText, queryParams);
  return res.rows[0] || null;
}

// حساب تسلسل العميل في الانتظار (كم زبون أمامه) للحلاق المعين في اليوم المحدد
export async function getQueuePosition(barberId, dateString, timeString) {
  if (isMockMode) {
    // جلب كل الحجوزات المعلقة أو النشطة للحلاق في هذا اليوم
    const activeApps = global.mockAppointments.filter(
      app => app.barber_id === parseInt(barberId) && 
             app.appointment_date === dateString && 
             (app.status === 'pending' || app.status === 'serving')
    );

    // ترتيبها حسب وقت الموعد تصاعدياً
    activeApps.sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

    // إيجاد مؤشر موعد العميل الحالي
    const currentIndex = activeApps.findIndex(app => app.appointment_time === timeString);
    
    if (currentIndex === -1) {
      // الحجز غير موجود أو ملغي، نفترض أنه يضاف كآخر حجز
      return { position: activeApps.length + 1, ahead: activeApps.length };
    }

    // حساب عدد العملاء الذين حالتهم 'serving' (جاري العمل) لمعرفة هل الدور يمشي
    const servingCount = activeApps.filter(app => app.status === 'serving').length;

    return {
      position: currentIndex + 1,
      ahead: currentIndex,
      is_serving: activeApps[currentIndex].status === 'serving',
      active_serving_name: servingCount > 0 ? activeApps.find(a => a.status === 'serving').customer_name : null
    };
  }

  // 1. جلب كل الحجوزات النشطة لنفس الحلاق في نفس اليوم مرتبة بحسب الوقت
  const res = await dbPool.query(
    `SELECT id, TO_CHAR(appointment_time, 'HH24:MI') as appointment_time, status, customer_name 
     FROM appointments 
     WHERE barber_id = $1 AND appointment_date = $2 AND status IN ('pending', 'serving') 
     ORDER BY appointment_time ASC`,
    [barberId, dateString]
  );

  const activeApps = res.rows;
  const currentIndex = activeApps.findIndex(app => app.appointment_time === timeString);

  if (currentIndex === -1) {
    return { position: activeApps.length + 1, ahead: activeApps.length };
  }

  const servingApp = activeApps.find(a => a.status === 'serving');

  return {
    position: currentIndex + 1,
    ahead: currentIndex,
    is_serving: activeApps[currentIndex].status === 'serving',
    active_serving_name: servingApp ? servingApp.customer_name : null
  };
}

// تحديث أيام الاستراحة لحلاق معين
export async function updateBarberRestDays(barberId, restDaysString) {
  if (isMockMode) {
    const barberIndex = global.mockBarbers.findIndex(b => b.id === parseInt(barberId));
    if (barberIndex !== -1) {
      global.mockBarbers[barberIndex].rest_days = restDaysString;
      return global.mockBarbers[barberIndex];
    }
    return null;
  }

  const res = await dbPool.query(
    "UPDATE barbers SET rest_days = $1 WHERE id = $2 RETURNING *",
    [restDaysString, barberId]
  );
  return res.rows[0] || null;
}

// تحديث الفترات الزمنية المتاحة لحلاق معين
export async function updateBarberCustomSlots(barberId, customSlotsString) {
  if (isMockMode) {
    const barberIndex = global.mockBarbers.findIndex(b => b.id === parseInt(barberId));
    if (barberIndex !== -1) {
      global.mockBarbers[barberIndex].custom_slots = customSlotsString;
      return global.mockBarbers[barberIndex];
    }
    return null;
  }

  const res = await dbPool.query(
    "UPDATE barbers SET custom_slots = $1 WHERE id = $2 RETURNING *",
    [customSlotsString, barberId]
  );
  return res.rows[0] || null;
}

export async function hashPassword(password) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function validateAdmin(username, password) {
  const hashedPassword = await hashPassword(password);
  if (isMockMode) {
    return username === 'admin' && hashedPassword === '240be518fabd2724ddb6f04eeb1da1415b43b32c3b22ab1a0847beba18451897';
  }
  try {
    const res = await dbPool.query("SELECT * FROM admins WHERE username = $1 AND password = $2", [username, hashedPassword]);
    return res.rows.length > 0;
  } catch (err) {
    console.error("validateAdmin Database Error:", err);
    return username === 'admin' && hashedPassword === '240be518fabd2724ddb6f04eeb1da1415b43b32c3b22ab1a0847beba18451897'; // Fallback in case of neon serverless edge pooling delay
  }
}

export function getArabicDayOfWeek(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  return days[dateObj.getDay()];
}

export async function getWeeklySlots(barberId) {
  if (isMockMode) {
    return global.mockBarberSlots.filter(s => s.barber_id === parseInt(barberId) && !s.specific_date);
  }
  const res = await dbPool.query(
    "SELECT * FROM barber_slots WHERE barber_id = $1 AND specific_date IS NULL",
    [barberId]
  );
  return res.rows;
}

export async function getDateOverrides(barberId) {
  if (isMockMode) {
    return global.mockBarberSlots.filter(s => s.barber_id === parseInt(barberId) && s.specific_date)
      .sort((a, b) => a.specific_date.localeCompare(b.specific_date));
  }
  const res = await dbPool.query(
    "SELECT id, barber_id, day_of_week, specific_date::text as specific_date, time_slots FROM barber_slots WHERE barber_id = $1 AND day_of_week IS NULL ORDER BY specific_date ASC",
    [barberId]
  );
  return res.rows;
}

export async function getBarberSlotsForDate(barberId, dateString) {
  if (isMockMode) {
    // 1. Check override
    const override = global.mockBarberSlots.find(
      s => s.barber_id === parseInt(barberId) && s.specific_date === dateString
    );
    if (override) return override.time_slots;

    // 2. Check weekly day of week
    const dayName = getArabicDayOfWeek(dateString);
    const weekly = global.mockBarberSlots.find(
      s => s.barber_id === parseInt(barberId) && s.day_of_week === dayName && !s.specific_date
    );
    if (weekly) return weekly.time_slots;

    // 3. Fallback to barber's default
    const barber = global.mockBarbers.find(b => b.id === parseInt(barberId));
    return barber ? barber.custom_slots : "";
  }

  // 1. Check specific date override
  const overrideRes = await dbPool.query(
    "SELECT time_slots FROM barber_slots WHERE barber_id = $1 AND specific_date = $2",
    [barberId, dateString]
  );
  if (overrideRes.rows.length > 0) {
    return overrideRes.rows[0].time_slots;
  }

  // 2. Check weekly day of week
  const dayName = getArabicDayOfWeek(dateString);
  const weeklyRes = await dbPool.query(
    "SELECT time_slots FROM barber_slots WHERE barber_id = $1 AND day_of_week = $2 AND specific_date IS NULL",
    [barberId, dayName]
  );
  if (weeklyRes.rows.length > 0) {
    return weeklyRes.rows[0].time_slots;
  }

  // 3. Fallback to default in barbers table
  const barberRes = await dbPool.query("SELECT custom_slots FROM barbers WHERE id = $1", [barberId]);
  if (barberRes.rows.length > 0 && barberRes.rows[0].custom_slots) {
    return barberRes.rows[0].custom_slots;
  }

  return "10:00,10:30,11:00,11:30,12:00,12:30,14:00,14:30,15:00,15:30,16:00,16:30,17:00,17:30,18:00,18:30,19:00,19:30,20:00,20:30,21:00,21:30";
}

export async function saveBarberSlots({ barberId, dayOfWeek, specificDate, timeSlots }) {
  if (isMockMode) {
    if (specificDate) {
      const idx = global.mockBarberSlots.findIndex(
        s => s.barber_id === parseInt(barberId) && s.specific_date === specificDate
      );
      if (idx !== -1) {
        global.mockBarberSlots[idx].time_slots = timeSlots;
        return global.mockBarberSlots[idx];
      } else {
        const newOverride = {
          id: global.mockBarberSlots.length + 1,
          barber_id: parseInt(barberId),
          day_of_week: null,
          specific_date: specificDate,
          time_slots: timeSlots
        };
        global.mockBarberSlots.push(newOverride);
        return newOverride;
      }
    } else if (dayOfWeek) {
      const idx = global.mockBarberSlots.findIndex(
        s => s.barber_id === parseInt(barberId) && s.day_of_week === dayOfWeek && !s.specific_date
      );
      if (idx !== -1) {
        global.mockBarberSlots[idx].time_slots = timeSlots;
        return global.mockBarberSlots[idx];
      } else {
        const newWeekly = {
          id: global.mockBarberSlots.length + 1,
          barber_id: parseInt(barberId),
          day_of_week: dayOfWeek,
          specific_date: null,
          time_slots: timeSlots
        };
        global.mockBarberSlots.push(newWeekly);
        return newWeekly;
      }
    }
    return null;
  }

  if (specificDate) {
    const check = await dbPool.query(
      "SELECT id FROM barber_slots WHERE barber_id = $1 AND specific_date = $2",
      [barberId, specificDate]
    );
    if (check.rows.length > 0) {
      const res = await dbPool.query(
        "UPDATE barber_slots SET time_slots = $1 WHERE barber_id = $2 AND specific_date = $3 RETURNING *",
        [timeSlots, barberId, specificDate]
      );
      return res.rows[0];
    } else {
      const res = await dbPool.query(
        "INSERT INTO barber_slots (barber_id, day_of_week, specific_date, time_slots) VALUES ($1, NULL, $2, $3) RETURNING *",
        [barberId, specificDate, timeSlots]
      );
      return res.rows[0];
    }
  } else if (dayOfWeek) {
    const check = await dbPool.query(
      "SELECT id FROM barber_slots WHERE barber_id = $1 AND day_of_week = $2 AND specific_date IS NULL",
      [barberId, dayOfWeek]
    );
    if (check.rows.length > 0) {
      const res = await dbPool.query(
        "UPDATE barber_slots SET time_slots = $1 WHERE barber_id = $2 AND day_of_week = $3 AND specific_date IS NULL RETURNING *",
        [timeSlots, barberId, dayOfWeek]
      );
      return res.rows[0];
    } else {
      const res = await dbPool.query(
        "INSERT INTO barber_slots (barber_id, day_of_week, specific_date, time_slots) VALUES ($1, $2, NULL, $3) RETURNING *",
        [barberId, dayOfWeek, timeSlots]
      );
      return res.rows[0];
    }
  }
  return null;
}

export async function deleteBarberSlotsConfig({ barberId, dayOfWeek, specificDate }) {
  if (isMockMode) {
    if (specificDate) {
      global.mockBarberSlots = global.mockBarberSlots.filter(
        s => !(s.barber_id === parseInt(barberId) && s.specific_date === specificDate)
      );
    } else if (dayOfWeek) {
      global.mockBarberSlots = global.mockBarberSlots.filter(
        s => !(s.barber_id === parseInt(barberId) && s.day_of_week === dayOfWeek && !s.specific_date)
      );
    }
    return { success: true };
  }

  if (specificDate) {
    await dbPool.query(
      "DELETE FROM barber_slots WHERE barber_id = $1 AND specific_date = $2",
      [barberId, specificDate]
    );
  } else if (dayOfWeek) {
    await dbPool.query(
      "DELETE FROM barber_slots WHERE barber_id = $1 AND day_of_week = $2 AND specific_date IS NULL",
      [barberId, dayOfWeek]
    );
  }
  return { success: true };
}

export async function verifyAdminSession(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key) acc[key] = value;
    return acc;
  }, {});
  const sessionToken = cookies['admin_session'];
  if (!sessionToken) return false;
  
  const expectedToken = await hashPassword('admin' + 'some_secret_salt_12345');
  return sessionToken === expectedToken;
}

