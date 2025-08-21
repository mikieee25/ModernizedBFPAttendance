"""
Script to create the MySQL database.
"""

import pymysql


def create_database():
    """Create the MySQL database if it doesn't exist."""
    try:
        # Connect to MySQL server
        connection = pymysql.connect(
            host="localhost",
            user="root",
            password="",
            charset="utf8mb4",
            cursorclass=pymysql.cursors.DictCursor,
        )

        with connection.cursor() as cursor:
            # Create database if it doesn't exist
            cursor.execute(
                "CREATE DATABASE IF NOT EXISTS bfp_sorsogon_attendance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
            print("✅ Database 'bfp_sorsogon_attendance' created or already exists")

            # Grant privileges (if needed)
            cursor.execute(
                "GRANT ALL PRIVILEGES ON bfp_sorsogon_attendance.* TO 'root'@'localhost'"
            )
            print("✅ Privileges granted to root user")

        connection.close()
        print("✅ Database setup completed successfully")
        return True

    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False


if __name__ == "__main__":
    print("Setting up MySQL database...")
    success = create_database()

    if success:
        print("\nDatabase setup complete! Now you can run the application with:")
        print("python run.py")
    else:
        print("\nDatabase setup failed. Please check the error message above.")
