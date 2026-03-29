import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { getSyllabusesByEmail, deleteSyllabus, deleteAllSyllabuses } from "@/app/lib/syllabus";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const syllabi = await getSyllabusesByEmail(session.user.email);
  return NextResponse.json({ syllabi });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (body.all) {
    await deleteAllSyllabuses(session.user.email);
    return NextResponse.json({ ok: true });
  }

  if (!body.syllabusId) {
    return NextResponse.json({ error: "syllabusId required" }, { status: 400 });
  }

  await deleteSyllabus(body.syllabusId, session.user.email);
  return NextResponse.json({ ok: true });
}
