# Smart Helmet for Rider Safety 🚴‍♂️

## Overview

A cost-effective smart helmet system that detects accidents and sends alerts with real-time GPS location.

## Features

* Accident detection using MPU6050 sensor (X, Y, Z axis changes)
* Bluetooth communication between helmet and mobile app
* Real-time GPS location sharing
* Emergency alert system for connected users
* Cost-efficient design (~₹1100)

## Tech Stack

* Arduino Uno
* MPU6050 Sensor
* GPS Module
* Bluetooth Module
* React Native (Mobile App)

## How it Works

1. MPU6050 detects sudden motion (accident)
2. Arduino processes sensor data
3. Signal sent via Bluetooth to mobile app
4. App sends alert with GPS location to connected users

## Project Structure

* /arduino → Hardware code
* /mobile-app → React Native app
* /images → Hardware setup images

## Status

In Progress (Final Year Project)
