// migrations/setup.ts
import { openDb } from '../config/sqlite';

async function setupDatabase() {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      group TEXT,
      date TEXT,
      part TEXT,
      observations TEXT
    );
  `);
    console.log('Tabela de participantes criada com sucesso.');
  }
  
  setupDatabase();
  