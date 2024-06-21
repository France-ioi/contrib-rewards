import UserIcon from "@/public/icons/user.svg";
import Image from "next/image";
import {auth, signIn} from "@/app/lib/auth";
import UserDropdown from "@/app/ui/user/user-dropdown";

export default async function UserMenu() {
  const session = await auth();
  const user = session?.user;

  if (user) {
    return (
      <div className="flex items-center gap-2 text-light">
        <div>
          {user.login}
        </div>

        <UserDropdown/>
      </div>
    )
  }

  return (
    <form
      action={async () => {
        "use server";
        await signIn('france-ioi');
      }}
    >
      <button>
        <Image
          width={32}
          height={32}
          src={UserIcon}
          alt="User"
          className="cursor-pointer"
        />
      </button>
    </form>
  )
}
