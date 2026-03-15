import pool from "@/lib/db";

const migration = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  openid VARCHAR(128) NOT NULL UNIQUE,
  nickname VARCHAR(255) DEFAULT '',
  avatar_url TEXT DEFAULT '',
  merit BIGINT DEFAULT 0,
  current_skin VARCHAR(64) DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_openid ON users (openid);
CREATE INDEX IF NOT EXISTS idx_users_merit_desc ON users (merit DESC);

CREATE TABLE IF NOT EXISTS skins (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  image_url TEXT DEFAULT '',
  sound_url TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS merit_logs (
  id BIGSERIAL PRIMARY KEY,
  openid VARCHAR(128) NOT NULL,
  delta INT NOT NULL,
  source VARCHAR(32) DEFAULT 'tap',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_merit_logs_openid ON merit_logs (openid);
CREATE INDEX IF NOT EXISTS idx_merit_logs_created_at ON merit_logs (created_at);

INSERT INTO skins (id, name, sort_order) VALUES
  ('default', '经典木鱼', 0),
  ('cyberpunk', '赛博朋克', 1),
  ('jade', '翡翠禅心', 2)
ON CONFLICT (id) DO NOTHING;
`;

export async function POST() {
  const client = await pool.connect();
  try {
    await client.query(migration);
    return Response.json({ ok: true, message: "Migration completed" });
  } catch (error: any) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
