import json
import boto3
import uuid
from datetime import datetime, timedelta

scheduler = boto3.client("scheduler")
ses = boto3.client("ses")

SENDER_EMAIL = "ann165ann42@gmail.com"

LAMBDA_ARN = "arn:aws:lambda:ap-southeast-2:479394266406:function:getSunscreenReminder"

ROLE_ARN = "arn:aws:iam::479394266406:role/service-role/Amazon_EventBridge_Scheduler_LAMBDA_1ef1c756fc"


def lambda_handler(event, context):

    print("EVENT:", event)

    # -------- scheduler trigger --------
    if event.get("action") == "send_email":

        email = event["email"]

        ses.send_email(
            Source=SENDER_EMAIL,
            Destination={"ToAddresses": [email]},
            Message={
                "Subject": {"Data": "Sunscreen Reminder ☀️"},
                "Body": {
                    "Text": {
                        "Data": "Time to reapply your sunscreen!"
                    }
                },
            },
        )

        print("EMAIL SENT")

        return {"status": "email sent"}

    # -------- API gateway trigger --------

    body = json.loads(event["body"])
    email = body["email"]

    schedule_reminder(email, 0.02)
    schedule_reminder(email, 0.04)  # for testing

    return {
        "statusCode": 200,
        "body": json.dumps("Reminder scheduled"),
    }


def schedule_reminder(email, hours):

    run_time = datetime.utcnow() + timedelta(hours=hours)

    scheduler.create_schedule(
        Name="reminder-" + str(uuid.uuid4()),

        ScheduleExpression=f"at({run_time.strftime('%Y-%m-%dT%H:%M:%S')})",

        FlexibleTimeWindow={"Mode": "OFF"},

        Target={
            "Arn": LAMBDA_ARN,
            "RoleArn": ROLE_ARN,
            "Input": json.dumps(
                {
                    "action": "send_email",
                    "email": email,
                }
            ),
        },

        ActionAfterCompletion="DELETE",
    )