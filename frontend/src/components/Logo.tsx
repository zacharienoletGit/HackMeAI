import Link from "next/link";

export function Logo() {
  return (
    <Link className="logo" href="/chat" aria-label="HackMeAI">
      <span className="logoMark" aria-hidden="true">
        H
      </span>
      <span>
        HackMe<span className="logoAccent">AI</span>
      </span>
    </Link>
  );
}
