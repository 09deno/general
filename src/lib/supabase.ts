import { createClient } from '@supabase/supabase-js'

// Adresa projektu a verejný kľúč sú v appke zámerne – dáta chráni Row Level Security v databáze.
// Tajný kľúč (secret / service_role) sem nikdy nepatrí.
const supabaseUrl = 'https://xpnoghsrutstnfmalnfz.supabase.co'
const supabasePublishableKey = 'sb_publishable_auh0lOMrMIEdtSbJQzILGg_uMSiiTYr'

export const supabase = createClient(supabaseUrl, supabasePublishableKey)
