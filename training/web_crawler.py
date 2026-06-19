import requests

from bs4 import BeautifulSoup

from urllib.parse import (
    urljoin,
    urlparse,
    urlunparse
)

from collections import deque


# =====================================
# CLEAN TEXT
# =====================================

def clean_text(text):

    bad_words = [

        "privacy policy",
        "terms of service",
        "terms & conditions",
        "cookie policy",
        "copyright",
        "all rights reserved",
        "read more",
        "click here",
        "login",
        "sign up",
        "subscribe",
        "share",
        "follow us"

    ]

    lines = text.split("\n")

    cleaned = []

    seen = set()

    for line in lines:

        line = line.strip()

        if len(line) < 4:
            continue

        lower = line.lower()

        if any(word in lower for word in bad_words):
            continue

        if line not in seen:

            seen.add(line)

            cleaned.append(line)

    return "\n".join(cleaned)


# =====================================
# NORMALIZE URL
# =====================================

def normalize_url(url):

    parsed = urlparse(url)

    parsed = parsed._replace(

        query="",
        fragment=""

    )

    return urlunparse(parsed).rstrip("/")


# =====================================
# MAIN CRAWLER
# =====================================

def crawl_website(start_url, max_pages=20):

    visited = set()

    queue = deque()

    queue.append(normalize_url(start_url))

    collected_pages = []

    domain = urlparse(start_url).netloc

    headers = {

        "User-Agent":

        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/137 Safari/537.36"

    }

    skip_extensions = (

        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".svg",
        ".pdf",
        ".zip",
        ".css",
        ".js",
        ".ico",
        ".mp4",
        ".mp3",
        ".woff",
        ".woff2"

    )

    while queue and len(visited) < max_pages:

        current_url = queue.popleft()

        if current_url in visited:
            continue

        print("=" * 70)
        print("CRAWLING :", current_url)

        try:

            response = requests.get(

                current_url,

                headers=headers,

                timeout=15

            )

            if response.status_code != 200:

                print("Skipped :", response.status_code)

                visited.add(current_url)

                continue

            soup = BeautifulSoup(

                response.text,

                "html.parser"

            )

            # Remove unwanted tags

            for tag in soup([

                "script",
                "style",
                "noscript",
                "svg"

            ]):

                tag.decompose()

            texts = []

            for tag in soup.find_all([

                "title",
                "h1",
                "h2",
                "h3",
                "h4",
                "h5",
                "p",
                "li"

            ]):

                content = tag.get_text(

                    separator=" ",

                    strip=True

                )

                if len(content) > 3:

                    texts.append(content)

            page_text = clean_text(

                "\n".join(texts)

            )

            if len(page_text) > 100:

                collected_pages.append(

                    f"""

==================================================
PAGE : {current_url}
==================================================

{page_text}

"""

                )

                print("Extracted :", len(page_text), "characters")

            else:

                print("Low content skipped")

            visited.add(current_url)

            # -----------------------------
            # Find internal links
            # -----------------------------

            for link in soup.find_all(

                "a",

                href=True

            ):

                href = link["href"].strip()

                if href.startswith("mailto:"):
                    continue

                if href.startswith("tel:"):
                    continue

                full_url = normalize_url(

                    urljoin(

                        current_url,

                        href

                    )

                )

                parsed = urlparse(full_url)

                if parsed.netloc != domain:
                    continue

                if full_url.lower().endswith(skip_extensions):
                    continue

                if full_url not in visited and full_url not in queue:

                    queue.append(full_url)

                    print("FOUND :", full_url)

        except Exception as e:

            print("ERROR :", current_url)

            print(e)

            visited.add(current_url)

            continue

    print("\n" + "=" * 70)
    print("TOTAL PAGES CRAWLED :", len(visited))
    print("TOTAL PAGES EXTRACTED :", len(collected_pages))
    print("=" * 70)

    return "\n".join(collected_pages)






# import time
# from urllib.parse import urljoin, urlparse, urlunparse

