export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image_url: string | null;
  emoji: string | null;
  featured: boolean;
  active: boolean;
  created_at?: string;
};

export type ShippingScope = "nacional" | "internacional" | "europa";

export type ShippingRate = {
  id: string;
  scope: ShippingScope;
  destination: string;
  price: number;
  currency: "PEN" | "USD";
  eta: string;
  active: boolean;
  sort_order: number;
};

export type StoreSettings = {
  id: number;
  usd_to_pen: number;
  yape_number: string;
  yape_holder: string;
  min_box_items: number;
  issuer_ruc?: string;
  issuer_name?: string;
  issuer_address?: string;
};

export type DocType = "boleta" | "factura";

export type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: "customer" | "admin";
  marketing_opt_in: boolean;
  provider: string | null;
  created_at: string;
};

export type OrderStatus = "pagado" | "preparando" | "enviado" | "entregado" | "cancelado";

export type OrderItem = {
  id: string;
  name: string;
  unit_price: number;
  quantity: number;
};

export type Order = {
  id: string;
  order_number: number;
  user_id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_scope: ShippingScope;
  shipping_destination: string;
  shipping_address: string;
  shipping_cost_pen: number;
  items_total_pen: number;
  total_pen: number;
  gift_message: string | null;
  payment_method: "yape" | "plin" | "tarjeta" | "transferencia";
  payment_ref: string | null;
  status: OrderStatus;
  seen_by_admin: boolean;
  created_at: string;
  doc_type: DocType | null;
  doc_series: string | null;
  doc_number: number | null;
  customer_doc_type: string | null;
  customer_doc_number: string | null;
  customer_legal_name: string | null;
  customer_fiscal_address: string | null;
  igv_pen: number | null;
  order_items?: OrderItem[];
};

export const SCOPE_LABEL: Record<ShippingScope, string> = {
  nacional: "Perú (nacional)",
  internacional: "Internacional",
  europa: "Europa",
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pagado: "Pagado",
  preparando: "Preparando",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};
