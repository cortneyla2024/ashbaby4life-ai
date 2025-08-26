import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/database";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify user is a member of the circle
    const circle = await prisma.familyCircle.findFirst({
      where: {
        id: params.id,
        members: {
          some: {
            id: user.id,
          },
        },
      },
    });

    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }

    const { email } = await request.json();

    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find the user to add
    const memberToAdd = await prisma.user.findUnique({
      where: { email: email.trim() },
    });

    if (!memberToAdd) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is already a member
    const existingMember = await prisma.familyCircle.findFirst({
      where: {
        id: params.id,
        members: {
          some: {
            id: memberToAdd.id,
          },
        },
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: "User is already a member" }, { status: 400 });
    }

    // Add member to circle
    const updatedCircle = await prisma.familyCircle.update({
      where: { id: params.id },
      data: {
        members: {
          connect: { id: memberToAdd.id },
        },
      },
      include: {
        members: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ circle: updatedCircle });
  } catch (error) {
    console.error("Error adding member:", error);
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 }
    );
  }
}
