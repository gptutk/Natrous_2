CREATE TABLE `customer` (
  `first name` varchar(10) NOT NULL,
  `last name` varchar(10) NOT NULL,
  `email` varchar(45) NOT NULL,
  `address` varchar(100) DEFAULT NULL,
  `phone number` varchar(10) NOT NULL,
  PRIMARY KEY (`email`)
) 
CREATE TABLE `travel_agency` (
  `name` varchar(45) NOT NULL,
  `address` varchar(45) DEFAULT NULL,
  `mobile number` varchar(10) NOT NULL,
  `email` varchar(45) NOT NULL,
  PRIMARY KEY (`name`)
)
CREATE TABLE `tour` (
  `tour name` varchar(45) NOT NULL,
  `Duration` varchar(45) NOT NULL,
  `start date` date NOT NULL,
  `end date` date NOT NULL,
  `price` int NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `ratings` decimal(2,1) DEFAULT NULL,
  `destination` varchar(45) NOT NULL,
  `travel agency name` varchar(45) NOT NULL,
  PRIMARY KEY (`tour name`),
  KEY `travel agency name_idx` (`travel agency name`),
  CONSTRAINT `travel agency name` FOREIGN KEY (`travel agency name`) REFERENCES `travel_agency` (`name`)
) 

CREATE TABLE `review` (
  `tour name` varchar(45) NOT NULL,
  `rating` decimal(2,1) NOT NULL,
  `comment` varchar(100) DEFAULT NULL,
  `date` date NOT NULL,
  `review id` int NOT NULL,
  `customer email` varchar(45) NOT NULL,
  PRIMARY KEY (`review id`,`customer email`),
  KEY `customer email` (`customer email`),
  CONSTRAINT `review_ibfk_1` FOREIGN KEY (`customer email`) REFERENCES `customer` (`email`)
) 

CREATE TABLE `booking` (
  `email` varchar(45) NOT NULL,
  `tour name` varchar(45) NOT NULL,
  PRIMARY KEY (`email`,`tour name`),
  KEY `tour name_idx` (`tour name`),
  CONSTRAINT `customer email` FOREIGN KEY (`email`) REFERENCES `customer` (`email`),
  CONSTRAINT `tour name` FOREIGN KEY (`tour name`) REFERENCES `tour` (`tour name`)
) 

CREATE TABLE `payment` (
  `payment id` varchar(10) NOT NULL,
  `email` varchar(45) NOT NULL,
  `date` date NOT NULL,
  `currency` varchar(45) NOT NULL,
  `amount` decimal(6,2) NOT NULL,
  `payment method` varchar(45) NOT NULL,
  PRIMARY KEY (`payment id`),
  KEY `email_idx` (`email`),
  CONSTRAINT `email` FOREIGN KEY (`email`) REFERENCES `customer` (`email`)
)

CREATE TABLE 'phone_numbers' (
  `phone number` varchar(10) NOT NULL,
  `email` varchar(45) NOT NULL,
  PRIMARY KEY (`phone number`,`email`),
  KEY `customer email_idx` (`email`),
  CONSTRAINT `phone numbers_ibfk_1` FOREIGN KEY (`email`) REFERENCES `customer` (`email`)
) 