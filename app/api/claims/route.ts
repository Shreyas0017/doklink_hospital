import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const claims = await db.collection("claims").find({}).toArray();

    // Transform _id to id for frontend
    const transformedClaims = claims.map((claim: any) => ({
      ...claim,
      id: claim._id?.toString(),
    }));

    return NextResponse.json(transformedClaims);
  } catch (error) {
    console.error("Failed to fetch claims:", error);
    return NextResponse.json(
      { error: "Failed to fetch claims" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb();

    const result = await db.collection("claims").insertOne(body);

    return NextResponse.json(
      { ...body, id: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create claim:", error);
    return NextResponse.json(
      { error: "Failed to create claim" },
      { status: 500 }
    );
  }
}
