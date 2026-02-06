import os
from pathlib import Path
from typing import List, Set

def scan_codebase(root_path: str, language: str = "java") -> List[str]:
    """
    Recursively scans the directory for source files of the specified language.
    Ignores common build/vendor directories.
    """
    valid_extensions = {
        "java": [".java"],
        "cpp": [".cpp", ".h", ".cc", ".hpp"]
    }
    
    extensions = valid_extensions.get(language.lower())
    if not extensions:
        raise ValueError(f"Unsupported language: {language}")

    # Directories to ignore
    ignored_dirs = {
        ".git", ".idea", ".vscode", "__pycache__", "node_modules", 
        "target", "build", "dist", "bin", "obj", "vendor",
        "venv", ".venv", "env"
    }

    source_files = []
    root = Path(root_path)

    if not root.exists():
        raise ValueError(f"Path does not exist: {root_path}")

    for root_dir, dirs, files in os.walk(root):
        # Filter ignored directories in-place
        dirs[:] = [d for d in dirs if d not in ignored_dirs]
        
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                full_path = str(Path(root_dir) / file)
                source_files.append(full_path)

    return source_files

if __name__ == "__main__":
    # Test stub
    import sys
    if len(sys.argv) > 1:
        files = scan_codebase(sys.argv[1])
        print(f"Found {len(files)} files.")
        for f in files[:5]:
            print(f)
