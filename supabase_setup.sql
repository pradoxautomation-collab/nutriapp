-- Tabela de Configurações/Perfil do Usuário (Metas e Biometria)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  age INTEGER,
  weight_kg NUMERIC,
  height_cm NUMERIC,
  objective TEXT DEFAULT 'maintaining', -- 'losing', 'gaining', 'maintaining'
  lgpd_consent_at TIMESTAMP WITH TIME ZONE,
  calorie_goal NUMERIC DEFAULT 2000,
  protein_goal NUMERIC DEFAULT 150,
  carbs_goal NUMERIC DEFAULT 200,
  fat_goal NUMERIC DEFAULT 66,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Tabela de Histórico de Refeições
CREATE TABLE meals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  calories NUMERIC NOT NULL,
  protein NUMERIC NOT NULL,
  carbs NUMERIC NOT NULL,
  fat NUMERIC NOT NULL,
  insights TEXT, -- Novo campo para conselhos da IA
  meal_type TEXT -- 'breakfast', 'lunch', 'dinner', 'snack'
);

-- Habilitar RLS
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Usuários podem ver suas próprias refeições" ON meals;
CREATE POLICY "Privacidade: Usuários acessam apenas seus dados" ON meals
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON profiles;
CREATE POLICY "Privacidade: Perfil pessoal" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Trigger para criar perfil automático ao cadastrar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
