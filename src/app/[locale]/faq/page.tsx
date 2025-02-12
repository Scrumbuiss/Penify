import NavigationSidebar from "@/app/_components/navigation-sidebar";
import { auth } from "@/server/auth";
import Accordions from "./_components/accordions";

const Faq = async () => {
  const session = await auth();

  return (
    <div className="wrapper">
      <div className="flex">
        <NavigationSidebar session={session} searchParams={{}} />
        <Accordions />
      </div>
    </div>
  );
};

export default Faq;
