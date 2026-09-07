-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: ql_phong_tro_dev
-- ------------------------------------------------------
-- Server version	8.4.8

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `actorId` int DEFAULT NULL,
  `actorType` varchar(20) DEFAULT 'user',
  `action` varchar(100) NOT NULL,
  `entityType` varchar(50) DEFAULT NULL,
  `entityId` int DEFAULT NULL,
  `ipAddress` varchar(64) DEFAULT NULL,
  `userAgent` varchar(255) DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_audit_actor` (`actorId`),
  KEY `idx_audit_action` (`action`,`createdAt`)
) ENGINE=InnoDB AUTO_INCREMENT=264 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-09 04:48:33'),(2,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-09 04:48:54'),(3,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-09 04:49:03'),(4,6,'user','account.revoke_session','user',7,NULL,NULL,'{\"targetName\": \"Nguyễn Thị B\", \"targetEmail\": \"nguyenthib@gmail.com\"}','2026-08-09 04:49:03'),(5,6,'user','user.disable','user',7,NULL,NULL,'{\"targetName\": \"Nguyễn Thị B\", \"targetEmail\": \"nguyenthib@gmail.com\"}','2026-08-09 04:49:03'),(6,6,'user','user.enable','user',7,NULL,NULL,'{\"targetName\": \"Nguyễn Thị B\", \"targetEmail\": \"nguyenthib@gmail.com\"}','2026-08-09 04:49:03'),(7,7,'user','auth.login','user',7,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-09 04:49:04'),(8,7,'user','auth.login','user',7,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-09 04:49:09'),(9,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-09 04:49:09'),(10,6,'user','account.revoke_session','user',7,NULL,NULL,'{\"targetName\": \"Nguyễn Thị B\", \"targetEmail\": \"nguyenthib@gmail.com\"}','2026-08-09 04:49:09'),(11,7,'user','auth.login','user',7,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-09 04:49:38'),(12,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-09 04:49:39'),(13,6,'user','account.revoke_session','user',7,NULL,NULL,'{\"targetName\": \"Nguyễn Thị B\", \"targetEmail\": \"nguyenthib@gmail.com\"}','2026-08-09 04:49:39'),(14,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-09 04:50:01'),(15,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-09 04:50:10'),(16,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-09 04:57:20'),(17,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-09 04:58:40'),(18,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-09 04:59:30'),(19,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-09 05:01:39'),(20,7,'user','auth.login','user',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-09 05:14:39'),(21,6,'user','user.change_password','user',7,NULL,NULL,'{\"targetName\": \"Nguyễn Thị B\", \"targetEmail\": \"nguyenthib@gmail.com\"}','2026-08-09 07:58:38'),(22,7,'user','auth.login','user',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-09 07:58:59'),(23,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-09 11:56:02'),(24,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-09 12:03:36'),(25,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-09 12:05:18'),(26,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-09 12:05:45'),(27,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-09 13:43:12'),(28,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-21 16:14:04'),(29,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-21 16:28:45'),(30,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-21 16:38:10'),(31,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-21 16:38:18'),(32,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-21 16:38:31'),(33,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-21 16:44:21'),(34,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-21 16:44:30'),(35,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 01:42:52'),(36,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 01:43:01'),(37,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 01:43:30'),(38,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 01:43:46'),(39,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 01:45:41'),(40,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 01:56:37'),(41,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 03:32:57'),(42,6,'user','auth.login','user',6,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 03:39:35'),(43,6,'user','auth.login','user',6,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 03:39:53'),(44,6,'user','auth.login','user',6,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 03:40:15'),(45,6,'user','auth.login','user',6,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 03:41:21'),(46,6,'user','auth.login','user',6,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 03:41:53'),(47,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 04:16:58'),(48,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 04:24:46'),(49,13,'user','auth.login','user',13,'::1','node','{\"email\": \"vovanv@gmail.com\"}','2026-08-22 04:26:13'),(50,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 04:27:00'),(51,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 04:32:43'),(52,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 05:25:03'),(53,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 06:12:18'),(54,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 06:15:04'),(55,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 12:52:08'),(56,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 13:09:24'),(57,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 13:25:19'),(58,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 13:26:08'),(59,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 13:30:25'),(60,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 13:30:49'),(61,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 13:38:36'),(62,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 13:42:53'),(63,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 13:53:21'),(64,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-22 14:06:57'),(65,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-23 05:31:19'),(66,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-23 06:16:03'),(67,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-23 06:25:16'),(68,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-23 06:51:52'),(69,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-23 06:52:06'),(70,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-23 07:04:28'),(71,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-23 07:04:41'),(72,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-23 07:04:55'),(73,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-23 07:12:38'),(74,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-23 07:13:02'),(75,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-23 07:27:02'),(76,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-23 08:16:51'),(77,7,'user','auth.login','user',7,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-23 08:42:24'),(78,7,'user','auth.login','user',7,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-23 08:42:39'),(79,7,'user','auth.login','user',7,'::1','node','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-23 08:50:36'),(80,7,'user','auth.login','user',7,'::1','node','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-23 08:50:58'),(81,7,'user','auth.login','user',7,'::1','node','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-23 08:51:19'),(82,7,'user','auth.login','user',7,'::1','node','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-23 09:03:58'),(83,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-23 09:33:24'),(84,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-23 09:35:27'),(85,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-23 09:44:59'),(86,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-23 09:46:31'),(87,14,'user','auth.login','user',14,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"testcnt@gmail.com\"}','2026-08-23 11:54:55'),(88,6,'user','auth.logout','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-23 11:56:49'),(89,14,'user','auth.login','user',14,'::1','node','{\"email\": \"testcnt@gmail.com\"}','2026-08-23 11:57:00'),(90,14,'user','auth.login','user',14,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"testcnt@gmail.com\"}','2026-08-23 12:05:05'),(91,14,'user','auth.login','user',14,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"testcnt@gmail.com\"}','2026-08-23 12:08:33'),(92,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-23 12:08:39'),(93,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-24 13:02:07'),(94,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-24 13:02:36'),(95,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-24 13:03:29'),(96,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-24 13:04:09'),(97,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-24 13:52:23'),(98,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-24 13:53:38'),(99,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-24 14:17:05'),(100,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-24 14:17:34'),(101,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-24 14:20:20'),(102,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-24 14:22:05'),(103,6,'user','auth.logout','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-24 14:22:20'),(104,14,'user','auth.login','user',14,'::1','node','{\"email\": \"testcnt@gmail.com\"}','2026-08-24 14:22:31'),(105,14,'user','auth.login','user',14,'::1','node','{\"email\": \"testcnt@gmail.com\"}','2026-08-24 14:25:08'),(106,14,'user','auth.login','user',14,'::1','node','{\"email\": \"testcnt@gmail.com\"}','2026-08-24 14:27:45'),(107,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-24 14:28:13'),(108,14,'user','auth.login','user',14,'::1','node','{\"email\": \"testcnt@gmail.com\"}','2026-08-24 14:28:14'),(109,6,'user','user.enable','user',7,NULL,NULL,'{\"targetName\": \"Nguyễn Thị B\", \"targetEmail\": \"nguyenthib@gmail.com\"}','2026-08-24 14:28:14'),(110,14,'user','auth.login','user',14,'::1','node','{\"email\": \"testcnt@gmail.com\"}','2026-08-24 14:29:08'),(111,14,'user','auth.login','user',14,'::1','node','{\"email\": \"testcnt@gmail.com\"}','2026-08-24 14:29:38'),(112,14,'user','auth.login','user',14,'::1','node','{\"email\": \"testcnt@gmail.com\"}','2026-08-24 14:33:28'),(113,7,'user','auth.logout','user',7,'::1','node','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-24 14:45:43'),(114,7,'user','auth.login','user',7,'::1','node','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-24 14:45:51'),(115,15,'user','auth.login','user',15,'::1','node','{\"email\": \"chuhoangsa2@gmail.com\"}','2026-08-24 15:02:58'),(116,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-24 15:02:58'),(117,14,'user','auth.login','user',14,'::1','node','{\"email\": \"testcnt@gmail.com\"}','2026-08-24 15:02:58'),(118,15,'user','auth.login','user',15,'::1','node','{\"email\": \"chuhoangsa2@gmail.com\"}','2026-08-24 15:06:43'),(119,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-24 15:06:44'),(120,14,'user','auth.login','user',14,'::1','node','{\"email\": \"testcnt@gmail.com\"}','2026-08-24 15:06:44'),(121,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-24 15:21:42'),(122,16,'user','auth.logout','user',16,'::1','node','{\"email\": \"tranm@gmail.com\"}','2026-08-25 12:32:53'),(123,17,'user','auth.logout','user',17,'::1','node','{\"email\": \"ler@gmail.com\"}','2026-08-28 12:36:47'),(124,17,'user','auth.login','user',17,'::1','node','{\"email\": \"ler@gmail.com\"}','2026-08-28 12:36:56'),(125,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-28 12:37:12'),(126,7,'user','auth.login','user',7,'::1','node','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-28 12:38:42'),(127,18,'user','auth.login','user',18,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"lertest999@gmail.com\"}','2026-08-28 13:14:50'),(128,17,'user','auth.login','user',17,'::1','node','{\"email\": \"ler@gmail.com\"}','2026-08-28 13:15:55'),(129,7,'user','auth.logout','user',7,'::1','node','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-28 13:16:58'),(130,17,'user','auth.login','user',17,'::1','node','{\"email\": \"ler@gmail.com\"}','2026-08-28 13:17:16'),(131,17,'user','auth.login','user',17,'::1','node','{\"email\": \"ler@gmail.com\"}','2026-08-28 13:21:46'),(132,17,'user','auth.login','user',17,'::1','node','{\"email\": \"ler@gmail.com\"}','2026-08-28 13:22:24'),(133,17,'user','auth.login','user',17,'::1','curl/8.13.0','{\"email\": \"ler@gmail.com\"}','2026-08-28 13:29:42'),(134,17,'user','auth.login','user',17,'::1','curl/8.13.0','{\"email\": \"ler@gmail.com\"}','2026-08-28 13:29:42'),(135,17,'user','auth.login','user',17,'::1','node','{\"email\": \"ler@gmail.com\"}','2026-08-28 13:37:15'),(136,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-28 13:38:12'),(137,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-28 13:39:47'),(138,17,'user','auth.login','user',17,'::1','curl/8.13.0','{\"email\": \"ler@gmail.com\"}','2026-08-28 13:40:44'),(139,17,'user','auth.login','user',17,'::1','node','{\"email\": \"ler@gmail.com\"}','2026-08-28 13:42:19'),(140,17,'user','auth.login','user',17,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"ler@gmail.com\"}','2026-08-28 13:45:12'),(141,17,'user','auth.login','user',17,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"ler@gmail.com\"}','2026-08-28 13:45:20'),(142,6,'user','auth.login','user',6,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-28 13:48:49'),(143,6,'user','auth.login','user',6,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-28 13:49:54'),(144,6,'user','auth.login','user',6,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-28 13:51:31'),(145,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-28 13:52:43'),(146,6,'user','auth.logout','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-28 13:53:03'),(147,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-28 13:53:10'),(148,5,'user','auth.login','user',5,'::1','node','{\"email\": \"tranvana@gmail.com\"}','2026-08-28 13:53:25'),(149,5,'user','auth.logout','user',5,'::1','node','{\"email\": \"tranvana@gmail.com\"}','2026-08-28 13:54:00'),(150,17,'user','auth.login','user',17,'::1','node','{\"email\": \"ler@gmail.com\"}','2026-08-28 13:54:06'),(151,17,'user','auth.logout','user',17,'::1','node','{\"email\": \"ler@gmail.com\"}','2026-08-28 13:54:40'),(152,20,'user','auth.logout','user',20,'::1','node','{\"email\": \"vot@gmail.com\"}','2026-08-28 13:56:10'),(153,20,'user','auth.login','user',20,'::1','node','{\"email\": \"vot@gmail.com\"}','2026-08-28 13:56:17'),(154,20,'user','auth.logout','user',20,'::1','node','{\"email\": \"vot@gmail.com\"}','2026-08-28 13:56:57'),(155,20,'user','auth.login','user',20,'::1','node','{\"email\": \"vot@gmail.com\"}','2026-08-28 13:57:03'),(156,17,'user','auth.login','user',17,'::1','node','{\"email\": \"ler@gmail.com\"}','2026-08-28 14:01:49'),(157,17,'user','auth.login','user',17,'::1','node','{\"email\": \"ler@gmail.com\"}','2026-08-28 14:02:01'),(158,17,'user','auth.logout','user',17,'::1','node','{\"email\": \"ler@gmail.com\"}','2026-08-28 14:08:25'),(159,6,'user','building.add_collaborator','building',1,NULL,NULL,'{\"email\": \"testcnt@gmail.com\"}','2026-08-28 14:10:05'),(160,17,'user','auth.login','user',17,'::1','node','{\"email\": \"ler@gmail.com\"}','2026-08-28 15:27:09'),(161,17,'user','auth.login','user',17,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"ler@gmail.com\"}','2026-08-28 15:40:34'),(162,7,'user','auth.login','user',7,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-28 15:40:34'),(163,17,'user','auth.login','user',17,'::1','node','{\"email\": \"ler@gmail.com\"}','2026-08-28 15:43:43'),(164,17,'user','auth.logout','user',17,'::1','node','{\"email\": \"ler@gmail.com\"}','2026-08-28 15:45:48'),(165,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-28 16:08:39'),(166,6,'user','auth.login','user',6,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-28 16:31:09'),(167,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-29 14:36:58'),(168,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-29 14:51:26'),(169,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-29 14:54:26'),(170,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-29 14:55:36'),(171,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-29 14:58:25'),(172,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-29 14:59:56'),(173,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-29 15:09:48'),(174,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-29 15:16:17'),(175,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-29 15:18:42'),(176,6,'user','account.revoke_session','user',22,NULL,NULL,'{\"targetName\": \"Test Tenant\", \"targetEmail\": \"testtenant3@smartrent.app\"}','2026-08-29 15:19:07'),(177,6,'user','account.revoke_session','user',22,NULL,NULL,'{\"targetName\": \"Test Tenant\", \"targetEmail\": \"testtenant3@smartrent.app\"}','2026-08-29 15:19:11'),(178,6,'user','user.disable','user',22,NULL,NULL,'{\"targetName\": \"Test Tenant\", \"targetEmail\": \"testtenant3@smartrent.app\"}','2026-08-29 15:19:14'),(179,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-29 15:36:01'),(180,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-29 15:36:19'),(181,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-29 15:37:30'),(182,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-29 15:45:29'),(183,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-29 15:46:13'),(184,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-30 01:30:17'),(185,17,'user','auth.login','user',17,'::1','node','{\"email\": \"ler@gmail.com\"}','2026-08-30 01:50:17'),(186,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-30 02:19:52'),(187,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-30 02:20:02'),(188,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-30 02:20:22'),(189,6,'user','user.delete','user',23,NULL,NULL,'{\"targetName\": \"Temp Del\", \"targetEmail\": \"tempdel_zz@x.com\"}','2026-08-30 02:20:23'),(190,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-30 02:21:54'),(191,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-30 02:27:08'),(192,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-30 02:41:35'),(193,6,'user','user.delete','user',22,NULL,NULL,'{\"targetName\": \"Test Tenant\", \"targetEmail\": \"testtenant3@smartrent.app\"}','2026-08-30 02:41:45'),(194,NULL,'system','user.auto_disable','user',24,NULL,NULL,'{\"reason\": \"contract_ended_no_renewal_7d\", \"targetName\": \"Temp Disable\", \"targetEmail\": \"tempdisable_zz@x.com\"}','2026-08-30 02:48:13'),(195,17,'user','auth.logout','user',17,'::1','node','{\"email\": \"ler@gmail.com\"}','2026-08-30 03:23:09'),(196,7,'user','auth.login','user',7,'::1','node','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-30 03:23:15'),(197,7,'user','auth.logout','user',7,'::1','node','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-30 03:23:34'),(198,17,'user','auth.login','user',17,'::1','node','{\"email\": \"ler@gmail.com\"}','2026-08-30 03:23:40'),(199,17,'user','auth.logout','user',17,'::1','node','{\"email\": \"ler@gmail.com\"}','2026-08-30 03:23:48'),(200,7,'user','auth.login','user',7,'::1','node','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-30 03:24:04'),(201,7,'user','auth.login','user',7,'::1','node','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-30 03:24:27'),(202,6,'user','building.remove_collaborator','building',1,NULL,NULL,'{\"removedUserId\": 14}','2026-08-30 05:41:03'),(203,6,'user','building.remove_collaborator','building',1,NULL,NULL,'{\"removedUserId\": 15}','2026-08-30 05:52:47'),(204,6,'user','building.add_collaborator','building',1,NULL,NULL,'{\"email\": \"chuhoangsa2@gmail.com\"}','2026-08-30 05:57:04'),(205,6,'user','building.remove_collaborator','building',1,NULL,NULL,'{\"removedUserId\": 15}','2026-08-30 05:57:11'),(206,7,'user','auth.login','user',7,'::1','node','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-30 06:16:22'),(207,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-30 10:03:08'),(208,6,'user','auth.logout','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-30 10:03:15'),(209,7,'user','auth.logout','user',7,'::1','node','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-30 10:22:33'),(210,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-30 14:39:15'),(211,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-30 14:46:38'),(212,6,'user','auth.logout','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-30 15:01:51'),(213,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-30 15:02:00'),(214,6,'user','auth.logout','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-30 15:08:46'),(215,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-30 15:08:58'),(216,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-30 15:12:02'),(217,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-30 15:16:12'),(218,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-30 15:17:43'),(219,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-30 15:21:26'),(220,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-30 15:22:43'),(221,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-30 15:24:17'),(222,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-30 15:26:48'),(223,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-31 14:47:04'),(224,6,'user','auth.logout','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-31 14:56:06'),(225,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-31 14:56:17'),(226,7,'user','auth.login','user',7,'::1','node','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-31 15:57:23'),(227,7,'user','auth.login','user',7,'::1','node','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-31 16:01:07'),(228,7,'user','auth.login','user',7,'::1','node','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-31 16:01:27'),(229,6,'user','auth.logout','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-08-31 16:05:22'),(230,7,'user','auth.login','user',7,'::1','node','{\"email\": \"nguyenthib@gmail.com\"}','2026-08-31 16:05:35'),(231,7,'user','auth.login','user',7,'::1','node','{\"email\": \"nguyenthib@gmail.com\"}','2026-09-01 00:55:51'),(232,7,'user','auth.logout','user',7,'::1','node','{\"email\": \"nguyenthib@gmail.com\"}','2026-09-01 00:55:56'),(233,7,'user','auth.login','user',7,'::1','node','{\"email\": \"nguyenthib@gmail.com\"}','2026-09-01 04:00:59'),(234,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-09-01 04:04:10'),(235,7,'user','auth.logout','user',7,'::1','node','{\"email\": \"nguyenthib@gmail.com\"}','2026-09-01 04:07:36'),(236,7,'user','auth.login','user',7,'::1','node','{\"email\": \"nguyenthib@gmail.com\"}','2026-09-01 04:08:12'),(237,6,'user','auth.logout','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-09-01 04:56:42'),(238,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-09-01 04:56:52'),(239,7,'user','auth.logout','user',7,'::1','node','{\"email\": \"nguyenthib@gmail.com\"}','2026-09-01 13:15:09'),(240,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-09-03 12:41:03'),(241,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-09-03 12:41:46'),(242,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-09-03 12:53:28'),(243,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-09-03 12:53:45'),(244,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-09-03 13:00:36'),(245,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-09-03 13:08:37'),(246,6,'user','auth.login','user',6,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6456','{\"email\": \"namnguyenchan@gmail.com\"}','2026-09-03 13:13:50'),(247,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-09-03 14:32:06'),(248,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-09-03 16:31:40'),(249,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-09-03 16:32:04'),(250,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-09-03 16:44:34'),(251,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-09-03 16:45:02'),(252,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-09-03 16:53:46'),(253,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-09-04 15:15:17'),(254,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-09-04 15:19:33'),(255,17,'user','auth.login','user',17,'::1','node','{\"email\": \"ler@gmail.com\"}','2026-09-05 06:16:40'),(256,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-09-05 07:24:30'),(257,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-09-05 07:24:46'),(258,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-09-05 12:18:07'),(259,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-09-05 15:17:42'),(260,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-09-06 14:28:26'),(261,17,'user','auth.logout','user',17,'::1','node','{\"email\": \"ler@gmail.com\"}','2026-09-07 13:22:33'),(262,9,'user','auth.login','user',9,'::1','node','{\"email\": \"lentrendat@gmail.com\"}','2026-09-07 13:30:53'),(263,6,'user','auth.login','user',6,'::1','node','{\"email\": \"namnguyenchan@gmail.com\"}','2026-09-07 14:10:46');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `building_collaborators`
--

DROP TABLE IF EXISTS `building_collaborators`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `building_collaborators` (
  `id` int NOT NULL AUTO_INCREMENT,
  `buildingId` int NOT NULL,
  `userId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_bc_building_user` (`buildingId`,`userId`),
  KEY `idx_bc_user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `building_collaborators`
