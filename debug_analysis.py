import sys
import os
import traceback

# Add current dir to path
sys.path.append(os.getcwd())

try:
    from backend.ingestion import scan_codebase
    from backend.parsing import JavaParser
    from backend.graph.builder import GraphBuilder
    from backend.clustering.engine import ClusteringEngine
except Exception:
    traceback.print_exc()
    sys.exit(1)

def main():
    try:
        path = os.path.abspath("test_data/complex")
        print(f"Scanning {path}...")
        files = scan_codebase(path, "java")
        print(f"Found {len(files)} files.")

        print("Parsing files...")
        parser = JavaParser()
        parsed_data = []
        for f in files:
            # print(f"Parsing {f}...")
            funcs = parser.parse_file(f)
            parsed_data.append({
                "file_path": f,
                "functions": funcs
            })
            
        print("Building graph...")
        builder = GraphBuilder()
        builder.build_graph(parsed_data)
        
        print("Clustering...")
        cluster_engine = ClusteringEngine()
        clusters = cluster_engine.cluster_graph(builder.graph)
        
        print("Success!")
        
    except Exception:
        traceback.print_exc()

if __name__ == "__main__":
    main()
