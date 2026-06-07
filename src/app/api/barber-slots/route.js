import { 
  getWeeklySlots, 
  getDateOverrides, 
  getBarberSlotsForDate, 
  saveBarberSlots, 
  deleteBarberSlotsConfig,
  verifyAdminSession
} from '../../../lib/db';



// GET: جلب الفترات الزمنية
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const barberId = searchParams.get('barber_id');
    const date = searchParams.get('date');

    if (!barberId) {
      return new Response(JSON.stringify({ success: false, error: "معرف الحلاق مطلوب." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // إذا طلب تاريخ محدد
    if (date) {
      const slots = await getBarberSlotsForDate(parseInt(barberId), date);
      const isHoliday = slots === "holiday";
      return new Response(JSON.stringify({ 
        success: true, 
        slots: isHoliday ? [] : (slots ? slots.split(',') : []),
        isHoliday: isHoliday
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
      });
    }

    // إذا طلب القائمة الكاملة لإعداد المواعيد (Weekly + Overrides)
    const weekly = await getWeeklySlots(parseInt(barberId));
    const overrides = await getDateOverrides(parseInt(barberId));

    return new Response(JSON.stringify({
      success: true,
      weekly,
      overrides
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });

  } catch (error) {
    console.error("Barber slots GET error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST/PUT: حفظ أو تحديث الفترات الزمنية لليوم
export async function POST(request) {
  try {
    const isAuthorized = await verifyAdminSession(request);
    if (!isAuthorized) {
      return new Response(JSON.stringify({ success: false, error: "غير مصرح لك بإجراء هذا التعديل." }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { barber_id, day_of_week, specific_date, time_slots } = body;

    if (!barber_id || (!day_of_week && !specific_date) || time_slots === undefined) {
      return new Response(JSON.stringify({ success: false, error: "المعطيات غير مكتملة للتحديث." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await saveBarberSlots({
      barberId: parseInt(barber_id),
      dayOfWeek: day_of_week,
      specificDate: specific_date,
      timeSlots: time_slots
    });

    return new Response(JSON.stringify({
      success: true,
      data: result
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Barber slots POST error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE: حذف تكوين مواعيد مخصص
export async function DELETE(request) {
  try {
    const isAuthorized = await verifyAdminSession(request);
    if (!isAuthorized) {
      return new Response(JSON.stringify({ success: false, error: "غير مصرح لك بإجراء هذا التعديل." }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { searchParams } = new URL(request.url);
    const barberId = searchParams.get('barber_id');
    const dayOfWeek = searchParams.get('day_of_week');
    const specificDate = searchParams.get('specific_date');

    if (!barberId || (!dayOfWeek && !specificDate)) {
      return new Response(JSON.stringify({ success: false, error: "المعطيات غير مكتملة للحذف." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await deleteBarberSlotsConfig({
      barberId: parseInt(barberId),
      dayOfWeek,
      specificDate
    });

    return new Response(JSON.stringify({
      success: true,
      message: "تم حذف التكوين وتصفير المواعيد بنجاح."
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Barber slots DELETE error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
