#!/bin/bash

# This script is used to initialize the taskprio database tables on Supabase
# Make sure you have psql installed and your Supabase credentials ready

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/tp_db.sql"

print_status "Initializing TaskPrio database tables on Supabase"
print_status "SQL File: $SQL_FILE"

# Check if SQL file exists
if [ ! -f "$SQL_FILE" ]; then
    print_error "SQL file not found: $SQL_FILE"
    exit 1
fi

# Database connection parameters (can be set as environment variables)
DB_HOST="${SUPABASE_DB_HOST:-}"
DB_PORT="${SUPABASE_DB_PORT:-5432}"
DB_NAME="${SUPABASE_DB_NAME:-postgres}"
DB_USER="${SUPABASE_DB_USER:-postgres}"
DB_PASSWORD="${SUPABASE_DB_PASSWORD:-}"

# Prompt for missing values
if [ -z "$DB_HOST" ]; then
    echo -n "Enter Supabase database host (e.g., db.xxxxxxxxxxxxxxxxxxxx.supabase.co): "
    read DB_HOST
fi

if [ -z "$DB_PASSWORD" ]; then
    echo -n "Enter database password: "
    read -s DB_PASSWORD
    echo
fi

# Validate required parameters
if [ -z "$DB_HOST" ] || [ -z "$DB_PASSWORD" ]; then
    print_error "Missing required database connection parameters"
    print_error "Please provide DB_HOST and DB_PASSWORD"
    exit 1
fi

# Set PGPASSWORD environment variable to avoid password prompt
export PGPASSWORD="$DB_PASSWORD"

print_status "Connecting to Supabase database..."
print_status "Host: $DB_HOST"
print_status "Port: $DB_PORT"
print_status "Database: $DB_NAME"
print_status "User: $DB_USER"

# Test connection first
print_status "Testing database connection..."
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" >/dev/null 2>&1; then
    print_error "Failed to connect to the database. Please check your credentials and network connection."
    exit 1
fi

print_success "Database connection test successful!"

# Run the SQL file
print_status "Executing SQL file: $SQL_FILE"
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SQL_FILE"; then
    print_success "Database initialization completed successfully!"
else
    print_error "Database initialization failed with error code $?"
    exit 1
fi

# Clean up
unset PGPASSWORD

print_success "TaskPrio database initialization finished!"
echo
print_status "You can now use your Supabase database with TaskPrio."
print_warning "Remember to update your application configuration with the correct database connection details."
