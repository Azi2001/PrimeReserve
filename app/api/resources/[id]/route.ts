
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Please log in." }, { status: 401 });
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const { id: rawId } = await context.params;
    const id = Number(rawId);

    if (!Number.isSafeInteger(id) || id < 1) {
      return NextResponse.json({ error: "Invalid resource ID." }, { status: 400 });
    }

    const body = await request.json();
    const data: {
      name?: string;
      type?: string;
      location?: string | null;
      description?: string | null;
      status?: "AVAILABLE" | "UNAVAILABLE";
    } = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
      }
      data.name = body.name.trim();
    }

    if (body.type !== undefined) {
      if (typeof body.type !== "string" || !body.type.trim()) {
        return NextResponse.json({ error: "Type cannot be empty." }, { status: 400 });
      }
      data.type = body.type.trim();
    }

    for (const field of ["location", "description"] as const) {
      if (body[field] !== undefined) {
        if (body[field] !== null && typeof body[field] !== "string") {
          return NextResponse.json({ error: `Invalid ${field}.` }, { status: 400 });
        }
        data[field] = typeof body[field] === "string" ? body[field].trim() || null : null;
      }
    }

    if (body.status !== undefined) {
      if (body.status !== "AVAILABLE" && body.status !== "UNAVAILABLE") {
        return NextResponse.json({ error: "Invalid resource status." }, { status: 400 });
      }
      data.status = body.status;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields provided." }, { status: 400 });
    }

    const resource = await prisma.resource.update({ where: { id }, data });
    return NextResponse.json(resource);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "Resource not found." }, { status: 404 });
    }
    console.error("Failed to update resource:", error);
    return NextResponse.json({ error: "Failed to update resource." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Please log in." }, { status: 401 });
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const { id: rawId } = await context.params;
    const id = Number(rawId);

    if (!Number.isSafeInteger(id) || id < 1) {
      return NextResponse.json({ error: "Invalid resource ID." }, { status: 400 });
    }

    await prisma.resource.delete({ where: { id } });
    return NextResponse.json({ message: "Resource deleted successfully." });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Resource not found." }, { status: 404 });
      }
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "This resource has reservations and cannot be deleted." },
          { status: 409 }
        );
      }
    }
    console.error("Failed to delete resource:", error);
    return NextResponse.json({ error: "Failed to delete resource." }, { status: 500 });
  }
}
