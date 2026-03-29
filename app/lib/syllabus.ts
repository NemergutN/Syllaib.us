import { randomUUID } from "crypto";
import clientPromise from "@/app/db";

export type SyllabusDoc = {
  syllabusId: string;
  email: string;
  uploadedAt: Date;
  courseName: string;
  courseCode: string;
  lectures: { day: string; time: string }[];
  officeHours: { day: string; time: string; instructor?: string }[];
  grading: { category: string; weight: number }[];
  deadlines: { title: string; date: string }[];
  drops: string;
};

type SyllabusInput = Omit<SyllabusDoc, "syllabusId" | "email" | "uploadedAt">;

function collection() {
  return clientPromise.then((client) =>
    client.db("syllabusDataBase").collection<SyllabusDoc>("syllabuses")
  );
}

export async function insertSyllabus(email: string, data: SyllabusInput): Promise<SyllabusDoc> {
  const col = await collection();
  const doc: SyllabusDoc = {
    syllabusId: randomUUID(),
    email: email.toLowerCase(),
    uploadedAt: new Date(),
    ...data,
  };
  await col.insertOne(doc);
  return doc;
}

export async function getSyllabusesByEmail(email: string): Promise<SyllabusDoc[]> {
  const col = await collection();
  return col
    .find({ email: email.toLowerCase() })
    .sort({ uploadedAt: -1 })
    .toArray();
}

export async function deleteSyllabus(syllabusId: string, email: string): Promise<void> {
  const col = await collection();
  await col.deleteOne({ syllabusId, email: email.toLowerCase() });
}

export async function deleteAllSyllabuses(email: string): Promise<void> {
  const col = await collection();
  await col.deleteMany({ email: email.toLowerCase() });
}
