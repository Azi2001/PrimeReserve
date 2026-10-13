
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ReservationActionsProps = {
  reservationId: number;
  status: string;
};

export default function ReservationActions({
  reservationId,
  status,
}: ReservationActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cancelReservation() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this reservation?"
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not cancel the reservation.");
        return;
      }

      router.refresh();
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "CANCELLED") {
    return <span className="text-xs text-slate-500">Cancelled</span>;
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={cancelReservation}
        disabled={loading}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
      >
        {loading ? "Cancelling..." : "Cancel reservation"}
      </button>

      {error && (
        <p role="alert" className="max-w-xs text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
