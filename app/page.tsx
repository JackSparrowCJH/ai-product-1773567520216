export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🪵 敲木鱼 - 后端服务</h1>
      <p>服务运行中。</p>
      <ul>
        <li><a href="/api/health">/api/health</a> - 健康检查</li>
        <li><a href="/api/db/status">/api/db/status</a> - 数据库状态</li>
      </ul>
    </main>
  );
}
