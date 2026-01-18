'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import NeuralNetworkBackground from '@/components/NeuralNetworkBackground';
import { useAuth } from '@/lib/auth-context';
import { getUserSessions, SavedSession } from '@/lib/sessions-service';

type MapNode = { id: string; position?: { x: number; y: number } };
type MapEdge = { id: string; source: string; target: string };

function MindMapPreview({ nodes, edges }: { nodes?: MapNode[]; edges?: MapEdge[] }) {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-foreground-muted">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      </div>
    );
  }

  const xs = nodes.map((n) => n.position?.x ?? 0);
  const ys = nodes.map((n) => n.position?.y ?? 0);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = maxX - minX || 1;
  const height = maxY - minY || 1;
  const padding = 12;

  const mapWidth = 240;
  const mapHeight = 140;

  const scaleX = (mapWidth - padding * 2) / width;
  const scaleY = (mapHeight - padding * 2) / height;
  const scale = Math.min(scaleX, scaleY);

  const normalize = (pos: number, min: number) => (pos - min) * scale + padding;

  return (
    <div className="relative w-full h-full">
      <svg viewBox={`0 0 ${mapWidth} ${mapHeight}`} className="w-full h-full text-foreground-muted/70">
        {edges?.map((edge) => {
          const source = nodes.find((n) => n.id === edge.source)?.position || { x: 0, y: 0 };
          const target = nodes.find((n) => n.id === edge.target)?.position || { x: 0, y: 0 };
          return (
            <line
              key={edge.id}
              x1={normalize(source.x, minX)}
              y1={normalize(source.y, minY)}
              x2={normalize(target.x, minX)}
              y2={normalize(target.y, minY)}
              stroke="currentColor"
              strokeWidth={1.5}
              className="opacity-70"
              strokeLinecap="round"
            />
          );
        })}
        {nodes.map((node) => (
          <circle
            key={node.id}
            cx={normalize(node.position?.x ?? 0, minX)}
            cy={normalize(node.position?.y ?? 0, minY)}
            r={7}
            className="fill-primary/70"
          />
        ))}
      </svg>
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
    </div>
  );
}

export default function LibraryPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      if (!user?.id) return;
      
      setLoading(true);
      const data = await getUserSessions(user.id);
      setSessions(data);
      setLoading(false);
    }

    loadSessions();
  }, [user?.id]);

  // Filter sessions based on search query
  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Count nodes helper
  const getNodeCount = (session: SavedSession) => {
    return Array.isArray(session.mind_map_nodes) ? session.mind_map_nodes.length : 0;
  };

  return (
    <ProtectedRoute>
      <NeuralNetworkBackground />
      <div className="relative z-10 w-full min-h-screen bg-transparent overflow-hidden animate-fade-in-down">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-20 p-6 opacity-0 animate-fade-in-down [animation-delay:0.1s] [animation-fill-mode:forwards]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Link 
                  href="/home" 
                  className="px-4 py-2 rounded-xl glass text-foreground-muted hover:text-foreground transition-all duration-300 text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </Link>
                <h1 className="text-2xl font-display font-bold text-foreground">My Sessions</h1>
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-2 glass rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-primary/20 text-primary' 
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-primary/20 text-primary' 
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative opacity-0 animate-fade-in-up [animation-delay:0.2s] [animation-fill-mode:forwards]">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl input-field text-sm"
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-6xl mx-auto px-6 pt-48 pb-12 h-screen flex flex-col">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <p className="text-foreground-muted">Loading your sessions...</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-16 animate-fade-in-up">
              <div className="w-20 h-20 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-foreground font-semibold text-lg mb-2">
                {searchQuery ? 'No sessions found' : 'No sessions yet'}
              </p>
              <p className="text-foreground-muted text-sm mb-6">
                {searchQuery ? 'Try a different search term' : 'Start a recording to create your first session'}
              </p>
              {!searchQuery && (
                <Link 
                  href="/record" 
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-sm"
                >
                  New Session
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="overflow-y-auto custom-scrollbar flex-1 pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up pb-6">
                {filteredSessions.map((session, index) => (
                  <Link
                    key={session.id}
                    href={`/session/${session.id}`}
                    className="group relative opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative card p-6 hover:border-primary/30 transition-all duration-300 h-full">
                      <div className="aspect-video bg-surface-dark rounded-xl mb-4 flex items-center justify-center border border-surface-border group-hover:border-primary/20 transition-colors duration-300 overflow-hidden">
                        <MindMapPreview nodes={session.mind_map_nodes as any} edges={session.mind_map_edges as any} />
                      </div>
                      <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors duration-300 truncate mb-3">
                        {session.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-foreground-muted mb-3">
                        <span>{formatDate(session.created_at)}</span>
                      </div>
                      <div className="pt-3 border-t border-surface-border flex items-center justify-between">
                        <span className="text-xs text-foreground-muted">{getNodeCount(session)} concepts</span>
                        <svg className="w-4 h-4 text-foreground-muted group-hover:text-primary transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto custom-scrollbar flex-1 pr-2">
              <div className="space-y-3 animate-fade-in-up pb-6">
                {filteredSessions.map((session, index) => (
                  <Link
                    key={session.id}
                    href={`/session/${session.id}`}
                    className="group relative block opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative card p-5 hover:border-primary/30 transition-all duration-300 flex items-center gap-5">
                      <div className="w-16 h-16 bg-surface-dark rounded-xl flex items-center justify-center flex-shrink-0 border border-surface-border group-hover:border-primary/20 transition-colors duration-300 overflow-hidden">
                        <MindMapPreview nodes={session.mind_map_nodes as any} edges={session.mind_map_edges as any} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors duration-300 truncate mb-2">
                          {session.title}
                        </h3>
                      <div className="flex items-center gap-3 text-xs text-foreground-muted">
                        <span>{formatDate(session.created_at)}</span>
                        <span>·</span>
                        <span>{getNodeCount(session)} concepts</span>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-foreground-muted group-hover:text-primary transition-colors duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
