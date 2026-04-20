package com.automationSystem.system.service;

import java.util.Scanner;

import org.springframework.stereotype.Service;

import com.fazecast.jSerialComm.SerialPort;

import jakarta.annotation.PostConstruct;

@Service
public class HardwareLinkService   
{
     private final String GAS_PORT_NAME = "/dev/ttyUSB0";   
     private final String POWER_PORT_NAME = "/dev/ttyACM0"; 

     // STATIC VARIABLES FOR GLOBAL ACCESS
     // Use volatile to ensure thread-safety and instant visibility across the app
     public static volatile int latestMq2 = 0;
     public static volatile int latestMq5 = 0;
     public static volatile double latestIrms = 0.0;
     public static volatile double latestPower = 0.0;

     @PostConstruct
     public void initConnections() 
     {
         new Thread(this::listenToGasSensors).start();
         new Thread(this::listenToPowerSensor).start();
     }

    private void listenToGasSensors() {
        SerialPort gasPort = SerialPort.getCommPort(GAS_PORT_NAME);
        gasPort.setBaudRate(115200);
        if (gasPort.openPort()) {
            System.out.println("LINKED: Gas Sensors on " + GAS_PORT_NAME);
            Scanner scanner = new Scanner(gasPort.getInputStream());
            while (scanner.hasNextLine()) {
                String line = scanner.nextLine();
                if (line.startsWith("DATA:")) {
                    processGasData(line.substring(5));
                }
            }
        }
    }

    private void listenToPowerSensor() {
    SerialPort powerPort = SerialPort.getCommPort(POWER_PORT_NAME);
    
    // 1. Match your Arduino Serial.begin(9600)
    powerPort.setBaudRate(9600); 
    
    // 2. IMPORTANT: Set timeouts. Without this, scanner.hasNextLine() can hang forever
    powerPort.setComPortTimeouts(SerialPort.TIMEOUT_READ_SEMI_BLOCKING, 1000, 0);

    if (powerPort.openPort()) {
        System.out.println("SUCCESS: Power Sensor Link Active on " + POWER_PORT_NAME);
                
        // Use a try-with-resources to ensure the scanner closes if the thread crashes
        try (Scanner scanner = new Scanner(powerPort.getInputStream())) {
            while (!Thread.currentThread().isInterrupted()) {
                if (scanner.hasNextLine()) {
                    String line = scanner.nextLine();
                    // DEBUG: Print everything to see if data is actually arriving
                    System.out.println("[RAW POWER]: " + line); 
                    if (line.contains("Irms:")) {
                        processPowerData(line);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Power Stream Error: " + e.getMessage());
        } finally {
            powerPort.closePort();
        }
    } else {
        System.err.println("CRITICAL: Could not open " + POWER_PORT_NAME + ". Is it plugged in?");
    }
}

    private void processGasData(String raw) {
        try {
            String[] parts = raw.split(",");
            latestMq2 = Integer.parseInt(parts[0]);
            latestMq5 = Integer.parseInt(parts[1]);

            if (latestMq2 > 800 || latestMq5 > 800) {
                System.out.println("FIRE ALERT: Recalculating...");
                // You can trigger your A* update here
            }
        } catch (Exception e) { System.err.println("Gas Parse Error"); }
    }

    private void processPowerData(String raw) {
        try {
            // "Published to ESP-01: Irms:0.123|Power:25.50"
            String[] parts = raw.split("\\|");
            latestIrms = Double.parseDouble(parts[0].split(":")[2].trim());
            latestPower = Double.parseDouble(parts[1].split(":")[1].trim());
            
            System.out.println("⚡ POWER SYNC: " + latestPower + " Watts");
        } catch (Exception e) { System.err.println("Power Parse Error"); }
    }
}