
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://fxgqkwinhpvwnhfxhfoo.supabase.co'
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Parse URL to get device ID
  const url = new URL(req.url)
  const deviceId = url.searchParams.get('device_id')
  
  if (!deviceId) {
    return new Response(
      JSON.stringify({ error: 'Missing device_id parameter' }),
      { headers: corsHeaders, status: 400 }
    )
  }

  if (req.method === 'GET') {
    try {
      // Get latest relay states for device
      const { data, error } = await supabase
        .from('latest_relay_states')
        .select('*')
        .eq('device_id', deviceId)
        .maybeSingle()

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Error fetching relay states', details: error }),
          { headers: corsHeaders, status: 500 }
        )
      }

      if (!data) {
        return new Response(
          JSON.stringify({ error: 'No relay states found for device' }),
          { headers: corsHeaders, status: 404 }
        )
      }

      return new Response(
        JSON.stringify({
          tds_relay: data.tds_relay,
          humidity_relay: data.humidity_relay,
          air_circulation_relay: data.air_circulation_relay,
          timestamp: data.timestamp
        }),
        { headers: corsHeaders, status: 200 }
      )
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Internal server error', details: error.message }),
        { headers: corsHeaders, status: 500 }
      )
    }
  } else if (req.method === 'POST') {
    try {
      // Update relay states
      const body = await req.json()
      
      // Check if all required fields are present
      const relayFields = ['tds_relay', 'humidity_relay', 'air_circulation_relay']
      const missingFields = relayFields.filter(field => !(field in body))
      
      if (missingFields.length > 0) {
        return new Response(
          JSON.stringify({ error: `Missing required fields: ${missingFields.join(', ')}` }),
          { headers: corsHeaders, status: 400 }
        )
      }
      
      // Insert new relay state
      const { data, error } = await supabase
        .from('relay_states')
        .insert({
          device_id: deviceId,
          tds_relay: body.tds_relay,
          humidity_relay: body.humidity_relay,
          air_circulation_relay: body.air_circulation_relay,
          timestamp: body.timestamp || new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Error updating relay states', details: error }),
          { headers: corsHeaders, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: corsHeaders, status: 201 }
      )
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Internal server error', details: error.message }),
        { headers: corsHeaders, status: 500 }
      )
    }
  } else {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: corsHeaders, status: 405 }
    )
  }
})
