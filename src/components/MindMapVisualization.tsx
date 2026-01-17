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
          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '16px',
          padding: '14px 24px',
          fontSize: '16px',
          fontWeight: '600',
          boxShadow: '0 10px 30px -5px rgba(14, 165, 233, 0.4)',
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
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          color: '#0c4a6e',
          border: '2px solid #0ea5e9',
          borderRadius: '12px',
          padding: '10px 18px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 15px -2px rgba(14, 165, 233, 0.2)',
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
          background: 'white',
          color: '#475569',
          border: '2px solid #e2e8f0',
          borderRadius: '10px',
          padding: '8px 14px',
          fontSize: '13px',
          fontWeight: '400',
          boxShadow: '0 2px 10px -2px rgba(0, 0, 0, 0.08)',
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
          animated: concept.type === 'concept',
          style: {
            stroke: concept.type === 'concept' ? '#0ea5e9' : '#94a3b8',
            strokeWidth: concept.type === 'concept' ? 2.5 : 2,
          },
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [concepts, setNodes, setEdges]);

  if (!concepts || concepts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 via-primary-50/20 to-accent-50/20 rounded-xl">
        <div className="text-center p-8 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="text-slate-700 text-lg font-semibold mb-2">Knowledge Map</p>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            Concepts will appear here as the lecture progresses and AI extracts key ideas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-right"
        minZoom={0.5}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1.5}
          color="#cbd5e1"
          className="bg-gradient-to-br from-slate-50 via-primary-50/20 to-accent-50/20"
        />
        <Controls
          showZoom={true}
          showFitView={true}
          showInteractive={false}
        />
        <MiniMap
          nodeColor={(node) => {
            if (node.style?.background && typeof node.style.background === 'string') {
              if (node.style.background.includes('gradient')) {
                return '#0ea5e9';
              }
              return node.style.background;
            }
            return '#e5e7eb';
          }}
          maskColor="rgba(15, 23, 42, 0.1)"
          className="shadow-lg rounded-xl"
        />
      </ReactFlow>
    </div>
  );
}
