import { 
  getAppointmentsForBarber, 
  getAllAppointments,
  updateAppointmentStatus,
  verifyAdminSession
} from '../../../lib/db';



// GET: جلب مواعيد حلاق معين في تاريخ محدد (أو اليوم) لعرضها في لوحة التحكم الخاصة به
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const barberId = searchParams.get('barber_id');
    let date = searchParams.get('date');

    if (!barberId) {
      return new Response(JSON.stringify({ success: false, error: "معرف الحلاق مطلوب." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // إذا لم يتم تمرير تاريخ، نعتمد تاريخ اليوم بتوقيت الرياض/مكة (GMT+3)
    if (!date) {
      const now = new Date();
      // تحويل التوقيت للحصول على التاريخ بتوقيت السعودية الصحيح YYYY-MM-DD
      const localTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
      date = localTime.toISOString().split('T')[0];
    }

    const appointments = barberId === 'all' 
      ? await getAllAppointments(date)
      : await getAppointmentsForBarber(barberId, date);

    
    return new Response(JSON.stringify({ 
      success: true, 
      date,
      appointments 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    console.error("Barber Dashboard GET Error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message || "فشل جلب مواعيد لوحة الحلاق." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PATCH: تحديث حالة موعد من قبل الحلاق (مثلاً: بدء الخدمة جاري، إكمال الخدمة، أو إلغاء)
export async function PATCH(request) {
  try {
    const isAuthorized = await verifyAdminSession(request);
    if (!isAuthorized) {
      return new Response(JSON.stringify({ success: false, error: "غير مصرح لك بإجراء هذا التعديل." }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { appointment_id, status } = body;

    if (!appointment_id || !status) {
      return new Response(JSON.stringify({ success: false, error: "معرف الموعد والحالة الجديدة مطلوبان للتحديث." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // التحقق من صحة الحالة الجديدة
    const validStatuses = ['pending', 'serving', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return new Response(JSON.stringify({ success: false, error: "حالة الحجز غير صالحة." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // تحديث الحالة
    const updated = await updateAppointmentStatus(parseInt(appointment_id), status);
    if (!updated) {
      return new Response(JSON.stringify({ success: false, error: "فشل العثور على الحجز لتحديثه." }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "تم تحديث حالة الحجز بنجاح!", 
      appointment: updated 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Barber Dashboard PATCH Error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message || "حدث خطأ أثناء تحديث حالة الحجز." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
