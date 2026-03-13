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


def lambda_handler(event, context):

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

        result = {
            "location": {
                "latitude": lat,
                "longitude": lon
            },
            "uv_index": uv_index,
            "risk_level": risk,
            "time": current_time
        }

        return {
            "statusCode": 200,
            "body": json.dumps(result)
        }

    except Exception as e:

        print("ERROR:", str(e))

        return {
            "statusCode": 500,
            "body": json.dumps({
                "error": str(e)
            })
        }
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


def get_uv_message(uv):

    if uv < 3:
        return "UV level is low. It is generally safe to go outside."

    elif uv < 6:
        return "UV level is moderate. Consider wearing sunglasses and using sunscreen."

    elif uv < 8:
        return "High UV level. Sunburn may occur within 30 minutes. Wear a hat, sunglasses, and apply sunscreen."

    elif uv < 11:
        return "Very high UV level. Sunburn may occur within 20 minutes. Avoid outdoor activities between 10 AM and 2 PM and use strong sun protection."

    else:
        return "Extreme UV level. Sunburn may occur within 15 minutes. Stay indoors if possible and apply maximum sun protection."


def lambda_handler(event, context):

    try:

        params = event.get("queryStringParameters") or {}

        lat = float(params.get("lat", "-37.8136"))
        lon = float(params.get("lon", "144.9631"))

        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=uv_index"

        # External API call
        response = urllib.request.urlopen(url, timeout=3)

        data = json.loads(response.read())

        print(data)

        uv_index = data["current"]["uv_index"]
        current_time = data["current"]["time"]

        risk = get_risk_level(uv_index)

        message = get_uv_message(uv_index)

        # alert flag
        alert = uv_index >= 6

        result = {
            "location": {
                "latitude": lat,
                "longitude": lon
            },
            "uv_index": uv_index,
            "risk_level": risk,
            "alert": alert,
            "message": message,
            "time": current_time
        }

        return {
            "statusCode": 200,
            "body": json.dumps(result)
        }

    except Exception as e:

        print("ERROR:", str(e))

        return {
            "statusCode": 500,
            "body": json.dumps({
                "error": str(e)
            })
        }
