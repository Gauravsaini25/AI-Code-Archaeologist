import networkx as nx
from typing import List, Dict, Any
import community.community_louvain as community_louvain # python-louvain

class ClusteringEngine:
    def __init__(self):
        pass

    def cluster_graph(self, graph: nx.DiGraph) -> Dict[str, Any]:
        """
        Groups nodes into clusters using Louvain Community Detection.
        """
        # Louvain needs an undirected graph
        undirected_g = graph.to_undirected()
        
        try:
            partition = community_louvain.best_partition(undirected_g)
        except Exception as e:
            print(f"Clustering fallback due to: {e}")
            # Fallback: All in one cluster if simple graph
            partition = {node: 0 for node in graph.nodes()}

        # Organize by cluster
        clusters = {}
        for node, cluster_id in partition.items():
            if cluster_id not in clusters:
                clusters[cluster_id] = []
            clusters[cluster_id].append(node)

        # Generate Metadata for clusters
        # For MVP, we name them "Cluster X"
        # In a real system, we'd use TF-IDF on code/names to label them.
        
        cluster_metadata = []
        for cid, nodes in clusters.items():
            cluster_metadata.append({
                "id": str(cid),
                "name": f"Cluster {cid}", # AI TODO: Generate name from node contents
                "node_count": len(nodes),
                "nodes": nodes,
                "risk_score": "LOW" # Placeholder
            })
            
        return cluster_metadata

    def assign_clusters(self, graph: nx.DiGraph, clusters: List[Dict[str, Any]]):
        """
        Updates the graph nodes with their cluster assignment.
        """
        node_to_cluster = {}
        for cluster in clusters:
            cid = cluster["id"]
            for node in cluster["nodes"]:
                node_to_cluster[node] = cid
                
        nx.set_node_attributes(graph, node_to_cluster, "cluster")
