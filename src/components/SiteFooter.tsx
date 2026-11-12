import Image from "next/image";
import Link from "next/link";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { Mountains } from "./ui";

function Social({ label, d, href }: { label: string; d: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid h-11 w-11 place-items-center rounded-full bg-white/10 transition hover:-translate-y-1 hover:bg-oro hover:text-cacao">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d={d} />
      </svg>
    </a>
  );
}

export default function SiteFooter() {
  return (
    <footer className="relative mt-24 bg-vino-800 text-crema">
      <Mountains className="absolute -top-[59px] h-16 w-full text-vino-800" />
      <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-10 pt-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <Image src="/img/logo.webp" alt="PerúBox" width={64} height={64} className="rounded-full" />
            <div>
              <p className="font-serif text-2xl font-bold">PerúBox</p>
              <p className="font-script text-xl text-oro">sabores que unen</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm text-crema/70">
            Llevamos un pedacito del Perú a cada rincón del mundo. Cajas personalizadas con productos 100% peruanos.
          </p>
          <div className="mt-6 flex gap-3">
            <Social label="Instagram" href="https://instagram.com" d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4ZM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4ZM12 2c-2.7 0-3 0-4.1.1C4.3 2.2 2.2 4.3 2.1 7.9 2 9 2 9.3 2 12s0 3 .1 4.1c.1 3.6 2.2 5.7 5.8 5.8 1.1.1 1.4.1 4.1.1s3 0 4.1-.1c3.6-.1 5.7-2.2 5.8-5.8.1-1.1.1-1.4.1-4.1s0-3-.1-4.1c-.1-3.6-2.2-5.7-5.8-5.8C15 2 14.7 2 12 2Z" />
            <Social label="Facebook" href="https://facebook.com" d="M14 8V6.2c0-.8.2-1.2 1.4-1.2H17V2h-2.6C11.3 2 10 3.5 10 6v2H8v3h2v11h4V11h2.7l.3-3H14Z" />
            <Social label="TikTok" href="https://tiktok.com" d="M19.6 7.7a5.4 5.4 0 0 1-3.2-1.1v7.6a5.8 5.8 0 1 1-5-5.7v3a2.9 2.9 0 1 0 2 2.7V2h3a3.6 3.6 0 0 0 3.2 3.4v2.3Z" />
            <Social label="WhatsApp" href="https://wa.me/51987654321" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1a17 17 0 0 1-1.7-.6 13.4 13.4 0 0 1-5.1-4.5c-.4-.5-1.2-1.6-1.2-3.1s.8-2.2 1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.3 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.6 2.1 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l2 1 .5.3c.1.1.1.6-.1 1.4Z" />
          </div>
        </div>
        <div>
          <p className="font-serif text-lg font-semibold">Explora</p>
          <ul className="mt-4 space-y-2 text-sm text-crema/70">
            <li><Link href="/arma-tu-box" className="hover:text-oro">Arma tu Box</Link></li>
            <li><Link href="/#productos" className="hover:text-oro">Productos</Link></li>
            <li><Link href="/#envios" className="hover:text-oro">Envíos</Link></li>
            <li><Link href="/cuenta" className="hover:text-oro">Mis pedidos</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-serif text-lg font-semibold">Contacto</p>
          <ul className="mt-4 space-y-2 text-sm text-crema/70">
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Lima, Perú</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +51 987 654 321</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hola@perubox.pe</li>
            <li className="flex items-center gap-2"><Globe className="h-4 w-4" /> Envíos a 31 destinos</li>
          </ul>
        </div>
      </div>
      <div className="andean-band h-4 opacity-90" />
      <p className="bg-vino-900 py-4 text-center text-xs text-crema/50">
        © {2026} PerúBox · Proyecto universitario · Hecho con 🤍 y mucho ají
        <span className="mt-1 block sm:ml-2 sm:mt-0 sm:inline">
          <Link href="/privacidad" className="hover:text-oro">Privacidad</Link> ·{" "}
          <Link href="/eliminar-datos" className="hover:text-oro">Eliminación de datos</Link>
        </span>
      </p>
    </footer>
  );
}
