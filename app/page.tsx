import { Input } from "@/components/ui/input";
import Image from "next/image";
import ClientHero from "./home-components/C_hero";
import { getPantryItems } from "./actions";

export default async function Home() {

  try {
    const pantryItems = await getPantryItems();
    return (
      <main className="bg-neutral-800 overflow-hidden text-white min-h-screen relative flex-col place-items-center p-8  md:p-24">
        <ClientHero items={pantryItems ?? []}  />
      </main>
    );
  } catch (error) {
  }

}
