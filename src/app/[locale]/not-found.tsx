import { auth } from "@/server/auth";
import NavigationSidebar from "../_components/navigation-sidebar";

export default async function NotFound() {
  const session = await auth();

  return (
    <>
      <div className="wrapper">
        <div className="flex">
          <NavigationSidebar session={session} searchParams={{}} />
          <div className="flex h-full w-full flex-col items-center justify-center">
            <h1 className="h1">404</h1>
            <p>Page not found</p>
          </div>
        </div>
      </div>
    </>
  );
}
