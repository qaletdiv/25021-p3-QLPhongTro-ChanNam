-- Hệ Thống Quản Lý Phòng Trọ
-- Database: ql_phong_tro_dev

CREATE DATABASE IF NOT EXISTS ql_phong_tro_dev;
USE ql_phong_tro_dev;

-- 1. Người dùng (Chủ trọ / Người thuê)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('landlord','tenant') NOT NULL DEFAULT 'tenant',
    avatar VARCHAR(255),
    cccd VARCHAR(20),
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

-- 2. Nhà trọ (mỗi chủ trọ có thể sở hữu nhiều nhà)
CREATE TABLE buildings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    landlordId INT NOT NULL,
    FOREIGN KEY (landlordId) REFERENCES users(id) ON DELETE CASCADE,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

-- 3. Phòng trọ
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(20) NOT NULL,
    floor INT DEFAULT 1,
    area DECIMAL(10,2),
    price DECIMAL(15,0) NOT NULL,
    default_payment_day INT NOT NULL DEFAULT 5,
    status ENUM('empty','rented') NOT NULL DEFAULT 'empty',
    landlordId INT NOT NULL,
    buildingId INT,
    FOREIGN KEY (landlordId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (buildingId) REFERENCES buildings(id) ON DELETE SET NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

-- 4. Vật dụng (thư viện)
CREATE TABLE furnitures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    note TEXT,
    default_quantity INT NOT NULL DEFAULT 1,
    landlordId INT NOT NULL,
    FOREIGN KEY (landlordId) REFERENCES users(id) ON DELETE CASCADE,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

-- 4. Khách thuê (hồ sơ riêng, có thể có hoặc không có tài khoản)
CREATE TABLE tenants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    cccd VARCHAR(20),
    telegramChatId VARCHAR(64),
    userId INT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

-- 5. Hợp đồng thuê
CREATE TABLE contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenantId INT NOT NULL,
    roomId INT NOT NULL,
    deposit DECIMAL(15,0) NOT NULL DEFAULT 0,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    paymentDay INT NOT NULL DEFAULT 5,
    fingerprintCode VARCHAR(255),
    status ENUM('active','ended') NOT NULL DEFAULT 'active',
    FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (roomId) REFERENCES rooms(id) ON DELETE CASCADE,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

-- 7. Người đi kèm (vợ/chồng/con/... của người thuê)
CREATE TABLE companions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    cccd VARCHAR(20),
    relationship VARCHAR(50),
    fingerprintCode VARCHAR(255),
    tenantId INT NOT NULL,
    FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

-- 8. Hóa đơn hàng tháng
CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contractId INT NOT NULL,
    month VARCHAR(7) NOT NULL,
    roomPrice DECIMAL(15,0) NOT NULL DEFAULT 0,
    electricityOld DECIMAL(10,2) NOT NULL DEFAULT 0,
    electricityNew DECIMAL(10,2) NOT NULL DEFAULT 0,
    electricityCost DECIMAL(15,0) NOT NULL DEFAULT 0,
    waterOld DECIMAL(10,2) NOT NULL DEFAULT 0,
    waterNew DECIMAL(10,2) NOT NULL DEFAULT 0,
    waterCost DECIMAL(15,0) NOT NULL DEFAULT 0,
    serviceFee DECIMAL(15,0) NOT NULL DEFAULT 0,
    otherFees DECIMAL(15,0) NOT NULL DEFAULT 0,
    total DECIMAL(15,0) NOT NULL DEFAULT 0,
    status ENUM('pending','submitted','paid') NOT NULL DEFAULT 'pending',
    paidAt DATETIME,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (contractId) REFERENCES contracts(id) ON DELETE CASCADE
);

-- 9. Thông báo từ chủ trọ
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    targetType ENUM('all','specific_rooms') NOT NULL DEFAULT 'all',
    targetRoomIds TEXT,
    sentAt DATETIME,
    recipientCount INT NOT NULL DEFAULT 0,
    status ENUM('draft','sent') NOT NULL DEFAULT 'draft',
    landlordId INT NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (landlordId) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. Cài đặt hệ thống
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(100) NOT NULL,
    `value` TEXT,
    landlordId INT NOT NULL,
    buildingId INT,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (landlordId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (buildingId) REFERENCES buildings(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_key_landlord_building (`key`, landlordId, buildingId)
);

-- 11. Báo hỏng từ người thuê
CREATE TABLE issues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenantId INT NOT NULL,
    roomId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    images TEXT,
    status ENUM('pending','resolved') NOT NULL DEFAULT 'pending',
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (roomId) REFERENCES rooms(id) ON DELETE CASCADE
);

-- 6. Vật dụng trong hợp đồng (junction)
CREATE TABLE contract_furnitures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contractId INT NOT NULL,
    furnitureId INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (contractId) REFERENCES contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (furnitureId) REFERENCES furnitures(id) ON DELETE CASCADE,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);
