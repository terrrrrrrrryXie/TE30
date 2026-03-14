"""
Clothing Recommendation Lambda: what to wear based on UV levels.
"""

import json
import urllib.request


def get_risk_level(uv):
    """Maps UV index to a human readable risk level."""
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


def get_clothing_recommendation(uv):

    if uv < 3:
        return {
            "materials": [
                "Light cotton clothing",
                "Breathable fabrics"
            ],
            "recommended_items": [
                "Sunglasses",
                "Light hat"
            ]
        }

    elif uv < 6:
        return {
            "materials": [
                "Tightly woven cotton",
                "Breathable long-sleeve fabrics"
            ],
            "recommended_items": [
                "Hat",
                "Sunglasses",
                "Light long-sleeve shirt"
            ]
        }

    elif uv < 8:
        return {
            "materials": [
                "Tightly woven fabrics",
                "Denim or canvas materials"
            ],
            "recommended_items": [
                "Wide-brim hat",
                "Long sleeve shirt",
                "UV protective sunglasses"
            ]
        }

    elif uv < 11:
        return {
            "materials": [
                "UPF-rated UV protective fabrics",
                "Tightly woven clothing"
            ],
            "recommended_items": [
                "Wide-brim hat",
                "Long sleeve UV-protective shirt",
                "Sunglasses with UV protection"
            ]
        }

    else:
        return {
            "materials": [
                "UPF-rated clothing",
                "Full coverage UV protective fabrics"
            ],
            "recommended_items": [
                "Wide-brim hat",
                "Full sleeve UV protective clothing",
                "UV-blocking sunglasses"
            ]
        }


def get_clothing_explanation(uv):

    if uv < 3:
        return (
            "Light clothing and basic sun protection are usually sufficient "
            "during low UV conditions. However, wearing sunglasses and hats "
            "can still help protect sensitive areas."
        )

    elif uv < 6:
        return (
            "Moderate UV levels mean some protection is needed. "
            "Clothing made from tightly woven fabrics helps reduce "
            "UV exposure to the skin."
        )

    elif uv < 8:
        return (
            "At high UV levels, clothing becomes an important barrier "
            "against UV radiation. Long sleeves and hats help protect "
            "areas such as the arms, neck, and face."
        )

    elif uv < 11:
        return (
            "Very high UV levels require strong sun protection. "
            "UPF-rated clothing and wide-brim hats significantly reduce "
            "UV exposure to sensitive areas of the body."
        )

    else:
        return (
            "Extreme UV levels can damage skin very quickly. "
            "Full coverage clothing and UV-protective fabrics help "
            "minimise direct sun exposure."
        )

def get_weather_condition(weather_code):
    weather_map = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        56: "Light freezing drizzle",
        57: "Dense freezing drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        66: "Light freezing rain",
        67: "Heavy freezing rain",
        71: "Slight snow fall",
        73: "Moderate snow fall",
        75: "Heavy snow fall",
        77: "Snow grains",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        85: "Slight snow showers",
        86: "Heavy snow showers",
        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail"
    }
    return weather_map.get(weather_code, "Unknown")


def lambda_handler(event, context):
    try:

        params = event.get("queryStringParameters") or {}

        lat = float(params.get("lat", "-37.8136"))
        lon = float(params.get("lon", "144.9631"))

        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            f"&current=temperature_2m,weather_code"
            f"&hourly=uv_index"
        )

        response = urllib.request.urlopen(url, timeout=3)

        data = json.loads(response.read())

        print(data)

        current = data.get("current", {})
        hourly = data.get("hourly", {})
        uv_index = hourly.get("uv_index", [0])[0]
        temperature = current.get("temperature_2m")
        weather_code = current.get("weather_code")
        current_time = current.get("time")

        if uv_index is None:
            raise ValueError("UV index not found in weather response")

        risk = get_risk_level(uv_index)
        clothing = get_clothing_recommendation(uv_index)
        explanation = get_clothing_explanation(uv_index)
        condition = get_weather_condition(weather_code)

        result = {

            "location": {
                "lat": lat,
                "lon": lon
            },

            "uv_index": uv_index,

            "risk_level": risk,

            "temperature": temperature,

            "weather_code": weather_code,

            "condition": condition,

            "clothing_materials": clothing["materials"],

            "recommended_items": clothing["recommended_items"],

            "explanation": explanation,

            "timestamp": current_time
        }

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS"
            },
            "body": json.dumps(result)
        }

    except Exception as e:

        print("ERROR:", str(e))

        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS"
            },
            "body": json.dumps({
                "error": str(e)
            })
        }