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


def get_clothing_recommendation(uv, temperature):
    """
    Returns clothing recommendations based on UV index and temperature.
    Temperature categories: Hot (>25°C), Warm (15-25°C), Cold (<15°C)
    """
    is_hot = temperature > 25
    is_cold = temperature < 15

    # Low UV (< 3)
    if uv < 3:
        if is_hot:
            return {
                "materials": [
                    "Light and breathable cotton",
                    "Moisture-wicking fabrics"
                ],
                "recommended_items": [
                    "Sunglasses",
                    "Light hat or cap",
                    "Loose-fitting t-shirt or tank top"
                ]
            }
        elif is_cold:
            return {
                "materials": [
                    "Warm layered clothing",
                    "Insulated fabrics"
                ],
                "recommended_items": [
                    "Warm jacket or sweater",
                    "Long pants",
                    "Beanie or warm hat"
                ]
            }
        else:
            return {
                "materials": [
                    "Light cotton clothing",
                    "Breathable fabrics"
                ],
                "recommended_items": [
                    "Sunglasses",
                    "Light hat",
                    "Comfortable casual wear"
                ]
            }

    # Moderate UV (3-6)
    elif uv < 6:
        if is_hot:
            return {
                "materials": [
                    "Lightweight tightly woven cotton",
                    "Breathable UV-protective fabrics"
                ],
                "recommended_items": [
                    "Wide-brim hat",
                    "Sunglasses",
                    "Light long-sleeve shirt for sun protection"
                ]
            }
        elif is_cold:
            return {
                "materials": [
                    "Warm tightly woven fabrics",
                    "Layered clothing with UV protection"
                ],
                "recommended_items": [
                    "Warm jacket with collar",
                    "Long pants",
                    "Sunglasses",
                    "Warm hat"
                ]
            }
        else:
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

    # High UV (6-8)
    elif uv < 8:
        if is_hot:
            return {
                "materials": [
                    "Lightweight UPF-rated fabrics",
                    "Breathable sun-protective clothing"
                ],
                "recommended_items": [
                    "Wide-brim hat",
                    "UV protective sunglasses",
                    "Lightweight long-sleeve UV shirt",
                    "Light-colored clothing to stay cool"
                ]
            }
        elif is_cold:
            return {
                "materials": [
                    "Warm UPF-rated fabrics",
                    "Insulated sun-protective clothing"
                ],
                "recommended_items": [
                    "Wide-brim hat or warm beanie",
                    "UV protective sunglasses",
                    "Warm long-sleeve jacket",
                    "Long pants"
                ]
            }
        else:
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

    # Very High UV (8-11)
    elif uv < 11:
        if is_hot:
            return {
                "materials": [
                    "Lightweight UPF 50+ fabrics",
                    "Moisture-wicking sun-protective clothing"
                ],
                "recommended_items": [
                    "Wide-brim hat",
                    "UV-blocking sunglasses",
                    "Lightweight long-sleeve UPF shirt",
                    "Light-colored loose clothing"
                ]
            }
        elif is_cold:
            return {
                "materials": [
                    "Warm UPF 50+ fabrics",
                    "Insulated UV-protective layers"
                ],
                "recommended_items": [
                    "Wide-brim hat",
                    "UV-blocking sunglasses",
                    "Warm long-sleeve UPF jacket",
                    "Long pants with UV protection"
                ]
            }
        else:
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

    # Extreme UV (>= 11)
    else:
        if is_hot:
            return {
                "materials": [
                    "Lightweight UPF 50+ clothing",
                    "Maximum breathable sun protection"
                ],
                "recommended_items": [
                    "Wide-brim hat",
                    "UV-blocking sunglasses",
                    "Full coverage lightweight UPF clothing",
                    "Seek shade whenever possible"
                ]
            }
        elif is_cold:
            return {
                "materials": [
                    "Warm UPF 50+ clothing",
                    "Full coverage insulated sun protection"
                ],
                "recommended_items": [
                    "Wide-brim hat",
                    "UV-blocking sunglasses",
                    "Warm full coverage UPF clothing",
                    "Minimize direct sun exposure"
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


def get_clothing_explanation(uv, temperature):
    """
    Returns explanation based on UV index and temperature.
    """
    is_hot = temperature > 25
    is_cold = temperature < 15

    # Temperature context
    if is_hot:
        temp_context = "With high temperatures, choose lightweight and breathable fabrics to stay cool while protected."
    elif is_cold:
        temp_context = "With cooler temperatures, layered clothing provides both warmth and UV protection."
    else:
        temp_context = "Current temperatures are comfortable for most outdoor clothing options."

    # UV context
    if uv < 3:
        uv_context = (
            "Low UV levels mean minimal sun protection is needed. "
            "Basic clothing choices are usually sufficient."
        )
    elif uv < 6:
        uv_context = (
            "Moderate UV levels mean some sun protection is recommended. "
            "Tightly woven fabrics help reduce UV exposure."
        )
    elif uv < 8:
        uv_context = (
            "High UV levels require good sun protection. "
            "Long sleeves and hats help protect exposed skin."
        )
    elif uv < 11:
        uv_context = (
            "Very high UV levels require strong sun protection. "
            "UPF-rated clothing significantly reduces UV exposure."
        )
    else:
        uv_context = (
            "Extreme UV levels can damage skin quickly. "
            "Full coverage UV-protective clothing is essential."
        )

    return f"{uv_context} {temp_context}"

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
        clothing = get_clothing_recommendation(uv_index, temperature)
        explanation = get_clothing_explanation(uv_index, temperature)
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