/*
 * Copyright (c) 2026 Aritra Banerjee. All Rights Reserved.
 * GitHub: https://github.com/programmer1128
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 */

package com.automationSystem.system.controller;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.automationSystem.system.service.AStarEvacuationService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*") // Crucial for your phone/web to connect
public class DashboardController {

    @Autowired
    private AStarEvacuationService astarService;

    // Shared state variables (updated by your HardwareLinkService)
    public static double currentPower = 0.0;
    public static int[][] currentFloorMatrix = {
        {3, 3, 3, 0, 2}, // Initial Floor (3=Path, 0=Wall, 2=Exit)
        {3, 0, 3, 3, 3},
        {3, 3, 3, 0, 3}
    };
    
    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("power", currentPower);
        stats.put("devices", 8); // Example static count
        return stats;
    }

    @GetMapping("/evacuation")
    public Map<String, Object> getEvacuationData() {
        // Assume user is at (0,0) and target is the Exit (2)
        int[] start = {0, 0};
        int[] goal = {0, 4};

        List<int[]> path = astarService.findPath(currentFloorMatrix, start, goal);

        Map<String, Object> data = new HashMap<>();
        data.put("matrix", currentFloorMatrix);
        data.put("path", path);
        return data;
    }
}