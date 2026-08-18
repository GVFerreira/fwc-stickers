import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

async function getUserId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("auth")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const stickers = await prisma.sticker.findMany({
      select: { code: true, title: true, section: true, type: true },
      orderBy: { code: "asc" },
    });

    const userStickers = await prisma.userSticker.findMany({
      where: { userId },
      select: { stickerCode: true, duplicates: true },
    });

    const collectedMap = new Map(userStickers.map((us) => [us.stickerCode, us.duplicates]));

    return NextResponse.json({
      stickers: stickers.map((s) => ({
        ...s,
        collected: collectedMap.has(s.code),
        duplicates: collectedMap.get(s.code) ?? 0,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stickers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { code } = await req.json();
    await prisma.userSticker.create({ data: { userId, stickerCode: code } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save sticker" }, { status: 500 });
  }
}

// Atualiza a quantidade de repetidas de uma figurinha já colada
export async function PATCH(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { code, duplicates } = await req.json();
    if (typeof code !== "string" || !Number.isInteger(duplicates) || duplicates < 0 || duplicates > 999) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await prisma.userSticker.update({
      where: { userId_stickerCode: { userId, stickerCode: code } },
      data: { duplicates },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to update duplicates" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { code } = await req.json();
    await prisma.userSticker.delete({
      where: { userId_stickerCode: { userId, stickerCode: code } },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to update sticker" }, { status: 500 });
  }
}
