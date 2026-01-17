'use client';

import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface Concept {
  id?: string;
  label: string;
  type: 'main' | 'concept' | 'detail';
  parent?: string;
  explanation?: string;
}

interface MindMapVisualizationProps {
  concepts: Concept[];
}

export default function MindMapVisualization({ concepts }: MindMapVisualizationProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  useEffect(() => {
    if (!concepts || concepts.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    // Convert concepts to nodes and edges
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const nodeMap = new Map<string, { x: number; y: number; level: number }>();

    // Calculate positions based on hierarchy
    let mainCount = 0;
    let conceptCount = 0;
    let detailCount = 0;

    concepts.forEach((concept, index) => {
      const nodeId = concept.id || `node-${index}`;
      let position = { x: 0, y: 0 };
      let level = 0;
      let nodeType = 'default';
      let style: any = {};

      if (concept.type === 'main') {
        // Main topics in center
        position = { x: 400, y: 50 + mainCount * 150 };
        level = 0;
        mainCount++;
        style = {
          background: '#3b82f6',
          color: 'white',
          border: '2px solid #1d4ed8',
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '16px',
          fontWeight: 'bold',
        };
      } else if (concept.type === 'concept') {
        // Concepts radiate from main
        const angle = (conceptCount * Math.PI * 2) / Math.max(concepts.filter(c => c.type === 'concept').length, 1);
        position = {
          x: 400 + Math.cos(angle) * 200,
          y: 200 + Math.sin(angle) * 150,
        };
        level = 1;
        conceptCount++;
        style = {
          background: '#f0f9ff',
          border: '2px solid #3b82f6',
          borderRadius: '6px',
          padding: '8px 15px',
          fontSize: '14px',
        };
      } else {
        // Details branch from concepts
        const parentId = concept.parent;
        const parentPos = nodeMap.get(parentId || '');
        if (parentPos) {
          position = {
            x: parentPos.x + (detailCount % 2 === 0 ? 150 : -150),
            y: parentPos.y + 100 + Math.floor(detailCount / 2) * 80,
          };
        } else {
          position = { x: 200 + detailCount * 150, y: 400 };
        }
        level = 2;
        detailCount++;
        style = {
          background: '#f9fafb',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          padding: '6px 12px',
          fontSize: '12px',
        };
      }

      nodeMap.set(nodeId, { x: position.x, y: position.y, level });

      newNodes.push({
        id: nodeId,
        type: nodeType,
        position,
        data: {
          label: (
            <div>
              <div className="font-semibold">{concept.label}</div>
              {concept.explanation && (
                <div className="text-xs mt-1 opacity-75">{concept.explanation}</div>
              )}
            </div>
          ),
        },
        style,
      });

      // Create edges to parent
      if (concept.parent) {
        newEdges.push({
          id: `edge-${concept.parent}-${nodeId}`,
          source: concept.parent,
          target: nodeId,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2 },
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [concepts, setNodes, setEdges]);

  if (!concepts || concepts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <p className="text-gray-600 text-lg font-medium">Mind Map</p>
          <p className="text-gray-500 text-sm mt-2">
            Concepts will appear here as the lecture progresses
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-right"
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.style?.background) return node.style.background as string;
            return '#e5e7eb';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
}
