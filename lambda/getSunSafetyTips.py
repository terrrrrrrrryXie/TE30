import boto3
import csv
import io
import json
# This function used for AC 2.1.3

# Read tips data based on UV Index from S3
uv_tips_response = boto3.client('s3').get_object(
    Bucket='sun-safety-data-te30',
    Key='safety_tips.csv'
)

file_content = uv_tips_response['Body'].read().decode('utf-8')
csv_reader = csv.DictReader(io.StringIO(file_content))
uv_tips_data = []

# Convert csv to json
for row in csv_reader:
    uv_tips_data.append({
        "risk_category": row["risk_category"],
        "colour": row["colour"],
        "min_uv": int(row["min_uv"]),
        "max_uv": int(row["max_uv"]),
        "message": row["message"]
    })

# Find according tips based on provided uv index
def find_uv_info(uv_index):
    for uv_level in uv_tips_data:
        if uv_level["min_uv"] <= uv_index <= uv_level["max_uv"]:
            return uv_level
    return None

# Read tips data based on city from S3
city_tips_response = boto3.client('s3').get_object(
            Bucket='sun-safety-data-te30',
            Key='tips_by_location.json'
        )

# Store as json
city_tips_data = json.loads(city_tips_response['Body'].read())

# Find according tips based on provided location
def find_location_info(city, state):
    cities = city_tips_data["cities"]

    city = (city or "").strip().lower()
    state = (state or "").strip().lower()

    # If provided city matchable, search by city
    # if not matchable search by state
    # otherwise just use default tips
    state_match = None
    default_match = None

    for item in cities:
        item_city = item.get("city", "").strip().lower()
        item_state = item.get("state", "").strip().lower()

        if item_city == city and city:
            return item

        if item_state == state and state and state_match is None:
            state_match = item

        if item.get("default") == "True":
            default_match = item

    if state_match:
        return state_match

    else:
        return default_match

def lambda_handler(event, context):
    try:
        uv_index = event.get("uv_index")
        city = event.get("city")
        state = event.get("state")

        # No missing param
        if (uv_index is None) or (city is None) or (state is None):
            return {
                "statusCode": 400,
                "body": json.dumps({
                    "error": "Missing required field"
                })
            }

        try:
            uv_index = float(uv_index)
        except (TypeError, ValueError):
            return {
                "statusCode": 400,
                "body": json.dumps({
                    "error": "uv index must be a number"
                })
            }

        uv_info = find_uv_info(uv_index)

        # uv index should be within range
        if not uv_info:
            return {
                "statusCode": 404,
                "body": json.dumps({
                    "error": "Invalid UV Index"
                })
            }

        location_info = find_location_info(city, state)

        response_body = {
            "uv_index": uv_index,
            "location": {
                "city": city,
                "state": state
            },
            "risk_category": uv_info["risk_category"],
            "colour": uv_info["colour"],
            "tips": uv_info["message"],
            "location_tips": location_info.get("tips", []),
            "final_tips": [uv_info["message"]] + location_info.get("tips", [])
        }

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps(response_body)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({
                "error": "Not Sure What Happend",
                "message": str(e)
            })
        }