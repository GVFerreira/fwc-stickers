import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Use npm run seed instead" }, { status: 410 });
}
