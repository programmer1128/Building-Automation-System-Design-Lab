/*
 * Copyright (c) 2026 Aritra Banerjee. All Rights Reserved.
 * GitHub: https://github.com/programmer1128
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 */

package com.automationSystem.system.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
;

@Service
public class AStarEvacuationService 
{
     /*
      public List<int[]> findPath(int[][] matrix, int[] start, int[] goal) 
     {
         int rows = matrix.length;
         int cols = matrix[0].length;

         PriorityQueue<Node> openSet = new PriorityQueue<>(Comparator.comparingInt(n -> n.f));
         Map<String, Node> allNodes = new HashMap<>();

         Node startNode = new Node(start[0], start[1], 0, heuristic(start, goal), null);
         openSet.add(startNode);
         allNodes.put(start[0] + "," + start[1], startNode);

         Set<String> closedSet = new HashSet<>();
 
         while (!openSet.isEmpty()) 
         {
             Node current = openSet.poll();

             // If we reached an Exit (2)
             if (matrix[current.x][current.y] == 2) 
             {
                 return reconstructPath(current);
             }

             closedSet.add(current.x + "," + current.y);

             // Possible moves: Up, Down, Left, Right
             int[][] directions = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};
             for (int[] dir : directions) 
             {
                 int nx = current.x + dir[0];
                 int ny = current.y + dir[1];
                 String key = nx + "," + ny;

                 // Inside bounds
                 // Not a Wall (0)
                 // Not a Fire (1)
                 // Not already visited
                 if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && 
                    matrix[nx][ny] != 0 && matrix[nx][ny] != 1 && !closedSet.contains(key)) 
                 {
                    
                     int gScore = current.g + 1;
                     int hScore = heuristic(new int[]{nx, ny}, goal);
                     int fScore = gScore + hScore;

                     if (!allNodes.containsKey(key) || gScore < allNodes.get(key).g) 
                     {
                         Node neighbor = new Node(nx, ny, gScore, hScore, current);
                         allNodes.put(key, neighbor);
                         openSet.add(neighbor);
                     }
                 }
             }
         }
         return Collections.emptyList(); // No safe path found
    }

    private int heuristic(int[] a, int[] b) 
    {
         //manhattan distance for grid-based building layouts
         return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    }
      */
    

    private List<int[]> reconstructPath(Node node) 
    {
         List<int[]> path = new ArrayList<>();
         while (node != null) 
         {
             path.add(0, new int[]{node.x, node.y});
             node = node.parent;
         }
         return path;
    }

    private static class Node 
    {
         int x, y, g, h, f;
         Node parent;

         Node(int x, int y, int g, int h, Node parent) 
         {
             this.x = x;
             this.y = y;
             this.g = g;
             this.h = h;
             this.f = g + h;
             this.parent = parent;
         }
    }   
}
