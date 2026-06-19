from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import os
import pickle

model = SentenceTransformer("all-MiniLM-L6-v2")

# 🔥 persistent storage files
BASE_PATH = "vector_data"
os.makedirs(BASE_PATH, exist_ok=True)


# =========================
# 🔹 SPLIT TEXT
# =========================
def split_text(text, chunk_size=700):
    sentences = text.split(". ")
    chunks = []
    current = ""

    for sentence in sentences:
        if len(current) + len(sentence) < chunk_size:
            current += sentence + ". "
        else:
            chunks.append(current.strip())
            current = sentence + ". "

    if current:
        chunks.append(current.strip())

    return chunks


# =========================
# 🔹 GET FILE PATHS
# =========================
def get_paths(agent_id):
    return (
        f"{BASE_PATH}/{agent_id}_index.faiss",
        f"{BASE_PATH}/{agent_id}_docs.pkl"
    )


# =========================
# 🔹 STORE DATA (PERSISTENT)
# =========================
def store_data(text, agent_id):

    print("🔥 STORE DATA CALLED")
    print("AGENT ID:", agent_id)

    index_path, docs_path = get_paths(agent_id)

    print("INDEX PATH:", index_path)
    print("DOC PATH:", docs_path)

    # load or create
    if os.path.exists(index_path):
        print("📂 Loading existing index")
        index = faiss.read_index(index_path)
        with open(docs_path, "rb") as f:
            documents = pickle.load(f)
    else:
        print("🆕 Creating new index")
        index = faiss.IndexFlatL2(384)
        documents = []

    chunks = split_text(text)

    print("CHUNKS CREATED:", len(chunks))

    if not chunks:
        print("❌ NO CHUNKS")
        return

    embeddings = model.encode(chunks)

    index.add(np.array(embeddings))
    documents.extend(chunks)

    # save
    faiss.write_index(index, index_path)

    with open(docs_path, "wb") as f:
        pickle.dump(documents, f)

    print("✅ DATA SAVED SUCCESSFULLY")

# def store_data(text, agent_id):

#     index_path, docs_path = get_paths(agent_id)

#     # load existing or create new
#     if os.path.exists(index_path):
#         index = faiss.read_index(index_path)
#         with open(docs_path, "rb") as f:
#             documents = pickle.load(f)
#     else:
#         index = faiss.IndexFlatL2(384)
#         documents = []

#     chunks = split_text(text)

#     if not chunks:
#         return

#     embeddings = model.encode(chunks)

#     index.add(np.array(embeddings))
#     documents.extend(chunks)

#     # save to disk
#     faiss.write_index(index, index_path)
#     with open(docs_path, "wb") as f:
#         pickle.dump(documents, f)

#     print(f"✅ Stored {len(chunks)} chunks for agent {agent_id}")


# =========================
# 🔹 SEARCH DATA
# =========================
def search_data(query, agent_id):

    index_path, docs_path = get_paths(agent_id)

    if not os.path.exists(index_path):
        print("❌ No index found")
        return "", 999

    index = faiss.read_index(index_path)

    with open(docs_path, "rb") as f:
        docs = pickle.load(f)

    if len(docs) == 0:
        print("❌ No documents")
        return "", 999

    query_embedding = model.encode([query])

    D, I = index.search(np.array(query_embedding), k=10)

    results = []

    for idx in I[0]:
        if idx < len(docs):
            chunk = docs[idx]

            # 🔥 IMPORTANT: keyword filter
            if any(word in chunk.lower() for word in query.lower().split()):
                results.append(chunk)

    # 🔥 fallback if nothing matched
    if not results:
        results = [docs[i] for i in I[0] if i < len(docs)]

    context = " ".join(results[:5])

    return context, float(D[0][0])



# from sentence_transformers import SentenceTransformer
# import faiss
# import numpy as np

# model = SentenceTransformer("all-MiniLM-L6-v2")

# # 🔥 per-agent storage
# agent_indexes = {}
# agent_documents = {}

# # 🔥 better chunking
# def split_text(text, chunk_size=700):
#     sentences = text.split(". ")
#     chunks = []
#     current = ""

#     for sentence in sentences:
#         if len(current) + len(sentence) < chunk_size:
#             current += sentence + ". "
#         else:
#             chunks.append(current.strip())
#             current = sentence + ". "

#     if current:
#         chunks.append(current.strip())

#     return chunks


# # 🔥 store data per agent
# def store_data(text, agent_id):

#     if agent_id not in agent_indexes:
#         agent_indexes[agent_id] = faiss.IndexFlatL2(384)
#         agent_documents[agent_id] = []

#     chunks = split_text(text)

#     if not chunks:
#         return

#     embeddings = model.encode(chunks)

#     agent_indexes[agent_id].add(np.array(embeddings))
#     agent_documents[agent_id].extend(chunks)


# # 🔥 improved search
# def search_data(query, agent_id):

#     if agent_id not in agent_documents or len(agent_documents[agent_id]) == 0:
#         return "", 999

#     query_embedding = model.encode([query])

#     index = agent_indexes[agent_id]
#     docs = agent_documents[agent_id]

#     # 🔥 increase search results
#     D, I = index.search(np.array(query_embedding), k=10)

#     results = []

#     for idx in I[0]:
#         if idx < len(docs):
#             results.append(docs[idx])

#     # ❌ if nothing retrieved
#     if not results:
#         return "", 999

#     context = " ".join(results[:5])

#     return context, float(D[0][0])





# def search_data(query, agent_id):

#     if agent_id not in agent_documents or len(agent_documents[agent_id]) == 0:
#         return "", 999

#     # 🔥 remove useless words
#     stop_words = {"who","is","at","the","a","an","of","in","on","for","what","are"}
#     query_words = [w for w in query.lower().split() if w not in stop_words]

#     query_embedding = model.encode([query])

#     index = agent_indexes[agent_id]
#     docs = agent_documents[agent_id]

#     # 🔥 increase search depth
#     D, I = index.search(np.array(query_embedding), k=20)

#     results = []

#     for idx in I[0]:
#         if idx < len(docs):
#             chunk = docs[idx]

#             # 🔥 strict keyword match
#             if any(word in chunk.lower() for word in query_words):
#                 results.append(chunk)

#     # ❌ NO FALLBACK (important)
#     if not results:
#         return "", 999

#     return " ".join(results[:5]), float(D[0][0])





