-- Add source column to notifications (manual / auto reminders)
ALTER TABLE notifications
    ADD COLUMN source ENUM('manual','auto') NOT NULL DEFAULT 'manual' AFTER status;
