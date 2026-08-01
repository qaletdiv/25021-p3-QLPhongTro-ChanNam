-- Migration: them bang buildings + rooms.buildingId + settings.buildingId
-- Database: ql_phong_tro_dev

USE ql_phong_tro_dev;

-- 1. Tao bang buildings
CREATE TABLE IF NOT EXISTS buildings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    landlordId INT NOT NULL,
    FOREIGN KEY (landlordId) REFERENCES users(id) ON DELETE CASCADE,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

-- 2. Them cot buildingId vao rooms
ALTER TABLE rooms ADD COLUMN buildingId INT NULL AFTER landlordId;
ALTER TABLE rooms ADD CONSTRAINT fk_rooms_building FOREIGN KEY (buildingId) REFERENCES buildings(id) ON DELETE SET NULL;

-- 3. Them cot buildingId vao settings (theo nha, duoc phep NULL = cau hinh mac dinh cua chu tro)
ALTER TABLE settings ADD COLUMN buildingId INT NULL AFTER landlordId;
ALTER TABLE settings DROP INDEX idx_key_landlord;
ALTER TABLE settings ADD CONSTRAINT fk_settings_building FOREIGN KEY (buildingId) REFERENCES buildings(id) ON DELETE CASCADE;
ALTER TABLE settings ADD UNIQUE INDEX idx_key_landlord_building (`key`, landlordId, buildingId);
