import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function inspectConstraints() {
    try {
        const constraints: any = await prisma.$queryRaw`
            SELECT
                conname AS constraint_name,
                pg_get_constraintdef(c.oid) AS constraint_definition
            FROM
                pg_constraint c
            JOIN
                pg_namespace n ON n.oid = c.connamespace
            WHERE
                contype = 'c'
                AND conrelid = 'profiles'::regclass;
        `;
        console.log('--- Check Constraints on "profiles" ---');
        console.log(JSON.stringify(constraints, null, 2));
    } catch (e) {
        console.error('Error inspecting constraints:', e);
    } finally {
        await prisma.$disconnect();
    }
}

inspectConstraints();
