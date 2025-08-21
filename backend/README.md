# BFP Sorsogon Attendance System - Database Setup

This document explains how to set up and configure the database for the BFP Sorsogon Attendance System.

## Requirements

- MySQL 8.0.42 or later
- Python 3.8 or later
- Required Python packages (see `requirements.txt`)

## Database Setup

1. Create a MySQL database:

```sql
CREATE DATABASE bfp_sorsogon_attendance;
```

2. Install required Python packages:

```bash
pip install -r requirements.txt
```

## Database Configuration

The application uses the following database connection string by default:

```
mysql://root:@localhost/bfp_sorsogon_attendance
```

If you need to use different credentials or settings, you can set the `DATABASE_URL` environment variable:

```bash
# Windows
set DATABASE_URL=mysql://username:password@host/database_name

# Linux/Mac
export DATABASE_URL=mysql://username:password@host/database_name
```

## Testing the Database Connection

You can test the database connection by running:

```bash
python tests/test_database_connection.py
```

This script will attempt to connect to the database and create all the necessary tables.

## Validating Models Against the Schema

To validate the models against the existing database schema:

```bash
python tests/test_validate_models.py
```

This will check if all the tables and columns in the models exist in the database.

## Running All Tests

To run all tests at once:

```bash
python tests/run_tests.py
```

This will run all tests in the tests directory using pytest.

## Running Migrations

The application uses Flask-Migrate for database migrations.

### Initialize Migrations

```bash
python manage.py db init
```

### Create a Migration

```bash
python manage.py db migrate -m "Initial migration"
```

### Apply Migrations

```bash
python manage.py db upgrade
```

## Database Management Commands

The application provides several management commands via the `manage.py` script:

### Initialize the Database with Default Users

```bash
python manage.py initialize_db
```

### Validate Models Against the Schema

```bash
python manage.py validate_models
```

### Test Database Connection

```bash
python manage.py test_connection
```

## Database Schema

The database schema includes the following tables:

1. `user` - Stores user accounts for stations and admin users
2. `personnel` - Stores information about fire personnel
3. `attendance` - Stores attendance records
4. `face_data` - Stores face recognition data
5. `pending_attendance` - Stores pending attendance records
6. `activity_log` - Stores user activity logs

## Troubleshooting

If you encounter any issues with the database connection:

1. Make sure MySQL is running and accessible
2. Check that the database credentials are correct
3. Verify that the database exists
4. Ensure that the MySQL user has the necessary permissions
5. Check the firewall settings if connecting to a remote database
