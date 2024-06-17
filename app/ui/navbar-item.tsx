import Link from "next/link";

interface NavbarItemProps {
  name: string
  href: string
  active: boolean
}

export default function NavbarItem({name, href, active}: NavbarItemProps) {
  return (
    <h3
      className={
        `md:text-3xl text-nowrap`
      }
    >
      <Link
        href={href}
        className={`block py-2 md:py-4
         ${active ? 'border-b-[3px] md:border-b-8 border-b-action text-action' : 'text-light'}
       `}
      >
        {name}
      </Link>
    </h3>
  )
}
