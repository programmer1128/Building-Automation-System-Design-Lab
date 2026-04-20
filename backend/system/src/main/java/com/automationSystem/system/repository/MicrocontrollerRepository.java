package com.automationSystem.system.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.automationSystem.system.entity.Microcontroller;
import com.automationSystem.system.entity.User;


public interface MicrocontrollerRepository extends JpaRepository<Microcontroller, Object> 
{
     Optional<Microcontroller> findByMacAddress(String macAddress); 

     List<Microcontroller> findByOwner(User owner);
}
