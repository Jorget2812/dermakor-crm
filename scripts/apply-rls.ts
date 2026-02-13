import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const sqlPath = path.join(__dirname, '../supabase/rls_commissions.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // Split by statement if needed, but RLS usually can run in blocks.
    // Prisma $executeRawUnsafe handles multiple statements in some drivers, 
    // but better to split by semicolon if simple, or run as one block if supported.
    // PostgreSQL driver usually supports multiple statements in one query string.

    console.log('Applying RLS policies...');

    try {
        // Execute the raw SQL
        await prisma.$executeRawUnsafe(sql);
        console.log('✅ RLS policies applied successfully.');
    } catch (e) {
        console.error('❌ Error applying RLS:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
