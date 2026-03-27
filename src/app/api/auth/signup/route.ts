import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signupSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    // Check if user already exists
    const existingUsers = await query<any[]>(
      "SELECT id FROM User WHERE email = ?",
      [validatedData.email.toLowerCase()]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const userId = crypto.randomUUID();
    await query(
      "INSERT INTO User (id, email, name, password) VALUES (?, ?, ?, ?)",
      [userId, validatedData.email.toLowerCase(), validatedData.name, hashedPassword]
    );

    return NextResponse.json(
      {
        user: {
          id: userId,
          email: validatedData.email,
          name: validatedData.name,
        },
        message: "User created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }

    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
