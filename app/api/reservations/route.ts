
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Please log in to view reservations." },
        { status: 401 }
      );
    }

    const reservations = await prisma.reservation.findMany({
      where:
        session.role === "ADMIN"
          ? {}
          : { userId: session.id },
      include: {
        resource: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("Failed to fetch reservations:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Please log in to create a reservation." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const resourceId = Number(body.resourceId);
    const startTime =
      typeof body.startTime === "string"
        ? new Date(body.startTime)
        : new Date("");
    const endTime =
      typeof body.endTime === "string"
        ? new Date(body.endTime)
        : new Date("");
    const notes =
      typeof body.notes === "string" ? body.notes.trim() : "";

    if (!Number.isSafeInteger(resourceId) || resourceId < 1) {
      return NextResponse.json(
        { error: "Please select a valid resource." },
        { status: 400 }
      );
    }

    if (
      Number.isNaN(startTime.getTime()) ||
      Number.isNaN(endTime.getTime()) ||
      endTime <= startTime
    ) {
      return NextResponse.json(
        { error: "Please provide valid start and end times. End time must be after start time." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const resource = await tx.resource.findUnique({
        where: { id: resourceId },
      });

      if (!resource) {
        return {
          error: "Resource not found.",
          status: 404,
        };
      }

      if (resource.status !== "AVAILABLE") {
        return {
          error: "This resource is currently unavailable.",
          status: 409,
        };
      }

      // Two reservations overlap when the existing start is before
      // the requested end AND the existing end is after the requested start.
      const conflict = await tx.reservation.findFirst({
        where: {
          resourceId,
          status: { in: ["PENDING", "CONFIRMED"] },
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      });

      if (conflict) {
        return {
          error: "This resource is already reserved during that time.",
          status: 409,
        };
      }

      const reservation = await tx.reservation.create({
        data: {
          resourceId,
          userId: session.id,
          requester: session.name,
          startTime,
          endTime,
          notes: notes || null,
          status: "CONFIRMED",
        },
        include: {
          resource: true,
        },
      });

      return { reservation };
    });

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.reservation, { status: 201 });
  } catch (error) {
    console.error("Failed to create reservation:", error);
    return NextResponse.json(
      { error: "Failed to create reservation." },
      { status: 500 }
    );
  }
}
