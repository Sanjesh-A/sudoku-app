output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = [aws_subnet.public_a.id, aws_subnet.public_b.id]
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = [aws_subnet.private_a.id, aws_subnet.private_b.id]
}

output "alb_security_group_id" {
  description = "Security group ID for the ALB"
  value       = aws_security_group.alb.id
}

output "app_security_group_id" {
  description = "Security group ID for the application"
  value       = aws_security_group.app.id
}

output "db_security_group_id" {
  description = "Security group ID for the database"
  value       = aws_security_group.db.id
}

output "db_instance_address" {
  description = "Hostname of the database"
  value       = aws_db_instance.main.address
}

output "db_instance_port" {
  description = "Port of the database"
  value       = aws_db_instance.main.port
}

output "db_name" {
  description = "Name of the initial database"
  value       = aws_db_instance.main.db_name
}

output "db_credentials_secret_arn" {
  description = "ARN of the Secrets Manager secret holding DB credentials"
  value       = aws_secretsmanager_secret.db_credentials.arn
}

output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.api.repository_url
}

output "alb_dns_name" {
  description = "DNS name of the ALB"
  value       = aws_lb.main.dns_name
}

output "acm_certificate_arn" {
  description = "ARN of the API ACM certificate"
  value       = aws_acm_certificate.api.arn
}