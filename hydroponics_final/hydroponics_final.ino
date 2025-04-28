#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// WiFi Credentials
const char* ssid = "";
const char* password = "";

// Supabase Edge Function URL 
const char* serverUrl = "https://lstmfefngokizyxqpbdo.supabase.co/functions/v1/add-sensor-reading";

// Create Web Server on port 80
WebServer server(80);

// Pin Definitions
#define DHTPIN 4          // DHT11 data pin
#define DHTTYPE DHT11     // DHT 11
#define TDS_SENSOR_PIN 34 // Analog pin for TDS sensor
#define PH_SENSOR_PIN 32  // Analog pin for pH sensor
#define ONE_WIRE_BUS 22   // DS18B20 data pin (water temperature)

// Transistor Control Pins (BC547)
#define TRANSISTOR_WATER 17 // BC547 transistor for humidity control
#define TRANSISTOR_AIR 19   // BC547 transistor for air temperature control

// Sensor objects
DHT dht(DHTPIN, DHTTYPE);
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature waterTempSensor(&oneWire);

// Sensor calibration values
#define TDS_VREF 5.0      // Analog reference voltage
#define TDS_TEMPERATURE 25 // Reference temperature for TDS readings
float phCalibration = 0.0; // pH calibration offset

// Sensor Data Variables
float tdsValue = 0.0;
float pHValue = 0.0;
float humidity = 0.0;
float waterTemp = 0.0;
float airTemp = 0.0;

// Crop Configuration Structure
struct CropConfig {
  float min_tds = 0.0, max_tds = 0.0;
  float min_ph = 0.0, max_ph = 0.0;
  float min_humidity = 0.0, max_humidity = 0.0;
  float min_water_temp = 0.0, max_water_temp = 0.0;
  float min_air_temp = 0.0, max_air_temp = 0.0;
} cropConfig;

// Timing for non-blocking loop
unsigned long lastCheck = 0;
const unsigned long checkInterval = 10000; // 10 seconds
unsigned long lastSensorRead = 0;
const unsigned long sensorReadInterval = 2000; // 2 seconds
unsigned long lastDataUpload = 0;
const unsigned long dataUploadInterval = 10000; // 1 minute

// Utility: Check if cropConfig is actually configured
bool isCropConfigured() {
  return cropConfig.max_tds > 0.0 || cropConfig.max_ph > 0.0 ||
         cropConfig.max_humidity > 0.0 || cropConfig.max_water_temp > 0.0 ||
         cropConfig.max_air_temp > 0.0;
}

// Read TDS Sensor Value
float readTDSSensor() {
  // Read analog value and convert to voltage
  int analogValue = analogRead(TDS_SENSOR_PIN);
  float voltage = analogValue * (TDS_VREF / 4095.0); // ESP32 ADC is 12-bit (0-4095)
  
  // Temperature compensation
  float compensationCoefficient = 1.0 + 0.02 * (waterTemp - TDS_TEMPERATURE);
  float compensationVoltage = voltage / compensationCoefficient;
  
  // Convert voltage to TDS value
  float tdsValue = (133.42 * compensationVoltage * compensationVoltage * compensationVoltage 
                   - 255.86 * compensationVoltage * compensationVoltage 
                   + 857.39 * compensationVoltage) * 0.5;
  
  return tdsValue;
}

// Read pH Sensor Value
float readPHSensor() {
  // Get multiple samples for more accurate reading
  int samples = 10;
  float avgValue = 0;
  
  for(int i=0; i<samples; i++) {
    avgValue += analogRead(PH_SENSOR_PIN);
    delay(10);
  }
  
  avgValue = avgValue / samples;
  
  // Convert analog reading to voltage
  float voltage = avgValue * (3.3 / 4095.0); // ESP32 ADC is 12-bit (0-4095)
  float phValue = 3.5 * voltage + phCalibration;
  
  return phValue;
}

