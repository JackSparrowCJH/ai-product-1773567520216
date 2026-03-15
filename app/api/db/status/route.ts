import pool from "@/lib/db";

export async function GET() {
  try {
    const tables = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`
    );

    const indexes = await pool.query(
      `SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname`
    );

    const counts: Record<string, number> = {};
    for (const row of tables.rows) {
      const res = await pool.query(`SELECT COUNT(*) as cnt FROM "${row.table_name}"`);
      counts[row.table_name] = parseInt(res.rows[0].cnt, 10);
    }

    return Response.json({
      ok: true,
      tables: tables.rows.map((r) => r.table_name),
      indexes: indexes.rows,
      row_counts: counts,
    });
  } catch (error: any) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}
