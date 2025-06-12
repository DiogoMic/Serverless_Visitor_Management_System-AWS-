# main.tf

provider "aws" {
  region = "us-east-1"
}

# DynamoDB Table
resource "aws_dynamodb_table" "visitor_table" {
  name           = "VisitorRequest"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "PK"
  range_key      = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "CreatedBy"
    type = "S"
  }

  attribute {
    name = "Status"
    type = "S"
  }

  global_secondary_index {
    name               = "GSI_UserStatus"
    hash_key           = "CreatedBy"
    range_key          = "Status"
    projection_type    = "ALL"
  }

  tags = {
    Name        = "VisitorRequestTable"
    Environment = "Production"
  }
}

# S3 Bucket for Analytics
resource "aws_s3_bucket" "analytics_bucket" {
  bucket = "visitor-analytics-data"
  acl    = "private"

  tags = {
    Name        = "VisitorAnalyticsBucket"
    Environment = "Dev"
  }
}

# IAM Role for Lambda Functions
resource "aws_iam_role" "lambda_role" {
  name = "visitor_management_lambda_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for Lambda Functions
resource "aws_iam_policy" "lambda_policy" {
  name        = "visitor_management_lambda_policy"
  description = "Policy for Visitor Management Lambda Functions"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Effect   = "Allow"
        Resource = [
          aws_dynamodb_table.visitor_table.arn,
          "${aws_dynamodb_table.visitor_table.arn}/index/*"
        ]
      },
      {
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Effect   = "Allow"
        Resource = [
          aws_s3_bucket.analytics_bucket.arn,
          "${aws_s3_bucket.analytics_bucket.arn}/*"
        ]
      },
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# Attach Policy to Role
resource "aws_iam_role_policy_attachment" "lambda_policy_attachment" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}

# Lambda Functions
resource "aws_lambda_function" "create_request" {
  filename      = "lambda/create_request.zip"
  function_name = "create_request"
  role          = aws_iam_role.lambda_role.arn
  handler       = "create_request.lambda_handler"
  runtime       = "python3.12"
  timeout       = 60

  environment {
    variables = {
      TABLE_NAME   = aws_dynamodb_table.visitor_table.name # DynamoDB table name
      SENDER_EMAIL = "your verified email address here"
    }
  }
}

resource "aws_lambda_function" "get_visitor_history" {
  filename      = "lambda/getVisitorHistory.zip"
  function_name = "getVisitorHistory"
  role          = aws_iam_role.lambda_role.arn
  handler       = "getVisitorHistory.lambda_handler"
  runtime       = "python3.12"
  timeout       = 60

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.visitor_table.name
    }
  }
}

resource "aws_lambda_function" "visitor_security_handler" {
  filename      = "lambda/visitorsecurityhandler.zip"
  function_name = "visitorsecurityhandler"
  role          = aws_iam_role.lambda_role.arn
  handler       = "visitorsecurityhandler.lambda_handler"
  runtime       = "python3.12"
  timeout       = 60

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.visitor_table.name
    }
  }
}

resource "aws_lambda_function" "get_all_visitors" {
  filename      = "lambda/getAllVisitors.zip"
  function_name = "getAllVisitors"
  role          = aws_iam_role.lambda_role.arn
  handler       = "getAllVisitors.lambda_handler"
  runtime       = "python3.12"
  timeout       = 60

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.visitor_table.name
    }
  }
}

resource "aws_lambda_function" "export_visitor_data" {
  filename      = "lambda/exportVisitorData.zip"
  function_name = "exportVisitorData"
  role          = aws_iam_role.lambda_role.arn
  handler       = "exportVisitorData.lambda_handler"
  runtime       = "python3.12"
  timeout       = 60

  environment {
    variables = {
      TABLE_NAME  = aws_dynamodb_table.visitor_table.name
      BUCKET_NAME = aws_s3_bucket.analytics_bucket.id
    }
  }
}

