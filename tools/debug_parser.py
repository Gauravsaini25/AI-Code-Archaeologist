from backend.parsing import JavaParser
import os

def test_parser():
    try:
        print("Initializing Parser...")
        parser = JavaParser()
        print("Parser Initialized.")
        
        test_file = os.path.abspath("test_data/complex/AnalyticsEngine.java")
        print(f"Parsing {test_file}...")
        
        if not os.path.exists(test_file):
            print("File not found!")
            return

        funcs = parser.parse_file(test_file)
        print(f"Parsed {len(funcs)} functions.")
        print(funcs)
        
    except Exception as e:
        print(f"Parser Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_parser()
