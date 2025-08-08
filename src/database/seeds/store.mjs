import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

// Store type data
const storeTypes = [
    { title: "Restaurant" },
    { title: "Cafe" },
    { title: "Retail Store" },
    { title: "Supermarket" },
    { title: "Pharmacy" },
    { title: "Electronics Store" },
    { title: "Clothing Store" },
    { title: "Bookstore" },
    { title: "Hardware Store" },
    { title: "Beauty Salon" },
    { title: "Gym" },
    { title: "Bakery" },
    { title: "Jewelry Store" },
    { title: "Toy Store" },
    { title: "Pet Store" }
];

// Store name templates for different types
const storeNameTemplates = {
    "Restaurant": [
        "The Golden Plate", "Spice Garden", "Ocean View", "Rustic Kitchen", "Urban Bistro",
        "Taste of Home", "Fusion Delight", "Coastal Cuisine", "Mountain View", "City Lights"
    ],
    "Cafe": [
        "Morning Brew", "Coffee Corner", "Sweet Dreams", "Urban Cafe", "Artisan Coffee",
        "The Daily Grind", "Cafe Society", "Bean There", "Espresso Bar", "Caffeine Fix"
    ],
    "Retail Store": [
        "Trendy Boutique", "Style Corner", "Fashion Forward", "Urban Style", "Chic Collection",
        "Modern Retail", "Style Hub", "Fashion District", "Trend Setter", "Style Gallery"
    ],
    "Supermarket": [
        "Fresh Market", "Daily Grocer", "Family Foods", "Community Market", "Fresh & Easy",
        "Neighborhood Market", "Quality Foods", "Fresh Choice", "Market Place", "Food Mart"
    ],
    "Pharmacy": [
        "Health First", "Wellness Pharmacy", "Care Pharmacy", "Health Plus", "MediCare",
        "Wellness Corner", "Health Mart", "Care Plus", "Wellness First", "Health Corner"
    ],
    "Electronics Store": [
        "Tech Hub", "Digital World", "Electronics Plus", "Tech Mart", "Digital Store",
        "Tech Corner", "Electronics Hub", "Digital Plus", "Tech World", "Electronics Mart"
    ],
    "Clothing Store": [
        "Fashion Forward", "Style Studio", "Trendy Threads", "Fashion Hub", "Style Corner",
        "Urban Fashion", "Trend Setter", "Fashion Gallery", "Style World", "Fashion Plus"
    ],
    "Bookstore": [
        "Knowledge Corner", "Book Haven", "Literary Hub", "Reading Room", "Book World",
        "Knowledge Hub", "Literary Corner", "Reading Haven", "Book Corner", "Knowledge World"
    ],
    "Hardware Store": [
        "Tool Box", "Hardware Hub", "DIY Center", "Tool Mart", "Hardware Plus",
        "Tool Corner", "DIY Hub", "Hardware World", "Tool Plus", "DIY Mart"
    ],
    "Beauty Salon": [
        "Beauty Haven", "Glamour Studio", "Beauty Corner", "Style Salon", "Glamour Hub",
        "Beauty Studio", "Style Corner", "Glamour Plus", "Beauty World", "Style Hub"
    ],
    "Gym": [
        "Fit Life", "Power Gym", "Fitness Hub", "Strength Center", "Fit World",
        "Power Hub", "Fitness Corner", "Strength Plus", "Fit Corner", "Power World"
    ],
    "Bakery": [
        "Sweet Dreams", "Artisan Bakery", "Fresh Bakes", "Bread Corner", "Sweet Corner",
        "Artisan Corner", "Fresh Bakes", "Bread World", "Sweet World", "Artisan Plus"
    ],
    "Jewelry Store": [
        "Sparkle & Shine", "Jewelry Corner", "Diamond World", "Sparkle Hub", "Jewelry Plus",
        "Diamond Corner", "Sparkle World", "Jewelry World", "Diamond Plus", "Sparkle Corner"
    ],
    "Toy Store": [
        "Fun World", "Toy Corner", "Play Haven", "Fun Corner", "Toy World",
        "Play Corner", "Fun Hub", "Toy Haven", "Play World", "Fun Plus"
    ],
    "Pet Store": [
        "Pet Paradise", "Animal Corner", "Pet World", "Animal Haven", "Pet Corner",
        "Animal World", "Pet Haven", "Animal Plus", "Pet World", "Animal Corner"
    ]
};

export const storeSeed = async () => {
    const prisma = new PrismaClient();
    try {
        console.log('Starting store seeding...');

        // First, create store types
        const createdStoreTypes = [];
        for (const storeType of storeTypes) {
            // Check if store type already exists
            let existingStoreType = await prisma.storeType.findFirst({
                where: { title: storeType.title }
            });

            if (!existingStoreType) {
                existingStoreType = await prisma.storeType.create({
                    data: storeType,
                });
                console.log(`Created store type: ${existingStoreType.title}`);
            } else {
                console.log(`Store type already exists: ${existingStoreType.title}`);
            }

            createdStoreTypes.push(existingStoreType);
        }

        // Get all users to assign stores to
        const users = await prisma.user.findMany({
            where: { deletedAt: null },
            select: { id: true, username: true }
        });

        if (users.length === 0) {
            console.log('No users found. Please run user seeder first.');
            await prisma.$disconnect();
            return;
        }

        console.log(`Found ${users.length} users to assign stores to`);

        // Create 100 fake stores
        const storesToCreate = [];
        for (let i = 0; i < 100; i++) {
            const randomStoreType = createdStoreTypes[Math.floor(Math.random() * createdStoreTypes.length)];
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const templates = storeNameTemplates[randomStoreType.title] || storeNameTemplates["Retail Store"];
            const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
            const storeNumber = Math.floor(Math.random() * 999) + 1;

            storesToCreate.push({
                title: `${randomTemplate} ${storeNumber}`,
                active: Math.random() > 0.3, // 70% chance of being active
                userId: randomUser.id,
                storeTypeId: randomStoreType.id,
            });
        }

        // Create stores in batches
        const batchSize = 10;
        for (let i = 0; i < storesToCreate.length; i += batchSize) {
            const batch = storesToCreate.slice(i, i + batchSize);
            await prisma.store.createMany({
                data: batch,
                skipDuplicates: true,
            });
            console.log(`Created batch ${Math.floor(i / batchSize) + 1} of stores (${batch.length} stores)`);
        }

        // Get final count
        const totalStores = await prisma.store.count({
            where: { deletedAt: null }
        });

        console.log(`✅ Store seeding completed! Created ${totalStores} stores`);
        await prisma.$disconnect();
    } catch (err) {
        console.error('Error during store seeding:', err);
        await prisma.$disconnect();
        process.exit(1);
    }
}; 