import boto3
import csv
import io
import json

# This function used for AC 2.2.3

def lambda_handler(event, context):
    # expected params input:
    # {
    #   "skin_type": 1
    # }
    skin_type = event.get("skin_type")
    if skin_type is None:
        return {
            "statusCode": 400,
            "body": json.dumps({
                "error": "Missing required field: skin_type"
            })
        }

    # Ensure skin_type is integer
    try:
        skin_type = int(skin_type)
    except (TypeError, ValueError):
        return {
            "statusCode": 400,
            "body": json.dumps({
                "error": "skin_type must be an integer"
            })
        }

    # Check valid range
    if skin_type < 1 or skin_type > 4:
        return {
            "statusCode": 400,
            "body": json.dumps({
                "error": "skin_type must be between 1 and 4"
            })
        }

    try: 
        response = boto3.client('s3').get_object(
            Bucket='sun-safety-data-te30',
            Key='skin_type_advice.json'
        )

        data = json.loads(response['Body'].read())
        for item in data["fitzpatrick_types"]:
            if item["type"] == skin_type:
                return {
                    'statusCode': 200,
                    'body': item
                }
                
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({
                "error": "Internal server error",
                "message": str(e)
            })
        }
