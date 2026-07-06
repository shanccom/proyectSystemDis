import { createClient } from '@supabase/supabase-js';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer el archivo .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

// Parsear variables de entorno
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

// Lee variables de entorno del archivo .env.local o .env
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: No se encontraron las variables de entorno de Supabase');
  console.error('Asegúrate de tener VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu .env.local');
  process.exit(1);
}

// Crea cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

async function createAdmin() {
  console.log('\n🔐 === Crear Usuario Admin ===\n');

  const email = await question('📧 Email: ');
  const password = await question('🔒 Contraseña (mín. 6 caracteres): ');
  const fullName = await question('👤 Nombre completo: ');

  if (password.length < 6) {
    console.error('❌ La contraseña debe tener al menos 6 caracteres');
    rl.close();
    return;
  }

  try {
    console.log('\n⏳ Creando usuario...');

    // 1. Registrar usuario en Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          full_name: fullName,
          role: 'admin'
        }
      }
    });

    if (signUpError) {
      console.error('❌ Error al registrar:', signUpError.message);
      rl.close();
      return;
    }

    console.log('✅ Usuario registrado en Auth');

    // 2. Esperar a que se cree el perfil
    await new Promise(r => setTimeout(r, 1500));

    // 3. Actualizar el rol a admin directamente
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', data.user?.id);

    if (updateError) {
      console.error('❌ Error al actualizar rol:', updateError.message);
      rl.close();
      return;
    }

    console.log('\n✅ ¡Usuario admin creado exitosamente!\n');
    console.log('📝 Credenciales:');
    console.log(`   Email: ${email}`);
    console.log(`   Contraseña: ${password}`);
    console.log(`   Rol: admin\n`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  }

  rl.close();
}

createAdmin();
