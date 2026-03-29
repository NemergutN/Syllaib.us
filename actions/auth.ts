"use server";

import { redirect } from "next/navigation";
import clientPromise from "@/app/db";
import bcrypt from "bcryptjs";

export type RegisterState = {
  errors?: {
    username?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    general?: string[];
  };
  success?: boolean;
};

export async function registerUser(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const username = (formData.get("username") || "").toString().trim();
  const rawEmail = (formData.get("email") || "").toString();
  const email = rawEmail.trim().toLowerCase();
  const password = (formData.get("password") || "").toString();
  const confirmPassword = (formData.get("confirmPassword") || "").toString();

  const normalizedEmail = email;
  const errors: RegisterState["errors"] = {};

  if (!username || username.trim().length < 2) {
    errors.username = ["Username must be at least 2 characters."];
  }

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
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

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Your DB call goes here


  const client = await clientPromise;
  const db = client.db("syllabusDataBase");
  const users = db.collection("Users");

  // Ensure unique email / username (case-insensitive for email)
  const existingUser = await users.findOne({
    $or: [
      { email: normalizedEmail },
      { username },
      { email: { $regex: `^${normalizedEmail}$`, $options: "i" } } // case-insensitive fallback
    ]
  });

  if (existingUser) {
    return {
      errors: {
        general: ["User with this email or username already exists."]
      }
    };
  }



  try {
    await users.insertOne({
      username,
      email: normalizedEmail,
      password: hashedPassword,
      major: null,
      careerGoal: null,
      createdAt: new Date(),
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return {
        errors: {
          general: ["User with this email or username already exists."]
        }
      };
    }
    throw error;
  }

  await new Promise((r) => setTimeout(r, 800)); // simulate async

  return { success: true };
}

export type LoginState = {
  errors?: {
    email?: string[];
    password?: string[];
    general?: string[];
  };
};

export async function loginUser(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const rawEmail = (formData.get("email") || "").toString();
  const email = rawEmail.trim().toLowerCase();
  const password = (formData.get("password") || "").toString();

  const errors: LoginState["errors"] = {};

  if (!email || !email.includes("@")) {
    errors.email = ["Please enter a valid email address."];
  }

  if (!password) {
    errors.password = ["Password is required."];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    const client = await clientPromise;
    const db = client.db("syllabusDataBase");
    const users = db.collection("Users");

    const user = await users.findOne({ email });

    if (!user) {
      return {
        errors: {
          general: ["Invalid email or password."]
        }
      };
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return {
        errors: {
          general: ["Invalid email or password."]
        }
      };
    }

    // TODO: Create session/token here
    console.log("Login successful for user:", user.username);

    await new Promise((r) => setTimeout(r, 800)); // simulate async

    redirect("/dashboard");

  } catch (error) {
    console.error("Login error:", error);
    return {
      errors: {
        general: ["An error occurred during login."]
      }
    };
  }
}