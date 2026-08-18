import json
import os
from wordfreq import top_n_list
from sentence_transformers import SentenceTransformer
import umap.umap_ as umap

words = top_n_list('en', 40000)
print(f"Got {len(words)} words")

model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(words, show_progress_bar=True)
print(f"Embeddings shape: {embeddings.shape}")

reducer = umap.UMAP(n_components=2, metric='cosine', n_neighbors=15, random_state=42)
projections = reducer.fit_transform(embeddings)
print(f"Projections shape: {projections.shape}")

word_map = {word: [round(float(p[0]), 3), round(float(p[1]), 3)] for word, p in zip(words, projections)}

out_dir = "public"
os.makedirs(out_dir, exist_ok=True)

with open(os.path.join(out_dir, "word_map_40k.json"), "w", encoding="utf-8") as f:
    json.dump(word_map, f, separators=(",", ":"))

print(f"Exported {len(word_map)} words")