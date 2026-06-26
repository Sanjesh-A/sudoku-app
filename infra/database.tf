# Random password for the database master user

resource "random_password" "db_master" {
  length  = 32
  special = true
  # RDS disallows certain characters in master passwords
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Secret holding the database connection details

resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "${var.project_name}/db-credentials"
  description             = "Master credentials for the Sudoku Postgres database"
  recovery_window_in_days = 7

  tags = {
    Name = "${var.project_name}-db-credentials"
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = "sudoku_admin"
    password = random_password.db_master.result
    engine   = "postgres"
    host     = aws_db_instance.main.address
    port     = aws_db_instance.main.port
    dbname   = aws_db_instance.main.db_name
  })
}

# Subnet group telling RDS which subnets to use

resource "aws_db_subnet_group" "main" {
  name        = "${var.project_name}-db"
  description = "Subnets for the Sudoku database"
  subnet_ids  = [aws_subnet.private_a.id, aws_subnet.private_b.id]

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

# The Postgres database

resource "aws_db_instance" "main" {
  identifier     = "${var.project_name}-postgres"
  engine         = "postgres"
  engine_version = "16.14"
  instance_class = "db.t4g.micro"

  # Storage
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp3"
  storage_encrypted     = true

  # Database
  db_name  = "sudoku"
  username = "sudoku_admin"
  password = random_password.db_master.result
  port     = 5432

  # Networking
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = false

  # Backups
  backup_retention_period = 1
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"

  # Availability
  multi_az = false

  # Lifecycle
  skip_final_snapshot       = true
  deletion_protection       = false
  final_snapshot_identifier = null

  # Performance Insights
  performance_insights_enabled = false

  tags = {
    Name = "${var.project_name}-postgres"
  }
}