

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    // Check whether the user is logged in.
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "You must log in to view resources." },
        { status: 401 }
      );
    }

    // Fetch resources from PostgreSQL.
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error("Failed to fetch resources:", error);

    return NextResponse.json(
      { error: "Failed to fetch resources." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check whether the user is logged in.
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "You must log in to create resources." },
        { status: 401 }
      );
    }

    // Only administrators can create resources.
    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only administrators can create resources." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const type =
      typeof body.type === "string" ? body.type.trim() : "";

    const location =
      typeof body.location === "string"
        ? body.location.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    if (!name || !type) {
      return NextResponse.json(
        { error: "Resource name and type are required." },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.create({
      data: {
        name,
        type,
        location: location || null,
        description: description || null,
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("Failed to create resource:", error);

    return NextResponse.json(
      { error: "Failed to create resource." },
      { status: 500 }
    );
  }
}
