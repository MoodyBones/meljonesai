import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const session = cookieStore.get("mj_session");

  if (session) {
    redirect("/admin");
  } else {
    redirect("/login");
  }
}
