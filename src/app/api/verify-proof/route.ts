import { NextResponse } from "next/server";
import type { IDKitResult } from "@worldcoin/idkit";

export async function POST(request: Request): Promise<Response> {
  const { rp_id, idkitResponse } = await request.json();
  const response = await fetch(
    `https://developer.world.org/api/v4/verify/${rp_id}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(idkitResponse),
    }
  );
  if (!response.ok) {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
