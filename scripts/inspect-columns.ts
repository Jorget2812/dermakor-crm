import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function inspectColumns() {
    try {
        const columns: any = await prisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'prospects'
            ORDER BY column_name;
        `;
        console.log('--- Columns in "prospects" ---');
        console.log(JSON.stringify(columns, null, 2));
    } catch (e) {
        console.error('Error inspecting columns:', e);
    } finally {
        await prisma.$disconnect();
    }
}

inspectColumns();
