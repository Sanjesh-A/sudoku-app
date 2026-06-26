# ACM certificate for api.sanyogsar.com

resource "aws_acm_certificate" "api" {
  domain_name       = "api.sanyogsar.com"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.project_name}-api-cert"
  }
}

resource "aws_acm_certificate_validation" "api" {
  certificate_arn = aws_acm_certificate.api.arn

  timeouts {
    create = "10m"
  }
}