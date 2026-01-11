import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error("MONGODB_URI missing");

const dbName = process.env.MONGODB_DB_NAME || "doklink";

declare global {
  let _mongo: Promise<MongoClient> | undefined;
}


const client = new MongoClient(uri, options);

const clientPromise =
  global._mongo ?? (global._mongo = client.connect());

export default clientPromise;

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}