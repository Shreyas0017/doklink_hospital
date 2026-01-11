import { getDb } from "@/lib/mongodb";

export async function GET() {
  const db = await getDb();
  const collections = await db.listCollections().toArray();

  return Response.json({
    dbName: db.databaseName,
    collections: collections.map(c => c.name),
  });
}
