import { AdminPanel } from "@/components/AdminPanel";
import { isAdminSession } from "@/lib/auth";

export default async function AdminPage() {
  const initialAuthed = await isAdminSession();

  return <AdminPanel initialAuthed={initialAuthed} />;
}
