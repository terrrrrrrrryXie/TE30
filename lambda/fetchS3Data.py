import boto3
import csv
import io
import json

# This function used for AC 2.1.2

def lambda_handler(event, context):
    file_name = event.get("file_name")

    if not file_name:
        return {
            "statusCode": 400,
            "body": json.dumps({
                "error": "Invalid Filename"
            })
        }

    try:
        response = boto3.client('s3').get_object(
            Bucket='sun-safety-data-te30',
            Key=file_name
        )

        file_content = response['Body'].read().decode('utf-8')
        rows = list(csv.DictReader(io.StringIO(file_content)))

        return {
            "statusCode": 200,
            "body": json.dumps(rows)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({
                "error": "Failed to read CSV from S3",
                "message": str(e)
            })
        }