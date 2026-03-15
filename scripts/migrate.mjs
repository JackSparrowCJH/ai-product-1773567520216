import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DB_URL });

const migration = `
-- 用户表：存储用户功德数据
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

-- 按 openid 查询用户（登录、同步功德）
CREATE INDEX IF NOT EXISTS idx_users_openid ON users (openid);

-- 按功德数排序（排行榜）
CREATE INDEX IF NOT EXISTS idx_users_merit_desc ON users (merit DESC);

-- 皮肤配置表
CREATE TABLE IF NOT EXISTS skins (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  image_url TEXT DEFAULT '',
  sound_url TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 敲击记录表：用于数据校验和防作弊
CREATE TABLE IF NOT EXISTS merit_logs (
  id BIGSERIAL PRIMARY KEY,
  openid VARCHAR(128) NOT NULL,
  delta INT NOT NULL,
  source VARCHAR(32) DEFAULT 'tap',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 按用户查询敲击记录
CREATE INDEX IF NOT EXISTS idx_merit_logs_openid ON merit_logs (openid);

-- 按时间查询（数据分析）
CREATE INDEX IF NOT EXISTS idx_merit_logs_created_at ON merit_logs (created_at);

-- 插入默认皮肤
INSERT INTO skins (id, name, sort_order) VALUES
  ('default', '经典木鱼', 0),
  ('cyberpunk', '赛博朋克', 1),
  ('jade', '翡翠禅心', 2)
ON CONFLICT (id) DO NOTHING;
`;

async function run() {
  const client = await pool.connect();
  try {
    await client.query(migration);
    console.log("Migration completed successfully.");

    const tables = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`
    );
    console.log("Tables:", tables.rows.map((r) => r.table_name));

    const indexes = await client.query(
      `SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname`
    );
    console.log("Indexes:", indexes.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
