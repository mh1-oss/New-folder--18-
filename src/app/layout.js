import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export const metadata = {
  title: "حجز مواعيد الحلاقة الفاخرة",
  description: "احجز موعدك مع أفضل الحلاقين المحترفين، وتابع دورك وتسلسلك في الانتظار لحظة بلحظة مع إمكانية تعديل أو إلغاء الحجز في أي وقت.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body>{children}</body>
    </html>
  );
}

