import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { signIn } from "@/auth";
import { Logo } from "@/components/Logo";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your Rufus workspace.",
  robots: { index: false, follow: false },
};

export default function SignInPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
      <div className="mb-10 flex items-center justify-between">
        <Logo />
        <Link href="/" className="text-xs font-medium text-ink-400 hover:text-ink-900">
          ← Home
        </Link>
      </div>

      <div className="card p-7 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink-900">
          Sign in to <span className="accent-italic text-accent">Rufus</span>
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Use your Google account. We&apos;ll create your workspace on first sign-in — no card required to
          try one task on the Free plan.
        </p>

        <form
          action={async (formData) => {
            "use server";
            const callbackUrl = String(formData.get("callbackUrl") ?? "/app");
            await signIn("google", { redirectTo: callbackUrl });
          }}
          className="mt-7"
        >
          <CallbackHidden searchParams={searchParams} />
          <button type="submit" className="btn-dark w-full">
            <GoogleGlyph /> Continue with Google
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-[11px] leading-relaxed text-ink-400">
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline hover:text-ink-900">Terms</Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-ink-900">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

async function CallbackHidden({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const sp = await searchParams;
  return <input type="hidden" name="callbackUrl" value={sp.callbackUrl ?? "/app"} />;
}

function GoogleGlyph() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.5 12.27c0-.78-.07-1.53-.2-2.27H12v4.3h5.93a5.07 5.07 0 0 1-2.2 3.33v2.77h3.55c2.08-1.92 3.28-4.74 3.28-8.13Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.6l-3.55-2.77c-.99.66-2.25 1.05-3.73 1.05-2.87 0-5.3-1.94-6.17-4.55H2.18v2.86A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.83 14.13a6.6 6.6 0 0 1 0-4.26V7H2.18a11 11 0 0 0 0 10l3.65-2.87Z" />
      <path fill="#EA4335" d="M12 5.45c1.62 0 3.08.56 4.22 1.65l3.16-3.16C17.46 2.14 14.97 1 12 1 7.7 1 3.99 3.48 2.18 7l3.65 2.87C6.7 7.27 9.13 5.45 12 5.45Z" />
    </svg>
  );
}
