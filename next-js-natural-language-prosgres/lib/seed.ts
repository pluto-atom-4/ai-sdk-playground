import { Pool } from 'pg';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import "dotenv/config"

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'your_database_name',
  password: process.env.POSTGRES_PASSWORD || 'your_password',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

const parseDate = (dateStr: string): string => {
  if (!dateStr || dateStr.trim() === '') {
    return new Date().toISOString();
  }

  const [month, day, year] = dateStr.split('/');

  // Handle 2-digit years (convert to 4-digit)
  let fullYear = year;
  if (year.length === 2) {
    const yearNum = parseInt(year);
    // Assume years 00-30 are 2000s, 31-99 are 1900s
    fullYear = yearNum <= 30 ? `20${year}` : `19${year}`;
  }

  // Create date object and return ISO string
  const date = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  return date.toISOString();
};

export async function seed() {
  const client = await pool.connect();

  try {
    const createTable = await client.query(`
      CREATE TABLE IF NOT EXISTS unicorns (
        id SERIAL PRIMARY KEY,
        company VARCHAR(255) NOT NULL UNIQUE,
        valuation DECIMAL(10, 2) NOT NULL,
        date_joined DATE,
        country VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        industry VARCHAR(255) NOT NULL,
        select_investors TEXT NOT NULL
      );
    `);

    console.log(`Created "unicorns" table`);

    const results: any[] = [];
    const csvFilePath = path.join(process.cwd(), 'unicorns.csv');

    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    for (const row of results) {
      const formattedDate = parseDate(row['Date Joined']);

      await client.query(`
        INSERT INTO unicorns (company, valuation, date_joined, country, city, industry, select_investors)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (company) DO NOTHING;
      `, [
        row.Company,
        parseFloat(row['Valuation ($B)'].replace('$', '').replace(',', '')),
        formattedDate,
        row.Country,
        row.City,
        row.Industry,
        row['Select Investors']
      ]);
    }

    console.log(`Seeded ${results.length} unicorns`);

    return {
      createTable,
      unicorns: results,
    };
  } finally {
    client.release();
  }
}

seed().catch(console.error).finally(() => pool.end());