// Read all sensors
void readSensors() {
  // Read DHT11 (air temperature and humidity)
  humidity = dht.readHumidity();
  airTemp = dht.readTemperature();
  
  // Check if DHT reading failed
  if (isnan(humidity) || isnan(airTemp)) {
    Serial.println("❌ Failed to read from DHT sensor!");
    humidity = 0.0;
    airTemp = 0.0;
  }
  
  // Read DS18B20 water temperature
  waterTempSensor.requestTemperatures();
  waterTemp = waterTempSensor.getTempCByIndex(0);
  
  // Check if water temperature reading failed
  if (waterTemp == DEVICE_DISCONNECTED_C) {
    Serial.println("❌ Failed to read from DS18B20 sensor!");
    waterTemp = 0.0;
  }
  
  // Read TDS value
  tdsValue = readTDSSensor();
  
  // Read pH value
  pHValue = readPHSensor();
  
  // Log values
  Serial.println("📊 Sensor Readings:");
  Serial.print("TDS: "); Serial.print(tdsValue); Serial.println(" ppm");
  Serial.print("pH: "); Serial.println(pHValue);
  Serial.print("Humidity: "); Serial.print(humidity); Serial.println(" %");
  Serial.print("Water Temp: "); Serial.print(waterTemp); Serial.println(" °C");
  Serial.print("Air Temp: "); Serial.print(airTemp); Serial.println(" °C");
}

// Send sensor data to database via API
void sendSensorData() {
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("📤 Sending data to database...");
    HTTPClient http;
    
    // Create a JSON document
    StaticJsonDocument<200> doc;
    doc["air_temp"] = airTemp;
    doc["water_temp"] = waterTemp;
    doc["humidity"] = humidity;
    doc["ph"] = pHValue;
    doc["tds"] = tdsValue;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    // Begin HTTP POST request
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    // Send HTTP POST request
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("✅ HTTP Response code: " + String(httpResponseCode));
      Serial.println(response);
    } else {
      Serial.print("❌ Error code: ");
      Serial.println(httpResponseCode);
    }
    
    // Free resources
    http.end();
  } else {
    Serial.println("❌ WiFi disconnected. Cannot send data.");
  }
}

// Handle Root
void handleRoot() {
  server.send(200, "text/plain", "ESP32 Hydroponics System");
}

// Handle Update Crop Configuration
void handleUpdate() {
  if (server.hasArg("plain")) {
    String jsonData = server.arg("plain");
    Serial.println("✅ Data Received!");
    Serial.println(jsonData);

    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, jsonData);

    if (error) {
      Serial.println("❌ JSON Parsing failed!");
      server.send(400, "application/json", "{\"error\":\"Invalid JSON!\"}");
      return;
    }

    // ✅ Store values properly
    cropConfig.min_tds = doc["min_tds"] | 0.0;
    cropConfig.max_tds = doc["max_tds"] | 0.0;
    cropConfig.min_ph = doc["min_ph"] | 0.0;
    cropConfig.max_ph = doc["max_ph"] | 0.0;
    cropConfig.min_humidity = doc["min_humidity"] | 0.0;
    cropConfig.max_humidity = doc["max_humidity"] | 0.0;
    cropConfig.min_water_temp = doc["min_water_temp"] | 0.0;
    cropConfig.max_water_temp = doc["max_water_temp"] | 0.0;
    cropConfig.min_air_temp = doc["min_atmosphere_temp"] | 0.0;
    cropConfig.max_air_temp = doc["max_atmosphere_temp"] | 0.0;

    Serial.println("✅ Crop configuration updated!");
    Serial.print("min_tds: "); Serial.println(cropConfig.min_tds);
    Serial.print("max_tds: "); Serial.println(cropConfig.max_tds);

    server.send(200, "application/json", "{\"message\":\"Configuration updated successfully!\"}");
  } else {
    server.send(400, "application/json", "{\"error\":\"Invalid data!\"}");
  }
}

// Handle Sensor Data Response
void handleSensorData() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  
  // Create a proper JSON document
  StaticJsonDocument<256> doc;
  doc["status"] = "connected";
  doc["isConfigured"] = isCropConfigured();
  doc["TDS"] = tdsValue;
  doc["pH"] = pHValue;
  doc["Humidity"] = humidity;
  doc["WaterTemp"] = waterTemp;
  doc["AirTemp"] = airTemp;
  
  String jsonResponse;
  serializeJson(doc, jsonResponse);
  server.send(200, "application/json", jsonResponse);
}

