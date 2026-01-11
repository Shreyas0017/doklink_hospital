import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

// Register a new hospital and its first admin user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      hospitalName,
      hospitalCode,
      hospitalAddress,
      hospitalPhone,
      hospitalEmail,
      adminName,
      adminEmail,
      adminPassword,
      adminPhone,
    } = body;

    // Validation
    if (
      !hospitalName ||
      !hospitalCode ||
      !hospitalAddress ||
      !hospitalPhone ||
      !hospitalEmail ||
      !adminName ||
      !adminEmail ||
      !adminPassword
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check if hospital code already exists
    const existingHospital = await db.collection("hospitals").findOne({
      code: hospitalCode.toLowerCase(),
    });

    if (existingHospital) {
      return NextResponse.json(
        { error: "Hospital code already exists" },
        { status: 400 }
      );
    }

    // Check if admin email already exists
    const existingUser = await db.collection("users").findOne({
      email: adminEmail.toLowerCase(),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Create hospital
    const hospital = {
      name: hospitalName,
      code: hospitalCode.toLowerCase(),
      address: hospitalAddress,
      phone: hospitalPhone,
      email: hospitalEmail.toLowerCase(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const hospitalResult = await db.collection("hospitals").insertOne(hospital);
    const hospitalId = hospitalResult.insertedId;

    // Hash password
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const user = {
      hospitalId,
      name: adminName,
      email: adminEmail.toLowerCase(),
      passwordHash,
      role: "Admin",
      isActive: true,
      phone: adminPhone || "",
      department: "Administration",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("users").insertOne(user);

    return NextResponse.json({
      success: true,
      message: "Hospital registered successfully",
      hospitalId: hospitalId.toString(),
    });
  } catch (error) {
    console.error("Error registering hospital:", error);
    return NextResponse.json(
      { error: "Failed to register hospital" },
      { status: 500 }
    );
  }
}

// Get all hospitals (for super admin or public listing)
export async function GET() {
  try {
    const db = await getDb();
    const hospitals = await db
      .collection("hospitals")
      .find({ isActive: true })
      .project({ name: 1, code: 1, address: 1, phone: 1, email: 1 })
      .toArray();

    return NextResponse.json(
      hospitals.map((h) => ({
        id: h._id.toString(),
        name: h.name,
        code: h.code,
        address: h.address,
        phone: h.phone,
        email: h.email,
      }))
    );
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    return NextResponse.json(
      { error: "Failed to fetch hospitals" },
      { status: 500 }
    );
  }
}
