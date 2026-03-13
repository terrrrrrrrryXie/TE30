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
    """Returns recommended materials and items based on UV level."""
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
        # Extreme UV - go full ninja mode
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
    """Explains why we recommend these clothes."""
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


def lambda_handler(event, context):
    """Main handler - fetches UV data and returns clothing advice."""
    try:

        params = event.get("queryStringParameters") or {}

        lat = float(params.get("lat", "-37.8136"))
        lon = float(params.get("lon", "144.9631"))

        # Fetch UV index from Open-Meteo
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=uv_index"

        response = urllib.request.urlopen(url, timeout=3)

        data = json.loads(response.read())

        print(data)  # CloudWatch logging

        uv_index = data["current"]["uv_index"]
        current_time = data["current"]["time"]

        # Get all the recommendations
        risk = get_risk_level(uv_index)

        clothing = get_clothing_recommendation(uv_index)

        explanation = get_clothing_explanation(uv_index)

        # Build response
        result = {

            "location": {
                "lat": lat,
                "lon": lon
            },

            "uv_index": uv_index,

            "risk_level": risk,

            "clothing_materials": clothing["materials"],

            "recommended_items": clothing["recommended_items"],

            "explanation": explanation,

            "timestamp": current_time
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