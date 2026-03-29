"use server";

import { redirect } from "next/navigation";
import clientPromise from "@/app/db";

export type RegisterState = {
  errors?: {
    username?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    general?: string[];
  };
};

export async function registerUser(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const errors: RegisterState["errors"] = {};

  if (!username || username.trim().length < 2) {
    errors.username = ["Username must be at least 2 characters."];
  }

  if (!email || !email.includes("@")) {
    errors.email = ["Please enter a valid email address."];
  }

  if (!password || password.length < 6) {
    errors.password = ["Password must be at least 6 characters."];
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = ["Passwords do not match."];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // Your DB call goes here, e.g.:
  // await db.user.create({ data: { username, email, password: await hash(password) } });
const client = await clientPromise;
const db = client.db("syllabusDataBase");
const users = db.collection("Users");

await users.insertOne({
  username,
  email,
  password,
  createdAt: new Date(),
});


  await new Promise((r) => setTimeout(r, 800)); // simulate async

  redirect("/");
}