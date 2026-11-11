-- =====================================================================
--  PerúBox · Datos iniciales (productos y tarifas de envío)
--  Ejecutar DESPUÉS de schema.sql. Todo se puede editar luego desde /admin
-- =====================================================================

-- ---------- ENVÍOS NACIONALES (S/) ----------
insert into public.shipping_rates (scope, destination, price, currency, eta, sort_order) values
  ('nacional','Lima Metropolitana',10,'PEN','24 a 48 h',1),
  ('nacional','Callao',12,'PEN','24 a 48 h',2),
  ('nacional','Lima Provincias',18,'PEN','2 a 3 días',3),
  ('nacional','Áncash',22,'PEN','2 a 4 días',4),
  ('nacional','Ica',20,'PEN','2 a 3 días',5),
  ('nacional','La Libertad',22,'PEN','2 a 4 días',6),
  ('nacional','Lambayeque',22,'PEN','2 a 4 días',7),
  ('nacional','Piura',25,'PEN','3 a 4 días',8),
  ('nacional','Tumbes',28,'PEN','3 a 5 días',9),
  ('nacional','Cajamarca',25,'PEN','3 a 5 días',10),
  ('nacional','Junín',22,'PEN','2 a 4 días',11),
  ('nacional','Huánuco',25,'PEN','3 a 5 días',12),
  ('nacional','Huancavelica',25,'PEN','3 a 5 días',13),
  ('nacional','Ayacucho',22,'PEN','3 a 5 días',14),
  ('nacional','Arequipa',25,'PEN','2 a 4 días',15),
  ('nacional','Cusco',28,'PEN','3 a 5 días',16),
  ('nacional','Puno',30,'PEN','3 a 6 días',17),
  ('nacional','Tacna',30,'PEN','3 a 5 días',18),
  ('nacional','Moquegua',28,'PEN','3 a 5 días',19),
  ('nacional','Amazonas',25,'PEN','4 a 6 días',20),
  ('nacional','San Martín',25,'PEN','4 a 6 días',21),
  ('nacional','Loreto',35,'PEN','5 a 8 días',22),
  ('nacional','Ucayali',30,'PEN','4 a 7 días',23),
  ('nacional','Madre de Dios',35,'PEN','5 a 8 días',24),
  ('nacional','Apurímac',25,'PEN','3 a 5 días',25),
  ('nacional','Pasco',22,'PEN','3 a 5 días',26)
on conflict (scope, destination) do nothing;

-- ---------- ENVÍOS INTERNACIONALES (USD) ----------
insert into public.shipping_rates (scope, destination, price, currency, eta, sort_order) values
  ('internacional','Estados Unidos',35,'USD','7 a 12 días',1),
  ('internacional','Canadá',40,'USD','8 a 14 días',2),
  ('internacional','México',35,'USD','7 a 12 días',3),
  ('internacional','Colombia',25,'USD','5 a 9 días',4),
  ('internacional','Ecuador',25,'USD','5 a 9 días',5),
  ('internacional','Chile',25,'USD','5 a 9 días',6),
  ('internacional','Argentina',35,'USD','7 a 12 días',7),
  ('internacional','Brasil',35,'USD','7 a 12 días',8),
  ('internacional','Japón',55,'USD','10 a 16 días',9),
  ('internacional','Australia',60,'USD','10 a 18 días',10)
on conflict (scope, destination) do nothing;

-- ---------- ENVÍOS EUROPA (USD) ----------
insert into public.shipping_rates (scope, destination, price, currency, eta, sort_order) values
  ('europa','España',45,'USD','8 a 14 días',1),
  ('europa','Francia',50,'USD','9 a 15 días',2),
  ('europa','Alemania',50,'USD','9 a 15 días',3),
  ('europa','Italia',50,'USD','9 a 15 días',4),
  ('europa','Reino Unido',50,'USD','9 a 15 días',5)
on conflict (scope, destination) do nothing;

-- ---------- PRODUCTOS (precios en S/) ----------
insert into public.products (name, description, category, price, stock, emoji, featured)
select * from (values
  ('Inca Kola 500 ml','La bebida de sabor nacional. Dorada, dulce e inconfundible.','Bebidas',4.50,120,'🥤',true),
  ('Inca Kola Lata 355 ml','Formato lata ideal para viajar dentro de tu box.','Bebidas',4.00,80,'🥫',false),
  ('Chicha Morada 1 L','Maíz morado, piña, canela y clavo. Refrescante y natural.','Bebidas',8.50,40,'🍇',false),
  ('Inka Chips Clásicas','Papas nativas andinas fritas, crocantes y con sal de Maras.','Snacks',6.50,90,'🥔',true),
  ('Chifles Piuranos','Plátano verde frito en láminas, el snack del norte.','Snacks',5.00,70,'🍌',false),
  ('Cancha Serrana','Maíz chulpe tostado con sal, el acompañante perfecto.','Snacks',4.50,60,'🌽',false),
  ('Pingüino','Pastelito de chocolate relleno de crema, un clásico del recreo.','Dulces',3.00,100,'🐧',true),
  ('Chocolate Milky','Barra de chocolate con leche cremosa.','Dulces',3.50,90,'🍫',false),
  ('Chocolate Sublime','El chocolate con maní más querido del Perú.','Dulces',2.50,150,'🥜',true),
  ('Galletas Doña Pepa','Galleta bañada en chocolate con grageas de colores.','Dulces',2.00,140,'🍪',true),
  ('Turrón de Doña Pepa','Turrón tradicional de anís con miel de chancaca.','Dulces',22.00,25,'🍯',false),
  ('Alfajores de Manjar (x6)','Masa suave y manjar blanco artesanal, espolvoreados con azúcar.','Dulces',18.00,35,'🤍',true),
  ('Chocolate Cusqueño 70%','Cacao fino de aroma del valle de La Convención.','Gourmet',16.00,30,'🍫',false),
  ('Café de Chanchamayo 250 g','Café de altura tostado medio, notas a cacao y caramelo.','Gourmet',28.00,40,'☕',true),
  ('Maca Andina en Polvo','Superalimento de los Andes, energía natural.','Gourmet',24.00,35,'🌿',false),
  ('Pasta de Ají Amarillo','La base de la cocina peruana: ají de gallina, causa y más.','Gourmet',12.00,50,'🌶️',false),
  ('Infusión de Muña','Hierba andina digestiva y aromática (20 sobres).','Gourmet',9.00,45,'🍵',false),
  ('Peluche de Alpaca','Suave alpaca con chalina andina. El abrazo del Perú.','Recuerdos',35.00,20,'🦙',true),
  ('Llavero Chakana','Llavero artesanal con la cruz andina tallada.','Recuerdos',12.00,60,'🔑',false),
  ('Chullo Andino','Gorro tejido a mano con motivos tradicionales.','Recuerdos',45.00,15,'🧶',false)
) as v(name, description, category, price, stock, emoji, featured)
where not exists (select 1 from public.products p where p.name = v.name);
