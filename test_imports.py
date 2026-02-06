import sys
import os
import traceback

sys.path.append(os.getcwd())
print("Importing backend.main...")
try:
    import backend.main
    print("Success importing backend.main")
except Exception:
    import traceback
    traceback.print_exc()
