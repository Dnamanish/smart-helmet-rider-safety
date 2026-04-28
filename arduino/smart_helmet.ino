#include <Wire.h>
#include <MPU6050.h>
#include <TinyGPS++.h>
#include <SoftwareSerial.h>
#include <math.h>

MPU6050 mpu;

// 📍 GPS (RX, TX)
SoftwareSerial gpsSerial(4, 3);
TinyGPSPlus gps;

// 📡 Bluetooth HC-05 (RX, TX)
SoftwareSerial btSerial(9, 8);

// 🚨 Thresholds
const long MAG_THRESHOLD = 40000;
const int AXIS_THRESHOLD = 20000;
const int CONFIRM_DELAY = 1500;
const int LOCKOUT_DELAY = 5000;

// 📊 Magnitude calculation
long calcMagnitude(int16_t x, int16_t y, int16_t z) {
  return sqrt((long)x * x + (long)y * y + (long)z * z);
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  mpu.initialize();

  gpsSerial.begin(9600);
  btSerial.begin(9600);

  Serial.println("System Started");
}

void loop() {

  // 📡 Read GPS continuously
  while (gpsSerial.available()) {
    gps.encode(gpsSerial.read());
  }

  // 📊 Read MPU6050
  int16_t ax, ay, az;
  mpu.getAcceleration(&ax, &ay, &az);

  long mag1 = calcMagnitude(ax, ay, az);

  // Debug (Serial Monitor)
  Serial.print("MAG:");
  Serial.println(mag1);

  // 📡 Send to Bluetooth
  btSerial.println("MAG:" + String(mag1));

  delay(200);

  // 🚨 Accident detection
  if (mag1 > MAG_THRESHOLD) {

    delay(CONFIRM_DELAY);

    int16_t ax2, ay2, az2;
    mpu.getAcceleration(&ax2, &ay2, &az2);

    long mag2 = calcMagnitude(ax2, ay2, az2);

    if (mag2 > MAG_THRESHOLD ||
        abs(ax2) > AXIS_THRESHOLD ||
        abs(ay2) > AXIS_THRESHOLD ||
        abs(az2) > AXIS_THRESHOLD) {

      // 🚨 Send clean message
      btSerial.println("ACCIDENT");

      // 📍 Send GPS in correct format
      if (gps.location.isValid()) {
        btSerial.println("LAT:" + String(gps.location.lat(), 6));
        btSerial.println("LON:" + String(gps.location.lng(), 6));
      } else {
        btSerial.println("LAT:0");
        btSerial.println("LON:0");
      }

      // Debug output
      Serial.println("ACCIDENT DETECTED");

      delay(LOCKOUT_DELAY);
    }
  }

  delay(200);
}

