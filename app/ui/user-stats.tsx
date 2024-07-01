import Image from "next/image";
import {ReactElement} from "react";

interface UserStatsProps {
  icon: any,
  label: string,
  value: string|ReactElement,
}

export default function UserStats({icon, label, value}: UserStatsProps) {
  return (
    <div className="grow rounded-lg bg-white p-4 py-2 flex gap-4 items-center max-w-[800px]">
      <Image
        width={32}
        height={32}
        src={icon}
        alt={label}
      />

      <h5 className="grow text-base md:text-xl text-light">
        {label}
      </h5>

      <div className="font-bold text-2xl md:text-5xl !leading-[4rem]">
        {value}
      </div>
    </div>
  )
}
