import networkx as nx
from typing import List, Dict

class ImpactEngine:
    def __init__(self):
        pass
        
    def analyze_impact(self, graph: nx.DiGraph, target_node: str) -> Dict[str, List[str]]:
        """
        Trace upstream (who calls me) and downstream (who I call).
        """
        if target_node not in graph:
            return {"upstream": [], "downstream": []}
            
        # Upstream: Predecessors (Callers)
        upstream = list(graph.predecessors(target_node))
        
        # Downstream: Successors (Callees)
        downstream = list(graph.successors(target_node))
        
        return {
            "upstream": upstream,
            "downstream": downstream
        }
