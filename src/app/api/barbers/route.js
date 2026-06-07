import { getBarbers, updateBarberRestDays, updateBarberCustomSlots, verifyAdminSession } from '../../../lib/db';



// GET: جلب قائمة الحلاقين مع معلوماتهم
export async function GET(request) {
  try {
    const barbers = await getBarbers();
    return new Response(JSON.stringify({ 
      success: true, 
      barbers 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    console.error("Barbers GET API Error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || "Failed to fetch barbers." 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PATCH: تحديث أيام الاستراحة أو أوقات العمل الخاصة بالحلاق
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
    const { barber_id, rest_days, custom_slots } = body;

    if (!barber_id) {
      return new Response(JSON.stringify({ success: false, error: "معرف الحلاق مطلوب للتحديث." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let updated = null;
    
    // تحديث أيام الإجازة إذا تم توفيرها
    if (rest_days !== undefined) {
      updated = await updateBarberRestDays(parseInt(barber_id), rest_days);
    }
    
    // تحديث الفترات الزمنية المخصصة إذا تم توفيرها
    if (custom_slots !== undefined) {
      updated = await updateBarberCustomSlots(parseInt(barber_id), custom_slots);
    }
    
    if (!updated) {
      return new Response(JSON.stringify({ success: false, error: "فشل العثور على الحلاق المطلوب تعديله." }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "تم تحديث جدول إجازات وأوقات الحلاق بنجاح!", 
      barber: updated 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Barbers PATCH API Error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || "فشل اتصال الخادم لتحديث تفاصيل الحلاق." 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

