import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://sdbynzfddyiuijazyxra.supabase.co'
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_-t4YHpCM4z0QOYov7qwJmA_1DdZDqqe'

export const supabase = url && key ? createClient(url, key) : null
