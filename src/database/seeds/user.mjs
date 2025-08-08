import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";

dotenv.config();

// Fake user data
const fakeUsers = [
    // Admin users (only 2)
    { username: "admin", firstName: "Masoud", lastName: "Torabi", role: "ADMIN" },
    { username: "superadmin", firstName: "John", lastName: "Admin", role: "ADMIN" },

    // Store admin users (98 more)
    { username: "store1", firstName: "Alice", lastName: "Johnson", role: "STORE_ADMIN" },
    { username: "store2", firstName: "Bob", lastName: "Smith", role: "STORE_ADMIN" },
    { username: "store3", firstName: "Carol", lastName: "Davis", role: "STORE_ADMIN" },
    { username: "store4", firstName: "David", lastName: "Wilson", role: "STORE_ADMIN" },
    { username: "store5", firstName: "Emma", lastName: "Brown", role: "STORE_ADMIN" },
    { username: "store6", firstName: "Frank", lastName: "Miller", role: "STORE_ADMIN" },
    { username: "store7", firstName: "Grace", lastName: "Taylor", role: "STORE_ADMIN" },
    { username: "store8", firstName: "Henry", lastName: "Anderson", role: "STORE_ADMIN" },
    { username: "store9", firstName: "Ivy", lastName: "Thomas", role: "STORE_ADMIN" },
    { username: "store10", firstName: "Jack", lastName: "Jackson", role: "STORE_ADMIN" },
    { username: "store11", firstName: "Kate", lastName: "White", role: "STORE_ADMIN" },
    { username: "store12", firstName: "Liam", lastName: "Harris", role: "STORE_ADMIN" },
    { username: "store13", firstName: "Mia", lastName: "Clark", role: "STORE_ADMIN" },
    { username: "store14", firstName: "Noah", lastName: "Lewis", role: "STORE_ADMIN" },
    { username: "store15", firstName: "Olivia", lastName: "Robinson", role: "STORE_ADMIN" },
    { username: "store16", firstName: "Paul", lastName: "Walker", role: "STORE_ADMIN" },
    { username: "store17", firstName: "Quinn", lastName: "Hall", role: "STORE_ADMIN" },
    { username: "store18", firstName: "Ruby", lastName: "Young", role: "STORE_ADMIN" },
    { username: "store19", firstName: "Sam", lastName: "King", role: "STORE_ADMIN" },
    { username: "store20", firstName: "Tina", lastName: "Wright", role: "STORE_ADMIN" },
    { username: "store21", firstName: "Uma", lastName: "Lopez", role: "STORE_ADMIN" },
    { username: "store22", firstName: "Victor", lastName: "Hill", role: "STORE_ADMIN" },
    { username: "store23", firstName: "Wendy", lastName: "Scott", role: "STORE_ADMIN" },
    { username: "store24", firstName: "Xander", lastName: "Green", role: "STORE_ADMIN" },
    { username: "store25", firstName: "Yara", lastName: "Adams", role: "STORE_ADMIN" },
    { username: "store26", firstName: "Zoe", lastName: "Baker", role: "STORE_ADMIN" },
    { username: "store27", firstName: "Alex", lastName: "Gonzalez", role: "STORE_ADMIN" },
    { username: "store28", firstName: "Blake", lastName: "Nelson", role: "STORE_ADMIN" },
    { username: "store29", firstName: "Casey", lastName: "Carter", role: "STORE_ADMIN" },
    { username: "store30", firstName: "Drew", lastName: "Mitchell", role: "STORE_ADMIN" },
    { username: "store31", firstName: "Eden", lastName: "Perez", role: "STORE_ADMIN" },
    { username: "store32", firstName: "Finn", lastName: "Roberts", role: "STORE_ADMIN" },
    { username: "store33", firstName: "Gale", lastName: "Turner", role: "STORE_ADMIN" },
    { username: "store34", firstName: "Hazel", lastName: "Phillips", role: "STORE_ADMIN" },
    { username: "store35", firstName: "Indigo", lastName: "Campbell", role: "STORE_ADMIN" },
    { username: "store36", firstName: "Jasper", lastName: "Parker", role: "STORE_ADMIN" },
    { username: "store37", firstName: "Kai", lastName: "Evans", role: "STORE_ADMIN" },
    { username: "store38", firstName: "Luna", lastName: "Edwards", role: "STORE_ADMIN" },
    { username: "store39", firstName: "Moss", lastName: "Collins", role: "STORE_ADMIN" },
    { username: "store40", firstName: "Nova", lastName: "Stewart", role: "STORE_ADMIN" },
    { username: "store41", firstName: "Ocean", lastName: "Sanchez", role: "STORE_ADMIN" },
    { username: "store42", firstName: "Pine", lastName: "Morris", role: "STORE_ADMIN" },
    { username: "store43", firstName: "Quill", lastName: "Rogers", role: "STORE_ADMIN" },
    { username: "store44", firstName: "River", lastName: "Reed", role: "STORE_ADMIN" },
    { username: "store45", firstName: "Sage", lastName: "Cook", role: "STORE_ADMIN" },
    { username: "store46", firstName: "Terra", lastName: "Morgan", role: "STORE_ADMIN" },
    { username: "store47", firstName: "Urban", lastName: "Bell", role: "STORE_ADMIN" },
    { username: "store48", firstName: "Vale", lastName: "Murphy", role: "STORE_ADMIN" },
    { username: "store49", firstName: "Willow", lastName: "Bailey", role: "STORE_ADMIN" },
    { username: "store50", firstName: "Xen", lastName: "Rivera", role: "STORE_ADMIN" },
    { username: "store51", firstName: "Yarrow", lastName: "Cooper", role: "STORE_ADMIN" },
    { username: "store52", firstName: "Zephyr", lastName: "Richardson", role: "STORE_ADMIN" },
    { username: "store53", firstName: "Aster", lastName: "Cox", role: "STORE_ADMIN" },
    { username: "store54", firstName: "Birch", lastName: "Howard", role: "STORE_ADMIN" },
    { username: "store55", firstName: "Cedar", lastName: "Ward", role: "STORE_ADMIN" },
    { username: "store56", firstName: "Dawn", lastName: "Torres", role: "STORE_ADMIN" },
    { username: "store57", firstName: "Echo", lastName: "Peterson", role: "STORE_ADMIN" },
    { username: "store58", firstName: "Flora", lastName: "Gray", role: "STORE_ADMIN" },
    { username: "store59", firstName: "Grove", lastName: "Ramirez", role: "STORE_ADMIN" },
    { username: "store60", firstName: "Haven", lastName: "James", role: "STORE_ADMIN" },
    { username: "store61", firstName: "Iris", lastName: "Watson", role: "STORE_ADMIN" },
    { username: "store62", firstName: "Jade", lastName: "Brooks", role: "STORE_ADMIN" },
    { username: "store63", firstName: "Kestrel", lastName: "Kelly", role: "STORE_ADMIN" },
    { username: "store64", firstName: "Lark", lastName: "Sanders", role: "STORE_ADMIN" },
    { username: "store65", firstName: "Meadow", lastName: "Price", role: "STORE_ADMIN" },
    { username: "store66", firstName: "Nest", lastName: "Bennett", role: "STORE_ADMIN" },
    { username: "store67", firstName: "Oak", lastName: "Wood", role: "STORE_ADMIN" },
    { username: "store68", firstName: "Petal", lastName: "Barnes", role: "STORE_ADMIN" },
    { username: "store69", firstName: "Quartz", lastName: "Ross", role: "STORE_ADMIN" },
    { username: "store70", firstName: "Raven", lastName: "Henderson", role: "STORE_ADMIN" },
    { username: "store71", firstName: "Sparrow", lastName: "Coleman", role: "STORE_ADMIN" },
    { username: "store72", firstName: "Thistle", lastName: "Jenkins", role: "STORE_ADMIN" },
    { username: "store73", firstName: "Umber", lastName: "Perry", role: "STORE_ADMIN" },
    { username: "store74", firstName: "Violet", lastName: "Powell", role: "STORE_ADMIN" },
    { username: "store75", firstName: "Wren", lastName: "Long", role: "STORE_ADMIN" },
    { username: "store76", firstName: "Xerox", lastName: "Patterson", role: "STORE_ADMIN" },
    { username: "store77", firstName: "Yarrow", lastName: "Hughes", role: "STORE_ADMIN" },
    { username: "store78", firstName: "Zinc", lastName: "Flores", role: "STORE_ADMIN" },
    { username: "store79", firstName: "Amber", lastName: "Washington", role: "STORE_ADMIN" },
    { username: "store80", firstName: "Beryl", lastName: "Butler", role: "STORE_ADMIN" },
    { username: "store81", firstName: "Coral", lastName: "Simmons", role: "STORE_ADMIN" },
    { username: "store82", firstName: "Diamond", lastName: "Foster", role: "STORE_ADMIN" },
    { username: "store83", firstName: "Emerald", lastName: "Gonzales", role: "STORE_ADMIN" },
    { username: "store84", firstName: "Fuchsia", lastName: "Bryant", role: "STORE_ADMIN" },
    { username: "store85", firstName: "Garnet", lastName: "Alexander", role: "STORE_ADMIN" },
    { username: "store86", firstName: "Heliotrope", lastName: "Russell", role: "STORE_ADMIN" },
    { username: "store87", firstName: "Indigo", lastName: "Griffin", role: "STORE_ADMIN" },
    { username: "store88", firstName: "Jade", lastName: "Diaz", role: "STORE_ADMIN" },
    { username: "store89", firstName: "Kyanite", lastName: "Hayes", role: "STORE_ADMIN" },
    { username: "store90", firstName: "Lapis", lastName: "Myers", role: "STORE_ADMIN" },
    { username: "store91", firstName: "Malachite", lastName: "Ford", role: "STORE_ADMIN" },
    { username: "store92", firstName: "Nacre", lastName: "Hamilton", role: "STORE_ADMIN" },
    { username: "store93", firstName: "Opal", lastName: "Graham", role: "STORE_ADMIN" },
    { username: "store94", firstName: "Pearl", lastName: "Sullivan", role: "STORE_ADMIN" },
    { username: "store95", firstName: "Quartz", lastName: "Wallace", role: "STORE_ADMIN" },
    { username: "store96", firstName: "Ruby", lastName: "Woods", role: "STORE_ADMIN" },
    { username: "store97", firstName: "Sapphire", lastName: "Cole", role: "STORE_ADMIN" },
    { username: "store98", firstName: "Topaz", lastName: "West", role: "STORE_ADMIN" },
    { username: "store99", firstName: "Umber", lastName: "Jordan", role: "STORE_ADMIN" },
    { username: "store100", firstName: "Vermilion", lastName: "Owens", role: "STORE_ADMIN" }
];

