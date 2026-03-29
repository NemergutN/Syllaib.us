"use server";

import clientPromise from "@/app/db";
import bcrypt from "bcryptjs";

export type LoginResult = {
  success: boolean;
  message?: string;
};

export async function login(formData: FormData): Promise<LoginResult> {
  const rawEmail = (formData.get("email") || "").toString();
  const password = (formData.get("password") || "").toString();
  const email = rawEmail.trim().toLowerCase();

  if (!email || !password) {
    return { success: false, message: "Please provide email and password." };
  }

  const client = await clientPromise;
  const db = client.db("syllabusDataBase");
  const users = db.collection("Users");

  const user = await users.findOne({ email });
  console.log("[login] input", { email, password: password ? "<hidden>" : "" });
  console.log("[login] found user", user ? { email: user.email, passwordHash: user.password } : null);

  if (!user) {
    return { success: false, message: "Invalid credentials." };
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return { success: false, message: "Invalid credentials." };
  }

  return { success: true };
}