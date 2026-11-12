import Link from "next/link";

export function LegalPage({ eyebrow, title, updated, children }: { eyebrow: string; title: string; updated: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-3xl px-5 pb-10 pt-32 sm:px-8 sm:pt-36">
      <p className="font-script text-2xl text-vino-600">{eyebrow}</p>
      <h1 className="mt-1 font-serif text-4xl font-bold text-cacao sm:text-5xl">{title}</h1>
      <p className="mt-3 text-sm text-cacao/50">Última actualización: {updated}</p>
      <div className="mt-8 space-y-6 rounded-[2rem] bg-white p-6 leading-relaxed text-cacao/80 shadow-sm ring-1 ring-kraft/60 sm:p-10 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-cacao [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">
        {children}
      </div>
      <p className="mt-6 text-center text-sm text-cacao/50">
        <Link href="/privacidad" className="hover:text-vino-600">Política de privacidad</Link> ·{" "}
        <Link href="/eliminar-datos" className="hover:text-vino-600">Eliminación de datos</Link> ·{" "}
        <Link href="/" className="hover:text-vino-600">Volver a la tienda</Link>
      </p>
    </section>
  );
}
