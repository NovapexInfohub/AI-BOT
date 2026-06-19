import google.generativeai as genai

genai.configure(api_key="AIzaSyBPfSplybPAItUblmUi2MRcD-5_QVH-xvs")

models = genai.list_models()

for model in models:
    print(model.name)