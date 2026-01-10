import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error("MONGODB_URI missing");

// Optional: Specify your database name
// If not specified, MongoDB will use the database name from your connection string
const dbName = process.env.MONGODB_DB_NAME;

declare global {
  let _mongo: Promise<MongoClient> | undefined;
}

const client = new MongoClient(uri);

const clientPromise =
  global._mongo ?? (global._mongo = client.connect());

// Export default for backward compatibility
export default clientPromise;

// Export getDb function for the new API routes
export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}