import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const patients = await db.collection("patients").find({}).toArray();

    // Transform _id to id for frontend
    const transformedPatients = patients.map((patient: any) => ({
      ...patient,
      id: patient._id?.toString(),
    }));

    return NextResponse.json(transformedPatients);
  } catch (error) {
    console.error("Failed to fetch patients:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb();

    const result = await db.collection("patients").insertOne(body);

    return NextResponse.json(
      { ...body, id: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create patient:", error);
    return NextResponse.json(
      { error: "Failed to create patient" },
      { status: 500 }
    );
  }
}
