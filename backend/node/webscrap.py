from bs4 import BeautifulSoup
import requests
import json
from searchurl import search_serper
import os
import sys

def scrape_webpage(url):
    """Scrape clean text content from a webpage."""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
    }
    try:
        response = requests.get(url, timeout=15, headers=headers)
        if response.status_code != 200:
            print(f"Failed to retrieve {url} | Status code: {response.status_code}", file=sys.stderr)
            return ""

        soup = BeautifulSoup(response.content, 'html.parser')

        # Remove unwanted elements
        for tag in soup(['script', 'style', 'noscript', 'iframe']):
            tag.decompose()

        # Extract readable text
        text = soup.get_text(separator=' ', strip=True)
        return text

    except Exception as e:
        print(f"Error scraping {url}: {e}", file=sys.stderr)
        return ""

