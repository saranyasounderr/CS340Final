-- Flight Ticketing Management System Database Schema
-- Author: Jayasnehasree Sannidhi, Saranya Sounder Rajan
-- CS340 Project - Final Submission

-- Disable Foreign Key Checks for Smooth Execution
SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS AirlineFlights;
DROP TABLE IF EXISTS Booking;
DROP TABLE IF EXISTS Flights;
DROP TABLE IF EXISTS Passenger;
DROP TABLE IF EXISTS Airline;

-- Create Passenger Table
CREATE TABLE Passenger (
    passengerID INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    birthDate DATE NOT NULL,
    passportNum VARCHAR(100) UNIQUE NOT NULL,
    phoneNumber VARCHAR(20) NOT NULL
);

-- Create Airline Table
CREATE TABLE Airline (
    airlineID INT AUTO_INCREMENT PRIMARY KEY,
    airlineName VARCHAR(100) NOT NULL,
    contactEmail VARCHAR(100)
);

-- Create Flights Table
CREATE TABLE Flights (
    flightID INT AUTO_INCREMENT PRIMARY KEY,
    airlineID INT NOT NULL,
    departureAirport VARCHAR(100) DEFAULT 'PDX' NOT NULL,
    arrivalAirport VARCHAR(100) DEFAULT 'SFO' NOT NULL,
    departureTime DATETIME NOT NULL,
    arrivalTime DATETIME NOT NULL,
    totalCapacity INT NOT NULL CHECK (totalCapacity > 0),
    availableSeats INT NOT NULL CHECK (availableSeats >= 0),
    FOREIGN KEY (airlineID) REFERENCES Airline(airlineID) ON DELETE CASCADE
);

-- Create Booking Table
CREATE TABLE Booking (
    bookingID INT AUTO_INCREMENT PRIMARY KEY,
    passengerID INT NOT NULL,
    flightID INT NOT NULL,
    bookingDate DATE NOT NULL DEFAULT CURRENT_DATE,
    ticketClass ENUM('Economy', 'Business', 'First') NOT NULL,
    paymentStatus ENUM('Paid', 'Pending', 'Failed') NOT NULL,
    seatNumber VARCHAR(10),
    FOREIGN KEY (passengerID) REFERENCES Passenger(passengerID) ON DELETE CASCADE,
    FOREIGN KEY (flightID) REFERENCES Flights(flightID) ON DELETE CASCADE
);

-- Create Many-to-Many Relationship: AirlineFlights Table
CREATE TABLE AirlineFlights (
    airlineFlightID INT AUTO_INCREMENT PRIMARY KEY,
    flightID INT NOT NULL,
    airlineID INT NOT NULL,
    FOREIGN KEY (flightID) REFERENCES Flights(flightID) ON DELETE CASCADE,
    FOREIGN KEY (airlineID) REFERENCES Airline(airlineID) ON DELETE CASCADE
);

-- Enable Foreign Key Checks After Execution
SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
