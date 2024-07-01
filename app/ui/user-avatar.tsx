import Image from "next/image";

interface UserAvatarProps {
  user: {
    name: string|null,
    image: string|null,
  },
  size: number,
}

export default function UserAvatar({user, size}: UserAvatarProps) {
  return (
    <div className="rounded-full bg-gradient-to-br from-[#0F61FF] to-[#E01AFF] p-2" style={{width: `${size}px`, height: `${size}px`}}>
      <div className="rounded-full w-full h-full flex items-center justify-center">
        {/*TODO*/}
        {/*{user.image ?*/}
        {/*  <Image*/}
        {/*    width={size}*/}
        {/*    height={size}*/}
        {/*    src={user.image}*/}
        {/*    alt="Top donor"*/}
        {/*  />*/}
        {/*  :*/}
          <div className="text-white font-medium select-none" style={{fontSize: `${size * 0.7}px`}}>
            {user.name!.substring(0, 1).toLocaleUpperCase()}
          </div>
        {/*}*/}
      </div>
    </div>
  )
}
