import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import bcrypt from 'bcryptjs';

// ── Prisma client (same setup as src/lib/prisma.ts) ─────────────────────────
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database via Prisma...\n');

  // ── Reset tables in FK-safe order ─────────────────────────────────────────
  await prisma.tweetVisibility.deleteMany();
  await prisma.tweet.deleteMany();
  await prisma.userDepartments.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // ── 1. Companies ──────────────────────────────────────────────────────────
  console.log('── Creating companies ──');

  const acme = await prisma.company.create({ data: { name: 'Acme Corp' } });
  console.log(`  Acme Corp       → ${acme.id}`);

  const globex = await prisma.company.create({ data: { name: 'Globex Inc' } });
  console.log(`  Globex Inc      → ${globex.id}`);

  // ── 2. Departments ────────────────────────────────────────────────────────
  console.log('\n── Creating departments ──');

  // Acme Corp
  const deptEng = await prisma.department.create({
    data: { name: 'Engineering', companyId: acme.id },
  });
  const deptFrontend = await prisma.department.create({
    data: { name: 'Frontend', companyId: acme.id, parentId: deptEng.id },
  });
  const deptBackend = await prisma.department.create({
    data: { name: 'Backend', companyId: acme.id, parentId: deptEng.id },
  });
  const deptSales = await prisma.department.create({
    data: { name: 'Sales', companyId: acme.id },
  });
  const deptHr = await prisma.department.create({
    data: { name: 'HR', companyId: acme.id },
  });

  console.log('  Engineering       (Acme)');
  console.log('    ├─ Frontend');
  console.log('    └─ Backend');
  console.log('  Sales             (Acme)');
  console.log('  HR                (Acme)');

  // Globex Inc
  const deptProd = await prisma.department.create({
    data: { name: 'Product', companyId: globex.id },
  });
  const deptDesign = await prisma.department.create({
    data: { name: 'Design', companyId: globex.id, parentId: deptProd.id },
  });
  const deptMkt = await prisma.department.create({
    data: { name: 'Marketing', companyId: globex.id },
  });

  console.log('  Product           (Globex)');
  console.log('    └─ Design');
  console.log('  Marketing         (Globex)');

  // ── 3. Users ──────────────────────────────────────────────────────────────
  console.log('\n── Creating users ──');

  const pw = await bcrypt.hash('password123', 10);

  const alice = await prisma.user.create({
    data: { username: 'alice', email: 'alice@acme.com', password: pw, companyId: acme.id, role: 'USER' },
  });
  const bob = await prisma.user.create({
    data: { username: 'bob', email: 'bob@acme.com', password: pw, companyId: acme.id, role: 'USER' },
  });
  const carol = await prisma.user.create({
    data: { username: 'carol', email: 'carol@acme.com', password: pw, companyId: acme.id, role: 'USER' },
  });
  const admin = await prisma.user.create({
    data: { username: 'admin', email: 'admin@acme.com', password: pw, companyId: acme.id, role: 'ADMIN' },
  });
  const dave = await prisma.user.create({
    data: { username: 'dave', email: 'dave@globex.com', password: pw, companyId: globex.id, role: 'USER' },
  });
  const eve = await prisma.user.create({
    data: { username: 'eve', email: 'eve@globex.com', password: pw, companyId: globex.id, role: 'USER' },
  });

  console.log('  alice@acme.com   (USER)');
  console.log('  bob@acme.com     (USER)');
  console.log('  carol@acme.com   (USER)');
  console.log('  admin@acme.com   (ADMIN)');
  console.log('  dave@globex.com  (USER)');
  console.log('  eve@globex.com   (USER)');

  // ── 4. Department memberships ─────────────────────────────────────────────
  console.log('\n── Assigning users to departments ──');

  const memberships = [
    { userId: alice.id, departmentId: deptEng.id, companyId: acme.id },
    { userId: alice.id, departmentId: deptFrontend.id, companyId: acme.id },
    { userId: bob.id, departmentId: deptEng.id, companyId: acme.id },
    { userId: bob.id, departmentId: deptBackend.id, companyId: acme.id },
    { userId: carol.id, departmentId: deptSales.id, companyId: acme.id },
    { userId: carol.id, departmentId: deptHr.id, companyId: acme.id },
    { userId: dave.id, departmentId: deptProd.id, companyId: globex.id },
    { userId: dave.id, departmentId: deptDesign.id, companyId: globex.id },
    { userId: eve.id, departmentId: deptMkt.id, companyId: globex.id },
  ];

  for (const m of memberships) {
    await prisma.userDepartments.create({ data: m });
  }

  console.log('  alice  → Engineering, Frontend');
  console.log('  bob    → Engineering, Backend');
  console.log('  carol  → Sales, HR');
  console.log('  dave   → Product, Design');
  console.log('  eve    → Marketing');

  // ── 5. Tweets ─────────────────────────────────────────────────────────────
  console.log('\n── Creating tweets ──');

  // Company-wide tweets (no TweetVisibility rows needed)
  await prisma.tweet.create({
    data: {
      content: 'Welcome to Acme Corp! Excited to build great things together.',
      visibilityType: 'COMPANY',
      companyId: acme.id,
      authorId: alice.id,
    },
  });
  console.log('  alice → company-wide tweet');

  await prisma.tweet.create({
    data: {
      content: "Hello Globex! Let's ship amazing products.",
      visibilityType: 'COMPANY',
      companyId: globex.id,
      authorId: dave.id,
    },
  });
  console.log('  dave  → company-wide tweet');

  await prisma.tweet.create({
    data: {
      content: 'Deployed v2.1.0 to staging. Please test and report issues.',
      visibilityType: 'COMPANY',
      companyId: acme.id,
      authorId: bob.id,
    },
  });
  console.log('  bob   → company-wide tweet');

  // DEPARTMENTS-scoped tweets
  const tweetBackend = await prisma.tweet.create({
    data: {
      content: 'Backend team standup at 10am tomorrow.',
      visibilityType: 'DEPARTMENTS',
      companyId: acme.id,
      authorId: bob.id,
    },
  });
  await prisma.tweetVisibility.create({
    data: { tweetId: tweetBackend.id, departmentId: deptBackend.id, companyId: acme.id },
  });
  console.log('  bob   → Backend dept tweet');

  const tweetFrontend = await prisma.tweet.create({
    data: {
      content: 'Frontend sprint review notes posted in Confluence.',
      visibilityType: 'DEPARTMENTS',
      companyId: acme.id,
      authorId: alice.id,
    },
  });
  await prisma.tweetVisibility.create({
    data: { tweetId: tweetFrontend.id, departmentId: deptFrontend.id, companyId: acme.id },
  });
  console.log('  alice → Frontend dept tweet');

  const tweetSales = await prisma.tweet.create({
    data: {
      content: 'Sales team hit 120% of Q1 target!',
      visibilityType: 'DEPARTMENTS',
      companyId: acme.id,
      authorId: carol.id,
    },
  });
  await prisma.tweetVisibility.create({
    data: { tweetId: tweetSales.id, departmentId: deptSales.id, companyId: acme.id },
  });
  console.log('  carol → Sales dept tweet');

  const tweetMkt = await prisma.tweet.create({
    data: {
      content: 'Marketing campaign launched — check out the new landing page!',
      visibilityType: 'DEPARTMENTS',
      companyId: globex.id,
      authorId: eve.id,
    },
  });
  await prisma.tweetVisibility.create({
    data: { tweetId: tweetMkt.id, departmentId: deptMkt.id, companyId: globex.id },
  });
  console.log('  eve   → Marketing dept tweet');

  // DEPARTMENTS_AND_SUBDEPARTMENTS-scoped tweets
  const tweetEngAll = await prisma.tweet.create({
    data: {
      content: 'Engineering all-hands: Q2 planning starts next week!',
      visibilityType: 'DEPARTMENTS_AND_SUBDEPARTMENTS',
      companyId: acme.id,
      authorId: alice.id,
    },
  });
  await prisma.tweetVisibility.create({
    data: { tweetId: tweetEngAll.id, departmentId: deptEng.id, companyId: acme.id },
  });
  console.log('  alice → Engineering + subs tweet');

  const tweetProdAll = await prisma.tweet.create({
    data: {
      content: 'Product + Design sync: new wireframes ready for review.',
      visibilityType: 'DEPARTMENTS_AND_SUBDEPARTMENTS',
      companyId: globex.id,
      authorId: dave.id,
    },
  });
  await prisma.tweetVisibility.create({
    data: { tweetId: tweetProdAll.id, departmentId: deptProd.id, companyId: globex.id },
  });
  console.log('  dave  → Product + subs tweet');

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n✅ Database seeded successfully!');
  console.log('\n── Summary ──');
  console.log('  Companies:   2  (Acme Corp, Globex Inc)');
  console.log('  Users:       6  (5 USER + 1 ADMIN)');
  console.log('  Departments: 8  (with hierarchy)');
  console.log('  Tweets:      9  (3 COMPANY, 4 DEPARTMENTS, 2 DEPT+SUBS)');
  console.log('\n── Credentials ──');
  console.log('  All users: password123');
  console.log('  Admin:     admin@acme.com');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
