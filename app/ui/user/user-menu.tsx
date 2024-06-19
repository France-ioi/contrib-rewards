'use client';

import UserIcon from "@/public/icons/user.svg";
import Image from "next/image";
import {openLoginWindow} from "@/app/lib/user";

export default function UserMenu() {
  return (
    <Image
      width={32}
      height={32}
      src={UserIcon}
      alt="User"
      className="cursor-pointer"
      onClick={openLoginWindow}
    />
  )
}
