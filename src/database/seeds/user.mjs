import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";

dotenv.config();

export const userSeed = async () => {
    const prisma = new PrismaClient();
    try {
        const admin = await prisma.user.upsert({
            where: { username: 'admin' },
            update: {},
            create: {
                username: "admin",
                password: await bcrypt.hash("Aa123456", Number(process.env.PASSWORD_SALT)),
                role: 'ADMIN',
                Profile: {
                    create: {
                        firstName: 'Masoud',
                        lastName: 'Torabi',

                    }
                }
            },
        });

        console.log('created admin', admin);
        await prisma.$disconnect()
    } catch (err) {

        console.error(err)
        await prisma.$disconnect()
        process.exit(1)
    }
};
