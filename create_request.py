import json
import boto3
import random
import logging
from datetime import datetime, timedelta

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize clients outside handler for better cold start performance
dynamodb = boto3.client('dynamodb')
ses = boto3.client('ses', region_name='us-east-1')

# Constants
TABLE_NAME = 'VisitorRequest'
SENDER_EMAIL = 'contact@diogomic.me'
EXPIRATION_HOURS = 72  # Visitor code expiration time in hours

def lambda_handler(event, context):
    try:
        # Parse request body
        body = json.loads(event['body']) if isinstance(event.get('body'), str) else event
        
        # Generate access code
        access_code = str(random.randint(100000, 999999))
        
        # Calculate expiration time
        estimated_arrival = body['estimatedArrival']
        arrival_dt = datetime.fromisoformat(estimated_arrival.replace("Z", "+00:00"))
        expires_at = int((arrival_dt + timedelta(hours=EXPIRATION_HOURS)).timestamp())
        
        # Build DynamoDB item
        item = {
            'PK': {'S': f'VISITOR#{access_code}'},
            'SK': {'S': 'META'},
            'FirstName': {'S': body['firstName']},
            'LastName': {'S': body['lastName']},
            'Email': {'S': body['email']},
            'Phone': {'S': body['phone']},
            'VisitType': {'S': body['visitType']},
            'StaffToVisit': {'S': body['staffToVisit']},
            'EstimatedArrival': {'S': estimated_arrival},
            'MultiDayVisit': {'BOOL': body['multiDayVisit']},
            'Reason': {'S': body['reason']},
            'IdentityCard': {'S': body['identityCard']},
            'AccessCode': {'S': access_code},
            'CreatedBy': {'S': body['createdBy']},
            'CreatedAt': {'S': datetime.utcnow().isoformat()},
            'Status': {'S': 'Pending'},
            'ExpiresAt': {'N': str(expires_at)}
        }
        
        # Add multi-day visit dates if applicable
        if body['multiDayVisit']:
            if 'startDate' not in body or 'endDate' not in body:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Multi-day visits require startDate and endDate'})
                }
            item['StartDate'] = {'S': body['startDate']}
            item['EndDate'] = {'S': body['endDate']}
        
        # Save to DynamoDB
        try:
            dynamodb.put_item(TableName=TABLE_NAME, Item=item)
            logger.info(f"Visitor request created with access code: {access_code}")
        except Exception as db_error:
            logger.error(f"DynamoDB error: {str(db_error)}")
            raise db_error
        
        # Send email notification
        email_body = f"""Hello {body['firstName']},

You have been scheduled to visit our facility.

Here is your access code: {access_code}
Estimated arrival: {estimated_arrival}
This code expires {EXPIRATION_HOURS} hours after the estimated arrival.

Thank you,
Visitor Management Team"""

        try:
            ses.send_email(
                Source=SENDER_EMAIL,
                Destination={'ToAddresses': [body['email']]},
                Message={
                    'Subject': {'Data': "Your Visitor Access Code"},
                    'Body': {'Text': {'Data': email_body}}
                }
            )
            logger.info(f"Email sent to {body['email']}")
        except Exception as email_error:
            logger.error(f"Email sending error: {str(email_error)}")
            # Continue even if email fails, but log it
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'message': 'Visitor request created and email sent',
                'accessCode': access_code
            })
        }
        
    except KeyError as e:
        logger.error(f"Missing required field: {str(e)}")
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Missing required field: {str(e)}'})
        }
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Failed to create visitor request or send email'})
        }