export const userSeed = async () => {
    const prisma = new PrismaClient();
    try {
        console.log('Starting user seeding...');

        const hashedPassword = await bcrypt.hash("Aa123456", Number(process.env.PASSWORD_SALT));

        // Create users in batches
        const batchSize = 10;
        let createdUsers = [];

        for (let i = 0; i < fakeUsers.length; i += batchSize) {
            const batch = fakeUsers.slice(i, i + batchSize);
            const usersToCreate = batch.map(user => ({
                username: user.username,
                password: hashedPassword,
                role: user.role,
                active: true,
                Profile: {
                    create: {
                        firstName: user.firstName,
                        lastName: user.lastName,
                    }
                }
            }));

            // Create users with profiles
            for (const userData of usersToCreate) {
                const user = await prisma.user.upsert({
                    where: { username: userData.username },
                    update: {},
                    create: userData,
                });
                createdUsers.push(user);
                console.log(`Created user: ${user.username} (${user.role})`);
            }

            console.log(`Created batch ${Math.floor(i / batchSize) + 1} of users (${batch.length} users)`);
        }

        // Get final count
        const totalUsers = await prisma.user.count({
            where: { deletedAt: null }
        });

        const adminCount = await prisma.user.count({
            where: {
                role: 'ADMIN',
                deletedAt: null
            }
        });

        const storeAdminCount = await prisma.user.count({
            where: {
                role: 'STORE_ADMIN',
                deletedAt: null
            }
        });

        console.log(`✅ User seeding completed!`);
        console.log(`📊 Summary:`);
        console.log(`   - Total users: ${totalUsers}`);
        console.log(`   - Admin users: ${adminCount}`);
        console.log(`   - Store Admin users: ${storeAdminCount}`);

        await prisma.$disconnect();
    } catch (err) {
        console.error('Error during user seeding:', err);
        await prisma.$disconnect();
        process.exit(1);
    }
};
