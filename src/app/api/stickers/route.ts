import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const stickers = await prisma.sticker.findMany({
      select: { code: true, title: true, section: true, type: true, collected: true },
      orderBy: { code: "asc" },
    });
    return NextResponse.json({ stickers });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stickers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    await prisma.sticker.update({ where: { code }, data: { collected: true } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save sticker" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { code } = await request.json();
    await prisma.sticker.update({ where: { code }, data: { collected: false } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to update sticker" }, { status: 500 });
  }
}
