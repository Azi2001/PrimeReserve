
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResourceForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") ?? ""),
      type: String(formData.get("type") ?? ""),
      location: String(formData.get("location") ?? ""),
      description: String(formData.get("description") ?? ""),
    };

    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Unable to create resource.");
        return;
      }

      form.reset();
      setOpen(false);
      router.refresh();
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setError("");
        }}
        className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
      >
        {open ? "Cancel" : "+ Add resource"}
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 w-full space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="font-bold">Add a new resource</h3>

          <div>
            <label htmlFor="resource-name" className="mb-1 block text-sm font-medium">
              Resource name *
            </label>
            <input
              id="resource-name"
              name="name"
              required
              maxLength={100}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="e.g. Conference Room B"
            />
          </div>

          <div>
            <label htmlFor="resource-type" className="mb-1 block text-sm font-medium">
              Resource type *
            </label>
            <select
              id="resource-type"
              name="type"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              defaultValue=""
            >
              <option value="" disabled>Select a type</option>
              <option value="Meeting Room">Meeting Room</option>
              <option value="Equipment">Equipment</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Workspace">Workspace</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="resource-location" className="mb-1 block text-sm font-medium">
              Location
            </label>
            <input
              id="resource-location"
              name="location"
              maxLength={150}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="e.g. Floor 2"
            />
          </div>

          <div>
            <label htmlFor="resource-description" className="mb-1 block text-sm font-medium">
              Description
            </label>
            <textarea
              id="resource-description"
              name="description"
              maxLength={1000}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Optional details"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save resource"}
          </button>
        </form>
      )}
    </div>
  );
}