# API Gateway
resource "aws_apigatewayv2_api" "visitor_api" {
  name          = "visitor-management-api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_stage" "dev" {
  api_id      = aws_apigatewayv2_api.visitor_api.id
  name        = "Dev"
  auto_deploy = true
}

# API Gateway Routes
resource "aws_apigatewayv2_integration" "create_request_integration" {
  api_id             = aws_apigatewayv2_api.visitor_api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.create_request.invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "create_request_route" {
  api_id    = aws_apigatewayv2_api.visitor_api.id
  route_key = "POST /VisitorRequestPayload"
  target    = "integrations/${aws_apigatewayv2_integration.create_request_integration.id}"
}

resource "aws_apigatewayv2_integration" "get_visitor_history_integration" {
  api_id             = aws_apigatewayv2_api.visitor_api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.get_visitor_history.invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "get_visitor_history_route" {
  api_id    = aws_apigatewayv2_api.visitor_api.id
  route_key = "GET /getVisitorHistory"
  target    = "integrations/${aws_apigatewayv2_integration.get_visitor_history_integration.id}"
}

resource "aws_apigatewayv2_integration" "visitor_security_handler_integration" {
  api_id             = aws_apigatewayv2_api.visitor_api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.visitor_security_handler.invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "visitor_security_handler_route_post" {
  api_id    = aws_apigatewayv2_api.visitor_api.id
  route_key = "POST /VisitorSecurityHandler"
  target    = "integrations/${aws_apigatewayv2_integration.visitor_security_handler_integration.id}"
}

resource "aws_apigatewayv2_route" "visitor_security_handler_route_get" {
  api_id    = aws_apigatewayv2_api.visitor_api.id
  route_key = "GET /VisitorSecurityHandler"
  target    = "integrations/${aws_apigatewayv2_integration.visitor_security_handler_integration.id}"
}

resource "aws_apigatewayv2_integration" "get_all_visitors_integration" {
  api_id             = aws_apigatewayv2_api.visitor_api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.get_all_visitors.invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "get_all_visitors_route" {
  api_id    = aws_apigatewayv2_api.visitor_api.id
  route_key = "GET /getAllVisitors"
  target    = "integrations/${aws_apigatewayv2_integration.get_all_visitors_integration.id}"
}

# Lambda Permissions for API Gateway
resource "aws_lambda_permission" "create_request_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_request.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.visitor_api.execution_arn}/*/*/VisitorRequestPayload"
}

resource "aws_lambda_permission" "get_visitor_history_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_visitor_history.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.visitor_api.execution_arn}/*/*/getVisitorHistory"
}

resource "aws_lambda_permission" "visitor_security_handler_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.visitor_security_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.visitor_api.execution_arn}/*/*/VisitorSecurityHandler"
}

resource "aws_lambda_permission" "get_all_visitors_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_all_visitors.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.visitor_api.execution_arn}/*/*/getAllVisitors"
}

# EventBridge Rule for Daily Export
resource "aws_cloudwatch_event_rule" "daily_export" {
  name                = "daily-visitor-data-export"
  description         = "Triggers daily export of visitor data to S3"
  schedule_expression = "cron(0 0 * * ? *)"  # Daily at midnight UTC
}

resource "aws_cloudwatch_event_target" "export_lambda_target" {
  rule      = aws_cloudwatch_event_rule.daily_export.name
  target_id = "ExportVisitorData"
  arn       = aws_lambda_function.export_visitor_data.arn
}

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.export_visitor_data.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_export.arn
}

# Outputs
output "api_endpoint" {
  value = "${aws_apigatewayv2_stage.dev.invoke_url}"
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.visitor_table.name
}

output "s3_bucket_name" {
  value = aws_s3_bucket.analytics_bucket.id
}



### How to use this Terraform configuration:
### 1. Set up your AWS credentials and region in the AWS CLI or environment variables.
### 2. Ensure you have the necessary permissions to create resources in the specified AWS account and region
### 3. mkdir -p lambda
### cd lambda
# For each Lambda function (create_request.py, getVisitorHistory.py, etc.)
### zip create_request.zip create_request.py
### zip getVisitorHistory.zip getVisitorHistory.py
### zip visitorsecurityhandler.zip visitorsecurityhandler.py
### zip getAllVisitors.zip getAllVisitors.py
### zip exportVisitorData.zip exportVisitorData.py
### cd ..

### 2. Run `terraform init` to initialize the Terraform configuration.
### 3. Run `terraform plan` to review the changes that Terraform will make.
### 4. Run `terraform apply` to create the resources in AWS.
