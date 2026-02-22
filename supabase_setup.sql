-- Limpar estruturas existentes para reconstrução (Versão Pro 3.0)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS meal_plans;
DROP TABLE IF EXISTS meals;
DROP TABLE IF EXISTS profiles;

-- Habilitar extensão para UUID se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Configurações/Perfil do Usuário (Multi-Role)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('professional', 'client', 'admin')),
  
  -- Campos para Profissionais
  crn TEXT, -- Registro Profissional
  specialty TEXT,
  
  -- Campos para Clientes/Pacientes
  professional_id UUID REFERENCES profiles(id), -- Vínculo com o Nutri
  age INTEGER,
  weight_kg NUMERIC,
  height_cm NUMERIC,
  objective TEXT DEFAULT 'maintaining',
  allergies TEXT, -- Novo: Campo de Alergias
  medical_history TEXT, -- Novo: Histórico de Doenças
  lgpd_consent_at TIMESTAMP WITH TIME ZONE,
  
  -- Metas (Podem ser setadas pelo Nutri ou pelo Cliente)
  calorie_goal NUMERIC DEFAULT 2000,
  protein_goal NUMERIC DEFAULT 150,
  carbs_goal NUMERIC DEFAULT 200,
  fat_goal NUMERIC DEFAULT 66,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Tabela de Histórico de Refeições (Pode ser do plano ou registro livre)
CREATE TABLE meals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  calories NUMERIC NOT NULL,
  protein NUMERIC NOT NULL,
  carbs NUMERIC NOT NULL,
  fat NUMERIC NOT NULL,
  insights TEXT,
  meal_type TEXT -- 'breakfast', 'lunch', 'dinner', 'snack'
);

-- Tabela de Agendamentos
CREATE TABLE appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  professional_id UUID REFERENCES profiles(id) NOT NULL,
  client_id UUID REFERENCES profiles(id) NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS PARA PROFILES
CREATE POLICY "Profiles são visíveis pelo próprio dono" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Nutricionistas veem seus próprios pacientes" ON profiles
  FOR SELECT USING (
    professional_id = auth.uid()
  );

-- POLÍTICAS RLS PARA MEALS
CREATE POLICY "Refeições visíveis pelo dono" ON meals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Nutricionistas veem refeições dos seus pacientes" ON meals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = meals.user_id AND professional_id = auth.uid()
    )
  );

-- Trigger para criar perfil automático ao cadastrar usuário
-- O role padrão é 'client'. O profissional muda no primeiro login ou via metadata.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
