import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";
;

const prisma = new PrismaClient();

export async function PUT(
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

    // Verify the routine belongs to the user
    const existingRoutine = await prisma.automationRoutine.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingRoutine) {
      return NextResponse.json({ error: "Automation routine not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, isEnabled } = body;

    // Prepare update data
    const updateData: any = {};

    if (name !== undefined) {
updateData.name = name;
}
    if (description !== undefined) {
updateData.description = description;
}
    if (isEnabled !== undefined) {
updateData.isEnabled = isEnabled;
}

    // Update the routine
    const updatedRoutine = await prisma.automationRoutine.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ routine: updatedRoutine });
  } catch (error) {
    console.error("Error updating automation routine:", error);
    return NextResponse.json(
      { error: "Failed to update automation routine" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
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

    // Verify the routine belongs to the user
    const existingRoutine = await prisma.automationRoutine.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingRoutine) {
      return NextResponse.json({ error: "Automation routine not found" }, { status: 404 });
    }

    // Delete the routine (triggers, actions, and logs will be deleted via cascade)
    await prisma.automationRoutine.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Automation routine deleted successfully" });
  } catch (error) {
    console.error("Error deleting automation routine:", error);
    return NextResponse.json(
      { error: "Failed to delete automation routine" },
      { status: 500 }
    );
  }
}
