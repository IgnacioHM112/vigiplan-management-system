-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: brujula_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `asignaciones_cronograma`
--

DROP TABLE IF EXISTS `asignaciones_cronograma`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignaciones_cronograma` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_requerimiento` int NOT NULL,
  `id_vigilador` int NOT NULL,
  `fecha_asignacion` date NOT NULL,
  `estado` varchar(50) NOT NULL DEFAULT 'pendiente',
  PRIMARY KEY (`id`),
  KEY `id_requerimiento` (`id_requerimiento`),
  KEY `id_vigilador` (`id_vigilador`),
  CONSTRAINT `asignaciones_cronograma_ibfk_1` FOREIGN KEY (`id_requerimiento`) REFERENCES `requerimientos_mensuales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `asignaciones_cronograma_ibfk_2` FOREIGN KEY (`id_vigilador`) REFERENCES `vigiladores` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1630 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignaciones_cronograma`
--

LOCK TABLES `asignaciones_cronograma` WRITE;
/*!40000 ALTER TABLE `asignaciones_cronograma` DISABLE KEYS */;
INSERT INTO `asignaciones_cronograma` VALUES (1443,125,8,'2026-07-01','propuesto'),(1444,63,5,'2026-07-01','propuesto'),(1445,1,8,'2026-07-01','propuesto'),(1446,126,14,'2026-07-01','propuesto'),(1447,64,7,'2026-07-01','propuesto'),(1448,2,3,'2026-07-01','propuesto'),(1449,127,14,'2026-07-02','propuesto'),(1450,65,10,'2026-07-02','propuesto'),(1451,3,12,'2026-07-02','propuesto'),(1452,128,6,'2026-07-02','propuesto'),(1453,66,8,'2026-07-02','propuesto'),(1454,4,6,'2026-07-02','propuesto'),(1456,67,10,'2026-07-03','propuesto'),(1457,5,13,'2026-07-03','propuesto'),(1458,130,4,'2026-07-03','propuesto'),(1459,68,14,'2026-07-03','propuesto'),(1460,6,3,'2026-07-03','propuesto'),(1461,131,7,'2026-07-04','propuesto'),(1462,69,14,'2026-07-04','propuesto'),(1463,7,10,'2026-07-04','propuesto'),(1464,132,10,'2026-07-04','propuesto'),(1465,70,5,'2026-07-04','propuesto'),(1466,8,14,'2026-07-04','propuesto'),(1467,133,10,'2026-07-05','propuesto'),(1468,71,2,'2026-07-05','propuesto'),(1469,9,6,'2026-07-05','propuesto'),(1470,134,1,'2026-07-05','propuesto'),(1471,72,14,'2026-07-05','propuesto'),(1472,10,14,'2026-07-05','propuesto'),(1473,135,14,'2026-07-06','propuesto'),(1474,73,2,'2026-07-06','propuesto'),(1475,11,7,'2026-07-06','propuesto'),(1476,136,11,'2026-07-06','propuesto'),(1477,74,7,'2026-07-06','propuesto'),(1478,12,3,'2026-07-06','propuesto'),(1479,137,14,'2026-07-07','propuesto'),(1480,75,3,'2026-07-07','propuesto'),(1481,13,13,'2026-07-07','propuesto'),(1482,138,1,'2026-07-07','propuesto'),(1483,76,5,'2026-07-07','propuesto'),(1484,14,4,'2026-07-07','propuesto'),(1485,139,9,'2026-07-08','propuesto'),(1486,77,3,'2026-07-08','propuesto'),(1487,15,8,'2026-07-08','propuesto'),(1488,140,6,'2026-07-08','propuesto'),(1489,78,11,'2026-07-08','propuesto'),(1490,16,13,'2026-07-08','propuesto'),(1491,141,12,'2026-07-09','propuesto'),(1492,79,2,'2026-07-09','propuesto'),(1493,17,15,'2026-07-09','propuesto'),(1494,142,7,'2026-07-09','propuesto'),(1495,80,5,'2026-07-09','propuesto'),(1496,18,12,'2026-07-09','propuesto'),(1497,143,12,'2026-07-10','propuesto'),(1498,81,14,'2026-07-10','propuesto'),(1499,19,4,'2026-07-10','propuesto'),(1500,144,11,'2026-07-10','propuesto'),(1501,82,3,'2026-07-10','propuesto'),(1502,20,13,'2026-07-10','propuesto'),(1503,145,11,'2026-07-11','propuesto'),(1504,83,12,'2026-07-11','propuesto'),(1505,21,9,'2026-07-11','propuesto'),(1506,146,9,'2026-07-11','propuesto'),(1507,84,3,'2026-07-11','propuesto'),(1508,22,11,'2026-07-11','propuesto'),(1509,147,1,'2026-07-12','propuesto'),(1510,85,11,'2026-07-12','propuesto'),(1511,23,3,'2026-07-12','propuesto'),(1512,148,14,'2026-07-12','propuesto'),(1513,86,8,'2026-07-12','propuesto'),(1514,24,11,'2026-07-12','propuesto'),(1515,149,6,'2026-07-13','propuesto'),(1516,87,14,'2026-07-13','propuesto'),(1517,25,9,'2026-07-13','propuesto'),(1518,150,2,'2026-07-13','propuesto'),(1519,88,7,'2026-07-13','propuesto'),(1520,26,9,'2026-07-13','propuesto'),(1521,151,12,'2026-07-14','propuesto'),(1522,89,14,'2026-07-14','propuesto'),(1523,27,7,'2026-07-14','propuesto'),(1524,152,5,'2026-07-14','propuesto'),(1525,90,6,'2026-07-14','propuesto'),(1526,28,9,'2026-07-14','propuesto'),(1527,153,11,'2026-07-15','propuesto'),(1528,91,13,'2026-07-15','propuesto'),(1529,29,14,'2026-07-15','propuesto'),(1530,154,2,'2026-07-15','propuesto'),(1531,92,6,'2026-07-15','propuesto'),(1532,30,10,'2026-07-15','propuesto'),(1533,155,3,'2026-07-16','propuesto'),(1534,93,10,'2026-07-16','propuesto'),(1535,31,2,'2026-07-16','propuesto'),(1536,156,14,'2026-07-16','propuesto'),(1537,94,13,'2026-07-16','propuesto'),(1538,32,3,'2026-07-16','propuesto'),(1539,157,9,'2026-07-17','propuesto'),(1540,95,13,'2026-07-17','propuesto'),(1541,33,13,'2026-07-17','propuesto'),(1542,158,11,'2026-07-17','propuesto'),(1543,96,5,'2026-07-17','propuesto'),(1544,34,5,'2026-07-17','propuesto'),(1545,159,1,'2026-07-18','propuesto'),(1546,97,11,'2026-07-18','propuesto'),(1547,35,5,'2026-07-18','propuesto'),(1548,160,15,'2026-07-18','propuesto'),(1549,98,9,'2026-07-18','propuesto'),(1550,36,5,'2026-07-18','propuesto'),(1551,161,13,'2026-07-19','propuesto'),(1552,99,9,'2026-07-19','propuesto'),(1553,37,1,'2026-07-19','propuesto'),(1554,162,2,'2026-07-19','propuesto'),(1555,100,7,'2026-07-19','propuesto'),(1556,38,9,'2026-07-19','propuesto'),(1557,163,1,'2026-07-20','propuesto'),(1558,101,10,'2026-07-20','propuesto'),(1559,39,4,'2026-07-20','propuesto'),(1560,164,12,'2026-07-20','propuesto'),(1561,102,14,'2026-07-20','propuesto'),(1562,40,9,'2026-07-20','propuesto'),(1563,165,11,'2026-07-21','propuesto'),(1564,103,1,'2026-07-21','propuesto'),(1565,41,6,'2026-07-21','propuesto'),(1566,166,5,'2026-07-21','propuesto'),(1567,104,11,'2026-07-21','propuesto'),(1568,42,11,'2026-07-21','propuesto'),(1569,167,3,'2026-07-22','propuesto'),(1570,105,3,'2026-07-22','propuesto'),(1571,43,12,'2026-07-22','propuesto'),(1572,168,12,'2026-07-22','propuesto'),(1573,106,15,'2026-07-22','propuesto'),(1574,44,4,'2026-07-22','propuesto'),(1575,169,5,'2026-07-23','propuesto'),(1576,107,14,'2026-07-23','propuesto'),(1577,45,1,'2026-07-23','propuesto'),(1578,170,12,'2026-07-23','propuesto'),(1579,108,11,'2026-07-23','propuesto'),(1580,46,4,'2026-07-23','propuesto'),(1581,171,5,'2026-07-24','propuesto'),(1582,109,8,'2026-07-24','propuesto'),(1583,47,8,'2026-07-24','propuesto'),(1584,172,1,'2026-07-24','propuesto'),(1585,110,6,'2026-07-24','propuesto'),(1586,48,13,'2026-07-24','propuesto'),(1587,173,11,'2026-07-25','propuesto'),(1588,111,13,'2026-07-25','propuesto'),(1589,49,2,'2026-07-25','propuesto'),(1590,174,13,'2026-07-25','propuesto'),(1591,112,11,'2026-07-25','propuesto'),(1592,50,6,'2026-07-25','propuesto'),(1593,175,14,'2026-07-26','propuesto'),(1594,113,6,'2026-07-26','propuesto'),(1595,51,6,'2026-07-26','propuesto'),(1596,176,7,'2026-07-26','propuesto'),(1597,114,1,'2026-07-26','propuesto'),(1598,52,14,'2026-07-26','propuesto'),(1599,177,8,'2026-07-27','propuesto'),(1600,115,9,'2026-07-27','propuesto'),(1601,53,5,'2026-07-27','propuesto'),(1602,178,14,'2026-07-27','propuesto'),(1603,116,14,'2026-07-27','propuesto'),(1604,54,6,'2026-07-27','propuesto'),(1605,179,2,'2026-07-28','propuesto'),(1606,117,6,'2026-07-28','propuesto'),(1607,55,3,'2026-07-28','propuesto'),(1608,180,14,'2026-07-28','propuesto'),(1609,118,4,'2026-07-28','propuesto'),(1610,56,15,'2026-07-28','propuesto'),(1611,181,15,'2026-07-29','propuesto'),(1612,119,2,'2026-07-29','propuesto'),(1613,57,3,'2026-07-29','propuesto'),(1614,182,5,'2026-07-29','propuesto'),(1615,120,8,'2026-07-29','propuesto'),(1616,58,7,'2026-07-29','propuesto'),(1617,183,12,'2026-07-30','propuesto'),(1618,121,2,'2026-07-30','propuesto'),(1619,59,4,'2026-07-30','propuesto'),(1620,184,1,'2026-07-30','propuesto'),(1621,122,6,'2026-07-30','propuesto'),(1622,60,12,'2026-07-30','propuesto'),(1623,185,8,'2026-07-31','propuesto'),(1624,123,10,'2026-07-31','propuesto'),(1625,61,10,'2026-07-31','propuesto'),(1626,186,11,'2026-07-31','propuesto'),(1627,124,4,'2026-07-31','propuesto'),(1628,62,11,'2026-07-31','propuesto'),(1629,129,12,'2026-07-03','conflicto');
/*!40000 ALTER TABLE `asignaciones_cronograma` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `objetivos`
--

DROP TABLE IF EXISTS `objetivos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `objetivos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `objetivos`
--

LOCK TABLES `objetivos` WRITE;
/*!40000 ALTER TABLE `objetivos` DISABLE KEYS */;
INSERT INTO `objetivos` VALUES (1,'Hiper ChangoMas','Dorrego');
/*!40000 ALTER TABLE `objetivos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `puestos`
--

DROP TABLE IF EXISTS `puestos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `puestos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_objetivo` int NOT NULL,
  `nombre` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_objetivo` (`id_objetivo`),
  CONSTRAINT `puestos_ibfk_1` FOREIGN KEY (`id_objetivo`) REFERENCES `objetivos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `puestos`
--

LOCK TABLES `puestos` WRITE;
/*!40000 ALTER TABLE `puestos` DISABLE KEYS */;
INSERT INTO `puestos` VALUES (1,1,'Entrada'),(2,1,'Playa'),(3,1,'Cajas');
/*!40000 ALTER TABLE `puestos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `requerimientos_mensuales`
--

DROP TABLE IF EXISTS `requerimientos_mensuales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `requerimientos_mensuales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_puesto` int NOT NULL,
  `fecha` date NOT NULL,
  `id_turno_config` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_puesto` (`id_puesto`),
  KEY `id_turno_config` (`id_turno_config`),
  CONSTRAINT `requerimientos_mensuales_ibfk_1` FOREIGN KEY (`id_puesto`) REFERENCES `puestos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `requerimientos_mensuales_ibfk_2` FOREIGN KEY (`id_turno_config`) REFERENCES `turnos_config` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=373 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `requerimientos_mensuales`
--

LOCK TABLES `requerimientos_mensuales` WRITE;
/*!40000 ALTER TABLE `requerimientos_mensuales` DISABLE KEYS */;
INSERT INTO `requerimientos_mensuales` VALUES (1,1,'2026-07-01',1),(2,1,'2026-07-01',2),(3,1,'2026-07-02',1),(4,1,'2026-07-02',2),(5,1,'2026-07-03',1),(6,1,'2026-07-03',2),(7,1,'2026-07-04',1),(8,1,'2026-07-04',2),(9,1,'2026-07-05',1),(10,1,'2026-07-05',2),(11,1,'2026-07-06',1),(12,1,'2026-07-06',2),(13,1,'2026-07-07',1),(14,1,'2026-07-07',2),(15,1,'2026-07-08',1),(16,1,'2026-07-08',2),(17,1,'2026-07-09',1),(18,1,'2026-07-09',2),(19,1,'2026-07-10',1),(20,1,'2026-07-10',2),(21,1,'2026-07-11',1),(22,1,'2026-07-11',2),(23,1,'2026-07-12',1),(24,1,'2026-07-12',2),(25,1,'2026-07-13',1),(26,1,'2026-07-13',2),(27,1,'2026-07-14',1),(28,1,'2026-07-14',2),(29,1,'2026-07-15',1),(30,1,'2026-07-15',2),(31,1,'2026-07-16',1),(32,1,'2026-07-16',2),(33,1,'2026-07-17',1),(34,1,'2026-07-17',2),(35,1,'2026-07-18',1),(36,1,'2026-07-18',2),(37,1,'2026-07-19',1),(38,1,'2026-07-19',2),(39,1,'2026-07-20',1),(40,1,'2026-07-20',2),(41,1,'2026-07-21',1),(42,1,'2026-07-21',2),(43,1,'2026-07-22',1),(44,1,'2026-07-22',2),(45,1,'2026-07-23',1),(46,1,'2026-07-23',2),(47,1,'2026-07-24',1),(48,1,'2026-07-24',2),(49,1,'2026-07-25',1),(50,1,'2026-07-25',2),(51,1,'2026-07-26',1),(52,1,'2026-07-26',2),(53,1,'2026-07-27',1),(54,1,'2026-07-27',2),(55,1,'2026-07-28',1),(56,1,'2026-07-28',2),(57,1,'2026-07-29',1),(58,1,'2026-07-29',2),(59,1,'2026-07-30',1),(60,1,'2026-07-30',2),(61,1,'2026-07-31',1),(62,1,'2026-07-31',2),(63,2,'2026-07-01',1),(64,2,'2026-07-01',2),(65,2,'2026-07-02',1),(66,2,'2026-07-02',2),(67,2,'2026-07-03',1),(68,2,'2026-07-03',2),(69,2,'2026-07-04',1),(70,2,'2026-07-04',2),(71,2,'2026-07-05',1),(72,2,'2026-07-05',2),(73,2,'2026-07-06',1),(74,2,'2026-07-06',2),(75,2,'2026-07-07',1),(76,2,'2026-07-07',2),(77,2,'2026-07-08',1),(78,2,'2026-07-08',2),(79,2,'2026-07-09',1),(80,2,'2026-07-09',2),(81,2,'2026-07-10',1),(82,2,'2026-07-10',2),(83,2,'2026-07-11',1),(84,2,'2026-07-11',2),(85,2,'2026-07-12',1),(86,2,'2026-07-12',2),(87,2,'2026-07-13',1),(88,2,'2026-07-13',2),(89,2,'2026-07-14',1),(90,2,'2026-07-14',2),(91,2,'2026-07-15',1),(92,2,'2026-07-15',2),(93,2,'2026-07-16',1),(94,2,'2026-07-16',2),(95,2,'2026-07-17',1),(96,2,'2026-07-17',2),(97,2,'2026-07-18',1),(98,2,'2026-07-18',2),(99,2,'2026-07-19',1),(100,2,'2026-07-19',2),(101,2,'2026-07-20',1),(102,2,'2026-07-20',2),(103,2,'2026-07-21',1),(104,2,'2026-07-21',2),(105,2,'2026-07-22',1),(106,2,'2026-07-22',2),(107,2,'2026-07-23',1),(108,2,'2026-07-23',2),(109,2,'2026-07-24',1),(110,2,'2026-07-24',2),(111,2,'2026-07-25',1),(112,2,'2026-07-25',2),(113,2,'2026-07-26',1),(114,2,'2026-07-26',2),(115,2,'2026-07-27',1),(116,2,'2026-07-27',2),(117,2,'2026-07-28',1),(118,2,'2026-07-28',2),(119,2,'2026-07-29',1),(120,2,'2026-07-29',2),(121,2,'2026-07-30',1),(122,2,'2026-07-30',2),(123,2,'2026-07-31',1),(124,2,'2026-07-31',2),(125,3,'2026-07-01',1),(126,3,'2026-07-01',2),(127,3,'2026-07-02',1),(128,3,'2026-07-02',2),(129,3,'2026-07-03',1),(130,3,'2026-07-03',2),(131,3,'2026-07-04',1),(132,3,'2026-07-04',2),(133,3,'2026-07-05',1),(134,3,'2026-07-05',2),(135,3,'2026-07-06',1),(136,3,'2026-07-06',2),(137,3,'2026-07-07',1),(138,3,'2026-07-07',2),(139,3,'2026-07-08',1),(140,3,'2026-07-08',2),(141,3,'2026-07-09',1),(142,3,'2026-07-09',2),(143,3,'2026-07-10',1),(144,3,'2026-07-10',2),(145,3,'2026-07-11',1),(146,3,'2026-07-11',2),(147,3,'2026-07-12',1),(148,3,'2026-07-12',2),(149,3,'2026-07-13',1),(150,3,'2026-07-13',2),(151,3,'2026-07-14',1),(152,3,'2026-07-14',2),(153,3,'2026-07-15',1),(154,3,'2026-07-15',2),(155,3,'2026-07-16',1),(156,3,'2026-07-16',2),(157,3,'2026-07-17',1),(158,3,'2026-07-17',2),(159,3,'2026-07-18',1),(160,3,'2026-07-18',2),(161,3,'2026-07-19',1),(162,3,'2026-07-19',2),(163,3,'2026-07-20',1),(164,3,'2026-07-20',2),(165,3,'2026-07-21',1),(166,3,'2026-07-21',2),(167,3,'2026-07-22',1),(168,3,'2026-07-22',2),(169,3,'2026-07-23',1),(170,3,'2026-07-23',2),(171,3,'2026-07-24',1),(172,3,'2026-07-24',2),(173,3,'2026-07-25',1),(174,3,'2026-07-25',2),(175,3,'2026-07-26',1),(176,3,'2026-07-26',2),(177,3,'2026-07-27',1),(178,3,'2026-07-27',2),(179,3,'2026-07-28',1),(180,3,'2026-07-28',2),(181,3,'2026-07-29',1),(182,3,'2026-07-29',2),(183,3,'2026-07-30',1),(184,3,'2026-07-30',2),(185,3,'2026-07-31',1),(186,3,'2026-07-31',2);
/*!40000 ALTER TABLE `requerimientos_mensuales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `turnos_config`
--

DROP TABLE IF EXISTS `turnos_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `turnos_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_objetivo` int NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `duracion_horas` decimal(5,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_objetivo` (`id_objetivo`),
  CONSTRAINT `turnos_config_ibfk_1` FOREIGN KEY (`id_objetivo`) REFERENCES `objetivos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `turnos_config`
--

LOCK TABLES `turnos_config` WRITE;
/*!40000 ALTER TABLE `turnos_config` DISABLE KEYS */;
INSERT INTO `turnos_config` VALUES (1,1,'Ma�ana','07:00:00','11:00:00',4.00),(2,1,'Turno Tarde','13:00:00','21:00:00',8.00);
/*!40000 ALTER TABLE `turnos_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vigiladores`
--

DROP TABLE IF EXISTS `vigiladores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vigiladores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `legajo` varchar(50) NOT NULL,
  `max_horas_mensuales` decimal(6,2) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `legajo` (`legajo`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vigiladores`
--

LOCK TABLES `vigiladores` WRITE;
/*!40000 ALTER TABLE `vigiladores` DISABLE KEYS */;
INSERT INTO `vigiladores` VALUES (1,'MERCAU JUAN','14779',200.00,1),(2,'AQUENES NICOLAS','18305',200.00,1),(3,'ROSALES ARMANDO','15166',200.00,1),(4,'GONZALEZ CRISTIAN','18539',200.00,1),(5,'ESTRADA BAUTISTA','19409',200.00,1),(6,'MONDACA MAURO','19396',200.00,1),(7,'BOTTANI LUCAS','19025',200.00,1),(8,'VEDIA ROBERTO FRANCISCO','14071',200.00,1),(9,'POVEZ ESTEBAN TOMAS','18886',200.00,1),(10,'ARMENDIA CARLOS','13220',200.00,1),(11,'CRUZ JONATHAN','18390',200.00,1),(12,'LAZARO PABLO','17207',200.00,1),(13,'SARMIENTO DIEGO','12312',200.00,1),(14,'DOBERTI JUAN PABLO','18589',200.00,1),(15,'MASUECO ROBERTO','12331',200.00,1);
/*!40000 ALTER TABLE `vigiladores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'brujula_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-07 20:10:47
