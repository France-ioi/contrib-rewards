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
        `text-3xl`
      }
    >
      <Link
        href={href}
        className={`block py-4
         ${active ? 'border-b-8 border-b-action text-action' : 'text-light'}
       `}
      >
        {name}
      </Link>
    </h3>
  )
}
