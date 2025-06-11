import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

export async function POST(req: NextRequest) {
  try {
    const body = req.json();
    const { name, description, prompt, categories, pricing } = body;

    const Agent = z.object({
      name: z.string(),
      description: z.string(),
      prompt: z.string(),
      categories: z.array(z.string()),
      pricing: z.enum(["message", "daily", "weekly", "monthly", "yearly"]),
    });
    const data = Agent.parse(body);
    await prisma.
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { status: false, message: error.message, errors: error.issues },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      return NextResponse.json(
        { status: false, message: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { status: false, message: "An error occur, Try again" },
      { status: 500 }
    );
  }
}
