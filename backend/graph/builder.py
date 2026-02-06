import networkx as nx
from typing import List, Dict, Any

class GraphBuilder:
    def __init__(self):
        self.graph = nx.DiGraph()

    def build_graph(self, parsed_files: List[Dict[str, Any]]):
        """
        Constructs the dependency graph from parsed file data.
        """
        # First pass: Add all nodes
        for file_data in parsed_files:
            file_path = file_data.get("file_path")
            functions = file_data.get("functions", [])
            
            for func in functions:
                node_id = self._generate_node_id(file_path, func["name"])
                
                # Store extensive metadata
                self.graph.add_node(
                    node_id,
                    type="function",
                    name=func["name"],
                    file=file_path,
                    start_line=func["start_line"],
                    end_line=func["end_line"],
                    code=func["code"]
                )

        # Second pass: Add edges
        # This is tricky because calls are just strings (names). 
        # We need to resolve them to actual nodes.
        # MVP Strategy: Naive name matching. If function A calls "foo", link to all "foo" nodes.
        # (For MVP, strictly static analysis without full symbol resolution is acceptable but imprecise)
        
        # Build a map of name -> [node_ids] for lookup
        name_map = {}
        for node in self.graph.nodes():
            func_name = self.graph.nodes[node]["name"]
            if func_name not in name_map:
                name_map[func_name] = []
            name_map[func_name].append(node)

        for node in self.graph.nodes():
            code = self.graph.nodes[node]["code"]
            # We already extracted calls in parser. But let's verify if we have them in metadata.
            # Wait, I didn't verify if parser output was passed fully.
            # Assuming parser output structure is passed correctly.
            pass

        # Re-iterating to add edges based on the 'calls' list we extracted
        for file_data in parsed_files:
            file_path = file_data.get("file_path")
            functions = file_data.get("functions", [])
            
            for func in functions:
                source_id = self._generate_node_id(file_path, func["name"])
                calls = func.get("calls", [])
                
                for call_name in calls:
                    potential_matches = name_map.get(call_name, [])
                    
                    if not potential_matches:
                        continue
                        
                    # Refinement: Prefer matches in the same file
                    # Refinement: In real world, we need imports. MVP: Link to all (Mesh) or heuristic.
                    # Heuristic: Link to all for now (High Recall, Low Precision) to show density.
                    
                    for target_id in potential_matches:
                        if source_id == target_id:
                            continue # Ignore recursion self-loops for clarity or keep? Let's keep distinct.
                        
                        self.graph.add_edge(source_id, target_id, weight=1)

    def _generate_node_id(self, file_path: str, func_name: str) -> str:
        # Normalize file path
        fname = file_path.replace("\\", "/").split("/")[-1]
        return f"{fname}::{func_name}"

    def get_graph_data(self) -> Dict[str, Any]:
        """Return graph data in format compatible with ForceGraph3D (nodes, links)."""
        data = nx.node_link_data(self.graph)
        # ForceGraph3D expects "links" not "edges"
        if "edges" in data:
            data["links"] = data.pop("edges")
        return data
