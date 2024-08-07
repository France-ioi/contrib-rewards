import Image from "next/image";
import Navbar from "@/app/ui/navbar";
import UserMenu from "@/app/ui/user/user-menu";
import HeaderStats from "@/app/ui/header-stats";
import config from "@/app/lib/config";

export default function Header() {
  return (
    <header>
      <div className="container mx-auto px-4 pt-8">
        <div className="flex">
          <div className="grow">
            <div className="mb-2 md:mb-4">
              <Image
                src="/opentezos.svg"
                alt="Open Tezos Logo"
                width="0"
                height="0"
                className="w-[100px] h-auto"
                priority
              />
            </div>

            <h1 className="text-3xl md:text-6xl font-black leading-8 text-actions-hover">
              {config.appName}
            </h1>
          </div>
          <div>
            <UserMenu/>
          </div>
        </div>
      </div>

      <HeaderStats/>

      <Navbar/>
    </header>
  )
}
