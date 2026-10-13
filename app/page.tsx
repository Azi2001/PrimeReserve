
export const instant = false;

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/app/components/LogoutButton";
import ResourceForm from "@/app/components/ResourceForm";
import ReservationForm from "@/app/components/ReservationForm";
import ReservationActions from "@/app/components/ReservationActions";
import Link from "next/link";

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

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);

  const todayEnd = new Date(todayStart);
  todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

  const reservationFilter =
    session.role === "ADMIN" ? {} : { userId: session.id };

  const [
    resources,
    totalResources,
    availableResources,
    todayBookings,
    pendingBookings,
    upcomingReservations,
  ] = await Promise.all([
    prisma.resource.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.resource.count(),
    prisma.resource.count({
      where: { status: "AVAILABLE" },
    }),
    prisma.reservation.count({
      where: {
        ...reservationFilter,
        status: { in: ["PENDING", "CONFIRMED"] },
        startTime: { gte: todayStart, lt: todayEnd },
      },
    }),
    prisma.reservation.count({
      where: {
        ...reservationFilter,
        status: "PENDING",
      },
    }),
    prisma.reservation.findMany({
      where: {
        ...reservationFilter,
        status: { in: ["PENDING", "CONFIRMED"] },
        endTime: { gt: now },
      },
      include: {
        resource: true,
        user: { select: { name: true } },
      },
      orderBy: { startTime: "asc" },
      take: 3,
    }),
  ]);

  const stats = [
    {
      label: "Total resources",
      value: String(totalResources),
      note: "Across all categories",
      icon: "▦",
    },
    {
      label: "Available resources",
      value: String(availableResources),
      note: "Marked available",
      icon: "✓",
    },
    {
      label: "Today's bookings",
      value: String(todayBookings),
      note: "Starting today",
      icon: "▣",
    },
    {
      label: "Pending requests",
      value: String(pendingBookings),
      note: "Awaiting confirmation",
      icon: "◷",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900 md:flex">
      <aside className="w-full shrink-0 bg-[#111b32] p-5 text-white md:min-h-screen md:w-64">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-xl font-bold">
            P
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">PrimeReserve</h1>
            <p className="text-xs text-slate-400">Resource management</p>
          </div>
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Workspace
        </p>
             
<nav className="space-y-2">
  <Link
    href="/"
    className="flex items-center gap-3 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white"
  >
    <span>◫</span>
    Dashboard
  </Link>

  <Link
    href="/resources"
    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10"
  >
    <span>▦</span>
    Resources
  </Link>

  <Link
    href="/reservations"
    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10"
  >
    <span>▣</span>
    Reservations
  </Link>
</nav>
  
        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold">Reservation tip</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Check resource availability before scheduling your next booking.
          </p>
        </div>

        <div className="mt-8 border-t border-white/10 pt-5">
          <p className="text-xs text-slate-400">PrimeWave Lab</p>
          <p className="mt-1 text-xs text-slate-500">
            Internal resource portal
          </p>
        </div>
      </aside>

      <section id="dashboard" className="min-w-0 flex-1 p-5 md:p-9">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Workspace / Overview</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Dashboard
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Manage shared resources and keep every reservation organized.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
              {getInitials(session.name) || "U"}
            </div>
            <div>
              <p className="text-sm font-semibold">{session.name}</p>
              <p className="text-xs text-slate-500">
                {session.role === "ADMIN" ? "Administrator" : "Staff"}
              </p>
            </div>
            <LogoutButton />
          </div>
        </header>


        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-600">
                  {stat.icon}
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight">
                {stat.value}
              </p>
              <p className="mt-2 text-xs text-slate-500">{stat.note}</p>
            </article>
          ))}
        </div>

        <ReservationForm />
      
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_1fr]">
          <section
            id="resources"
            className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h3 className="font-bold">Resource overview</h3>

                <p className="mt-1 text-xs text-slate-500">
                  
                  A quick look at shared resources

                </p> 

              </div>
              <span className="text-sm text-slate-500">
                {totalResources} total
              </span>
            </div>
            <div className="px-5 py-4">
                <ResourceForm />
            </div>

            <div className="divide-y divide-slate-100">
              {resources.length === 0 ? (
                <p className="p-5 text-sm text-slate-500">
                  No resources yet. Add resources to get started.
                </p>
              ) : (
                resources.map((resource) => (
                  <article
                    key={resource.id}
                    className="flex items-center gap-3 p-4 transition hover:bg-slate-50 sm:p-5"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl text-indigo-700">
                      {resource.type.toLowerCase().includes("room")
                        ? "▦"
                        : "▣"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {resource.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {resource.type}
                        {resource.location ? ` · ${resource.location}` : ""}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        resource.status === "AVAILABLE"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {resource.status === "AVAILABLE"
                        ? "Available"
                        : "Unavailable"}
                    </span>
                  </article>
                ))
              )}
            </div>
          </section>
            


          <section
            id="reservations"
            className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h3 className="font-bold">Upcoming reservations</h3>
                
               
                <p className="mt-1 text-xs text-slate-500">
                  A preview of scheduled bookings
                </p>

                 
              </div>
              <span className="text-sm text-slate-500">
                {upcomingReservations.length} shown
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {upcomingReservations.length === 0 ? (
                <p className="p-5 text-sm text-slate-500">
                  No upcoming reservations yet.
                </p>
              ) : (
                upcomingReservations.map((reservation) => (
                  <article
                    key={reservation.id}
                    className="p-5 transition hover:bg-slate-50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">
                        {getInitials(reservation.user.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold">
                            {reservation.user.name}
                          </p>
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              reservation.status === "CONFIRMED"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {reservation.status === "CONFIRMED"
                              ? "Confirmed"
                              : "Pending"}
                          </span>
                                        <ReservationActions
                                       reservationId={reservation.id}
                                         status={reservation.status}/>
                                
                          
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                          {reservation.resource.name}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          {formatDate(reservation.startTime)} ·{" "}
                          {formatTime(reservation.startTime)} –{" "}
                          {formatTime(reservation.endTime)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <p>PrimeReserve · Resource Reservation Management System</p>
          <p>Assessment project · 2026</p>
        </footer>
      </section>
    </main>
  );
}
