
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "You must log in first." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const reservationId = Number(id);

    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      return NextResponse.json(
        { error: "Invalid reservation ID." },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found." },
        { status: 404 }
      );
    }

    // Staff may cancel only their own reservations.
    // Administrators may cancel any reservation.
    if (
      session.role !== "ADMIN" &&
      reservation.userId !== session.id
    ) {
      return NextResponse.json(
        { error: "You can only cancel your own reservations." },
        { status: 403 }
      );
    }

    if (reservation.status === "CANCELLED") {
      return NextResponse.json(
        { error: "This reservation is already cancelled." },
        { status: 409 }
      );
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "CANCELLED" },
      include: {
        resource: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      message: "Reservation cancelled successfully.",
      reservation: updatedReservation,
    });
  } catch (error) {
    console.error("Reservation cancellation error:", error);

    return NextResponse.json(
      { error: "Unable to cancel the reservation." },
      { status: 500 }
    );
  }
}
