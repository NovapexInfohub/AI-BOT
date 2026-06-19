import uuid
import sqlite3

def create_agent(prompt, name):
    agent_id = str(uuid.uuid4())
    conn = sqlite3.connect("users.db")
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO agents (id, name, prompt) VALUES (?,?,?)",
        (agent_id, name, prompt)
    )
    conn.commit()
    conn.close()
    return agent_id


# import uuid
# import sqlite3

# agents = {}

# def create_agent(prompt, name):

#     agent_id = str(uuid.uuid4())
#     agents[agent_id] = {
#         "name": name,
#         "prompt": prompt
#     }

#     return agent_id


# def get_agent(agent_id):
#     return agents.get(agent_id)









