import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { clientIpFromHeaders, parseUserAgent } from "@/lib/userAgent";

/**
 * Records the signed-in user's device and network details.
 *
 * This runs on the server because the client cannot see its own public IP or
 * the geo headers the platform adds. Called by the app after sign-in and on
 * subsequent loads; the RPC refreshes an existing row rather than inserting a
 * duplicate for the same device.
 */
export async function POST() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // 204 is a null-body status: attaching a JSON body makes the Response
    // constructor throw and turns this branch into a 500.
    return new NextResponse(null, { status: 204 });
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const h = await headers();
  const ua = h.get("user-agent");
  const { deviceType, browser, os } = parseUserAgent(ua);

  const { error } = await supabase.rpc("record_session", {
    p_ip: clientIpFromHeaders(h),
    p_user_agent: ua ?? "",
    p_device_type: deviceType,
    p_browser: browser,
    p_os: os,
    // Vercel adds these at the edge; absent in local development.
    p_country: h.get("x-vercel-ip-country"),
    p_city: h.get("x-vercel-ip-city"),
  });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
