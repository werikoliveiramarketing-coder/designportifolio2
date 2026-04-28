-- Limpeza Completa para Supabase (Executar no SQL Editor)
-- Avisos: Isso excluirá todos os dados existentes nas tabelas abaixo.

DROP TABLE IF EXISTS portfolio CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS contact CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS admin CASCADE;

-- 1. Tabela Portfolio
CREATE TABLE portfolio (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela Services
CREATE TABLE services (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela Contact (Singleton)
CREATE TABLE contact (
  id INT PRIMARY KEY DEFAULT 1,
  whatsapp TEXT,
  instagram TEXT,
  email TEXT,
  about TEXT,
  profile_image_url TEXT,
  linkedin TEXT,
  twitter TEXT,
  facebook TEXT,
  github TEXT,
  gitlab TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT singleton_contact CHECK (id = 1)
);

-- 4. Tabela Settings (Singleton)
CREATE TABLE settings (
  id INT PRIMARY KEY DEFAULT 1,
  brand_color TEXT DEFAULT '#7b2cff',
  brand_color_light TEXT DEFAULT '#f5f0ff',
  years_experience INT DEFAULT 0,
  identities_created INT DEFAULT 0,
  arts_created INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT singleton_settings CHECK (id = 1)
);

-- 5. Tabela Admin (Para o PIN)
CREATE TABLE admin (
  id INT PRIMARY KEY DEFAULT 1,
  pin TEXT NOT NULL DEFAULT 'W9x#vL2k@M6pQ*R4',
  CONSTRAINT singleton_admin CHECK (id = 1)
);

-- Inserir Dados Iniciais (Necessário para os Singletons funcionarem com UPDATE)
INSERT INTO admin (id, pin) VALUES (1, 'W9x#vL2k@M6pQ*R4');
INSERT INTO settings (id, brand_color, brand_color_light, years_experience, identities_created, arts_created) 
VALUES (1, '#7b2cff', '#f5f0ff', 5, 150, 500);
INSERT INTO contact (id, whatsapp, instagram, email, about, profile_image_url)
VALUES (1, '+5517991707452', 'https://instagram.com/woliveira.design', 'werikoliveiramarketing@gmail.com', 'Designer gráfico apaixonado por criar identidades visuais memoráveis e soluções criativas para negócios digitais.', 'https://ais-pre-byowhejhqsdych5hrsgbfs-154542314700.us-east1.run.app/uploads/profile_1777192151760.png');

-- Adicionar alguns itens de exemplo
INSERT INTO services (title, description, icon_name) VALUES 
('Identidade Visual', 'Logotipos e manuais de marca únicos.', 'Palette'),
('Design Digital', 'Interfaces para web e redes sociais.', 'Globe');

INSERT INTO portfolio (title, description, images, category) VALUES 
('Projeto de Exemplo', 'Uma breve descrição do seu trabalho.', ARRAY['https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800'], 'Identidade visual');

-- Desabilitar RLS para facilitar o acesso via Service Role (Opcional mas recomendado para este painel Admin simples)
ALTER TABLE portfolio DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin DISABLE ROW LEVEL SECURITY;
