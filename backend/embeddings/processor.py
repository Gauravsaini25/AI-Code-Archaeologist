from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
from typing import List, Dict, Any
import pickle
import os

class EmbeddingProcessor:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        # Lazy loading to avoid startup delay if not needed immediately
        self.model_name = model_name
        self.model = None
        self.index = None
        self.ids = [] # Map index ID to Node ID

    def _load_model(self):
        if not self.model:
            print("Loading embedding model...")
            self.model = SentenceTransformer(self.model_name)
            
    def generate_embeddings(self, nodes: List[Dict[str, Any]]):
        """
        nodes: List of dicts with 'id' and 'code' text.
        """
        self._load_model()
        
        texts = [node['code'] for node in nodes]
        self.ids = [node['id'] for node in nodes]
        
        if not texts:
            return
            
        print(f"Generating embeddings for {len(texts)} functions...")
        embeddings = self.model.encode(texts)
        
        # Initialize FAISS
        dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dimension)
        self.index.add(np.array(embeddings).astype('float32'))
        
        return embeddings

    def search(self, query: str, k: int = 5) -> List[str]:
        """
        Returns list of Node IDs
        """
        self._load_model()
        query_vector = self.model.encode([query])
        distances, indices = self.index.search(np.array(query_vector).astype('float32'), k)
        
        results = []
        for idx in indices[0]:
            if idx != -1 and idx < len(self.ids):
                results.append(self.ids[idx])
                
        return results

    def save(self, path: str):
        if self.index:
            faiss.write_index(self.index, f"{path}.index")
            with open(f"{path}.ids", "wb") as f:
                pickle.dump(self.ids, f)

    def load(self, path: str):
        if os.path.exists(f"{path}.index"):
            self.index = faiss.read_index(f"{path}.index")
            with open(f"{path}.ids", "rb") as f:
                self.ids = pickle.load(f)
            self._load_model()
