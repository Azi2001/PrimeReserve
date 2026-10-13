
export const instant = false;

import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/app/components/LogoutButton";
import ReservationForm from "@/app/components/ReservationForm";
import ReservationActions from "@/app/components/ReservationActions";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-LK", {
    timeZone: "Asia/Colombo",
    dateStyle: "medium",
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-LK", {
    timeZone: "Asia/Colombo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function ReservationsPage() {
  const session = await getSession();

  if (!session) redirect("/login");

  const reservations = await prisma.reservation.findMany({
    where:
      session.role === "ADMIN"
        ? {}
        : { userId: session.id },
    include: {
      resource: true,
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { startTime: "desc" },
  });

  return (
    <main className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/" className="text-sm text-indigo-600 hover:underline">
              ← Back to dashboard
            </Link>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">
              Reservations
            </h1>
            <p className="mt-2 text-slate-500">
              View and manage resource bookings.
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="mb-8">
          <ReservationForm />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              All reservations
            </h2>
            <span className="text-sm text-slate-500">
              {reservations.length} total
            </span>
          </div>

          {reservations.length === 0 ? (
            <p className="py-8 text-center text-slate-500">
              No reservations found. Create your first booking above.
            </p>
          ) : (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <article
                  key={reservation.id}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {reservation.resource.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {reservation.resource.type}
                      {reservation.resource.location
                        ? ` · ${reservation.resource.location}`
                        : ""}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      {formatDate(reservation.startTime)} ·{" "}
                      {formatTime(reservation.startTime)} –{" "}
                      {formatTime(reservation.endTime)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Requested by: {reservation.user.name}
                    </p>
                    {reservation.notes && (
                      <p className="mt-1 text-sm text-slate-500">
                        Notes: {reservation.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <span
                      className={
                        reservation.status === "CONFIRMED"
                          ? "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
                          : reservation.status === "CANCELLED"
                            ? "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                            : "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"
                      }
                    >
                      {reservation.status}
                    </span>

                    <ReservationActions
                      reservationId={reservation.id}
                      status={reservation.status}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
