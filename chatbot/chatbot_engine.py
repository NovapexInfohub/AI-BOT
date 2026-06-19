import google.generativeai as genai
from training.vector_store import search_data

genai.configure(api_key="AIzaSyBPfSplybPAItUblmUi2MRcD-5_QVH-xvs")

model = genai.GenerativeModel("gemini-2.5-flash")

def ask_agent(question, agent_id=None):

    try:

        docs = search_data(question)

        # if relevant context found
        if docs and len(docs) > 0:

            context = "\n".join(docs)

            prompt = f"""
Use the context below to answer the question.
If the context does NOT contain the answer, answer normally.

Context:
{context}

Question:
{question}
"""

            response = model.generate_content(prompt)

            return response.text

        # fallback → normal Gemini answer
        response = model.generate_content(question)

        return response.text

    except Exception as e:
        print("AI ERROR:", e)
        return "AI server error. Please try again."
# import google.generativeai as genai
# from training.vector_store import search_data

# # Add your real Gemini API key here
# genai.configure(api_key="AIzaSyBPfSplybPAItUblmUi2MRcD-5_QVH-xvs")

# model = genai.GenerativeModel("gemini-2.5-flash")

# def ask_agent(question, agent_id=None):
#     try:
#         # search vector database
#         docs = search_data(question)

#         if docs:
#             context = "\n".join(docs)

#             prompt = f"""
# Answer using this context only.

# Context:
# {context}

# Question:
# {question}
# """

#             response = model.generate_content(prompt)

#             return response.text

#         # fallback if nothing found
#         response = model.generate_content(question)

#         return response.text

#     except Exception as e:
#         print("AI ERROR:", e)
#         return "AI server error. Please try again."

# import os
# import google.generativeai as genai

# from training.vector_store import search_documents
# from config import GEMINI_API_KEY

# genai.configure(api_key=GEMINI_API_KEY)

# model = genai.GenerativeModel("gemini-flash_latest")


# def ask_agent(question):

#     context = search_documents(question)

#     if context:

#         prompt = f"""
# Answer using the following information.

# Context:
# {context}

# Question:
# {question}
# """

#     else:

#         prompt = question

#     response = model.generate_content(prompt)

#     return response.text



# import google.generativeai as genai
# import os
# from dotenv import load_dotenv
# from agents.agent_manager import get_agent

# load_dotenv()

# genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# model = genai.GenerativeModel("gemini-flash-latest")


# def ask_agent(agent_id, question):

#     agent = get_agent(agent_id)

#     if not agent:
#         return "Agent not found"

#     system_prompt = agent["prompt"]

#     final_prompt = f"""
# You are an AI assistant.

# Agent Role:
# {system_prompt}

# User Question:
# {question}

# Answer only related to the agent role.
# """

#     response = model.generate_content(final_prompt)

#     return response.text









# import os
# import google.generativeai as genai
# from dotenv import load_dotenv

# load_dotenv()

# genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# model = genai.GenerativeModel("gemini-flash-latest")

# def ask_agent(question):

#     response = model.generate_content(question)

#     return response.text