import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
