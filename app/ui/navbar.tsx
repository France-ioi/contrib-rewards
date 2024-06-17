'use client';

import NavbarItem from "@/app/ui/navbar-item";
import {usePathname} from "next/navigation";

const navbarItems = [
  {
    name: 'Contributions',
    href: '/contributions',
  },
  {
    name: 'Donations page',
    href: '/donations',
  },
  {
    name: 'Author page',
    href: '/authors',
  },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-b-divider mt-8 mb-8">
      <div className="container mx-auto">
        <div className="flex gap-12">
          {navbarItems.map(item =>
            <NavbarItem
              key={item.href}
              name={item.name}
              href={item.href}
              active={pathname === item.href}
            />
          )}
        </div>
      </div>
    </nav>
  )
}