// Optional Status Check Endpoint
void handleStatus() {
  String status = isCropConfigured() ? "✅ Crop data configured" : "⚠️ No crop data";
  server.send(200, "application/json", "{\"status\":\"" + status + "\"}");
}

// CORS handling
void handleOptions() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send(204);
}

// Control function for transistors
void controlTransistor(int pin, bool turnOn) {
  // For BC547 transistor, we send HIGH to turn ON and LOW to turn OFF
  // This is because the transistor conducts when base is HIGH
  digitalWrite(pin, turnOn ? HIGH : LOW);
  
  // Log the action
  Serial.print("Transistor on pin ");
  Serial.print(pin);
  Serial.println(turnOn ? " turned ON" : " turned OFF");
}

// Core Logic to Check Ranges
void checkAndControl() {
  if (!isCropConfigured()) {
    Serial.println("⚠️ No crop data configured!");
    return;
  }

  Serial.println("✅ Running automated control checks");

  if (tdsValue > cropConfig.max_tds) {
    Serial.println("⚠️ TDS out of range!");
  } else {
    Serial.println("✅ TDS is in range");
  }
  
  if (pHValue > cropConfig.max_ph) {
    Serial.println("⚠️ pH out of range!");
    // Add pH control transistor here if needed
  } else {
    Serial.println("✅ pH is in range");
  }

  if (humidity > cropConfig.max_humidity) {
    Serial.println("⚠️ Humidity out of range!");
  } else {
    Serial.println("✅ Humidity is in range!");
  }
  
  if (waterTemp > cropConfig.max_water_temp) {
    Serial.println("⚠️ Water Temperature out of range!");
    controlTransistor(TRANSISTOR_WATER, true);
  } else {
    Serial.println("✅ Water Temperature is in range!");
    controlTransistor(TRANSISTOR_WATER, false);
  }
  
  if (airTemp > cropConfig.max_air_temp) {
    Serial.println("⚠️ Air Temperature out of range!");
    controlTransistor(TRANSISTOR_AIR, true); // Turn ON fan
  } else {
    Serial.println("✅ Air Temperature is in range!");
    controlTransistor(TRANSISTOR_AIR, false); // Turn OFF fan
  }
}

// WiFi Setup
void connectToWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("⏳ Connecting to WiFi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Connected to WiFi!");
    Serial.print("📡 IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ Failed to connect. Restarting...");
    ESP.restart();
  }
}

// Setup Function
void setup() {
  Serial.begin(115200);
  
  // Initialize sensors
  dht.begin();
  waterTempSensor.begin();
  
  // Initialize transistor control pins
  pinMode(TRANSISTOR_WATER, OUTPUT);
  pinMode(TRANSISTOR_AIR, OUTPUT);
  
  // Set initial state to OFF
  digitalWrite(TRANSISTOR_WATER, LOW);
  digitalWrite(TRANSISTOR_AIR, LOW);
  
  // Connect to WiFi
  connectToWiFi();

  // Define Routes
  server.on("/", HTTP_GET, handleRoot);
  server.on("/update", HTTP_POST, handleUpdate);
  server.on("/sensor-data", HTTP_GET, handleSensorData);
  server.on("/status", HTTP_GET, handleStatus);
  server.onNotFound([]() {
    if (server.method() == HTTP_OPTIONS) {
      handleOptions();
    } else {
      server.send(404, "text/plain", "Not found");
    }
  });

  server.begin();
  Serial.println("🌍 Server started!");
  
  // Initial sensor reading
  readSensors();
}

// Main Loop
void loop() {
  server.handleClient();

  unsigned long currentMillis = millis();
  
  // Read sensors at regular intervals
  if (currentMillis - lastSensorRead >= sensorReadInterval) {
    lastSensorRead = currentMillis;
    readSensors();
  }
  
  // Check and control at regular intervals
  if (currentMillis - lastCheck >= checkInterval) {
    lastCheck = currentMillis;
    checkAndControl();
  }
  
  // Send data to database at regular intervals
  if (currentMillis - lastDataUpload >= dataUploadInterval) {
    lastDataUpload = currentMillis;
    sendSensorData();
  }
  
  // Check if WiFi is connected and reconnect if needed
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Attempting to reconnect...");
    connectToWiFi();
  }
}