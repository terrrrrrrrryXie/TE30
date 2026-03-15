"""
Sunscreen Dosage Lambda Function

This feature fetches UV index data and provides sunscreen dosage guidance.
"""

import json
import urllib.request


def get_risk_level(uv):
    """
    Figures out how dangerous the sun is right now.
    """
    if uv < 3:
        return "Low"
    elif uv < 6:
        return "Moderate"
    elif uv < 8:
        return "High"
    elif uv < 11:
        return "Very High"
    else:
        return "Extreme"


def get_sunscreen_dosage(uv):
    """
    How much sunscreen to slap on based on UV level.
    Returns tsp, pumps, and reapply interval.
    """
    if uv < 3:
        return {
            "tsp": 0.5,
            "pumps": 2,
            "reapply_minutes": 180
        }
    elif uv < 6:
        return {
            "tsp": 1,
            "pumps": 4,
            "reapply_minutes": 150
        }
    elif uv < 8:
        return {
            "tsp": 1.5,
            "pumps": 6,
            "reapply_minutes": 120
        }
    elif uv < 11:
        return {
            "tsp": 2,
            "pumps": 8,
            "reapply_minutes": 90
        }
    else:
        return {
            "tsp": 2.5,
            "pumps": 10,
            "reapply_minutes": 60
        }


def get_usage_guidance(uv):
    """
    Gives practical tips on how to use sunscreen properly.
    """
    if uv < 3:
        return [
            "Basic sun protection is recommended for long outdoor exposure.",
            "Use sunglasses if needed."
        ]
    elif uv < 6:
        return [
            "Apply sunscreen before going outdoors.",
            "Cover exposed skin evenly.",
            "Reapply after swimming or heavy sweating."
        ]
    else:
        return [
            "Apply SPF 50+ sunscreen 20 minutes before going outdoors.",
            "Cover all exposed skin evenly.",
            "Reapply after swimming or heavy sweating."
        ]


def get_protection_explanation(uv):
    """
    Explains why users need that much sunscreen in plain English.
    """
    if uv < 3:
        return (
            "A basic amount of sunscreen can help protect exposed skin during low UV conditions, "
            "especially during prolonged outdoor exposure."
        )
    elif uv < 6:
        return (
            "A moderate and even layer of sunscreen improves skin coverage and helps reduce the "
            "risk of UV-related skin irritation or sun damage."
        )
    elif uv < 8:
        return (
            "A full and even layer of sunscreen is recommended because higher UV levels increase "
            "the chance of skin damage during outdoor activities."
        )
    elif uv < 11:
        return (
            "A generous amount of sunscreen helps provide stronger UV protection coverage, which is "
            "important under very high UV conditions to reduce the risk of sunburn and skin damage."
        )
    else:
        return (
            "At extreme UV levels, maximum sunscreen coverage is important because UV radiation can "
            "damage skin more quickly. A sufficient amount helps improve protection across exposed skin."
        )


def lambda_handler(event, context):
    """
    The main entry point for our Lambda function.
    Takes in location coords, fetches UV data, and returns sunscreen advice.
    """
    try:
        # Grab query params from the request, or use Melbourne as default
        params = event.get("queryStringParameters") or {}

        # Default coords point to Melbourne
        lat = float(params.get("lat", "-37.8136"))
        lon = float(params.get("lon", "144.9631"))

        # Build the URL for the Open-Meteo API
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=uv_index"

        # Hit the external API, but don't wait forever (3 sec timeout)
        response = urllib.request.urlopen(url, timeout=3)

        # Parse the JSON response
        data = json.loads(response.read())

        # Debug log (CloudWatch)
        print(data)

        uv_index = data["current"]["uv_index"]

        # Build the response with all sunscreen guidance
        result = {
            "location": {
                "lat": lat,
                "lon": lon
            },
            "uv_index": uv_index,
            "risk_level": get_risk_level(uv_index),
            "dosage": get_sunscreen_dosage(uv_index),
            "guidance": get_usage_guidance(uv_index),
            "protection_explanation": get_protection_explanation(uv_index)
        }
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps(result)
        }

    except Exception as e:
        print("ERROR:", str(e))

        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "error": str(e)
            })
        }