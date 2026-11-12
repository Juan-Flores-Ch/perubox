import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Política de privacidad · PerúBox",
  description: "Cómo PerúBox recopila, usa y protege tus datos personales.",
};

export default function PrivacidadPage() {
  return (
    <LegalPage eyebrow="Tus datos, cuidados" title="Política de privacidad" updated="12 de noviembre de 2026">
      <p>
        PerúBox es una tienda en línea de cajas personalizadas con productos peruanos, desarrollada como <strong>proyecto universitario</strong>. Esta política explica qué datos
        personales recopilamos, para qué los usamos y cómo puedes ejercer tus derechos, conforme a la Ley N.º 29733, Ley de Protección de Datos Personales del Perú.
      </p>

      <h2>1. Datos que recopilamos</h2>
      <ul>
        <li><strong>Datos de cuenta:</strong> nombre, nombre de usuario, correo electrónico, teléfono y contraseña (almacenada cifrada; nunca la vemos).</li>
        <li>
          <strong>Inicio de sesión con Google o Facebook:</strong> solo recibimos tu nombre, correo electrónico y foto de perfil pública. No accedemos a tus contactos,
          publicaciones ni a ningún otro dato de esas cuentas.
        </li>
        <li><strong>Datos de compra:</strong> productos elegidos, dirección y destino de envío, mensaje de regalo y, si lo solicitas, DNI, RUC, razón social y dirección fiscal para el comprobante.</li>
        <li>
          <strong>Datos de pago:</strong> el pago es <strong>simulado</strong>. Con tarjeta solo guardamos la marca y los últimos 4 dígitos; nunca el número completo, la fecha ni el
          CVV.
        </li>
      </ul>

      <h2>2. Para qué usamos tus datos</h2>
      <ul>
        <li>Procesar y enviar tus pedidos, y emitir tu boleta o factura.</li>
        <li>Mostrarte tu historial y el estado de tus pedidos.</li>
        <li>Avisarte por WhatsApp o correo sobre tu pedido.</li>
        <li>Enviarte ofertas y novedades, <strong>solo si lo aceptaste</strong> al registrarte. Puedes darte de baja cuando quieras.</li>
      </ul>

      <h2>3. Con quién los compartimos</h2>
      <p>
        No vendemos ni alquilamos tus datos. Se almacenan en <strong>Supabase</strong> (base de datos) y el sitio se aloja en <strong>Vercel</strong>, proveedores que los procesan
        únicamente para que la tienda funcione. Google y Facebook solo intervienen si eliges iniciar sesión con ellos.
      </p>

      <h2>4. Seguridad</h2>
      <p>
        Las conexiones son cifradas (HTTPS) y cada tabla de la base de datos está protegida con reglas de acceso: cada cliente solo puede ver sus propios pedidos y únicamente el
        administrador de la tienda puede ver las ventas.
      </p>

      <h2>5. Cuánto tiempo los conservamos</h2>
      <p>Mientras tu cuenta esté activa o mientras sea necesario para atender tus pedidos. Puedes pedir que eliminemos tus datos en cualquier momento.</p>

      <h2>6. Tus derechos</h2>
      <p>
        Puedes solicitar el acceso, la rectificación, la cancelación u oposición al uso de tus datos (derechos ARCO). Para eliminar tu cuenta y tus datos, sigue los pasos de nuestra
        página de <Link href="/eliminar-datos" className="font-semibold text-vino-600 underline">eliminación de datos</Link>.
      </p>

      <h2>7. Contacto</h2>
      <p>
        Escríbenos a <strong>hola@perubox.pe</strong> o por WhatsApp al <strong>+51 987 654 321</strong>.
      </p>
    </LegalPage>
  );
}
