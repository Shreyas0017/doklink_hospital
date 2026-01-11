import { MongoClient, Db, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI missing");

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const client = new MongoClient(uri);

const clientPromise =
  global._mongoClientPromise ??
  (global._mongoClientPromise = client.connect());

export default clientPromise;

// Get main database for shared collections (users, hospitals)
export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db("doklink_main");
}

// Get hospital-specific database
export async function getHospitalDb(hospitalId: string | ObjectId): Promise<Db> {
  const client = await clientPromise;
  const id = typeof hospitalId === 'string' ? hospitalId : hospitalId.toString();
  // Each hospital gets its own database: dh_<id> (shortened to fit MongoDB 38 byte limit)
  return client.db(`dh_${id}`);
}
