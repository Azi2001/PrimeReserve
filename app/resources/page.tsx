
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/app/components/LogoutButton";
import ResourceForm from "@/app/components/ResourceForm";
export const instant = false;
import ResourceActions from "@/app/components/ResourceActions";



export default async function ResourcesPage() {
  const session = await getSession();

  if (!session) redirect("/login");

  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: "desc" },
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
              Resources
            </h1>
            <p className="mt-2 text-slate-500">
               View and manage your organization&apos;s resources.
            </p>
          </div>
          <LogoutButton />
        </div>

        {session.role === "ADMIN" && (
          <div className="mb-8">
            <ResourceForm />
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              All resources
            </h2>
            <span className="text-sm text-slate-500">
              {resources.length} total
            </span>
          </div>

          {resources.length === 0 ? (
            <p className="py-8 text-center text-slate-500">
              No resources have been added yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-3 py-3 font-medium">Name</th>
                    <th className="px-3 py-3 font-medium">Type</th>
                    <th className="px-3 py-3 font-medium">Location</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((resource) => (
                    <tr key={resource.id} className="border-b border-slate-100">
                      <td className="px-3 py-4 font-semibold text-slate-900">
                        {resource.name}
                      </td>
                      <td className="px-3 py-4 text-slate-600">
                        {resource.type}
                      </td>
                      <td className="px-3 py-4 text-slate-600">
                        {resource.location || "—"}
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={
                            resource.status === "AVAILABLE"
                              ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                              : "rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
                          }
                        >
                          {resource.status === "AVAILABLE"
                            ? "Available"
                            : "Unavailable"}
                        </span>
                      </td>
                      <td className="px-3 py-4">
  {session.role === "ADMIN" ? (
    <ResourceActions
      id={resource.id}
      name={resource.name}
      type={resource.type}
      location={resource.location}
      description={resource.description}
      status={resource.status}
    />
  ) : (
    <span className="text-xs text-slate-400">View only</span>
  )}
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
