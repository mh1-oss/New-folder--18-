import { validateAdmin, hashPassword } from '../../../lib/db';



export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return new Response(JSON.stringify({ success: false, error: "اسم المستخدم وكلمة المرور مطلوبان." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const isValid = await validateAdmin(username, password);
    if (isValid) {
      const sessionToken = await hashPassword('admin' + 'some_secret_salt_12345');
      return new Response(JSON.stringify({ success: true, message: "تم تسجيل الدخول بنجاح!" }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Set-Cookie': `admin_session=${sessionToken}; HttpOnly; Secure; Path=/; Max-Age=86400; SameSite=Strict`
        }
      });
    } else {
      return new Response(JSON.stringify({ success: false, error: "اسم المستخدم أو رمز المرور الخاص بالأدمن غير صحيح!" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error("Admin Login API Error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message || "فشل الاتصال بقاعدة البيانات." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
