import json
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super(DecimalEncoder, self).default(obj)

# Initialize resources outside handler for better cold start performance
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('VisitorRequest')

def lambda_handler(event, context):
    try:
        # Safely get query parameters
        query_params = event.get('queryStringParameters', {}) or {}
        user_email = query_params.get('email')
        status = query_params.get('status')  # Optional status filter
        
        if not user_email:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Missing email parameter'})
            }
        
        # Query based on whether status filter is provided
        if status:
            # Filter by both email and status
            response = table.query(
                IndexName='GSI_UserStatus',
                KeyConditionExpression=Key('CreatedBy').eq(user_email) & Key('Status').eq(status)
            )
        else:
            # Only filter by email, get all statuses
            # We need to query each status separately since GSI requires both partition and sort key
            statuses = ['Pending', 'CheckedIn', 'CheckedOut']
            all_items = []
            
            for status_value in statuses:
                status_response = table.query(
                    IndexName='GSI_UserStatus',
                    KeyConditionExpression=Key('CreatedBy').eq(user_email) & Key('Status').eq(status_value)
                )
                all_items.extend(status_response.get('Items', []))
        
        # Return all items or filtered items
        items_to_return = all_items if not status else response.get('Items', [])
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(items_to_return, cls=DecimalEncoder)
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': f'Error retrieving visitor history: {str(e)}'})
        }
