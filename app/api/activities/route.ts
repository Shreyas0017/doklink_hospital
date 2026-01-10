import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Activity } from "@/lib/types";

export async function GET() {
  const client = await clientPromise;
  const activities = await client
    .db()
    .collection<Activity>("activities")
    .find()
    .sort({ time: -1 })
    .toArray();

  return NextResponse.json(activities);
}

export async function POST(req: Request) {
  const body = await req.json();

  const client = await clientPromise;
  await client.db().collection("activities").insertOne({
    ...body,
    time: new Date(),
    createdAt: new Date(),
  });

  return NextResponse.json({ success: true });
}
