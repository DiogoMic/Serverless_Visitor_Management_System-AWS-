import json
import boto3
import logging
from datetime import datetime, timedelta
from decimal import Decimal

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS resources
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('VisitorRequest')
ses = boto3.client('ses', region_name='us-east-1')

# Constants
EXPIRATION_HOURS = 72  # 72 hours
SENDER_EMAIL = '*********' # Replace with your verified SES email

def lambda_handler(event, context):
    method = event['requestContext']['http']['method']
    path = event.get('rawPath', '')
    
    # For POST requests, parse the body
    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        access_code = body.get('AccessCode')
        action = body.get('action')
        
        if not access_code:
            return response(400, {"message": "Missing access code"})
            
        if action == 'check-in':
            return check_in(access_code)
        elif action == 'check-out':
            return check_out(access_code)
        elif action == 'get-details':
            return get_visitor(access_code)  # Reuse the get_visitor function
        else:
            return response(400, {"message": "Invalid or missing action"})
    
    # For GET requests, get from query parameters
    elif method == 'GET':
        access_code = event.get('queryStringParameters', {}).get('AccessCode')
        if not access_code:
            return response(400, {"message": "Missing access code"})
        return get_visitor(access_code)
    
    # Handle OPTIONS for CORS
    elif method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
            },
            'body': ''
        }
    
    else:
        return response(405, {"message": "Method not allowed"})

def get_visitor_data(access_code):
    """Helper function to get visitor data"""
    key = {
        'PK': f'VISITOR#{access_code}',
        'SK': 'META'
    }
    result = table.get_item(Key=key)
    return result.get('Item')

def get_visitor(access_code):
    """Get visitor details by access code"""
    try:
        item = get_visitor_data(access_code)
        if not item:
            return response(404, {"message": "Visitor not found"})
        
        # Check if visitor record has expired
        if 'ExpiresAt' in item:
            expires_at = int(item['ExpiresAt'])
            now = int(datetime.utcnow().timestamp())
            if now > expires_at:
                # Mark as expired and delete
                mark_as_expired_and_delete(access_code)
                return response(400, {"message": "Visitor access code has expired"})
                
        return response(200, item)
    except Exception as e:
        logger.error(f"Error retrieving visitor: {str(e)}")
        return response(500, {"message": "Error retrieving visitor information"})

def update_visitor_status(access_code, status, time_field):
    """Helper function to update visitor status"""
    now = datetime.utcnow().isoformat()
    key = {
        'PK': f'VISITOR#{access_code}',
        'SK': 'META'
    }
    result = table.update_item(
        Key=key,
        UpdateExpression=f"SET {time_field} = :t, #s = :s",
        ExpressionAttributeNames={"#s": "Status"},
        ExpressionAttributeValues={
            ':t': now,
            ':s': status
        },
        ReturnValues="ALL_NEW"
    )
    return result

def send_notification_email(visitor_data, status):
    """Send email notification to the person who created the visitor request"""
    try:
        creator_email = visitor_data.get('CreatedBy')
        visitor_name = f"{visitor_data.get('FirstName', '')} {visitor_data.get('LastName', '')}"
        access_code = visitor_data.get('AccessCode', '')
        
        if not creator_email:
            logger.warning(f"No creator email found for visitor {access_code}")
            return
        
        subject = f"Visitor {status} Notification"
        
        if status == 'CheckedIn':
            body_text = f"""Hello,

Your visitor {visitor_name} has checked in.

Visitor details:
- Access code: {access_code}
- Check-in time: {visitor_data.get('checkInTime', 'Not available')}

Thank you,
Visitor Management System
"""
        else:  # CheckedOut
            body_text = f"""Hello,

Your visitor {visitor_name} has checked out.

Visitor details:
- Access code: {access_code}
- Check-in time: {visitor_data.get('checkInTime', 'Not available')}
- Check-out time: {visitor_data.get('checkOutTime', 'Not available')}

Thank you,
Visitor Management System
"""
        
        ses.send_email(
            Source=SENDER_EMAIL,
            Destination={'ToAddresses': [creator_email]},
            Message={
                'Subject': {'Data': subject},
                'Body': {'Text': {'Data': body_text}}
            }
        )
        logger.info(f"Notification email sent to {creator_email} for visitor {access_code}")
    except Exception as e:
        logger.error(f"Error sending notification email: {str(e)}")
        # Continue even if email fails


def check_in(access_code):
    """Check in a visitor"""
    try:
        # First get current status
        visitor = get_visitor_data(access_code)
        if not visitor:
            return response(404, {"message": "Visitor not found"})
        
        # Validate visitor status
        current_status = visitor.get('Status')
        if current_status == 'CheckedIn':
            return response(400, {"message": "Visitor already checked in"})
        if current_status == 'CheckedOut':
            return response(400, {"message": "Visitor already completed their visit"})
        
        # Check if visitor record has expired
        if 'ExpiresAt' in visitor:
            expires_at = int(visitor['ExpiresAt'])
            now = int(datetime.utcnow().timestamp())
            if now > expires_at:
                # Mark as expired and delete
                mark_as_expired_and_delete(access_code)
                return response(400, {"message": "Visitor access code has expired"})
        
        # Proceed with check-in
        result = update_visitor_status(access_code, 'CheckedIn', 'checkInTime')
        updated_visitor = result['Attributes']
        
        # Send notification email
        send_notification_email(updated_visitor, 'CheckedIn')
        
        logger.info(f"Visitor {access_code} checked in successfully")
        return response(200, {"message": "Visitor checked in", "data": updated_visitor})
    except Exception as e:
        logger.error(f"Error checking in visitor: {str(e)}")
        return response(500, {"message": "Error processing check-in"})

def check_out(access_code):
    """Check out a visitor"""
    try:
        # First get current status
        visitor = get_visitor_data(access_code)
        if not visitor:
            return response(404, {"message": "Visitor not found"})
        
        # Validate visitor status
        current_status = visitor.get('Status')
        if current_status != 'CheckedIn':
            return response(400, {"message": "Visitor must be checked in before checking out"})
        
        # Proceed with check-out
        result = update_visitor_status(access_code, 'CheckedOut', 'checkOutTime')
        updated_visitor = result['Attributes']
        
        # Send notification email
        send_notification_email(updated_visitor, 'CheckedOut')
        
        logger.info(f"Visitor {access_code} checked out successfully")
        return response(200, {"message": "Visitor checked out", "data": updated_visitor})
    except Exception as e:
        logger.error(f"Error checking out visitor: {str(e)}")
        return response(500, {"message": "Error processing check-out"})

def convert_decimal(obj):
    """Helper function to convert Decimal to float or int for JSON serialization"""
    if isinstance(obj, list):
        return [convert_decimal(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_decimal(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    else:
        return obj

def mark_as_expired_and_delete(access_code):
    """Mark visitor record as expired and delete it"""
    try:
        key = {
            'PK': f'VISITOR#{access_code}',
            'SK': 'META'
        }
        
        # First update status to Expired (for audit logs)
        table.update_item(
            Key=key,
            UpdateExpression="SET #s = :s",
            ExpressionAttributeNames={"#s": "Status"},
            ExpressionAttributeValues={':s': 'Expired'}
        )
        
        # Then delete the item
        table.delete_item(Key=key)
        
        logger.info(f"Visitor {access_code} marked as expired and deleted")
    except Exception as e:
        logger.error(f"Error marking visitor as expired: {str(e)}")
        # We don't want to fail the main operation if cleanup fails
        # Just log the error and continue

def response(status_code, body):
    """Helper function to format API responses"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(convert_decimal(body))
    }
