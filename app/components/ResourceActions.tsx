
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ResourceActionsProps = {
  id: number;
  name: string;
  type: string;
  location: string | null;
  description: string | null;
  status: "AVAILABLE" | "UNAVAILABLE";
};

export default function ResourceActions({
  id,
  name,
  type,
  location,
  description,
  status,
}: ResourceActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function editResource() {
    const newName = window.prompt("Resource name:", name);
    if (newName === null) return;

    const newType = window.prompt("Resource type:", type);
    if (newType === null) return;

    const newLocation = window.prompt("Location:", location ?? "");
    if (newLocation === null) return;

    const newDescription = window.prompt(
      "Description:",
      description ?? ""
    );
    if (newDescription === null) return;

    const newStatus = window.prompt(
      "Status: enter AVAILABLE or UNAVAILABLE",
      status
    );
    if (newStatus === null) return;

    const normalizedStatus = newStatus.trim().toUpperCase();

    if (!["AVAILABLE", "UNAVAILABLE"].includes(normalizedStatus)) {
      setError("Status must be AVAILABLE or UNAVAILABLE.");
      return;
    }

    if (!newName.trim() || !newType.trim()) {
      setError("Resource name and type are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          type: newType.trim(),
          location: newLocation.trim(),
          description: newDescription.trim(),
          status: normalizedStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not update the resource.");
        return;
      }

      router.refresh();
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteResource() {
    const confirmed = window.confirm(
      `Delete "${name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not delete the resource.");
        return;
      }

      router.refresh();
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={editResource}
          disabled={loading}
          className="rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={deleteResource}
          disabled={loading}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Delete
        </button>
      </div>

      {error && (
        <p role="alert" className="max-w-xs text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
