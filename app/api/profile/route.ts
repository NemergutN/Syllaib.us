import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import clientPromise from "@/app/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const user = await client
    .db("syllabusDataBase")
    .collection("Users")
    .findOne(
      { email: session.user.email.toLowerCase() },
      { projection: { major: 1, careerGoal: 1 } }
    );

  return NextResponse.json({
    major: user?.major ?? "",
    careerGoal: user?.careerGoal ?? "",
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { major, careerGoal } = await req.json();

  await clientPromise.then((client) =>
    client
      .db("syllabusDataBase")
      .collection("Users")
      .updateOne(
        { email: session.user!.email!.toLowerCase() },
        { $set: { major: major ?? "", careerGoal: careerGoal ?? "" } }
      )
  );

  return NextResponse.json({ ok: true });
}
