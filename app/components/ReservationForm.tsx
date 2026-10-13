
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Resource = {
  id: number;
  name: string;
  type: string;
  location: string | null;
  status: "AVAILABLE" | "UNAVAILABLE";
};

export default function ReservationForm() {
  const router = useRouter();

  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceId, setResourceId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingResources, setLoadingResources] = useState(true);

  useEffect(() => {
    async function loadResources() {
      try {
        const response = await fetch("/api/resources");
        const data = await response.json();

        if (!response.ok) {
          setError(data.error ?? "Could not load resources.");
          return;
        }

        const available = (data as Resource[]).filter(
          (resource) => resource.status === "AVAILABLE"
        );

        setResources(available);

        if (available.length > 0) {
          setResourceId(String(available[0].id));
        }
      } catch {
        setError("Could not connect to load resources.");
      } finally {
        setLoadingResources(false);
      }
    }

    loadResources();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!resourceId || !startTime || !endTime) {
      setError("Please select a resource and both booking times.");
      return;
    }

    if (new Date(startTime) <= new Date()) {
      setError("The start time must be in the future.");
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setError("The end time must be later than the start time.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId: Number(resourceId),
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          notes: notes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Unable to create reservation.");
        return;
      }

      setSuccess("Reservation created successfully!");
      setStartTime("");
      setEndTime("");
      setNotes("");

      router.refresh();
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900">
          Create a reservation
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose an available resource and booking time.
        </p>
      </div>

      {loadingResources ? (
        <p className="text-sm text-slate-500">Loading resources...</p>
      ) : resources.length === 0 ? (
        <p className="text-sm text-amber-700">
          No available resources. Please ask an administrator to add or enable
          a resource.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="reservation-resource"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Resource *
            </label>
            <select
              id="reservation-resource"
              value={resourceId}
              onChange={(event) => setResourceId(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {resources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name} — {resource.type}
                  {resource.location ? ` (${resource.location})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="reservation-start"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Start date and time *
            </label>
            <input
              id="reservation-start"
              type="datetime-local"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="reservation-end"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              End date and time *
            </label>
            <input
              id="reservation-end"
              type="datetime-local"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="reservation-notes"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Notes (optional)
            </label>
            <textarea
              id="reservation-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={1000}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Purpose of the reservation"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          {success && (
            <p role="status" className="text-sm text-green-700">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Booking..." : "Create reservation"}
          </button>
        </form>
      )}
    </section>
  );
}
