import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/doklink_hospital";

async function testSuperAdmin() {
  console.log("🔍 Testing SuperAdmin login...");

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db();

    // Find SuperAdmin
    const user = await db.collection("users").findOne({
      email: "superadmin@doklink.com",
    });

    if (!user) {
      console.log("❌ SuperAdmin not found!");
      return;
    }

    console.log("\n📋 User Details:");
    console.log("   Email:", user.email);
    console.log("   Name:", user.name);
    console.log("   Role:", user.role);
    console.log("   Is Active:", user.isActive);
    console.log("   Has Password Hash:", !!user.passwordHash);

    // Test password
    const testPassword = "Super@123";
    console.log("\n🔐 Testing Password:", testPassword);
    
    const isValid = await bcrypt.compare(testPassword, user.passwordHash);
    console.log("   Password Valid:", isValid ? "✅ YES" : "❌ NO");

    if (!isValid) {
      console.log("\n⚠️  Resetting password to Super@123...");
      const newHash = await bcrypt.hash(testPassword, 10);
      await db.collection("users").updateOne(
        { email: "superadmin@doklink.com" },
        { $set: { passwordHash: newHash, updatedAt: new Date() } }
      );
      console.log("✅ Password reset successfully!");
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
    console.log("\n✅ Database connection closed");
  }
}

testSuperAdmin();
