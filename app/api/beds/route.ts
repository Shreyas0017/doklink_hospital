import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const beds = await db.collection("beds").find({}).toArray();

    // Transform _id to id for frontend
    const transformedBeds = beds.map((bed: any) => ({
      ...bed,
      id: bed._id?.toString(),
    }));

    return NextResponse.json(transformedBeds);
  } catch (error) {
    console.error("Failed to fetch beds:", error);
    return NextResponse.json(
      { error: "Failed to fetch beds" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb();

    const result = await db.collection("beds").insertOne(body);

    return NextResponse.json(
      { ...body, id: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create bed:", error);
    return NextResponse.json(
      { error: "Failed to create bed" },
      { status: 500 }
    );
  }
}
