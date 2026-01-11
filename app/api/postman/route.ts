import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const collections = await db.listCollections().toArray();

    return Response.json({
      success: true,
      dbName: db.databaseName,
      collections: collections.map(c => c.name),
    });
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
