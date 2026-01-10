import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const documents = await db.collection("documents").find({}).toArray();

    // Transform _id to id for frontend
    const transformedDocs = documents.map((doc: any) => ({
      ...doc,
      id: doc._id?.toString(),
    }));

    return NextResponse.json(transformedDocs);
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb();

    const result = await db.collection("documents").insertOne(body);

    return NextResponse.json(
      { ...body, id: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
