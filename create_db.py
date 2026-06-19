import sqlite3

conn = sqlite3.connect("users.db")
cur = conn.cursor()

# users table
cur.execute("""
CREATE TABLE IF NOT EXISTS users(
    username TEXT PRIMARY KEY,
    password TEXT)
""")

# Agents table linked with user
cur.execute("""
CREATE TABLE IF NOT EXISTS agents(
    id TEXT PRIMARY KEY,
    username TEXT,
    name TEXT,
    prompt TEXT,
    FOREIGN KEY(username) REFERENCES users(username)
)
""")

# training files table
cur.execute("""
CREATE TABLE IF NOT EXISTS training_data(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT,
    file_name TEXT,
    file_path TEXT,
    source_type TEXT,
    source_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(agent_id) REFERENCES agents(id)   
)
""")

conn.commit()
conn.close()
print("Database Created Successfully 🚀")





# import sqlite3

# conn = sqlite3.connect("users.db")
# cur = conn.cursor()

# # USERS TABLE
# cur.execute("""
# CREATE TABLE IF NOT EXISTS users(
#     username TEXT PRIMARY KEY,
#     password TEXT
# )
# """)

# # AGENTS TABLE
# cur.execute("""
# CREATE TABLE IF NOT EXISTS agents(
#     id TEXT PRIMARY KEY,
#     name TEXT,
#     prompt TEXT
# )
# """)

# conn.commit()
# conn.close()

# print("Database Created Successfully 🚀")