# Instrucciones: Configuración de Base de Datos Supabase

## Paso 1: Acceder al SQL Editor

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. En el menú lateral, selecciona **SQL Editor**
3. Haz clic en **"New Query"**

## Paso 2: Ejecutar el Schema SQL

1. Abre el archivo `supabase-schema.sql` en este proyecto
2. Copia TODO el contenido del archivo
3. Pégalo en el editor SQL de Supabase
4. Haz clic en **"Run"** (botón verde inferior derecho)

Esto creará:
- ✅ Tabla `profiles` para perfiles de usuario
- ✅ Tabla `leads` para los leads del CRM
- ✅ Políticas de Row Level Security (RLS)
- ✅ Índices para optimización
- ✅ Triggers para actualización automática de timestamps
- ✅ Función para crear perfil automáticamente al registrarse

## Paso 3: Verificar la Configuración

### Verificar Tablas
En el menú lateral, ve a **Table Editor** y verifica que aparezcan:
- `profiles`
- `leads`

### Verificar Authentication
1. Ve a **Authentication** → **Policies**
2. Verás las políticas RLS configuradas para ambas tablas

## Paso 4: Variables de Entorno

Ya configuradas en `.env.local`:
```
VITE_SUPABASE_URL=https://nieyivfiqqgianiboblk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI...
```

## Paso 5: Crear Primer Usuario

1. Inicia la aplicación: `npm run dev`
2. Ve a http://localhost:3001
3. Haz clic en "¿No tienes cuenta? **Regístrate**"
4. Completa el formulario:
   - Nombre: tu nombre
   - Email: tu email
   - Contraseña: mínimo 6 caracteres
5. Haz clic en "Crear Cuenta"

> **Nota**: Supabase enviará un email de confirmación. Revisa tu bandeja de entrada y haz clic en el enlace de confirmación.

## Paso 6: Verificar en Supabase

### Ver Usuarios
1. Ve a **Authentication** → **Users**
2. Verás tu usuario recién creado

### Ver Perfil
1. Ve a **Table Editor** → **profiles**
2. Verás tu perfil con:
   - `id`: UUID del usuario
   - `full_name`: el nombre que ingresaste
   - `role`: 'sales_rep' (por defecto)

## Migración de Datos Locales (Opcional)

Si ya tienes leads en localStorage y quieres migrarlos:

1. Inicia sesión en la aplicación
2. Abre la consola del navegador (F12)
3. Ejecuta:
```javascript
// Ver datos locales
console.log(JSON.parse(localStorage.getItem('dermakor_crm_leads')))
```

> **Nota**: La migración automática se implementará en una próxima actualización.

## Solución de Problemas

### Error: "relation does not exist"
- Verifica que ejecutaste el SQL completo
- Ve a Table Editor y confirma que las tablas existen

### Error: "Invalid API key"
- Verifica las variables de entorno en `.env.local`
- Reinicia el servidor de desarrollo

### Email de confirmación no llega
- Revisa spam/correo no deseado
- En desarrollo, Supabase muestra un enlace en la consola
- Alternativamente, desactiva confirmación de email:
  1. Settings → Auth → Email Auth
  2. Desactiva "Enable email confirmations"

## Próximos Pasos

Una vez configurado:
1. ✅ Crea tu cuenta
2. ✅ Inicia sesión
3. ✅ Los leads se guardarán en Supabase
4. ✅ Invita a más miembros del equipo
5. ✅ Todos verán los mismos datos en tiempo real

## Crear Más Usuarios

Para agregar miembros del equipo:

**Opción 1: Auto-registro**
- Comparte el link de la app
- Cada usuario se registra con su email

**Opción 2: Desde Supabase Dashboard**
1. Ve a Authentication → Users
2. Click "Invite User"
3. Ingresa el email del nuevo usuario
4. Supabase enviará invitación

---

¿Problemas? Revisa la consola del navegador (F12) para mensajes de error detallados.
