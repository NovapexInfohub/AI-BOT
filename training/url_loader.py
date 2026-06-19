import requests
from bs4 import BeautifulSoup


def load_url(url):

    response = requests.get(url)

    soup = BeautifulSoup(response.text, "html.parser")

    text = soup.get_text()

    return text

# import requests
# from bs4 import BeautifulSoup

# def load_url(url):

#     html = requests.get(url).text

#     soup = BeautifulSoup(html, "html.parser")

#     return soup.get_text()