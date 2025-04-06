
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

  // Check request method
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: corsHeaders, status: 405 }
    )
  }

  try {
    // Parse request body
    const body = await req.json()
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Validate required fields
    const requiredFields = ['device_id', 'air_temperature', 'air_humidity', 'water_temperature', 'tds', 'ph']
    for (const field of requiredFields) {
      if (!(field in body)) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { headers: corsHeaders, status: 400 }
        )
      }
    }

    // Check if device exists in the database
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('id')
      .eq('id', body.device_id)
      .maybeSingle()

    if (deviceError) {
      return new Response(
        JSON.stringify({ error: 'Error checking device', details: deviceError }),
        { headers: corsHeaders, status: 500 }
      )
    }

    // If device not found, return error
    if (!device) {
      return new Response(
        JSON.stringify({ error: 'Device not found' }),
        { headers: corsHeaders, status: 404 }
      )
    }

    // Update device last_seen timestamp and status
    const { error: updateDeviceError } = await supabase
      .from('devices')
      .update({ 
        last_seen: new Date().toISOString(),
        status: 'online'
      })
      .eq('id', body.device_id)

    if (updateDeviceError) {
      console.error('Error updating device status:', updateDeviceError)
    }

    // Insert sensor data
    const { data, error } = await supabase
      .from('sensor_readings')
      .insert({
        device_id: body.device_id,
        air_temperature: body.air_temperature,
        air_humidity: body.air_humidity,
        water_temperature: body.water_temperature,
        tds: body.tds,
        ph: body.ph,
        timestamp: body.timestamp || new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Error inserting sensor data', details: error }),
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
})
