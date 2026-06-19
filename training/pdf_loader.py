import PyPDF2

def load_pdf(file):

    text = ""

    reader = PyPDF2.PdfReader(file)

    for page in reader.pages:

        page_text = page.extract_text()

        if page_text:
            text += page_text

    return text

# from pypdf import PdfReader

# def load_pdf(file):

#     reader = PdfReader(file)

#     text = ""

#     for page in reader.pages:
#         text += page.extract_text()

#     return text