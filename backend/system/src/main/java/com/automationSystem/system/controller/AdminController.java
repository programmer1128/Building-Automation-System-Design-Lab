package com.automationSystem.system.controller;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.automationSystem.system.DataTransferObjects.DeviceRegisterRequest;
import com.automationSystem.system.DataTransferObjects.GetDevicesRequest;
import com.automationSystem.system.DataTransferObjects.LoginRequest;
import com.automationSystem.system.DataTransferObjects.MicrocontrollerRegisterRequest;
import com.automationSystem.system.DataTransferObjects.RegisterRemoteDeviceRequest;
import com.automationSystem.system.DataTransferObjects.RegisterRemoteRequest;
import com.automationSystem.system.DataTransferObjects.RegisterUserRequest;
import com.automationSystem.system.service.AdminService;
import com.automationSystem.system.service.HardwareLinkService;
import com.automationSystem.system.service.ParserService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.POST, RequestMethod.GET, RequestMethod.OPTIONS})
public class AdminController 
{
     //autowired to enable spring create instances
     @Autowired
     AdminService adminService;

     @Autowired
     ParserService parserService;


     @Autowired
     HardwareLinkService hardwareLinkService;

     //method to register a new user
     
     @PostMapping("/register/user")
     public ResponseEntity<?> registerUser(@RequestBody RegisterUserRequest request)
     {
         try
         {
             return adminService.registerUser(request);
         }
         catch(Exception e)
         {
             return ResponseEntity.badRequest().body(e.getMessage());
         }
     }

    
     @PostMapping("/signin/user")
     public ResponseEntity<?> loginUser(@RequestBody LoginRequest request)
     {
         try
         {
             System.out.println(request.getUsername());
             return adminService.loginUser(request);
         }
         catch(Exception e)
         {
             return ResponseEntity.badRequest().body(e.getMessage());
         }
     }

     @PostMapping("/register/microcontroller")   
     public ResponseEntity<?> registerMicrocontroller(@RequestBody MicrocontrollerRegisterRequest request)
     {
         try 
         {
             return ResponseEntity.ok(adminService.registerMicrocontroller(request));   
         } 
         catch (Exception e) 
         {
             return ResponseEntity.badRequest().body(e.getMessage());
         }
     }


     @PostMapping("/register/device")
     public ResponseEntity<?> registerDevice(@RequestBody DeviceRegisterRequest request)
     {
         try
         {
             return ResponseEntity.ok(adminService.registerDevice(request));       
         }
         catch(Exception e)
         {
             return ResponseEntity.badRequest().body(e.getMessage());
         }
     }

     @PostMapping("/register/remote")
     public ResponseEntity<?> registerRemoteDevice(@RequestBody RegisterRemoteRequest request)
     {
         try
         {
             return adminService.registerRemote(request);
         }
         catch(Exception e)
         { 
             return ResponseEntity.badRequest().body(e.getMessage());
         }
     }


     @PostMapping("/register/remoteDevice")
     public ResponseEntity<?> registerRemoteDevices(@RequestBody RegisterRemoteDeviceRequest request)
     {
          try
          {
             return adminService.registerRemoteDevice(request);
          }
          catch(Exception e)
          {
             return ResponseEntity.badRequest().body(e.getMessage());
          }
     }

     @PostMapping("/fillcommandstasmota")
     public ResponseEntity<?> fillCommands()
     {
         try
         {
             File tasmotaFile = new File("src/main/java/com/automationSystem/system/dataFiles/Codes for IR Remotes - Tasmota.html");
             parserService.ParseTasmotaHtml(tasmotaFile);
             return ResponseEntity.ok("");
         }
         catch(Exception e)
         {
             return ResponseEntity.badRequest().body(HttpStatus.INTERNAL_SERVER_ERROR);
         }
     }

     @GetMapping("/all-sensors")
     public Map<String, Object> getAllSensors() 
     {
         Map<String, Object> data = new HashMap<>();
    
         // Values taken from your HardwareLinkService (Static variables)
         data.put("mq2", hardwareLinkService.latestMq2); 
         data.put("mq5", hardwareLinkService.latestMq5);
         data.put("irms", hardwareLinkService.latestIrms);
         data.put("power", hardwareLinkService.latestPower);
         data.put("status", hardwareLinkService.latestMq2 > 800 ? "HAZARD" : "OK");

         return data;
     }

     @PostMapping("/devices")
     public List<String> getDveices(@RequestBody GetDevicesRequest request)
     {
         try
         {
             return adminService.getDevices(request.getUsername());
         }
         catch(Exception e)
         {
             System.out.println(e.getMessage());
             return null;
         }
     }

}
