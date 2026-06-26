import pg from "pg";

const connectionString = process.env.DATABASE_URL ?? process.env.SUPABASE_DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL required");
  process.exit(1);
}

const client = new pg.Client({ connectionString });
await client.connect();

const mem = await client.query(`
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'liv_entity_memory'
    AND column_name IN ('supersedes_id', 'source_ref', 'metadata')
`);
const twin = await client.query(`
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'twin_observations'
    AND column_name IN ('owner_status', 'owner_acted_at', 'owner_user_id')
`);

const memCols = mem.rows.map((r) => r.column_name).sort();
const twinCols = twin.rows.map((r) => r.column_name).sort();

console.log("liv_entity_memory:", memCols.join(", ") || "MISSING");
console.log("twin_observations:", twinCols.join(", ") || "MISSING");

const ok =
  memCols.length === 3 &&
  twinCols.length === 3;

await client.end();
process.exit(ok ? 0 : 1);
