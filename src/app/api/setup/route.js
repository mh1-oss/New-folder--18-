import { initDatabase } from '../../../lib/db';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const result = await initDatabase();
    return new Response(JSON.stringify({ 
      success: true, 
      message: result.message, 
      mock: result.mock || false 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    console.error("Setup API Error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || "Failed to initialize database." 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
