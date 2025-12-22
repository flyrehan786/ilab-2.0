-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: lab_management
-- ------------------------------------------------------
-- Server version	8.0.44

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
-- Table structure for table `tests`
--

DROP TABLE IF EXISTS `tests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `test_code` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `category_id` int DEFAULT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `normal_range` varchar(200) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `sample_type` varchar(100) DEFAULT NULL,
  `preparation_instructions` text,
  `turnaround_time` int DEFAULT NULL COMMENT 'in hours',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `test_code` (`test_code`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `tests_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `test_categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tests`
--

LOCK TABLES `tests` WRITE;
/*!40000 ALTER TABLE `tests` DISABLE KEYS */;
INSERT INTO `tests` VALUES (1,'CBC001','Complete Blood Count',1,NULL,500.00,'4.5-11.0','10^9/L','Blood',NULL,4,1,'2025-10-26 16:45:52','2025-10-26 16:45:52'),(2,'GLU001','Fasting Blood Sugar',2,NULL,200.00,'70-100','mg/dL','Blood',NULL,2,1,'2025-10-26 16:45:52','2025-10-26 16:45:52'),(3,'LFT001','Liver Function Test',2,NULL,800.00,'Various','Various','Blood',NULL,6,1,'2025-10-26 16:45:52','2025-10-26 16:45:52'),(4,'KFT001','Kidney Function Test',2,NULL,700.00,'Various','Various','Blood',NULL,6,1,'2025-10-26 16:45:52','2025-10-26 16:45:52'),(5,'LIPID001','Lipid Profile',2,NULL,600.00,'Various','mg/dL','Blood',NULL,4,1,'2025-10-26 16:45:52','2025-10-26 16:45:52'),(6,'TSH001','Thyroid Stimulating Hormone',4,NULL,400.00,'0.4-4.0','mIU/L','Blood',NULL,8,1,'2025-10-26 16:45:52','2025-10-26 16:45:52'),(7,'HBA1C001','HbA1c',2,NULL,500.00,'4.0-5.6','%','Blood',NULL,4,1,'2025-10-26 16:45:52','2025-10-26 16:45:52'),(8,'URINE001','Urine Routine',3,NULL,150.00,'Normal','Various','Urine',NULL,2,1,'2025-10-26 16:45:52','2025-10-26 16:45:52');
/*!40000 ALTER TABLE `tests` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-22 12:06:25
