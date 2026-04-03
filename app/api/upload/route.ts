import { put, list } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

const UPLOAD_SECRET = process.env.REVALIDATION_SECRET;

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-upload-secret");
  if (!secret || secret !== UPLOAD_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const pathname = formData.get("pathname") as string | null;

  if (!file || !pathname) {
    return NextResponse.json(
      { error: "Missing file or pathname" },
      { status: 400 }
    );
  }

  const blob = await put(pathname, file, {
    access: "public",
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url, pathname: blob.pathname });
}

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-upload-secret");
  if (!secret || secret !== UPLOAD_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prefix = request.nextUrl.searchParams.get("prefix") || "summer-party/";
  const blobs: { pathname: string; url: string }[] = [];
  let cursor: string | undefined = undefined;

  do {
    const res = await list({ prefix, cursor, limit: 1000 });
    for (const b of res.blobs) {
      blobs.push({ pathname: b.pathname, url: b.url });
    }
    cursor = res.hasMore ? res.cursor : undefined;
  } while (cursor);

  return NextResponse.json({ blobs, count: blobs.length });
}
