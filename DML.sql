-- Disable Foreign Key Checks for Smooth Execution
SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;

-- Delete existing data to avoid duplicates
DELETE FROM AirlineFlights;
DELETE FROM Booking;
DELETE FROM Flights;
DELETE FROM Passenger;
DELETE FROM Airline;

-- Reset Auto-Increment Counters
ALTER TABLE AirlineFlights AUTO_INCREMENT = 1;
ALTER TABLE Booking AUTO_INCREMENT = 1;
ALTER TABLE Flights AUTO_INCREMENT = 1;
ALTER TABLE Passenger AUTO_INCREMENT = 1;
ALTER TABLE Airline AUTO_INCREMENT = 1;

-- Insert Sample Airlines (Ensure Airlines Exist Before Flights)
INSERT INTO Airline (airlineID, airlineName, contactEmail) VALUES 
(1, 'Delta Airlines', 'contact@delta.com'),
(2, 'United Airlines', 'support@united.com'),
(3, 'Southwest Airlines', 'info@southwest.com');

-- Insert Sample Passengers
INSERT INTO Passenger (passengerID, firstName, lastName, birthDate, passportNum, phoneNumber) VALUES 
(1, 'John', 'Doe', '1990-05-15', 'A12345678', '555-123-1234'),
(2, 'Alice', 'Smith', '1985-08-22', 'B98765432', '555-123-5678'),
(3, 'Carlos', 'Garcia', '1992-11-10', 'C11223344', '555-123-8765');

--Insert Sample Flights (Ensure Airline IDs Exist in Airline Table)
INSERT INTO Flights (flightID, airlineID, departureAirport, arrivalAirport, departureTime, arrivalTime, totalCapacity, availableSeats) VALUES 
(1, 1, 'PDX', 'SFO', '2025-03-10 08:00:00', '2025-03-10 10:00:00', 150, 100),
(2, 2, 'SFO', 'PDX', '2025-03-11 12:00:00', '2025-03-11 18:00:00', 200, 120),
(3, 3, 'SFO', 'PDX', '2025-03-12 06:00:00', '2025-03-12 11:00:00', 180, 150);

--Insert Sample Bookings (Ensure Passengers and Flights Exist)
INSERT INTO Booking (bookingID, passengerID, flightID, bookingDate, ticketClass, paymentStatus, seatNumber) VALUES 
(1, 1, 1, '2025-03-05', 'Economy', 'Paid', '12A'),
(2, 2, 2, '2025-03-06', 'Business', 'Pending', '5B'),
(3, 3, 3, '2025-03-07', 'First', 'Failed', NULL);

-- Insert Sample Airline-Flight Relationships (Ensure Flight & Airline IDs Exist)
INSERT INTO AirlineFlights (assignmentID, flightID, airlineID) VALUES 
(1, 1, 1), -- Delta Airlines -> Flight 1
(2, 2, 2), -- United Airlines -> Flight 2
(3, 3, 3); -- Southwest Airlines -> Flight 3

-- Enable Foreign Key Checks After Execution
SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
