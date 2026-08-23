import mysql from 'mysql2/promise';

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Awesh@005',
    database: 'knt_welfare',
  });

  const [rows] = await connection.query(
    "SELECT content FROM cms_content WHERE page_key = 'global' AND section_key = 'policies'"
  );

  const row = (rows as any[])[0];
  if (!row) {
    console.log('No policies content found');
    await connection.end();
    return;
  }

  const content = typeof row.content === 'string' ? JSON.parse(row.content) : row.content;
  console.log(content.map((d: any) => ({ type: d.type, title: d.title })));
  await connection.end();
}

main();
