'use client';

import {signIn} from "next-auth/react";

export default function NonLoggedState({label}: {label: string}) {
  const login = () => {
    signIn('france-ioi');
  }

  return (
    <div className="text-center text-xl text-project-focus mt-12">
      <a onClick={login} className="cursor-pointer underline">
        Log in
      </a>
      &nbsp;{label}
    </div>
  );
}
