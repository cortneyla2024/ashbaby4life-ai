import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/database";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.id) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const communityId = params.id;

    // Check if community exists and is public
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    if (!community.isPublic) {
      return NextResponse.json(
        { error: "Cannot join private community" },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const existingMembership = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: user.id,
          communityId,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "Already a member of this community" },
        { status: 400 }
      );
    }

    // Join the community
    const membership = await prisma.communityMember.create({
      data: {
        userId: user.id,
        communityId,
        role: "MEMBER",
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        community: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json(membership, { status: 201 });
  } catch (error) {
    console.error("Error joining community:", error);
    return NextResponse.json(
      { error: "Failed to join community" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.id) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const communityId = params.id;

    // Check if user is a member
    const membership = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: user.id,
          communityId,
        },
      },
      include: {
        community: true,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this community" },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (membership.community.ownerId === user.id) {
      return NextResponse.json(
        { error: "Community owner cannot leave. Transfer ownership first." },
        { status: 400 }
      );
    }

    // Leave the community
    await prisma.communityMember.delete({
      where: {
        userId_communityId: {
          userId: user.id,
          communityId,
        },
      },
    });

    return NextResponse.json({ message: "Successfully left community" });
  } catch (error) {
    console.error("Error leaving community:", error);
    return NextResponse.json(
      { error: "Failed to leave community" },
      { status: 500 }
    );
  }
}
