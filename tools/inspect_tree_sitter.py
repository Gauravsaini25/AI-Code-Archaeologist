from tree_sitter import Language, Parser
import tree_sitter_java

def inspect_ts():
    print("Inspecting tree-sitter...")
    try:
        lang = Language(tree_sitter_java.language())
        parser = Parser(lang)
        print("Parser dir:", dir(parser))
        
        query = lang.query("(method_declaration) @m")
        print("Query attributes:")
        for x in dir(query):
            if not x.startswith("_"):
                print(x)
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_ts()
