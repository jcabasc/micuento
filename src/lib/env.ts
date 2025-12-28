export const env = {
  // Supabase
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,

  // Segmind
  segmindApiKey: process.env.SEGMIND_API_KEY!,

  // Wompi
  wompiPublicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY!,
  wompiPrivateKey: process.env.WOMPI_PRIVATE_KEY!,
  wompiEventsSecret: process.env.WOMPI_EVENTS_SECRET!,
  wompiEnv: process.env.NEXT_PUBLIC_WOMPI_ENV as "sandbox" | "production",

  // Resend
  resendApiKey: process.env.RESEND_API_KEY!,

  // App
  appUrl: process.env.NEXT_PUBLIC_APP_URL!,
} as const;
