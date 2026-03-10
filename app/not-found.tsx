import Link from "next/link";

export default function NotFound() {
  return (
    <div className="section-padding min-h-[60vh] flex items-center">
      <div className="container-max text-center w-full">
        <div
          className="w-24 h-24 rounded-full border-4 border-brand-blue mx-auto mb-8 flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="text-brand-blue font-bold text-3xl">404</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Stranica nije pronađena
        </h1>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          Tražena stranica ne postoji ili je premještena.
        </p>
        <Link href="/" className="btn-primary">
          Idi na početnu
        </Link>
      </div>
    </div>
  );
}
