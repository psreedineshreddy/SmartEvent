
import sqlite3

DB_PATH = "smartevent.db"

connection = sqlite3.connect(DB_PATH)

try:
    cursor = connection.cursor()

    cursor.execute("PRAGMA table_info(bookings)")
    existing_columns = {
        row[1] for row in cursor.fetchall()
    }

    migrations = [
        (
            "coupon_id",
            "ALTER TABLE bookings ADD COLUMN coupon_id INTEGER "
            "REFERENCES coupons(id)"
        ),
        (
            "discount_amount",
            "ALTER TABLE bookings ADD COLUMN discount_amount FLOAT "
            "NOT NULL DEFAULT 0"
        ),
        (
            "final_amount",
            "ALTER TABLE bookings ADD COLUMN final_amount FLOAT"
        ),
    ]

    for column_name, sql in migrations:
        if column_name not in existing_columns:
            cursor.execute(sql)
            print(f"Added bookings.{column_name}")
        else:
            print(f"bookings.{column_name} already exists")

    cursor.execute(
        "UPDATE bookings SET final_amount = total_price "
        "WHERE final_amount IS NULL"
    )

    connection.commit()
    print("Coupon database migration completed successfully.")

except Exception:
    connection.rollback()
    raise

finally:
    connection.close()

