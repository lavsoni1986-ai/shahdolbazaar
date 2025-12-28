import 'dotenv/config';
import { db } from "../server/db";
import { offers, products, shops, users } from "../shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");
  try {
    // 1. Create a seller user
    const [seller] = await db.insert(users).values({
      username: "seller1",
      password: "password123",
      role: "seller",
    }).returning();

    // 2. Create a shop
    const [shop] = await db.insert(shops).values({
      ownerId: seller.id,
      name: "Shahdol General Store",
      category: "Grocery",
      description: "Everything you need in one place",
      address: "Main Road, Shahdol",
      phone: "919999999999",
      mobile: "919999999999",
      approved: true,
      isVerified: true,
    }).returning();

    // 3. Create products
    await db.insert(products).values([
      {
        shopId: shop.id,
        sellerId: seller.id,
        name: "Fresh Apples",
        price: "150",
        category: "Grocery",
        description: "Kinnaur apples directly from farm",
      },
      {
        shopId: shop.id,
        sellerId: seller.id,
        name: "Amul Butter 100g",
        price: "60",
        category: "Grocery",
        description: "Pure cow milk butter",
      }
    ]);

    // 4. Create offers/news
    await db.insert(offers).values([
      {
        content: "शहडोल में आज का मौसम: हल्की ठंड के साथ तापमान 17°C रहेगा।",
        isActive: true,
      },
      {
        content: "कल विराटेश्वर मंदिर में विशेष आरती और भंडारा दोपहर 12 बजे से।",
        isActive: true,
      },
      {
        content: "शहडोल बाज़ार में ताज़ा फल और सब्जियों की नई आवक शुरू - देखें किराना सेक्शन।",
        isActive: true,
      },
      {
        content: "नगर पालिका सूचना: बुढ़ार रोड पर पाइपलाइन मरम्मत के कारण आज जल आपूर्ति बाधित रह सकती है।",
        isActive: true,
      },
    ]);
    console.log("✅ Seeding complete!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    process.exit();
  }
}

seed();

