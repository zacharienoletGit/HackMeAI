import Link from "next/link";

export default function NotFound() {
  return (
    <main className="centeredPage">
      <span className="errorCode">404</span>
      <h1>Page introuvable</h1>
      <Link className="button buttonPrimary" href="/">
        Retour à HackMeAI
      </Link>
    </main>
  );
}