# from bs4 import BeautifulSoup
# from selenium import webdriver
# from selenium.webdriver.chrome.options import Options
# from selenium.webdriver.chrome.service import Service
# from webdriver_manager.chrome import ChromeDriverManager


# # -----------------------------
# # CLEAN EXTRACTED TEXT
# # -----------------------------
# def clean_text(text):

#     bad_words = [
#         "privacy policy",
#         "terms of service",
#         "terms & conditions",
#         "cookie policy",
#         "copyright",
#         "all rights reserved",
#         "read more",
#         "click here",
#         "share",
#         "follow us",
#         "login",
#         "sign up"
#     ]

#     lines = text.split("\n")
#     cleaned = []

#     for line in lines:

#         line = line.strip()

#         if len(line) < 4:
#             continue

#         if any(word in line.lower() for word in bad_words):
#             continue

#         if line not in cleaned:
#             cleaned.append(line)

#     return "\n".join(cleaned)


# # -----------------------------
# # NORMALIZE URL
# # -----------------------------
# def normalize_url(url):

#     parsed = urlparse(url)

#     normalized = parsed._replace(
#         query="",
#         fragment=""
#     )

#     return urlunparse(normalized).rstrip("/")


# # -----------------------------
# # MAIN CRAWLER
# # -----------------------------
# def crawl_website(start_url, max_pages=30):

#     visited = set()

#     queue = [normalize_url(start_url)]

#     collected_text = []

#     domain = urlparse(start_url).netloc

#     chrome_options = Options()

#     chrome_options.add_argument("--headless=new")
#     chrome_options.add_argument("--disable-gpu")
#     chrome_options.add_argument("--no-sandbox")
#     chrome_options.add_argument("--disable-dev-shm-usage")

#     driver = webdriver.Chrome(
#         service=Service(
#             ChromeDriverManager().install()
#         ),
#         options=chrome_options
#     )

#     while queue and len(visited) < max_pages:

#         current_url = queue.pop(0)

#         if current_url in visited:
#             continue

#         try:

#             print("=" * 60)
#             print("Crawling:", current_url)

#             driver.get(current_url)

#             time.sleep(3)

#             driver.execute_script(
#                 "window.scrollTo(0, document.body.scrollHeight);"
#             )

#             time.sleep(2)

#             soup = BeautifulSoup(
#                 driver.page_source,
#                 "html.parser"
#             )

#             # Remove unwanted tags
#             for tag in soup([
#                 "script",
#                 "style",
#                 "noscript",
#                 "svg",
#                 "footer",
#                 "header"
#             ]):
#                 tag.extract()

#             texts = []

#             for tag in soup.find_all([
#                 "h1",
#                 "h2",
#                 "h3",
#                 "h4",
#                 "p",
#                 "li"
#             ]):

#                 content = tag.get_text(
#                     separator=" ",
#                     strip=True
#                 )

#                 if len(content) > 3:
#                     texts.append(content)

#             page_text = clean_text(
#                 "\n".join(texts)
#             )

#             if len(page_text) > 100:

#                 collected_text.append(

#                     f"""

# ==============================
# PAGE : {current_url}
# ==============================

# {page_text}

# """

#                 )

#                 print("Extracted:", len(page_text))

#             visited.add(current_url)

#             skip_extensions = (

#                 ".jpg",
#                 ".jpeg",
#                 ".png",
#                 ".gif",
#                 ".svg",
#                 ".pdf",
#                 ".zip",
#                 ".css",
#                 ".js",
#                 ".ico",
#                 ".mp4",
#                 ".mp3"

#             )

#             links = soup.find_all(
#                 "a",
#                 href=True
#             )

#             for link in links:

#                 href = link["href"]

#                 if href.startswith("mailto:"):
#                     continue

#                 if href.startswith("tel:"):
#                     continue

#                 full_url = normalize_url(

#                     urljoin(
#                         current_url,
#                         href
#                     )

#                 )

