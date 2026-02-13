import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function executeSqlFile(filePath: string) {
    const sql = fs.readFileSync(filePath, 'utf-8');
    // Simple split by semicolon, filtering out empty statements
    // Note: This matches standard semicolons.
    // We use a regex to be slightly safer about newlines but simple split is usually enough for our schema files.
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    console.log(`📝 Found ${statements.length} statements in ${path.basename(filePath)}`);

    for (const statement of statements) {
        try {
            await prisma.$executeRawUnsafe(statement);
        } catch (e) {
            console.error(`❌ Error executing statement:\n${statement}\nError:`, e);
            throw e;
        }
    }
}

async function main() {
    console.log('🚀 Starting Database Deployment...');

    try {
        // 1. Create Tables
        console.log('📦 Creating Tables...');
        await executeSqlFile(path.join(process.cwd(), 'supabase/schema_commissions.sql'));
        console.log('✅ Tables created successfully.');

        // 2. Apply RLS
        console.log('🔒 Applying RLS Policies...');
        await executeSqlFile(path.join(process.cwd(), 'supabase/rls_commissions.sql'));
        console.log('✅ RLS policies applied successfully.');

        console.log('🎉 Deployment complete!');
    } catch (e) {
        console.error('❌ Deployment failed:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
