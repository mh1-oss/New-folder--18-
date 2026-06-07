"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const runtime = 'edge';

export default function BookRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontFamily: 'Cairo, sans-serif' }}>
      <div style={{ border: '4px solid rgba(233, 193, 118, 0.1)', borderTop: '4px solid var(--md-sys-color-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', marginBottom: '16px' }}></div>
      <p style={{ fontWeight: 'bold' }}>جاري تحويلك إلى الصفحة الرئيسية لحجز المواعيد...</p>
      <style jsx>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
