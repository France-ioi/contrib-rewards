import Image from "next/image";
import Navbar from "@/app/ui/navbar";

export default async function Header() {
  return (
    <header>
      <div className="container mx-auto pt-8">
        <div className="mb-8">
          <Image
            src="/opentezos.svg"
            alt="Open Tezos Logo"
            width={100}
            height={24}
            priority
          />
        </div>

        <h1 className="text-6xl font-bolder leading-8 text-actions-hover">
          Kudoz
        </h1>
      </div>
      {/*<section>*/}
      {/*  We have raised*/}
      {/*</section>*/}

      <Navbar/>
    </header>
  )
}
