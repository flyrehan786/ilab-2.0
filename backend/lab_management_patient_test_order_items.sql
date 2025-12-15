-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: localhost    Database: lab_management
-- ------------------------------------------------------
-- Server version	8.2.0

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
-- Table structure for table `patient_test_order_items`
--

DROP TABLE IF EXISTS `patient_test_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_test_order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `test_id` int NOT NULL,
  `test_name` varchar(200) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `status` enum('pending','in_progress','completed') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `test_id` (`test_id`),
  CONSTRAINT `patient_test_order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `patient_test_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `patient_test_order_items_ibfk_2` FOREIGN KEY (`test_id`) REFERENCES `tests` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_test_order_items`
--

LOCK TABLES `patient_test_order_items` WRITE;
/*!40000 ALTER TABLE `patient_test_order_items` DISABLE KEYS */;
INSERT INTO `patient_test_order_items` VALUES (1,1,1,'Complete Blood Count (CBC)',200.00,'pending','2025-10-14 11:07:53'),(2,1,2,'Thyroid Function Test',400.00,'pending','2025-10-14 11:07:53'),(3,2,1,'Complete Blood Count (CBC)',200.00,'completed','2025-10-14 11:10:36'),(4,2,2,'Thyroid Function Test',400.00,'completed','2025-10-14 11:10:36'),(5,3,1,'Complete Blood Count',500.00,'completed','2025-10-14 12:19:08'),(6,3,9,'Complete Blood Count (CBC)',1200.00,'completed','2025-10-14 12:19:08'),(7,3,2,'Fasting Blood Sugar',200.00,'completed','2025-10-14 12:19:08'),(8,3,7,'HbA1c',500.00,'completed','2025-10-14 12:19:08'),(9,3,4,'Kidney Function Test',700.00,'completed','2025-10-14 12:19:08'),(10,3,5,'Lipid Profile',600.00,'completed','2025-10-14 12:19:08'),(11,3,6,'Thyroid Stimulating Hormone',400.00,'completed','2025-10-14 12:19:08'),(12,3,3,'Liver Function Test',800.00,'completed','2025-10-14 12:19:08'),(13,4,1,'Complete Blood Count',500.00,'completed','2025-10-14 12:21:08'),(14,4,10,'Complete Blood Count (CBC)',1200.00,'completed','2025-10-14 12:21:08'),(15,5,1,'Complete Blood Count',500.00,'completed','2025-10-14 12:22:25'),(16,6,1,'Complete Blood Count',500.00,'completed','2025-10-21 06:43:13'),(17,6,7,'HbA1c',500.00,'completed','2025-10-21 06:43:13'),(18,7,5,'Lipid Profile',600.00,'completed','2025-10-21 06:53:52'),(19,7,9,'Complete Blood Count (CBC)',1200.00,'completed','2025-10-21 06:53:52'),(20,8,7,'HbA1c',500.00,'completed','2025-11-12 10:54:14'),(21,8,2,'Fasting Blood Sugar',200.00,'completed','2025-11-12 10:54:14'),(22,9,7,'HbA1c',500.00,'completed','2025-11-12 10:59:14'),(23,9,2,'Fasting Blood Sugar',200.00,'completed','2025-11-12 10:59:14'),(24,10,7,'HbA1c',500.00,'completed','2025-11-12 11:02:52'),(25,11,2,'Fasting Blood Sugar',200.00,'completed','2025-11-12 11:41:03'),(26,12,7,'HbA1c',500.00,'completed','2025-11-12 11:44:28');
/*!40000 ALTER TABLE `patient_test_order_items` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-15 17:28:24
