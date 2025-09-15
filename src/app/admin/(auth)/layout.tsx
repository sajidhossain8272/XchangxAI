// app/admin/(auth)/layout.tsx
export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Keep this minimal — no nav in auth
  return <div className="mx-auto max-w-md p-6">{children}</div>;
}
