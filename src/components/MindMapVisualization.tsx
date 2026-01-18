'use client';

import { useCallback, useEffect, useMemo } from 'react';
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

  // Memoize the expensive layout calculation
  const layoutData = useMemo(() => {
    if (!concepts || concepts.length === 0) {
      return { nodes: [], edges: [] };
    }

    // Estimate node dimensions based on content
    const estimateNodeWidth = (concept: Concept): number => {
      const labelLength = concept.label.length;
      
      if (concept.type === 'main') {
        return Math.max(120, Math.min(200, labelLength * 8 + 40));
      } else if (concept.type === 'concept') {
        return Math.max(100, Math.min(180, labelLength * 7 + 30));
      } else {
        return Math.max(80, Math.min(160, labelLength * 6 + 25));
      }
    };

    const estimateNodeHeight = (concept: Concept): number => {
      if (concept.explanation) {
        return concept.type === 'main' ? 70 : concept.type === 'concept' ? 60 : 50;
      }
      return concept.type === 'main' ? 50 : concept.type === 'concept' ? 40 : 35;
    };

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const childrenByParent = new Map<string, string[]>();
    const widthCache = new Map<string, number>(); // Cache subtree widths

    // First pass: build parent-child relationships
    concepts.forEach((concept) => {
      const nodeId = concept.id || concept.label;
      const parentId = concept.parent;
      
      if (!childrenByParent.has(parentId || 'root')) {
        childrenByParent.set(parentId || 'root', []);
      }
      childrenByParent.get(parentId || 'root')!.push(nodeId);
    });

    // Get node style
    const getNodeStyle = (type: string): Record<string, string | number> => {
      switch (type) {
        case 'main':
          return {
            background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
            color: '#0c0f14',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 0 30px rgba(20, 184, 166, 0.3)',
          };
        case 'concept':
          return {
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#0c0f14',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.25)',
          };
        default:
          return {
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
    };

    // Calculate subtree widths with caching to avoid recalculation
    const calculateSubtreeWidth = (nodeId: string | null): number => {
      const key = nodeId || 'root';
      if (widthCache.has(key)) {
        return widthCache.get(key)!;
      }

      const children = childrenByParent.get(key) || [];
      let width: number;

      if (children.length === 0) {
        const concept = concepts.find(c => (c.id || c.label) === nodeId);
        width = concept ? estimateNodeWidth(concept) + 80 : 120;
      } else {
        let totalWidth = 0;
        children.forEach((childId) => {
          totalWidth += calculateSubtreeWidth(childId) + 60;
        });
        width = Math.max(totalWidth, 200);
      }

      widthCache.set(key, width);
      return width;
    };

    // Position nodes using hierarchical layout
    const positionNodes = (parentId: string | null, level: number, parentPos: { x: number; y: number } | null, leftBound: number) => {
      const children = childrenByParent.get(parentId || 'root') || [];
      if (children.length === 0) return leftBound;
      
      let currentX = leftBound;
      const verticalGap = 200;
      
      children.forEach((childId, childIndex) => {
        const concept = concepts.find(c => (c.id || c.label) === childId);
        if (!concept) return;

        const nodeWidth = estimateNodeWidth(concept);
        const subtreeWidth = calculateSubtreeWidth(childId);
        
        let position = { x: 0, y: 0 };

        if (level === 0) {
          position = {
            x: 150 + childIndex * 700,
            y: 40,
          };
          currentX = position.x + subtreeWidth / 2;
        } else if (parentPos) {
          const subtreeCenter = currentX + subtreeWidth / 2;
          position = {
            x: subtreeCenter,
            y: parentPos.y + verticalGap,
          };
          currentX += subtreeWidth + 80;
        }

        newNodes.push({
          id: childId,
          type: 'default',
          position,
          draggable: true,
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
          style: {
            ...getNodeStyle(concept.type),
            cursor: 'grab',
          },
        });

        if (concept.parent && parentPos) {
          newEdges.push({
            id: `edge-${concept.parent}-${childId}`,
            source: concept.parent,
            target: childId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#14b8a6', strokeWidth: 2 },
          });
        }

        const nextLeftBound = level === 0 ? 150 + (childIndex + 1) * 700 : currentX - subtreeWidth;
        positionNodes(childId, level + 1, position, nextLeftBound);
      });
      
      return currentX;
    };

    positionNodes(null, 0, null, 0);

    return { nodes: newNodes, edges: newEdges };
  }, [concepts]); // Only recalculate when concepts change

  useEffect(() => {
    if (!concepts || concepts.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    setNodes(layoutData.nodes);
    setEdges(layoutData.edges);
  }, [layoutData, setNodes, setEdges]);

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
        nodesDraggable={true}
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
