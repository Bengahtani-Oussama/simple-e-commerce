"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";



export default function GoogleSignInButton() {
  return (
    <button onClick={() => signIn("google")} className="w-full bg-slate-50 border-2 rounded-full flex justify-center items-center gap-2 p-2 ">
       <FcGoogle size={22}/>
       <span>Sign in with Google</span>
    </button>
  );
}