--

LOCK TABLES `building_collaborators` WRITE;
/*!40000 ALTER TABLE `building_collaborators` DISABLE KEYS */;
/*!40000 ALTER TABLE `building_collaborators` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `buildings`
--

DROP TABLE IF EXISTS `buildings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `buildings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `address` text,
  `landlordId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `landlordId` (`landlordId`),
  CONSTRAINT `buildings_ibfk_1` FOREIGN KEY (`landlordId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `buildings`
--

LOCK TABLES `buildings` WRITE;
/*!40000 ALTER TABLE `buildings` DISABLE KEYS */;
INSERT INTO `buildings` VALUES (1,'Nhà Hoàng Sa','627/2 Hoàng Sa, phường Xuân Hòa, Tp.HCM',6,'2026-08-01 06:17:59','2026-08-01 06:17:59'),(2,'Nhà 3/2','abc xyz',6,'2026-08-28 14:19:59','2026-08-28 14:19:59');
/*!40000 ALTER TABLE `buildings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companions`
--

DROP TABLE IF EXISTS `companions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `cccd` varchar(20) DEFAULT NULL,
  `relationship` varchar(50) DEFAULT NULL,
  `telegramChatId` varchar(64) DEFAULT NULL,
  `fingerprintCode` varchar(255) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active',
  `endedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `tenantId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenantId` (`tenantId`),
  CONSTRAINT `companions_ibfk_1` FOREIGN KEY (`tenantId`) REFERENCES `tenants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companions`
--

LOCK TABLES `companions` WRITE;
/*!40000 ALTER TABLE `companions` DISABLE KEYS */;
INSERT INTO `companions` VALUES (3,'Lê Thị C','070807080708','996633','Bạn bè',NULL,'17','ended','2026-08-09 09:45:48','2026-08-06 13:22:30','2026-08-09 09:45:48',2),(4,'Trần Văn D','0909123456',NULL,'Bạn bè',NULL,'18','active',NULL,'2026-08-06 13:22:31','2026-08-09 04:01:52',2);
/*!40000 ALTER TABLE `companions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contract_furnitures`
--

DROP TABLE IF EXISTS `contract_furnitures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contract_furnitures` (
  `id` int NOT NULL AUTO_INCREMENT,
  `contractId` int NOT NULL,
  `furnitureId` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `contractId` (`contractId`),
  KEY `furnitureId` (`furnitureId`),
  CONSTRAINT `contract_furnitures_ibfk_1` FOREIGN KEY (`contractId`) REFERENCES `contracts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contract_furnitures_ibfk_2` FOREIGN KEY (`furnitureId`) REFERENCES `furnitures` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contract_furnitures`
--

LOCK TABLES `contract_furnitures` WRITE;
/*!40000 ALTER TABLE `contract_furnitures` DISABLE KEYS */;
INSERT INTO `contract_furnitures` VALUES (3,1,1,1,'2026-07-30 15:33:46','2026-07-30 15:33:46'),(4,1,2,1,'2026-07-30 15:33:46','2026-07-30 15:33:46'),(5,1,3,1,'2026-07-30 15:33:46','2026-07-30 15:33:46'),(6,1,4,1,'2026-07-30 15:33:46','2026-07-30 15:33:46'),(7,1,5,1,'2026-07-30 15:33:46','2026-07-30 15:33:46'),(8,1,6,1,'2026-07-30 15:33:46','2026-07-30 15:33:46'),(27,6,1,1,'2026-07-30 15:50:56','2026-07-30 15:50:56'),(28,6,2,1,'2026-07-30 15:50:56','2026-07-30 15:50:56'),(29,6,3,1,'2026-07-30 15:50:56','2026-07-30 15:50:56'),(30,6,4,1,'2026-07-30 15:50:56','2026-07-30 15:50:56'),(40,10,1,1,'2026-09-01 15:10:16','2026-09-01 15:10:16'),(41,10,2,1,'2026-09-01 15:10:16','2026-09-01 15:10:16'),(42,10,3,1,'2026-09-01 15:10:16','2026-09-01 15:10:16'),(43,10,4,1,'2026-09-01 15:10:16','2026-09-01 15:10:16'),(44,10,5,1,'2026-09-01 15:10:16','2026-09-01 15:10:16'),(45,10,6,1,'2026-09-01 15:10:16','2026-09-01 15:10:16'),(46,10,7,1,'2026-09-01 15:10:16','2026-09-01 15:10:16'),(47,10,8,1,'2026-09-01 15:10:16','2026-09-01 15:10:16'),(51,12,1,1,'2026-09-03 16:06:29','2026-09-03 16:06:29'),(52,12,3,1,'2026-09-03 16:06:29','2026-09-03 16:06:29'),(53,12,5,1,'2026-09-03 16:06:29','2026-09-03 16:06:29'),(54,12,6,1,'2026-09-03 16:06:29','2026-09-03 16:06:29');
/*!40000 ALTER TABLE `contract_furnitures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contracts`
--

DROP TABLE IF EXISTS `contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contracts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenantId` int NOT NULL,
  `roomId` int NOT NULL,
  `deposit` decimal(15,0) NOT NULL DEFAULT '0',
  `price` decimal(15,0) NOT NULL DEFAULT '0',
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `paymentDay` int NOT NULL DEFAULT '5',
  `fingerprintCode` varchar(255) DEFAULT NULL,
  `initialElectricity` decimal(10,2) NOT NULL DEFAULT '0.00',
  `initialWater` decimal(10,2) NOT NULL DEFAULT '0.00',
  `initialElectricityPhoto` varchar(500) DEFAULT NULL,
  `initialWaterPhoto` varchar(500) DEFAULT NULL,
  `status` enum('active','ended') NOT NULL DEFAULT 'active',
  `checkoutDate` date DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tenantId` (`tenantId`),
  KEY `roomId` (`roomId`),
  CONSTRAINT `contracts_ibfk_1` FOREIGN KEY (`tenantId`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contracts_ibfk_2` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contracts`
--

LOCK TABLES `contracts` WRITE;
/*!40000 ALTER TABLE `contracts` DISABLE KEYS */;
INSERT INTO `contracts` VALUES (1,1,1,5000000,5000000,'2026-05-06','2027-05-06',5,'15',0.00,0.00,NULL,NULL,'active',NULL,'2026-07-27 15:41:46','2026-07-30 15:33:46'),(2,2,2,6000000,6000000,'2026-08-06','2027-07-06',8,'19',1130.00,70.00,'https://res.cloudinary.com/ahpwdyfy/image/upload/v1785666889/phongtro/1B/meters/elec_initial_2.jpg','https://res.cloudinary.com/ahpwdyfy/image/upload/v1785666889/phongtro/1B/meters/water_initial_2.jpg','active',NULL,'2026-07-27 16:04:07','2026-08-09 04:01:52'),(6,3,4,5000000,5000000,'2026-07-29','2027-07-29',5,'18',0.00,0.00,NULL,NULL,'ended',NULL,'2026-07-30 15:42:59','2026-07-31 16:40:50'),(8,4,5,3000000,3000000,'2026-07-29','2027-08-31',2,'20',1122.00,65.00,'https://res.cloudinary.com/ahpwdyfy/image/upload/v1785559811/phongtro/2B/meters/elec_initial_8.jpg','https://res.cloudinary.com/ahpwdyfy/image/upload/v1785559811/phongtro/2B/meters/water_initial_8.jpg','active',NULL,'2026-07-31 13:52:09','2026-09-03 14:33:17'),(10,8,4,5000000,5000000,'2026-09-01','2026-09-30',5,'23',0.00,0.00,NULL,NULL,'active',NULL,'2026-09-01 15:10:16','2026-09-01 15:10:16'),(11,7,6,3000000,3000000,'2026-09-03','2026-09-05',5,'88',0.00,0.00,NULL,NULL,'ended','2026-09-03','2026-09-03 15:19:45','2026-09-03 15:20:13'),(12,4,7,5500000,5500000,'2026-09-03','2026-09-30',5,'89',0.00,0.00,NULL,NULL,'active',NULL,'2026-09-03 16:06:29','2026-09-03 16:06:29');
/*!40000 ALTER TABLE `contracts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fingerprint_histories`
--

DROP TABLE IF EXISTS `fingerprint_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fingerprint_histories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fingerprintCode` varchar(255) NOT NULL,
  `ownerType` enum('tenant','companion') NOT NULL DEFAULT 'tenant',
  `ownerId` int DEFAULT NULL,
  `ownerName` varchar(255) DEFAULT NULL,
  `tenantId` int DEFAULT NULL,
  `roomId` int DEFAULT NULL,
  `buildingId` int DEFAULT NULL,
  `landlordId` int NOT NULL,
  `action` enum('assigned','removed') NOT NULL DEFAULT 'assigned',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_fp_landlord` (`landlordId`,`fingerprintCode`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fingerprint_histories`
--

LOCK TABLES `fingerprint_histories` WRITE;
/*!40000 ALTER TABLE `fingerprint_histories` DISABLE KEYS */;
INSERT INTO `fingerprint_histories` VALUES (5,'15','tenant',1,'Trần Văn A',1,1,1,6,'assigned','2026-07-27 15:41:46','2026-08-09 03:48:41'),(6,'16','tenant',2,'Nguy?n Th? B',2,2,1,6,'assigned','2026-07-27 16:04:07','2026-08-09 03:48:42'),(7,'20','tenant',4,'Lê Tiến Đạt',4,5,1,6,'assigned','2026-07-31 13:52:09','2026-08-09 03:48:42'),(8,'17','companion',3,'Lê Thị C',2,2,1,6,'assigned','2026-08-09 03:51:36','2026-08-09 03:51:36'),(9,'18','companion',4,'Trần Văn D',2,2,1,6,'assigned','2026-08-09 03:51:36','2026-08-09 03:51:36'),(10,'16','tenant',2,'Nguy?n Th? B',2,2,1,6,'removed','2026-08-09 04:01:53','2026-08-09 04:01:53'),(11,'19','tenant',2,'Nguy?n Th? B',2,2,1,6,'assigned','2026-08-09 04:01:53','2026-08-09 04:01:53'),(12,'17','companion',3,'Lê Thị C',2,2,1,6,'removed','2026-08-09 09:45:48','2026-08-09 09:45:48'),(13,'23','tenant',8,'Lê R',8,4,1,6,'assigned','2026-09-01 15:10:16','2026-09-01 15:10:16'),(14,'88','tenant',7,'Trần My',7,6,2,6,'assigned','2026-09-03 15:19:46','2026-09-03 15:19:46'),(15,'88','tenant',7,'Trần My',7,6,2,6,'removed','2026-09-03 15:20:13','2026-09-03 15:20:13'),(16,'89','tenant',4,'Lê Tiến Đạt',4,7,1,6,'assigned','2026-09-03 16:06:29','2026-09-03 16:06:29');
/*!40000 ALTER TABLE `fingerprint_histories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `furnitures`
--

DROP TABLE IF EXISTS `furnitures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `furnitures` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `note` text,
  `default_quantity` int NOT NULL DEFAULT '1',
  `landlordId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `landlordId` (`landlordId`),
  CONSTRAINT `furnitures_ibfk_1` FOREIGN KEY (`landlordId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `furnitures`
--

LOCK TABLES `furnitures` WRITE;
/*!40000 ALTER TABLE `furnitures` DISABLE KEYS */;
INSERT INTO `furnitures` VALUES (1,'Máy lạnh','',1,6,'2026-07-30 14:54:40','2026-07-30 14:54:40'),(2,'Tủ lạnh','',1,6,'2026-07-30 15:31:49','2026-07-30 15:31:49'),(3,'Bếp','',1,6,'2026-07-30 15:32:12','2026-07-30 15:32:12'),(4,'Tủ gỗ để quần áo','',1,6,'2026-07-30 15:32:35','2026-07-30 15:32:35'),(5,'Thùng rác','',1,6,'2026-07-30 15:32:52','2026-07-30 15:32:52'),(6,'Chổi','',1,6,'2026-07-30 15:33:04','2026-07-30 15:33:04'),(7,'Máy nóng lạnh','',1,6,'2026-07-31 15:44:12','2026-07-31 15:44:12'),(8,'Chỗ để xe','',1,6,'2026-08-09 13:45:19','2026-08-09 13:45:19');
/*!40000 ALTER TABLE `furnitures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `contractId` int NOT NULL,
  `month` varchar(7) NOT NULL,
  `roomPrice` decimal(15,0) NOT NULL DEFAULT '0',
  `electricityOld` decimal(10,2) NOT NULL DEFAULT '0.00',
  `electricityNew` decimal(10,2) NOT NULL DEFAULT '0.00',
  `electricityCost` decimal(15,0) NOT NULL DEFAULT '0',
  `waterOld` decimal(10,2) NOT NULL DEFAULT '0.00',
  `waterNew` decimal(10,2) NOT NULL DEFAULT '0.00',
  `waterCost` decimal(15,0) NOT NULL DEFAULT '0',
  `serviceFee` decimal(15,0) NOT NULL DEFAULT '0',
  `otherFees` decimal(15,0) NOT NULL DEFAULT '0',
  `total` decimal(15,0) NOT NULL DEFAULT '0',
  `status` enum('pending','submitted','paid') NOT NULL DEFAULT 'pending',
  `electricityPhoto` varchar(500) DEFAULT NULL,
  `waterPhoto` varchar(500) DEFAULT NULL,
  `paidAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `contractId` (`contractId`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`contractId`) REFERENCES `contracts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (1,8,'08/2026',3000000,1122.00,1130.00,128000,65.00,70.00,22500,0,0,3150500,'paid','https://res.cloudinary.com/ahpwdyfy/image/upload/v1785561770/phongtro/2B/invoices/08/2026/elec_8.jpg','https://res.cloudinary.com/ahpwdyfy/image/upload/v1785561771/phongtro/2B/invoices/08/2026/water_8.jpg','2026-08-01 05:30:44','2026-08-01 05:22:52','2026-08-01 05:30:44'),(4,2,'09/2026',6000000,1130.00,1140.00,160000,70.00,75.00,22500,0,0,6182500,'submitted','https://res.cloudinary.com/ahpwdyfy/image/upload/v1785667039/phongtro/1B/invoices/09/2026/elec_2.jpg','https://res.cloudinary.com/ahpwdyfy/image/upload/v1785667040/phongtro/1B/invoices/09/2026/water_2.jpg',NULL,'2026-08-02 10:37:22','2026-08-02 10:37:22'),(5,2,'08/2026',6000000,0.00,1130.00,0,0.00,70.00,0,0,0,6000000,'paid',NULL,NULL,'2026-08-02 10:45:46','2026-08-02 10:45:46','2026-08-04 14:55:58');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `issues`
--

DROP TABLE IF EXISTS `issues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `issues` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenantId` int NOT NULL,
  `roomId` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `images` text,
  `status` enum('pending','resolved') NOT NULL DEFAULT 'pending',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tenantId` (`tenantId`),
  KEY `roomId` (`roomId`),
  CONSTRAINT `issues_ibfk_1` FOREIGN KEY (`tenantId`) REFERENCES `tenants` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `issues_ibfk_2` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `issues`
--

LOCK TABLES `issues` WRITE;
/*!40000 ALTER TABLE `issues` DISABLE KEYS */;
INSERT INTO `issues` VALUES (1,4,5,'Máy lạnh chảy nước','Máy lạnh chảy nước nhieu, nho lien he ben dich vu sua chua',NULL,'resolved','2026-08-02 06:55:49','2026-08-02 07:38:54'),(3,2,2,'','',NULL,'resolved','2026-09-01 04:01:57','2026-09-01 04:05:19'),(4,2,2,'','',NULL,'resolved','2026-09-01 04:01:59','2026-09-01 04:05:15');
/*!40000 ALTER TABLE `issues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `targetType` enum('all','specific_rooms') NOT NULL DEFAULT 'all',
  `targetRoomIds` text,
  `sentAt` datetime DEFAULT NULL,
  `recipientCount` int NOT NULL DEFAULT '0',
  `status` enum('draft','sent') NOT NULL DEFAULT 'draft',
  `source` enum('manual','auto') NOT NULL DEFAULT 'manual',
  `landlordId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `landlordId` (`landlordId`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`landlordId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'Thông báo thu tiền phòng tháng 08/2026','Kính gửi {{TENKHACH}} (Phòng {{MAPHONG}}), hóa đơn tháng này là {{TONG_TIEN}}₫. Vui lòng thanh toán trước ngày {{HAN_THANH_TOAN}}. Cảm ơn!','all','[]','2026-08-01 07:15:06',3,'sent','manual',6,'2026-08-01 07:15:06','2026-08-01 07:15:06',0),(2,'Thông báo thu tiền phòng tháng 07/2026','Kính gửi {{TENKHACH}} (Phòng {{MAPHONG}}), Từ tháng sau tiền điện sẽ tăng lên thành 5.000 VND/KWh. Xin lưu ý.','specific_rooms','[\"5\"]','2026-08-01 07:21:54',1,'sent','manual',6,'2026-08-01 07:21:54','2026-08-01 07:42:57',0),(4,'Nhắc Tiền Phòng 08/2026 (Tự Động)','Kính gửi {{TENKHACH}} (Phòng {{MAPHONG}}), đã đến kỳ thu tiền nhà tháng {{THANG}}. Vui lòng thanh toán trước ngày {{HAN_THANH_TOAN}}. Chân thành cảm ơn!','specific_rooms','[\"5\"]','2026-08-02 03:54:36',1,'sent','auto',6,'2026-08-02 03:54:36','2026-08-02 03:54:36',0),(5,'Tủ lạnh','Kính gửi {{TENKHACH}} (Phòng {{MAPHONG}}),\n Cảm ơn!','specific_rooms','[\"5\"]','2026-08-03 14:36:23',1,'sent','manual',6,'2026-08-03 14:36:23','2026-08-03 14:36:23',0),(6,'Tủ lạnh','Kính gửi {{TENKHACH}} (Phòng {{MAPHONG}}),\n Cảm ơn!','specific_rooms','[\"5\"]','2026-08-03 14:36:31',1,'sent','manual',6,'2026-08-03 14:36:31','2026-08-03 14:36:31',0),(7,'Tủ lạnh','Kính gửi {{TENKHACH}} (Phòng {{MAPHONG}}),\n Cảm ơn!','specific_rooms','[\"5\"]','2026-08-03 14:36:35',1,'sent','manual',6,'2026-08-03 14:36:35','2026-08-03 14:36:35',0),(8,'Tủ lạnh','Kính gửi {{TENKHACH}} (Phòng {{MAPHONG}}),\n Cảm ơn!','specific_rooms','[\"5\"]','2026-08-03 14:36:37',1,'sent','manual',6,'2026-08-03 14:36:37','2026-08-03 14:36:37',0),(9,'Tủ lạnh','Kính gửi {{TENKHACH}} (Phòng {{MAPHONG}}),\n Cảm ơn!','specific_rooms','[\"5\"]','2026-08-03 14:36:41',1,'sent','manual',6,'2026-08-03 14:36:41','2026-08-03 14:36:41',0),(10,'Tủ lạnh','Kính gửi {{TENKHACH}} (Phòng {{MAPHONG}}),\n Cảm ơn!','specific_rooms','[\"5\"]','2026-08-03 14:36:47',1,'sent','manual',6,'2026-08-03 14:36:47','2026-08-03 14:36:47',0),(11,'Tủ lạnh','Kính gửi {{TENKHACH}} (Phòng {{MAPHONG}}),\n Cảm ơn!','specific_rooms','[\"5\"]','2026-08-03 14:36:52',1,'sent','manual',6,'2026-08-03 14:36:52','2026-08-03 14:36:52',0),(12,'Tủ lạnh','Kính gửi {{TENKHACH}} (Phòng {{MAPHONG}}),\n Cảm ơn!','specific_rooms','[\"5\"]','2026-08-03 14:36:56',1,'sent','manual',6,'2026-08-03 14:36:56','2026-08-03 14:36:56',0),(13,'test test','Kính gửi {{TENKHACH}} (Phòng {{MAPHONG}}),\n Cảm ơn!','specific_rooms','[\"2\"]','2026-08-04 13:50:31',1,'sent','manual',6,'2026-08-04 13:50:31','2026-08-04 13:50:31',0),(14,'test test','Kính gửi {{TENKHACH}} (Phòng {{MAPHONG}}),\n Cảm ơn!','specific_rooms','[\"2\"]','2026-08-04 13:50:35',1,'sent','manual',6,'2026-08-04 13:50:35','2026-08-04 13:50:35',0),(15,'test test','Kính gửi {{TENKHACH}} (Phòng {{MAPHONG}}),\n Cảm ơn!','specific_rooms','[\"2\"]','2026-08-04 13:50:37',1,'sent','manual',6,'2026-08-04 13:50:37','2026-08-04 13:50:37',0),(16,'test test','Kính gửi {{TENKHACH}} (Phòng {{MAPHONG}}),\n Cảm ơn!','specific_rooms','[\"2\"]','2026-08-04 13:50:39',1,'sent','manual',6,'2026-08-04 13:50:39','2026-08-04 13:50:39',0),(17,'test test','Kính gửi {{TENKHACH}} (Phòng {{MAPHONG}}),\n Cảm ơn!','specific_rooms','[\"2\"]','2026-08-04 13:50:41',1,'sent','manual',6,'2026-08-04 13:50:41','2026-08-04 13:50:41',0),(18,'test test','Kính gửi {{TENKHACH}} (Phòng {{MAPHONG}}),\n Cảm ơn!','specific_rooms','[\"2\"]','2026-08-04 13:50:42',1,'sent','manual',6,'2026-08-04 13:50:42','2026-08-04 13:50:42',0),(19,'Nhắc Tiền Phòng 09/2026 (Tự Động)','Kính gửi {{TENKHACH}} (Phòng {{MAPHONG}}), đã đến kỳ thu tiền nhà tháng {{THANG}}. Vui lòng thanh toán trước ngày {{HAN_THANH_TOAN}}. Chân thành cảm ơn!','specific_rooms','[\"7\"]','2026-09-05 05:54:09',1,'sent','auto',6,'2026-09-05 05:54:09','2026-09-05 05:54:09',0);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `push_subscriptions`
--

DROP TABLE IF EXISTS `push_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `push_subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `endpoint` varchar(500) NOT NULL,
  `p256dh` varchar(255) NOT NULL,
  `auth` varchar(255) NOT NULL,
  `userAgent` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_push_endpoint` (`endpoint`),
  UNIQUE KEY `push_subscriptions_endpoint` (`endpoint`),
  KEY `idx_push_user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `push_subscriptions`
--

LOCK TABLES `push_subscriptions` WRITE;
/*!40000 ALTER TABLE `push_subscriptions` DISABLE KEYS */;
INSERT INTO `push_subscriptions` VALUES (3,17,'https://wns2-pn1p.notify.windows.com/w/?token=BQYAAABWNVJp1cJ4aqmhkYHw8kYqkJmKgaWSBwAIQTnrzYnRkqfNrub5SGsPjZjsm3ZznNBDQQNQLvxPni%2flqLYTwXOe1DXghFSuLCITvtIEllK94%2fDeqcpvAGmtloNvbRrz%2f3BO1RtzutcxY0X%2fvCvj%2fT77yq37tWsfVjjezAePs9ljby3QunVwtuBEP3HTEC2%2f4drW1CLm2Gpm3bEcukVaU6BKXwPHqJ0eIr3MAzlPoWp3eBtlTm%2bsdVhkhNVPp9IOC0fHrKbVdY6x%2bnf2eDLuBUSWZzrgPDf2FpWkjHPx22j5GcawAIEdz%2fecv%2bAJg%2fyNqWU%3d','BER1ObFcgVb5h559LDN1dkNi+zNimyacrbJvWxOpmXEbV8ubrXzQXqjR6OYPPFpOp/ifBsaPtnNxhJQJrereKf8=','tGXziYsDl9vVu1h8Y1lC8w==','node','2026-08-23 09:03:58','2026-08-28 13:17:16'),(4,17,'https://wns2-pn1p.notify.windows.com/w/?token=BQYAAAB0o2dmofPjg32AK5Yz4Q2ECIzgwgfvif16rIsAadhXLi%2fI0JjMfrr7eh5REi5TzfND%2bF7e26tUVyz7xI0YN0yiYY%2fr%2bhP9cQbSsmiqo4UuARQnH9zCngE6vHSOIUOjJDCdQ7ouJ%2bi9sdRMc78JdkQxnnlCCOvrr6QOiP4IAHyd9fObcr21pqBbTxyjwfQvMWawcboaYdGkdcbmDKKt8woCkIS1MZQ5fg9oxBejmmrBY7Wj3i6npwr3VhP5gtPR6Op5z0qlit038WcomOwYB7J4DhmB3cwV2kIsoiDU5wLL93VkExfyHb8bJb64iIqTrrBOfG2pkU5KtVqSIN368xZ0','BDD0842n3ieMsrXG7KN9fjUNtT9eY/eZ2bADAbMssFowAFvl/yYubtmJKr3IAH38HfCfiddW4hswZeezxxuMnGQ=','oSQvnvQU+zqd5MXj8+4Ywg==','node','2026-08-28 13:21:46','2026-08-28 13:21:46'),(5,17,'https://wns2-pn1p.notify.windows.com/w/?token=BQYAAACVrfxDpSVQPkAUqG5DY6eLGesHKpNCxXmNfUzTpdZvj2H7fO9j8s9%2b2rBlCT%2f3KFmrkeaepaXzk1QX%2fhTs7NlDGyHHSX6HzrLhWAk4lFcg67z7PQ560fRL6ixZtnNnvugseBFrk8kBbqEx9BdjFaUIP4AY6YOF74V7nC3e0No1TRDg1yhpqg23R2nAzyYewT4kFGq4EuXwNjAmoGnZHgYd4n6T6RIihZKqq0zgc18QJC3iR7T98hRFxz3uCBLepAUXWqeadOwJjnHdrnOsXaGLe6z8Igd%2f63lf8APB0QKW1USL0ltmBUqAmBkfO2icy1mIkE%2fk%2fI4Sc0OAlh0lHckJ','BPiT4YTP2DVt2BL5REvTheO05Cj/SG//MiDjWsLqv60eLousXPcd/Q7k27Trz9lkpu4V/+KQFqjiqKZPWSnr47g=','CW/Ztq55lulBAI5QE+9Upg==','node','2026-08-28 13:22:24','2026-08-28 13:22:24'),(7,9,'https://wns2-bl2p.notify.windows.com/w/?token=BQYAAAC9LMdh9%2bvxCyqEKkGu9V66G%2f9QDHbldlDiRQYSJsA6cfvotmp1sNTvuNK%2fRUstwz8B2G3tR66ldGvfOyzFij6Ca2brfCyf%2buSHE7BuyTyysHlr7VGe%2b72BBZseZnGHbqRdGkkupyBBYOpmswuOUgZ%2b61ZAvcCwrHznRNsr%2bxCFsPE0a2FclrLf7GLPEUdHiAOy%2fEXcZ%2b7kFZR8WmrIqDb7O%2fwjj8QdcXsn%2bFhcFsOBghWWXdEpoPvKKt9eHl2eNsH20TAodORKXHWOq83SIGbaC4eEx6sCSQk%2fH633YeK98%2fcN%2b7BE8DwHSVplqJpQq5Y%3d','BFJw1ZDam8uOLM3sVFYrlzeQZLmU5dfHZepLNtiOV/qPHvA8FGwtMRPChmw9ttbY0id9NzsUwbsthPrYVl9X/jQ=','AVVb2ibQ2cIr9NWBeeeEeA==','node','2026-09-05 06:16:41','2026-09-07 13:30:54');
/*!40000 ALTER TABLE `push_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rate_histories`
--

DROP TABLE IF EXISTS `rate_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rate_histories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(100) NOT NULL,
  `value` decimal(12,2) DEFAULT NULL,
  `landlordId` int NOT NULL,
  `buildingId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_rate_landlord` (`key`,`landlordId`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rate_histories`
--

LOCK TABLES `rate_histories` WRITE;
/*!40000 ALTER TABLE `rate_histories` DISABLE KEYS */;
INSERT INTO `rate_histories` VALUES (1,'electricityRate',18000.00,6,NULL,'2026-08-07 15:52:05','2026-08-07 15:52:05'),(2,'waterRate',5000.00,6,NULL,'2026-08-07 15:52:05','2026-08-07 15:52:05'),(3,'serviceFee',50000.00,6,NULL,'2026-08-07 15:52:05','2026-08-07 15:52:05'),(4,'electricityRate',16000.00,6,NULL,'2026-07-30 16:06:14','2026-07-30 16:06:14'),(5,'waterRate',4500.00,6,NULL,'2026-07-30 16:06:15','2026-07-30 16:06:15'),(6,'serviceFee',0.00,6,NULL,'2026-07-30 16:06:15','2026-07-30 16:06:15');
/*!40000 ALTER TABLE `rate_histories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_number` varchar(20) NOT NULL,
  `floor` int DEFAULT '1',
  `area` decimal(10,2) DEFAULT NULL,
  `price` decimal(15,0) NOT NULL,
  `status` enum('empty','rented') NOT NULL DEFAULT 'empty',
  `landlordId` int NOT NULL,
  `buildingId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `landlordId` (`landlordId`),
  KEY `fk_rooms_building` (`buildingId`),
  CONSTRAINT `fk_rooms_building` FOREIGN KEY (`buildingId`) REFERENCES `buildings` (`id`) ON DELETE SET NULL,
  CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`landlordId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,'1A',1,25.00,5000000,'rented',6,1,'2026-07-27 15:29:51','2026-08-01 06:18:39'),(2,'1B',1,30.00,6000000,'rented',6,1,'2026-07-27 16:00:05','2026-08-01 06:18:39'),(4,'2A',2,25.00,5000000,'rented',6,1,'2026-07-30 15:41:16','2026-09-01 15:10:16'),(5,'2B',2,25.00,3000000,'rented',6,1,'2026-07-31 12:43:59','2026-08-01 06:18:39'),(6,'1A',1,25.00,3000000,'empty',6,2,'2026-08-28 14:20:44','2026-09-03 15:20:13'),(7,'3A',3,25.00,5500000,'rented',6,1,'2026-09-03 16:05:58','2026-09-03 16:06:29');
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(100) NOT NULL,
  `value` text,
  `landlordId` int NOT NULL,
  `buildingId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_key_landlord` (`key`,`landlordId`),
  UNIQUE KEY `idx_key_landlord_building` (`key`,`landlordId`,`buildingId`),
  KEY `landlordId` (`landlordId`),
  KEY `fk_settings_building` (`buildingId`),
  CONSTRAINT `fk_settings_building` FOREIGN KEY (`buildingId`) REFERENCES `buildings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `settings_ibfk_1` FOREIGN KEY (`landlordId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (3,'contract_template','CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nHỢP ĐỒNG THUÊ PHÒNG TRỌ\n\nHôm nay, ngày {{ngay_hom_nay}}, tại địa chỉ nhà trọ.\n\nBÊN CHO THUÊ (Bên A): Chủ trọ\n- Họ và tên: Chủ trọ\n- Số điện thoại: {{sdt_chu_tro}}\n\nBÊN THUÊ (Bên B):\n- Họ và tên: {{ten_nguoi_thue}}\n- Số CCCD: {{cccd}}\n- Số điện thoại: {{so_dien_thoai}}\n\nHai bên thỏa thuận ký kết hợp đồng thuê phòng trọ với các điều khoản sau:\n\nĐiều 1: Thông tin phòng thuê\n- Phòng số: {{ma_phong}}\n- Giá thuê: {{gia_thue}} VND/tháng\n- Tiền cọc: {{tien_coc}} VND\n\nĐiều 2: Thời hạn hợp đồng\n- Ngày bắt đầu: {{ngay_bat_dau}}\n- Ngày kết thúc: {{ngay_ket_thuc}}\n- Ngày thanh toán hàng tháng: Ngày {{ngay_thu_tien}}\n\nĐiều 3: Quy định khác\n- Mã số vân tay: {{ma_van_tay}}\n- Người ở kèm: {{nguoi_di_kem}}\n\nĐiều 4: Hiệu lực hợp đồng\nHợp đồng có hiệu lực kể từ ngày ký.\n\nĐại diện bên A (Ký, ghi rõ họ tên)          Đại diện bên B (Ký, ghi rõ họ tên)',6,NULL,'2026-07-29 16:25:29','2026-08-30 15:42:53'),(6,'electricityRate','18000',6,NULL,'2026-07-30 16:06:14','2026-08-07 15:52:05'),(7,'waterRate','5000',6,NULL,'2026-07-30 16:06:15','2026-08-07 15:52:05'),(8,'serviceFee','50000',6,NULL,'2026-07-30 16:06:15','2026-08-07 15:52:05'),(9,'landlordName','LÊ THỊ VĨNH',6,NULL,'2026-07-30 16:06:15','2026-08-01 05:20:17'),(10,'landlordPhone','0387217437',6,NULL,'2026-07-30 16:06:15','2026-08-01 05:20:17'),(11,'bankHolder','LÊ THỊ VĨNH',6,NULL,'2026-07-30 16:06:15','2026-08-01 05:20:17'),(12,'bankName','TPBank',6,NULL,'2026-07-30 16:06:15','2026-08-01 05:20:17'),(35,'bankAccount','10004151335',6,NULL,'2026-08-01 05:01:34','2026-08-01 05:20:17'),(36,'bankBranch','Hồ Chí Minh',6,NULL,'2026-08-01 05:01:35','2026-08-01 05:20:17'),(47,'telegramBotToken','8653456084:AAFuEMrs-kQdgz5MH3nfasqOhNgM2Fa57ao',6,NULL,'2026-08-01 07:02:19','2026-08-01 07:02:19'),(48,'autoReminderTemplate','Kính gửi {{TENKHACH}} (Phòng {{MAPHONG}}), đã đến kỳ thu tiền nhà tháng {{THANG}}. Vui lòng thanh toán trước ngày {{HAN_THANH_TOAN}}. Chân thành cảm ơn!',6,NULL,'2026-08-01 08:30:51','2026-08-01 09:25:09'),(49,'landlordTelegramId','667203953',6,NULL,'2026-08-02 07:49:41','2026-08-02 07:49:41');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_notification_reads`
--

DROP TABLE IF EXISTS `tenant_notification_reads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_notification_reads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenantId` int NOT NULL,
  `kind` varchar(20) NOT NULL,
  `targetId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenant_notification_reads_tenant_id_kind_target_id` (`tenantId`,`kind`,`targetId`),
  CONSTRAINT `tenant_notification_reads_ibfk_1` FOREIGN KEY (`tenantId`) REFERENCES `tenants` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_notification_reads`
--

LOCK TABLES `tenant_notification_reads` WRITE;
/*!40000 ALTER TABLE `tenant_notification_reads` DISABLE KEYS */;
INSERT INTO `tenant_notification_reads` VALUES (1,4,'invoice',1,'2026-08-02 07:36:20','2026-08-02 07:36:20'),(2,4,'issue',1,'2026-08-02 07:39:29','2026-08-02 07:39:29'),(3,2,'invoice',5,'2026-08-30 06:21:58','2026-08-30 06:21:58');
/*!40000 ALTER TABLE `tenant_notification_reads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `cccd` varchar(20) DEFAULT NULL,
  `telegramChatId` varchar(64) DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `buildingId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `tenants_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES (1,'Trần Văn A','0909090909','123456789',NULL,5,1,'2026-07-27 15:41:18','2026-08-30 02:20:23'),(2,'Nguyễn Thị B','0808080808','',NULL,7,1,'2026-07-27 15:52:34','2026-08-09 07:58:38'),(3,'Test Tenant','0987654321','123456789',NULL,NULL,1,'2026-07-27 16:06:05','2026-08-30 02:41:45'),(4,'Lê Tiến Đạt','0909080708','123456789','667203953',9,1,'2026-07-31 12:42:52','2026-08-01 15:07:38'),(6,'Võ Văn V','0908098098','123456789',NULL,13,NULL,'2026-08-22 04:25:53','2026-08-22 04:25:53'),(7,'Trần My','09080808082','1111',NULL,16,2,'2026-08-25 12:32:53','2026-09-03 15:19:46'),(8,'Lê R','0908090809','12534',NULL,17,1,'2026-08-28 12:36:47','2026-09-01 15:10:16'),(9,'Test User','0912345678',NULL,NULL,18,NULL,'2026-08-28 13:14:50','2026-08-28 13:14:50'),(10,'Vo T','0908070606','1234',NULL,20,NULL,'2026-08-28 13:56:10','2026-08-28 13:56:10');
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` enum('landlord','tenant') NOT NULL DEFAULT 'tenant',
  `currentSessionToken` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `avatar` varchar(255) DEFAULT NULL,
  `cccd` varchar(20) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (5,'tranvana@gmail.com','0909090909','$2b$10$GJZhYYdCmyNqJQJqVBBoL.ZDsQ1AaihumNr44whdTMdUmL5/e8xLa','Trần Văn A','tenant',NULL,1,NULL,NULL,'2026-07-27 15:19:21','2026-08-28 13:54:00'),(6,'namnguyenchan@gmail.com','0907089022','$2b$10$kLM79JoSFL4ibvPXux.3neJmtTsvwajUbvSBPnzoMyTBR1wqeW9EC','Nguyễn Chấn Nam','landlord','a5bc2ca2-7f3f-4235-b04a-8285434dcb49',1,NULL,NULL,'2026-07-27 15:20:39','2026-09-07 14:10:46'),(7,'nguyenthib@gmail.com','0808080808','$2b$10$BKh1vZrT4hEs3yablQY9feT7eaSV8D9WRa4UE0JdhaeBJHY10j3Ay','Nguyễn Thị B','tenant',NULL,1,NULL,NULL,'2026-07-27 15:52:34','2026-09-01 13:15:09'),(9,'lentrendat@gmail.com','0907089021','$2b$10$wSUrq//3UlmGAIt3hd58mOeN6DiwPUAQ2a02RJQex6eUHIpZry4v6','Le Tien Dat','tenant','08fe3f84-4c74-45ef-b79f-b2dcb87a1e27',1,NULL,'123456789','2026-07-31 12:42:52','2026-09-07 13:30:53'),(11,'lethivinh@gmail.com','0387217437','$2b$10$0A7y6TmQfSwlPusdI1vjZO0ncWzlJH0k1rd0Z/pp7DARDxoj0yBB6','Lê Thị Vĩnh','landlord',NULL,1,NULL,NULL,'2026-08-02 08:10:37','2026-08-02 08:10:37'),(13,'vovanv@gmail.com','0908098098','$2b$10$ZX8qTdWIiF0s2fVE0gDqruyLbb0jAnw4xPaqw1WR/1Hrh.YYxJ8OC','Võ Văn V','tenant','827d5cf8-aa44-4a73-8688-9259f59f86c6',1,NULL,NULL,'2026-08-22 04:25:53','2026-08-22 04:26:13'),(14,'testcnt@gmail.com','0900000100','$2b$10$xcsddFvNFEZJgsGNxWkpX.QeEL7Jsnw0Z62cALjuBNafRlyiFuApG','TestCNT','landlord','9151ff4a-7768-4042-8519-b0e1b5653e50',1,NULL,NULL,'2026-08-23 11:54:46','2026-08-24 15:06:44'),(15,'chuhoangsa2@gmail.com','0900000200','$2b$10$P9Yn1PBkIs6iAc1m5IXudegWh3QxDHEfdfDsSqjHq21EVTlK5Yc0K','Chu Tro 2 (Hoang Sa)','landlord','8dc4c94e-b7f3-4d8e-a9c6-1403d19a308c',1,NULL,NULL,'2026-08-24 15:02:12','2026-08-24 15:06:43'),(16,'tranm@gmail.com','09080808080','$2b$10$kt8pl6efGi9WY8cwLyUAAOzQ2dVTkTgk7xZutsUXB80yp6cRjSnua','Trần M','tenant',NULL,1,NULL,NULL,'2026-08-25 12:32:53','2026-08-25 12:32:53'),(17,'ler@gmail.com','0908090809','$2b$10$DOOLRbI8cEXvn.KOCEtAFODH98U3MKmTFFxjj8SykdjtsSHfnz9vW','Lê R','tenant',NULL,1,NULL,NULL,'2026-08-28 12:36:47','2026-09-07 13:22:33'),(18,'lertest999@gmail.com','0912345678','$2b$10$ajE3GqB6NCSyXoRu5GJkg.Dhvr8u5/y2J1DpaPXdfc9.vHzrRZrnO','Test User','tenant','f9a53841-c02e-489e-acb4-a9b5c2f9be46',1,NULL,NULL,'2026-08-28 13:14:50','2026-08-28 13:14:50'),(20,'vot@gmail.com','0908070606','$2b$10$Kx0h8BAzymBsOETbToC7i.Jnn0IYYhHp8AYI0E1eq6Zn2.i5jZjTi','Vo T','tenant','6b967bc6-e5b4-4e90-a80f-0fd8c2a5448b',1,NULL,NULL,'2026-08-28 13:56:10','2026-08-28 13:57:03');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-07 21:12:01
