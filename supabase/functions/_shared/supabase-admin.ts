import { createClient } from 'npm:@supabase/supabase-js@2'

export function adminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  )
}

export function userClient(authHeader: string) {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  )
}

export async function getAuthUser(req: Request) {
  const header = req.headers.get('Authorization')
  if (!header) return null
  const client = userClient(header)
  const { data: { user } } = await client.auth.getUser()
  return user
}