#                 parsed = urlparse(full_url)

#                 if parsed.netloc != domain:
#                     continue

#                 if full_url.lower().endswith(skip_extensions):
#                     continue

#                 if full_url not in visited and full_url not in queue:

#                     queue.append(full_url)

#                     print("Found:", full_url)

#         except Exception as e:

#             print("Error:", e)

#     driver.quit()

#     print("\nTotal Pages Crawled:", len(visited))

#     return "\n".join(collected_text)












# import time
# from selenium import webdriver
# from selenium.webdriver.chrome.service import Service
# from selenium.webdriver.chrome.options import Options
# from webdriver_manager.chrome import ChromeDriverManager
# from bs4 import BeautifulSoup
# from urllib.parse import urljoin, urlparse


# def clean_text(text):

#     bad_words = [
#         "what our clients say",
#         "testimonials",
#         "highly recommend",
#         "read more",
#         "click here",
#         "privacy policy",
#         "terms"
#     ]

#     lines = text.split("\n")
#     clean_lines = []

#     for line in lines:
#         line = line.strip()

#         if len(line) < 4:  #10
#             continue

#         if any(word in line.lower() for word in bad_words):
#             continue
        
#         if line not in clean_lines:
#             clean_lines.append(line)

#     return "\n".join(clean_lines)


# def crawl_website(start_url, max_pages=20):

#     visited = set()
#     # SPA hash routes (important for your site)
#     to_visit = [
#         start_url,
#         "https://www.novapexhub.com/#/about",
#         "https://www.novapexhub.com/#/services",
#         "https://www.novapexhub.com/#/contact"
#     ]
#     # to_visit = [start_url]
#     collected_text = []

#     domain = urlparse(start_url).netloc

#     chrome_options = Options()
#     chrome_options.add_argument("--headless")
#     chrome_options.add_argument("--disable-gpu")
#     chrome_options.add_argument("--no-sandbox")


#     driver = webdriver.Chrome(
#         service=Service(ChromeDriverManager().install()),
#         options=chrome_options
#     )

#     while to_visit and len(visited) < max_pages:

#         url = to_visit.pop(0)

#         if url in visited:
#             continue

#         try:
#             print("🔎 Crawling:", url)

#             driver.get(url)
#             time.sleep(4)

#             # scroll to load dynamic content
#             driver.execute_script(
#                 "window.scrollTo(0, document.body.scrollHeight);"
#             )

#             time.sleep(2)

#             soup = BeautifulSoup(driver.page_source, "html.parser")

#             for tag in soup(["script", "style", "noscript"]):
#                 tag.extract()

#             texts = []

#             for tag in soup.find_all(["h1", "h2", "h3", "p", "li"]):
#                 content = tag.get_text(strip=True)

#                 if len(content) < 4:
#                     continue

#                 texts.append(content)

#             text = clean_text("\n".join(texts))

#             # 🔥 DEBUG PRINT (ADD HERE)
#             print("\n===== PAGE CONTENT =====")
#             print("URL:", url)
#             print(text[:1500])   # first 1000 characters
#             print("========================\n")
            

#             if len(text) > 150:
#                 collected_text.append(f"\n--- PAGE: {url} ---\n{text}")
#                 print("✅ Extracted:", len(text))
#             else:
#                 print("⚠️ Low content skipped")
#             visited.add(url)


#             for link in soup.find_all("a", href=True):
                
#                 full_url = urljoin(url, link["href"])
#                 parsed = urlparse(full_url)

#                 if parsed.netloc == domain:

#                     if any(x in full_url for x in ["#", "mailto:", "tel:", ".jpg", ".png", ".pdf"]):
#                         continue

#                     if full_url not in visited and full_url not in to_visit:
#                         to_visit.append(full_url)
#                     print("➡️ Found link:", full_url)

#         except Exception as e:
#             print("❌ Error:", e)

#     driver.quit()

#     print("✅ Total pages crawled:", len(visited))

#     return "\n".join(collected_text)

