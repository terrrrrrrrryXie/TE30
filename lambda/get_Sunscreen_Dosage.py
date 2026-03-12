import json
import urllib.request


def get_risk_level(uv):

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
    if uv < 3:
        return {
            "label": "Low coverage",
            "estimated_amount": "Minimal sunscreen needed for short outdoor exposure."
        }
    elif uv < 6:
        return {
            "label": "Moderate coverage",
            "estimated_amount": "Apply a light amount of sunscreen to exposed skin."
        }
    elif uv < 8:
        return {
            "label": "High coverage",
            "estimated_amount": "Apply a full and even layer of sunscreen to all exposed skin."
        }
    elif uv < 11:
        return {
            "label": "Very high coverage",
            "estimated_amount": "Apply a generous amount of SPF 50+ sunscreen to all exposed skin."
        }
    else:
        return {
            "label": "Maximum coverage",
            "estimated_amount": "Apply maximum SPF 50+ coverage and minimise direct sun exposure."
        }   
    
def get_usage_guidance(uv):
    if uv < 3:
        return [
            "Basic sun protection is recommended for long outdoor exposure.",
            "Use sunglasses if needed."
        ]
    elif uv < 6:
        return [
            "Apply sunscreen before going outdoors.",
            "Cover exposed skin evenly.",
            "Reapply if outdoors for an extended period."
        ]
    else:
        return [
            "Apply SPF 50+ sunscreen 20 minutes before going outdoors.",
            "Cover all exposed skin evenly.",
            "Reapply every 2 hours or after sweating or swimming."
        ]    

def get_protection_explanation(uv):
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
    # TODO implement
    try:

        params = event.get("queryStringParameters") or {}

        lat = float(params.get("lat", "-37.8136"))
        lon = float(params.get("lon", "144.9631"))

        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=uv_index"

        # External API call with timeout
        response = urllib.request.urlopen(url, timeout=3)

        data = json.loads(response.read())

        # Debug log (CloudWatch)
        print(data)

        uv_index = data["current"]["uv_index"]
        current_time = data["current"]["time"]

        risk = get_risk_level(uv_index)
        dosage = get_sunscreen_dosage(uv_index)
        guidance = get_usage_guidance(uv_index)
        protection_explanation = get_protection_explanation(uv_index)

        result = {
            "location": {
                "lat": lat,
                "lon": lon
            },
            "uv_index": uv_index,
            "risk_level": risk,
            "dosage": dosage,
            "guidance": guidance,
            "protection_explanation": protection_explanation,
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