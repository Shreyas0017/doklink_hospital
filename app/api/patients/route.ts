import { NextRequest, NextResponse } from "next/server";
import { getHospitalDb } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getHospitalDb(session.user.hospitalId);
    const patients = await db.collection("patients").find({}).toArray();

    // Transform _id to id for frontend
    const transformedPatients = patients.map((patient: any) => ({
      ...patient,
      id: patient._id?.toString(),
      assignedBed: patient.assignedBed?.toString(),
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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const db = await getHospitalDb(session.user.hospitalId);

    const patientData = {
      ...body,
      hospitalId: new ObjectId(session.user.hospitalId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("patients").insertOne(patientData);

    return NextResponse.json(
      { ...patientData, id: result.insertedId.toString() },
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
