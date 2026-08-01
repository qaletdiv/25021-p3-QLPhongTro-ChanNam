-- Add telegramChatId column to tenants (Telegram integration)
ALTER TABLE tenants
    ADD COLUMN telegramChatId VARCHAR(64) NULL AFTER cccd;
