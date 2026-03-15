import json
import urllib.parse
import urllib.request
import os
from datetime import datetime, timedelta

# This function used for AC 2.1.4

def lambda_handler(event, context):
    # only display UV-related news(if title includes "uv"/"ultraviolet")
    query = {
        "$query": {
            "$and": [
                {
                    "lang": "eng"
                },
                {
                    "$or": [
                        {"keyword": "uv", "keywordLoc": "title"},
                        {"keyword": "ultraviolet", "keywordLoc": "title"}
                    ]
                }
            ]
        }
    }

    params = {
        "apiKey": "4b984e6e-dabe-439c-b87a-1de2157b1ada",
        "query": json.dumps(query)
    }

    url = "https://eventregistry.org/api/v1/article/getArticles?" + urllib.parse.urlencode(params)

    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode("utf-8"))

        results = data.get("articles", {}).get("results", [])

        news = []
        today = datetime.now().date()
        three_days_ago = today - timedelta(days=3)

        for article in results:
            article_date = datetime.strptime(article.get("date"), "%Y-%m-%d").date()

            if three_days_ago <= article_date <= today:
                news.append({
                    "uri": article.get("uri"),
                    "title": article.get("title"),
                    "source": article.get("source", {}).get("title"),
                    "url": article.get("url"),
                    "date": article.get("date"),
                    "image": article.get("image")
                })

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "count": len(news),
                "news": news
            })
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({
                "error": str(e)
            })
        }