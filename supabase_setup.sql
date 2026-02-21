-- Tabela de Histórico de Refeições
CREATE TABLE meals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  food_name TEXT NOT NULL,
  calories NUMERIC NOT NULL,
  protein NUMERIC NOT NULL,
  carbs NUMERIC NOT NULL,
  fat NUMERIC NOT NULL,
  meal_type TEXT -- 'breakfast', 'lunch', 'dinner', 'snack'
);

-- Tabela de Configurações/Perfil do Usuário (Metas)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  calorie_goal NUMERIC DEFAULT 2000,
  protein_goal NUMERIC DEFAULT 150,
  carbs_goal NUMERIC DEFAULT 200,
  fat_goal NUMERIC DEFAULT 66
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Usuários podem ver suas próprias refeições" ON meals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias refeições" ON meals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
