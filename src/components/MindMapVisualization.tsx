'use client';

import { useCallback, useEffect } from 'react';
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
      const nodeType = 'default';
      let style: Record<string, string | number> = {};

      if (concept.type === 'main') {
        // Main topics in center
        position = { x: 400, y: 50 + mainCount * 150 };
        level = 0;
        mainCount++;
        style = {
          background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
          color: '#0c0f14',
          border: 'none',
          borderRadius: '12px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          boxShadow: '0 0 30px rgba(20, 184, 166, 0.3)',
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
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: '#0c0f14',
          border: 'none',
          borderRadius: '10px',
          padding: '10px 18px',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 4px 20px rgba(245, 158, 11, 0.25)',
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
          background: '#1a1f2b',
          color: '#f0f2f5',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '8px 14px',
          fontSize: '12px',
          fontWeight: '500',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
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
          style: { stroke: '#14b8a6', strokeWidth: 2 },
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [concepts, setNodes, setEdges]);

  if (!concepts || concepts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-background rounded-lg border border-surface-border">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="text-foreground font-display font-semibold text-lg">Mind Map</p>
          <p className="text-foreground-muted text-sm mt-2 max-w-xs mx-auto">
            Concepts will appear here as the lecture progresses
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-background rounded-lg border border-surface-border overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-right"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.05)" />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.style?.background) {
              const bg = node.style.background as string;
              if (bg.includes('14b8a6')) return '#14b8a6';
              if (bg.includes('f59e0b')) return '#f59e0b';
              return '#1a1f2b';
            }
            return '#1a1f2b';
          }}
          maskColor="rgba(12, 15, 20, 0.8)"
          style={{ background: '#12161e', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </ReactFlow>
    </div>
  );
}
