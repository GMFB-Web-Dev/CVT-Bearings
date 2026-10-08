import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
export const metadata: Metadata = { title:"Sign In" };
export default function LoginPage(){return <section className="auth-shell"><Suspense><AuthForm/></Suspense></section>}
