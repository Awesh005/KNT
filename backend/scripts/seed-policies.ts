import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const BOOK_SEEDS = [
  { title: 'Project Photo Chapters', file: 'KNT_Full_Book_Project_Photo_Chapters.pdf' },
  { title: 'Complete Project Book (Print Safe)', file: 'KNT_World_Welfare_Foundation_Complete_Project_Book_2026_Improved_300DPI_Print_Safe_No_Cut.pdf' },
  { title: 'Complete Project VIP Photo Filled Book', file: 'KNT_World_Welfare_Foundation_Complete_Project_VIP_Photo_Filled_Book.pdf' },
  { title: 'Full Work Project Cost Portfolio', file: 'KNT_World_Welfare_Foundation_Full_Work_Project_Cost_Portfolio_2026_Clear_Typing_No_Cut.pdf' },
];

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Awesh@005',
    database: 'knt_welfare',
  });

  const [rows] = await connection.query(
    "SELECT id, content FROM cms_content WHERE page_key = 'global' AND section_key = 'policies'"
  );

  const existingRow = (rows as any[])[0];
  const existingDocs: any[] = existingRow
    ? (typeof existingRow.content === 'string' ? JSON.parse(existingRow.content) : existingRow.content)
    : [];

  if (existingDocs.some((doc) => doc.type === 'Publications')) {
    console.log('Publications already seeded.');
    await connection.end();
    return;
  }

  const booksDir = path.join(process.cwd(), '../frontend/public/books');
  const policiesDir = path.join(process.cwd(), 'uploads/policies');
  if (!fs.existsSync(policiesDir)) fs.mkdirSync(policiesDir, { recursive: true });

  const nextId = existingDocs.reduce((max, doc) => Math.max(max, Number(doc.id) || 0), 0) + 1;
  const publications: any[] = [];
  let id = nextId;

  for (const book of BOOK_SEEDS) {
    const sourcePath = path.join(booksDir, book.file);
    if (!fs.existsSync(sourcePath)) continue;
    const destName = `policy-seed-${id}-${book.file}`;
    fs.copyFileSync(sourcePath, path.join(policiesDir, destName));
    publications.push({
      id: id++,
      type: 'Publications',
      title: book.title,
      year: '2026',
      fileUrl: `/uploads/policies/${destName}`,
      visibility: 'public',
      updatedAt: new Date().toISOString(),
    });
  }

  if (publications.length === 0) {
    console.log('No publication PDFs found.');
    await connection.end();
    return;
  }

  const merged = [...publications, ...existingDocs];

  if (existingRow) {
    await connection.query('UPDATE cms_content SET content = ? WHERE id = ?', [
      JSON.stringify(merged),
      existingRow.id,
    ]);
  } else {
    const [users] = await connection.query("SELECT id FROM users WHERE role = 'Super Admin' LIMIT 1");
    const updatedBy = (users as any[])[0]?.id || null;
    await connection.query(
      'INSERT INTO cms_content (page_key, section_key, content, updated_by) VALUES (?, ?, ?, ?)',
      ['global', 'policies', JSON.stringify(merged), updatedBy]
    );
  }

  console.log(`Added ${publications.length} publications to policies CMS.`);
  await connection.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
