import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

// Branch name templates for different store types
const branchNameTemplates = {
    "Restaurant": [
        "Downtown Location", "Mall Branch", "Airport Terminal", "University Campus", "Business District",
        "Shopping Center", "Hotel Lobby", "Office Complex", "Residential Area", "Tourist District"
    ],
    "Cafe": [
        "Coffee Corner", "Espresso Bar", "Brew Station", "Cafe Lounge", "Bean House",
        "Morning Brew", "Caffeine Hub", "Coffee Lab", "Brew & Bites", "Cafe Central"
    ],
    "Retail Store": [
        "Fashion Outlet", "Style Studio", "Trend Boutique", "Urban Collection", "Chic Corner",
        "Fashion Hub", "Style Gallery", "Trend Zone", "Fashion District", "Style Central"
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

// Branch descriptions
const branchDescriptions = [
    "A modern and welcoming location serving our community with quality products and excellent service.",
    "Conveniently located for easy access, offering a wide selection of items to meet your needs.",
    "Our flagship location featuring the latest trends and premium customer experience.",
    "A cozy neighborhood branch providing personalized service and local favorites.",
    "Strategically positioned in a high-traffic area for maximum convenience and accessibility.",
    "Our newest location featuring state-of-the-art facilities and innovative services.",
    "A boutique-style branch offering curated selections and expert guidance.",
    "Located in the heart of the business district, perfect for professionals on the go.",
    "Family-friendly location with spacious layout and kid-friendly amenities.",
    "Premium location with luxury atmosphere and exclusive product offerings."
];

export const storeBranchSeed = async () => {
    const prisma = new PrismaClient();
    try {
        console.log('Starting store branch seeding...');

        // Get all stores with their types
        const stores = await prisma.store.findMany({
            where: { deletedAt: null },
            include: {
                storeType: true,
                user: {
                    select: { id: true, username: true }
                }
            }
        });

        if (stores.length === 0) {
            console.log('No stores found. Please run store seeder first.');
            await prisma.$disconnect();
            return;
        }

        console.log(`Found ${stores.length} stores to potentially add branches to`);

        // Create branches for 60% of stores (some stores won't have branches)
        const storesWithBranches = stores.filter(() => Math.random() < 0.6);
        const storesWithoutBranches = stores.filter(store =>
            !storesWithBranches.some(storeWithBranch => storeWithBranch.id === store.id)
        );

        console.log(`Will create branches for ${storesWithBranches.length} stores`);
        console.log(`${storesWithoutBranches.length} stores will remain without branches`);

        // Create branches
        const branchesToCreate = [];
        for (const store of storesWithBranches) {
            // Each store can have 1-3 branches
            const branchCount = Math.floor(Math.random() * 3) + 1;

            for (let i = 0; i < branchCount; i++) {
                const templates = branchNameTemplates[store.storeType.title] || branchNameTemplates["Retail Store"];
                const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
                const randomDescription = branchDescriptions[Math.floor(Math.random() * branchDescriptions.length)];
                const branchNumber = i + 1;

                branchesToCreate.push({
                    title: `${randomTemplate} ${branchNumber}`,
                    description: randomDescription,
                    active: Math.random() > 0.2, // 80% chance of being active
                    storeId: store.id,
                    userId: store.userId,
                });
            }
        }

        // Create branches in batches
        const batchSize = 10;
        for (let i = 0; i < branchesToCreate.length; i += batchSize) {
            const batch = branchesToCreate.slice(i, i + batchSize);
            await prisma.storeBranch.createMany({
                data: batch,
                skipDuplicates: true,
            });
            console.log(`Created batch ${Math.floor(i / batchSize) + 1} of branches (${batch.length} branches)`);
        }

        // Get final statistics
        const totalBranches = await prisma.storeBranch.count({
            where: { deletedAt: null }
        });

        const storesWithBranchesCount = await prisma.store.count({
            where: {
                deletedAt: null,
                StoreBranch: {
                    some: {
                        deletedAt: null
                    }
                }
            }
        });

        const storesWithoutBranchesCount = await prisma.store.count({
            where: {
                deletedAt: null,
                StoreBranch: {
                    none: {
                        deletedAt: null
                    }
                }
            }
        });

        console.log(`✅ Store branch seeding completed!`);
        console.log(`📊 Summary:`);
        console.log(`   - Total branches created: ${totalBranches}`);
        console.log(`   - Stores with branches: ${storesWithBranchesCount}`);
        console.log(`   - Stores without branches: ${storesWithoutBranchesCount}`);
        console.log(`   - Average branches per store: ${(totalBranches / storesWithBranchesCount).toFixed(1)}`);

        await prisma.$disconnect();
    } catch (err) {
        console.error('Error during store branch seeding:', err);
        await prisma.$disconnect();
        process.exit(1);
    }
}; 