export const metadata = {
  title: "敲木鱼",
  description: "敲木鱼解压小程序后端服务",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
