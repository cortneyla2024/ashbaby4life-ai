import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

// Generate a secure random token
function generateSecureToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { apiToken: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If user already has a token, delete it first
    if (user.apiToken) {
      await prisma.userAPIToken.delete({
        where: { userId: user.id },
      });
    }

    // Generate new token
    const plainToken = generateSecureToken();
    const tokenHash = await bcrypt.hash(plainToken, 12);

    // Save the hashed token
    await prisma.userAPIToken.create({
      data: {
        userId: user.id,
        tokenHash: tokenHash,
      },
    });

    return NextResponse.json({
      message: "API token generated successfully",
      token: plainToken,
      warning: "This token will only be shown once. Please save it securely.",
    });

  } catch (error) {
    console.error("Error generating API token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { apiToken: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.apiToken) {
      return NextResponse.json({ error: "No API token found" }, { status: 404 });
    }

    // Delete the token
    await prisma.userAPIToken.delete({
      where: { userId: user.id },
    });

    return NextResponse.json({
      message: "API token revoked successfully",
    });

  } catch (error) {
    console.error("Error revoking API token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
