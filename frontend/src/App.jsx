import React, { useState, useEffect } from 'react';
import GraphView from './visualization/GraphView';
import ChatPanel from './chat/ChatPanel';
import { Code, Info, Layers, GitBranch, Zap, ChevronDown, ChevronUp, Target, Search, ChevronLeft, ChevronRight } from 'lucide-react';

// Cluster colors matching GraphView
const CLUSTER_COLORS = [
  '#0A84FF', '#30D158', '#FF9F0A', '#BF5AF2',
  '#64D2FF', '#FF375F', '#FFD60A', '#5E5CE6',
];

function App() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [clusters, setClusters] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Sidebar states
  const [rightWidth, setRightWidth] = useState(
    typeof window !== 'undefined' && window.innerWidth > 768 ? 320 : 0
  );
  const [resizing, setResizing] = useState(false);
  const [artifactPanelCollapsed, setArtifactPanelCollapsed] = useState(false);
  const [clusterPanelCollapsed, setClusterPanelCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  // Code Editing & Ripple Effect
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState("");
  const [affectedNodes, setAffectedNodes] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  /* ================= DATA FETCH ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:8005/graph');
        const data = await res.json();
        setGraphData(data);

        const clusterRes = await fetch('http://localhost:8005/clusters');
        const clusterData = await clusterRes.json();
        setClusters(clusterData);
      } catch (e) {
        console.error("Backend not ready", e);
      }
    };
    fetchData();
  }, []);

  /* ================= RESIZE Logic for Window ================= */
  useEffect(() => {
    const handleWindowResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Optional: auto-close sidebar when switching to mobile
      if (mobile && rightWidth > 0 && rightWidth > window.innerWidth) {
        setRightWidth(window.innerWidth - 40);
      }
    };
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [rightWidth]);

  /* ================= RESIZE Logic for Sidebar ================= */
  useEffect(() => {
    const onMove = (e) => {
      if (!resizing) return;
      const newWidth = window.innerWidth - e.clientX;
      const maxWidth = isMobile ? window.innerWidth - 20 : 480;
      setRightWidth(Math.min(maxWidth, Math.max(260, newWidth)));
    };
    const stop = () => setResizing(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", stop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", stop);
    };
  }, [resizing, isMobile]);

  /* ================= SEARCH ================= */
  const handleSearchChange = (value) => {
    setSearchTerm(value);

    if (!value.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const lower = value.toLowerCase();

    const nodeMatches = graphData.nodes
      .filter(n => n.name?.toLowerCase().includes(lower))
      .slice(0, 10)
      .map(n => ({ type: "node", id: n.id }));

    const clusterMatches = clusters
      .filter(c => c.name.toLowerCase().includes(lower))
      .map(c => ({ type: "cluster", data: c }));

    const combined = [...clusterMatches, ...nodeMatches];
    setSearchResults(combined);
    setShowDropdown(combined.length > 0);
  };

  const handleResultSelect = (item) => {
    setSearchTerm("");
    setSearchResults([]);
    setShowDropdown(false);

    if (item.type === "node") {
      const node = graphData.nodes.find(n => n.id === item.id);
      if (node) setSelectedNode(node);
      // On mobile, ensure sidebar opens when content selected
      if (isMobile) setRightWidth(Math.min(320, window.innerWidth - 40));
      return;
    }

    if (item.type === "cluster") {
      focusCluster(item.data);
      // On mobile, ensure sidebar opens when content selected
      if (isMobile) setRightWidth(Math.min(320, window.innerWidth - 40));
    }
  };

  const focusCluster = (cluster) => {
    const clusterNodes = graphData.nodes.filter(n => n.cluster === cluster.id);
    if (!clusterNodes.length) return;

    const center = clusterNodes.reduce(
      (a, n) => ({
        x: a.x + (n.x || 0),
        y: a.y + (n.y || 0),
        z: a.z + (n.z || 0),
      }),
      { x: 0, y: 0, z: 0 }
    );

    center.x /= clusterNodes.length;
    center.y /= clusterNodes.length;
    center.z /= clusterNodes.length;

    setSelectedNode({
      id: `cluster-${cluster.id}`,
      isCluster: true,
      name: cluster.name,
      clusterId: cluster.id,
      nodeCount: cluster.node_count,
      nodes: cluster.nodes,
      x: center.x,
      y: center.y,
      z: center.z
    });
  };

  const handleClusterNodeClick = (nodeId) => {
    const node = graphData.nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setIsEditing(false); // reset editing state
    }
  };

  const handleSaveCode = async () => {
    if (!selectedNode) return;

    setIsAnalyzing(true);
    setAffectedNodes([]); // Clear previous results

    try {
      const res = await fetch('http://localhost:8005/update_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          node_id: selectedNode.id,
          code: editedCode
        })
      });

      const data = await res.json();
      if (data.status === "UPDATED") {
        // ⚠️ CRITICAL: Mutate the existing node object to preserve d3 references (x, y, z, links)
        // If we create a new object, existing links will point to the old object, detaching the node.
        const nodeToUpdate = graphData.nodes.find(n => n.id === selectedNode.id);
        if (nodeToUpdate) {
          nodeToUpdate.code = editedCode;
        }

        // Trigger React re-render with shallow copy of the container, but SAME node references
        setGraphData({ ...graphData });

        // Update selectedNode state
        setSelectedNode({ ...selectedNode, code: editedCode });

        // Trigger Ripple Effect
        setAffectedNodes(data.affected_nodes);
        setIsEditing(false);

        // Removed automatic timeout - waiting for user confirmation now
      } else {
        alert("Update failed: " + JSON.stringify(data));
      }
    } catch (e) {
      console.error("Failed to update code", e);
      alert("Failed to connect to backend. Is it running? Error: " + e.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="relative w-screen h-screen bg-black text-white overflow-hidden">

      {/* Subtle background texture */}
      <svg className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <defs>
          <pattern id="dots" width="40" height="40">
            <circle cx="1" cy="1" r="1" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* GRAPH */}
      <GraphView
        data={graphData}
        selectedNode={selectedNode}
        onNodeClick={(node) => {
          setSelectedNode(node);
          setIsEditing(false);
        }}
        affectedNodes={affectedNodes}
      />

      {/* CHAT - Responsive */}
      <ChatPanel onQuery={() => { }} />

      {/* HEADER - Responsive */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 text-center w-full max-w-[90vw] pointer-events-none">
        <h1 className="tracking-widest text-lg sm:text-l md:text-xl pointer-events-auto inline-block">
          <span className="font-bold text-blue-400">CODE</span>{" "}
          <span className="text-white/80 font-light">ARCHAEOLOGIST</span>
        </h1>
        <div className="flex flex-wrap gap-2 sm:gap-4 justify-center text-xs text-white/50 mt-1 sm:mt-2 pointer-events-auto">
          <div className="stat-badge whitespace-nowrap">
            <Layers size={12} className="sm:w-[14px] sm:h-[14px]" />
            <span>{graphData.nodes.length} nodes</span>
          </div>
          <div className="stat-badge whitespace-nowrap">
            <GitBranch size={12} className="sm:w-[14px] sm:h-[14px]" />
            <span>{graphData.links.length} links</span>
          </div>
          <div className="stat-badge whitespace-nowrap">
            <Zap size={12} className="sm:w-[14px] sm:h-[14px]" />
            <span>{clusters.length} clusters</span>
          </div>
        </div>
      </div>

      {/* SEARCH BAR - Responsive */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90vw] max-w-[420px]">
        <div
          className="flex items-center gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }}
        >
          <Search size={16} className="text-white/50" />
          <input
            value={searchTerm}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search nodes..."
            className="flex-1 bg-transparent outline-none text-xs sm:text-sm text-white placeholder-white/40 min-w-0"
          />
        </div>

        {showDropdown && (
          <div
            className="absolute bottom-full mb-2 w-full rounded-xl max-h-48 sm:max-h-56 overflow-auto"
            style={{
              background: 'linear-gradient(145deg, rgba(20,20,20,0.95) 0%, rgba(10,10,10,0.95) 100%)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
            }}
          >
            {searchResults.map(item => {
              // Determine color based on item type
              let itemColor = 'currentColor'; // fallback

              if (item.type === "cluster") {
                // Use ID to match GraphView logic, not array index
                const clusterId = parseInt(item.data.id || 0);
                itemColor = CLUSTER_COLORS[clusterId % CLUSTER_COLORS.length];
              } else if (item.type === "node") {
                const node = graphData.nodes.find(n => n.id === item.id);
                if (node) {
                  const clusterIndex = parseInt(node.cluster || 0) % CLUSTER_COLORS.length;
                  itemColor = CLUSTER_COLORS[clusterIndex];
                }
              }

              return (
                <div
                  key={item.type === "node" ? item.id : item.data.id}
                  onClick={() => handleResultSelect(item)}
                  className="interactive-item px-3 sm:px-4 py-2 sm:py-2.5 flex gap-3 items-center text-xs sm:text-sm"
                >
                  {item.type === "cluster"
                    ? <Layers size={14} style={{ color: itemColor }} className="shrink-0" />
                    : <Code size={14} style={{ color: itemColor }} className="shrink-0" />}
                  <span className="text-white/80 truncate">
                    {item.type === "cluster"
                      ? item.data.name
                      : item.id.split("::")[1]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR TOGGLE (When Closed) */}
      {rightWidth === 0 && (
        <button
          onClick={() => setRightWidth(320)} // Expand sidebar
          className="absolute top-20 right-0 p-2 bg-[#0b0b0b] border border-white/10 rounded-l-lg z-30 hover:bg-[#1a1a1a]"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      {/* RIGHT SIDEBAR - Responsive */}
      {rightWidth > 0 && (
        <div
          className="absolute top-4 right-4 bottom-4 z-30 flex flex-col gap-3"
          style={{ width: rightWidth }}
        >
          {/* Resize handle (left side of panel) */}
          {!isMobile && (
            <div
              onMouseDown={() => setResizing(true)}
              className="absolute -left-2 top-0 bottom-0 w-4 bg-transparent cursor-col-resize z-10 hover:bg-white/5"
            />
          )}

          {/* Close Button on Mobile */}
          {isMobile && (
            <button
              className="absolute -left-8 top-0 p-1.5 bg-black/50 backdrop-blur rounded-l-md border border-white/10 text-white/60"
              onClick={() => setRightWidth(0)}
            >
              <ChevronRight size={16} />
            </button>
          )}

          {/* ARTIFACT DETAILS PANEL */}
          <div
            className="glass-panel flex-1 flex flex-col overflow-hidden animate-slide-right"
            style={{
              minHeight: artifactPanelCollapsed ? '56px' : '200px',
              flex: artifactPanelCollapsed ? '0 0 56px' : '1'
            }}
          >
            {/* Header */}
            <div className="panel-header">
              <div className="panel-title">
                <Target size={16} className="text-blue-400" />
                <span>Select an Artifact</span>
              </div>
              <button
                className="collapse-toggle"
                onClick={() => setArtifactPanelCollapsed(!artifactPanelCollapsed)}
              >
                {artifactPanelCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
            </div>

            {/* Content */}
            {!artifactPanelCollapsed && (
              <div className="flex-1 overflow-auto p-4">
                {!selectedNode && (
                  <div className="h-full flex flex-col items-center justify-center text-white/40">
                    <Info size={32} className="mb-3 opacity-50" />
                    <p className="text-sm">Click any node to reveal its secrets.</p>
                  </div>
                )}

                {selectedNode?.isCluster && (
                  <div className="animate-fade-in">
                    {/* Back to Overview Button */}
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="mb-3 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <ChevronLeft size={12} />
                      Back to Overview
                    </button>

                    <div className="flex items-center gap-2 mb-3">
                      <Layers className="text-purple-400" size={18} />
                      <h3 className="font-semibold text-white">{selectedNode.name}</h3>
                    </div>
                    <p className="text-xs text-white/50 mb-4">
                      {selectedNode.nodeCount} functions in this cluster
                    </p>

                    <div className="space-y-1">
                      {selectedNode.nodes.map(id => (
                        <div
                          key={id}
                          onClick={() => handleClusterNodeClick(id)}
                          className="interactive-item flex items-center gap-2 text-xs font-mono px-3 py-2 rounded-lg"
                        >
                          <Code size={12} className="text-blue-400" />
                          <span className="text-white/70">{id.split("::")[1]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedNode && !selectedNode.isCluster && (
                  <div className="animate-fade-in">
                    {/* Analyzing State Overlay */}
                    {isAnalyzing && (
                      <div className="absolute inset-0 z-50 bg-[#0b0b0b]/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center rounded-lg animate-fade-in">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <h4 className="font-semibold text-blue-400">Analyzing Impact...</h4>
                        <p className="text-xs text-white/50">Calculating dependency ripple effect</p>
                      </div>
                    )}

                    {/* Impact Analysis Results (Confirmation) */}
                    {!isAnalyzing && affectedNodes.length > 0 && (
                      <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 animate-slide-in">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap size={16} className="text-red-400" />
                          <span className="font-semibold text-red-50 text-sm">Impact Analysis Detected</span>
                        </div>
                        <p className="text-xs text-red-200/70 mb-3">
                          Modifying this function affects <strong className="text-white">{affectedNodes.length}</strong> dependent nodes (highlighted in graph).
                        </p>
                        <button
                          onClick={() => setAffectedNodes([])}
                          className="w-full py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-semibold rounded transition-colors border border-red-500/30"
                        >
                          ACCEPT CHANGES
                        </button>
                      </div>
                    )}

                    {/* Back to Cluster Button (Only show if not in confirmation mode) */}
                    {selectedNode.cluster && affectedNodes.length === 0 && (
                      <button
                        onClick={() => {
                          const cluster = clusters.find(c => String(c.id) === String(selectedNode.cluster));
                          if (cluster) focusCluster(cluster);
                        }}
                        className="mb-3 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ChevronLeft size={12} />
                        Back to Cluster
                      </button>
                    )}

                    <div className="flex items-center gap-2 mb-3">
                      <Code className="text-green-400" size={18} />
                      <h3 className="font-semibold text-white">{selectedNode.name}</h3>

                      <div className="ml-auto flex gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSaveCode}
                              className="px-2 py-1 bg-green-500/20 text-green-400 text-[10px] rounded border border-green-500/30 hover:bg-green-500/30"
                            >
                              SAVE
                            </button>
                            <button
                              onClick={() => setIsEditing(false)}
                              className="px-2 py-1 bg-white/10 text-white/60 text-[10px] rounded hover:bg-white/20"
                            >
                              CANCEL
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setEditedCode(selectedNode.code || "");
                              setIsEditing(true);
                            }}
                            className="px-2 py-1 bg-blue-500/20 text-blue-400 text-[10px] rounded border border-blue-500/30 hover:bg-blue-500/30"
                          >
                            EDIT
                          </button>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <textarea
                        value={editedCode}
                        onChange={(e) => setEditedCode(e.target.value)}
                        className="w-full h-64 bg-black/40 text-xs text-white p-3 rounded-lg border border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono resize-none"
                      />
                    ) : (
                      <pre
                        className="text-xs p-3 rounded-lg max-h-64 overflow-auto"
                        style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        {selectedNode.code || 'No code preview available'}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CLUSTERS PANEL */}
          <div
            className="glass-panel flex flex-col overflow-hidden animate-slide-right"
            style={{
              minHeight: clusterPanelCollapsed ? '56px' : '180px',
              flex: clusterPanelCollapsed ? '0 0 56px' : '0 0 auto',
              maxHeight: clusterPanelCollapsed ? '56px' : '280px'
            }}
          >
            {/* Header */}
            <div className="panel-header">
              <div className="panel-title">
                <Layers size={16} className="text-purple-400" />
                <span>Clusters</span>
                <span className="text-xs text-white/40 ml-1">{clusters.length} groups</span>
              </div>
              <button
                className="collapse-toggle"
                onClick={() => setClusterPanelCollapsed(!clusterPanelCollapsed)}
              >
                {clusterPanelCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
            </div>

            {/* Content */}
            {!clusterPanelCollapsed && (
              <div className="flex-1 overflow-auto p-2">
                {clusters.map((cluster) => {
                  // Use ID to deterministically match GraphView colors
                  const clusterIndex = parseInt(cluster.id || 0) % CLUSTER_COLORS.length;
                  const color = CLUSTER_COLORS[clusterIndex];

                  return (
                    <div
                      key={cluster.id}
                      onClick={() => focusCluster(cluster)}
                      className="interactive-item flex items-center gap-3 px-3 py-2.5 rounded-lg"
                    >
                      <div
                        className="cluster-dot"
                        style={{
                          backgroundColor: color,
                          color: color
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white/90 truncate">{cluster.name}</div>
                        <div className="text-xs text-white/40">{cluster.node_count} nodes</div>
                      </div>
                    </div>
                  );
                })}

                {clusters.length === 0 && (
                  <div className="text-center text-white/40 text-xs py-4">
                    No clusters detected
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
