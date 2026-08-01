-- Remove default_payment_day from rooms (payment day is per-contract now)
ALTER TABLE rooms
    DROP COLUMN default_payment_day;
