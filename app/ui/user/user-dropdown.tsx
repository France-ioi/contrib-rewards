'use client';

import {Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@nextui-org/react";
import UserIcon from "@/public/icons/user.svg";
import Image from "next/image";
import {signOut} from "next-auth/react";
import Link from "next/link";

export default function UserDropdown() {
  const profileUrl = process.env.NEXT_PUBLIC_OAUTH_SERVER_URL + '/profile';

  return (
    <Dropdown>
      <DropdownTrigger>
        <Image
          width={32}
          height={32}
          src={UserIcon}
          alt="User"
          className="cursor-pointer"
        />
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem key="profile" textValue="Profile" className="p-0">
          <Link href={profileUrl} className="block h-full w-full p-2 m-0">
            Profile
          </Link>
        </DropdownItem>
        <DropdownItem key="logout" textValue="Log out" onClick={() => signOut()}>Log out</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
