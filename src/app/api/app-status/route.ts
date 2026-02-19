import { NextResponse } from "next/server";
import { getAppStatus, setAppStatus, validateKey } from "@/lib/appStatus";

export async function GET() {
  try {
    const status = await getAppStatus();
    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Error reading app status:", error);
    return NextResponse.json({ success: false, error: "Failed to read status" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key, enabled } = body || {};

    if (!(await validateKey(key))) {
      return NextResponse.json({ success: false, error: "Invalid key" }, { status: 401 });
    }

    if (typeof enabled !== "boolean") {
      return NextResponse.json({ success: false, error: "enabled must be boolean" }, { status: 400 });
    }

    const status = await setAppStatus(enabled);
    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Error updating app status:", error);
    return NextResponse.json({ success: false, error: "Failed to update status" }, { status: 500 });
  }
}
