import { 
  getAppointmentByCode, 
  getAppointmentsByPhone, 
  getAppointmentsForBarber, 
  createAppointment, 
  updateAppointmentTime, 
  updateAppointmentStatus,
  getQueuePosition 
} from '../../../lib/db';



// GET: الاستعلام عن حجز بكود، أو برقم هاتف، أو جلب مواعيد حلاق في تاريخ معين
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const phone = searchParams.get('phone');
    const barberId = searchParams.get('barber_id');
    const date = searchParams.get('date');

    // 1. الاستعلام بكود الحجز (يُرجع الحجز مع موقعه في الطابور)
    if (code) {
      const appointment = await getAppointmentByCode(code);
      if (!appointment) {
        return new Response(JSON.stringify({ success: false, error: "لم يتم العثور على حجز بهذا الكود." }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // حساب ترتيب الطابور إذا كان الحجز نشطاً (pending أو serving)
      let queue = null;
      if (appointment.status === 'pending' || appointment.status === 'serving') {
        queue = await getQueuePosition(appointment.barber_id, appointment.appointment_date, appointment.appointment_time);
      }

      return new Response(JSON.stringify({ success: true, appointment, queue }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
      });
    }

    // 2. الاستعلام برقم الهاتف
    if (phone) {
      const appointments = await getAppointmentsByPhone(phone);
      // لكل حجز نشط، نقوم بإرفاق تسلسله في الطابور
      const enrichedAppointments = await Promise.all(appointments.map(async (app) => {
        let queue = null;
        if (app.status === 'pending' || app.status === 'serving') {
          queue = await getQueuePosition(app.barber_id, app.appointment_date, app.appointment_time);
        }
        return { ...app, queue };
      }));

      return new Response(JSON.stringify({ success: true, appointments: enrichedAppointments }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
      });
    }

    // 3. جلب مواعيد حلاق في يوم معين (لمعرفة الأوقات المحجوزة)
    if (barberId && date) {
      const appointments = await getAppointmentsForBarber(barberId, date);
      return new Response(JSON.stringify({ success: true, appointments }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
      });
    }

    return new Response(JSON.stringify({ success: false, error: "معاملات الاستعلام غير كافية." }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Appointments GET Error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message || "حدث خطأ أثناء جلب البيانات." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST: إنشاء حجز جديد وحساب التسلسل المبدئي
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      barber_id, 
      customer_name, 
      customer_phone, 
      service_name, 
      service_price, 
      appointment_date, 
      appointment_time 
    } = body;

    // التحقق من المدخلات الأساسية
    if (!barber_id || !customer_name || !customer_phone || !service_name || !appointment_date || !appointment_time) {
      return new Response(JSON.stringify({ success: false, error: "جميع الحقول مطلوبة لإتمام الحجز." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. فحص هل الوقت محجوز مسبقاً لنفس الحلاق وفي نفس اليوم
    const existingAppointments = await getAppointmentsForBarber(barber_id, appointment_date);
    const isTimeTaken = existingAppointments.some(
      app => app.appointment_time === appointment_time && app.status !== 'cancelled'
    );

    if (isTimeTaken) {
      return new Response(JSON.stringify({ success: false, error: "هذا الوقت محجوز بالفعل لدى الحلاق المختار. يرجى اختيار وقت آخر." }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. إنشاء الحجز
    const newAppointment = await createAppointment({
      barber_id,
      customer_name,
      customer_phone,
      service_name,
      service_price,
      appointment_date,
      appointment_time
    });

    // 3. حساب تسلسل العميل الجديد في الانتظار فوراً
    const queue = await getQueuePosition(newAppointment.barber_id, newAppointment.appointment_date, newAppointment.appointment_time);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "تم الحجز بنجاح!", 
      appointment: newAppointment,
      queue 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Appointments POST Error:", error);
    if (error.code === '23505') {
      return new Response(JSON.stringify({ success: false, error: "هذا الوقت محجوز بالفعل لدى الحلاق المختار. يرجى اختيار وقت آخر." }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ success: false, error: error.message || "فشل إنشاء الحجز." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PATCH: إلغاء الحجز أو تعديل موعده
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { action, booking_code } = body;

    if (!booking_code) {
      return new Response(JSON.stringify({ success: false, error: "كود الحجز مطلوب لتحديثه." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // التحقق من وجود الحجز أصلاً
    const app = await getAppointmentByCode(booking_code);
    if (!app) {
      return new Response(JSON.stringify({ success: false, error: "الحجز غير موجود." }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. إجراء الإلغاء
    if (action === 'cancel') {
      if (app.status === 'completed' || app.status === 'cancelled') {
        return new Response(JSON.stringify({ success: false, error: `لا يمكن إلغاء الحجز لأنه بالفعل: ${app.status === 'completed' ? 'مكتمل' : 'ملغي'}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const updated = await updateAppointmentStatus(booking_code, 'cancelled');
      return new Response(JSON.stringify({ success: true, message: "تم إلغاء الحجز بنجاح.", appointment: updated }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. إجراء تعديل الموعد (Reschedule)
    if (action === 'reschedule') {
      const { appointment_date, appointment_time } = body;

      if (!appointment_date || !appointment_time) {
        return new Response(JSON.stringify({ success: false, error: "التاريخ والوقت الجديدين مطلوبين للتعديل." }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // فحص هل الوقت الجديد محجوز مسبقاً لدى هذا الحلاق
      const existingAppointments = await getAppointmentsForBarber(app.barber_id, appointment_date);
      const isTimeTaken = existingAppointments.some(
        a => a.appointment_time === appointment_time && a.booking_code !== booking_code && a.status !== 'cancelled'
      );

      if (isTimeTaken) {
        return new Response(JSON.stringify({ success: false, error: "الوقت الجديد محجوز بالفعل لدى الحلاق. يرجى اختيار موعد آخر." }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // تعديل الموعد وإعادته للحالة المعلقة pending
      const updated = await updateAppointmentTime(booking_code, appointment_date, appointment_time);
      
      // إذا كان ملغياً سابقاً، نعيده إلى معلق بمجرد تعديله
      if (app.status === 'cancelled') {
        await updateAppointmentStatus(booking_code, 'pending');
        updated.status = 'pending';
      }

      // حساب التسلسل الجديد في الطابور للموعد الجديد
      const queue = await getQueuePosition(updated.barber_id, updated.appointment_date, updated.appointment_time);

      return new Response(JSON.stringify({ 
        success: true, 
        message: "تم تعديل موعد الحجز بنجاح!", 
        appointment: updated, 
        queue 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: false, error: "الإجراء المطلوب غير مدعوم." }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Appointments PATCH Error:", error);
    if (error.code === '23505') {
      return new Response(JSON.stringify({ success: false, error: "الوقت الجديد محجوز بالفعل لدى الحلاق. يرجى اختيار موعد آخر." }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ success: false, error: error.message || "حدث خطأ أثناء تحديث الحجز." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
