import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Eliminación de datos · PerúBox",
  description: "Cómo solicitar que PerúBox elimine tu cuenta y tus datos personales.",
};

export default function EliminarDatosPage() {
  return (
    <LegalPage eyebrow="Tú decides" title="Eliminación de datos" updated="12 de noviembre de 2026">
      <p>
        Si creaste una cuenta en PerúBox (con tu correo, Google o Facebook) y quieres que eliminemos tu cuenta y tus datos personales, puedes pedirlo en cualquier momento.
      </p>

      <h2>Cómo solicitarlo</h2>
      <ul>
        <li>
          Escribe a <strong>hola@perubox.pe</strong> o por WhatsApp al <strong>+51 997 534 790</strong> con el asunto <em>“Eliminar mis datos”</em>.
        </li>
        <li>Indica el correo electrónico con el que te registraste o con el que entraste por Google o Facebook.</li>
        <li>Atenderemos tu solicitud en un plazo máximo de 10 días hábiles y te confirmaremos cuando esté hecho.</li>
      </ul>

      <h2>Qué eliminamos</h2>
      <ul>
        <li>Tu cuenta y tu perfil: nombre, usuario, correo, teléfono y preferencias de ofertas.</li>
        <li>El vínculo con tu cuenta de Google o Facebook.</li>
        <li>Tus datos personales en los pedidos (nombre, teléfono, dirección y documento), que quedan anonimizados.</li>
      </ul>
      <p>
        Solo conservamos, sin datos que te identifiquen, el registro contable de las ventas (importe y fecha), porque los comprobantes de pago deben guardarse por ley.
      </p>

      <h2>Si entraste con Facebook</h2>
      <p>
        También puedes quitar el acceso de PerúBox desde Facebook: <strong>Configuración y privacidad → Configuración → Apps y sitios web</strong>, elige <em>PerúBox</em> y pulsa{" "}
        <em>Eliminar</em>. Después escríbenos para borrar también los datos que guardamos.
      </p>

      <p>
        Más detalles en nuestra <Link href="/privacidad" className="font-semibold text-vino-600 underline">política de privacidad</Link>.
      </p>
    </LegalPage>
  );
}
