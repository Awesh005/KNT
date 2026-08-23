import fs from 'fs';
import path from 'path';

const BOOK_SEEDS = [
  { title: 'Project Photo Chapters', file: 'KNT_Full_Book_Project_Photo_Chapters.pdf' },
  { title: 'Complete Project Book (Print Safe)', file: 'KNT_World_Welfare_Foundation_Complete_Project_Book_2026_Improved_300DPI_Print_Safe_No_Cut.pdf' },
  { title: 'Complete Project VIP Photo Filled Book', file: 'KNT_World_Welfare_Foundation_Complete_Project_VIP_Photo_Filled_Book.pdf' },
  { title: 'Full Work Project Cost Portfolio', file: 'KNT_World_Welfare_Foundation_Full_Work_Project_Cost_Portfolio_2026_Clear_Typing_No_Cut.pdf' },
];

export default async function seedPolicies(connection: any) {
  const [existing] = await connection.query(
    "SELECT id FROM cms_content WHERE page_key = 'global' AND section_key = 'policies'"
  );

  if ((existing as any[]).length > 0) {
    console.log('Policies CMS content already exists. Skipping publications seed...');
    return;
  }

  const booksDir = path.join(process.cwd(), '../frontend/public/books');
  const policiesDir = path.join(process.cwd(), 'uploads/policies');

  if (!fs.existsSync(policiesDir)) {
    fs.mkdirSync(policiesDir, { recursive: true });
  }

  const documents: any[] = [];
  let id = 1;

  for (const book of BOOK_SEEDS) {
    const sourcePath = path.join(booksDir, book.file);
    if (!fs.existsSync(sourcePath)) {
      console.log(`Skipping missing book: ${book.file}`);
      continue;
    }

    const destName = `policy-seed-${id}-${book.file}`;
    const destPath = path.join(policiesDir, destName);
    fs.copyFileSync(sourcePath, destPath);

    documents.push({
      id: id++,
      type: 'Publications',
      title: book.title,
      year: '2026',
      fileUrl: `/uploads/policies/${destName}`,
      visibility: 'public',
      updatedAt: new Date().toISOString(),
    });
  }

  // Seed common policy placeholders if privacy PDF exists in production build
  const privacyCandidates = [
    path.join(process.cwd(), '../production/frontend_build/privacy.pdf'),
    path.join(booksDir, 'privacy-policy.pdf'),
  ];

  for (const privacyPath of privacyCandidates) {
    if (fs.existsSync(privacyPath)) {
      const destName = `policy-seed-privacy-${Date.now()}.pdf`;
      fs.copyFileSync(privacyPath, path.join(policiesDir, destName));
      documents.push({
        id: id++,
        type: 'Data Privacy Policy',
        title: 'Privacy Policy',
        year: '2026',
        fileUrl: `/uploads/policies/${destName}`,
        visibility: 'public',
        updatedAt: new Date().toISOString(),
      });
      break;
    }
  }

  if (documents.length === 0) {
    console.log('No publication PDFs found to seed.');
    return;
  }

  await connection.query(
    `INSERT INTO cms_content (page_key, section_key, content, updated_by)
     VALUES ('global', 'policies', ?, 'SYSTEM')`,
    [JSON.stringify(documents)]
  );

  console.log(`Seeded ${documents.length} policy/publication documents.`);
}
