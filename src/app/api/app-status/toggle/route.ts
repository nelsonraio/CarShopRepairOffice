import { NextResponse } from "next/server";
import { setAppStatus, validateKey } from "@/lib/appStatus";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key") || undefined;
    const enabledParam = searchParams.get("enabled");

    if (!(await validateKey(key))) {
      return NextResponse.json({ success: false, error: "Invalid key" }, { status: 401 });
    }

    if (enabledParam !== "true" && enabledParam !== "false") {
      return NextResponse.json({ success: false, error: "enabled must be true or false" }, { status: 400 });
    }

    const enabled = enabledParam === "true";
    const status = await setAppStatus(enabled);
    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Error updating app status:", error);
    return NextResponse.json({ success: false, error: "Failed to update status" }, { status: 500 });
  }
}
