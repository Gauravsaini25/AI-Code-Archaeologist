from tree_sitter import Language, Parser
import tree_sitter_java
from typing import List, Dict, Any

class JavaParser:
    def __init__(self):
        self.JAVA_LANGUAGE = Language(tree_sitter_java.language())
        self.parser = Parser(self.JAVA_LANGUAGE)

    def parse_file(self, file_path: str) -> List[Dict[str, Any]]:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                code = f.read()
            # print(f"Read {len(code)} bytes from {file_path}") # Debug
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return []

        tree = self.parser.parse(bytes(code, "utf8"))
        
        functions = []
        
        def traverse(node):
            if node.type == "method_declaration" or node.type == "constructor_declaration":
                # Found a method
                func_name = "anonymous"
                # Find name node
                for child in node.children:
                    if child.type == "identifier":
                        func_name = code[child.start_byte:child.end_byte]
                        break
                
                # Extract calls
                calls = self._extract_calls_manual(node, code)
                
                functions.append({
                    "name": func_name,
                    "type": "constructor" if node.type == "constructor_declaration" else "method",
                    "start_line": node.start_point.row + 1,
                    "end_line": node.end_point.row + 1,
                    "code": code[node.start_byte:node.end_byte],
                    "calls": calls
                })
            
            # Recurse
            for child in node.children:
                traverse(child)

        traverse(tree.root_node)
        return functions

    def _extract_calls_manual(self, node, code) -> List[str]:
        calls = []
        def traverse_calls(n):
            if n.type == "method_invocation":
                # Find name
                for child in n.children:
                    if child.type == "identifier":
                        calls.append(code[child.start_byte:child.end_byte])
                        break
            for child in n.children:
                traverse_calls(child)
        traverse_calls(node)
        return calls

    def _extract_calls(self, node, code) -> List[str]:
        calls = []
        # Simple query for method invocations
        query_scm = """
        (method_invocation
            name: (identifier) @call_name)
        """
        query = self.JAVA_LANGUAGE.query(query_scm)
        for match in query.matches(node):
            captures = match[1]
            if "call_name" in captures:
                call_node = captures["call_name"][0]
                calls.append(code[call_node.start_byte:call_node.end_byte])
        return calls

if __name__ == "__main__":
    # Test stub - wait for proper environment
    pass
