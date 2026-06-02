import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "radar-concursos-br",
    timestamp: new Date().toISOString(),
  });
}
