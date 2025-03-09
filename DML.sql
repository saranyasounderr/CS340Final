-- Disable Foreign Key Checks for Smooth Execution
SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;

-- Insert Sample Passengers
INSERT INTO Passenger (firstName, lastName, birthDate, passportNum, phoneNumber)
VALUES 
('John', 'Doe', '1990-05-15', 'A12345678', '555-1234'),
('Alice', 'Smith', '1985-08-22', 'B98765432', '555-5678'),
('Carlos', 'Garcia', '1992-11-10', 'C11223344', '555-8765');

-- Insert Sample Airlines
INSERT INTO Airline (airlineName, contactEmail)
VALUES 
('Delta Airlines', 'contact@delta.com'),
('United Airlines', 'support@united.com'),
('Southwest Airlines', 'info@southwest.com');

-- Insert Sample Flights
INSERT INTO Flights (airlineID, departureAirport, arrivalAirport, departureTime, arrivalTime, totalCapacity, availableSeats)
VALUES 
(1, 'PDX', 'SFO', '2025-03-10 08:00:00', '2025-03-10 10:00:00', 150, 100),
(2, 'LAX', 'JFK', '2025-03-11 12:00:00', '2025-03-11 18:00:00', 200, 120),
(3, 'SEA', 'ORD', '2025-03-12 06:00:00', '2025-03-12 11:00:00', 180, 150);

-- Insert Sample Bookings
INSERT INTO Booking (passengerID, flightID, bookingDate, ticketClass, paymentStatus, seatNumber)
VALUES 
(1, 1, '2025-03-05', 'Economy', 'Paid', '12A'),
(2, 2, '2025-03-06', 'Business', 'Pending', '5B'),
(3, 3, '2025-03-07', 'First', 'Failed', NULL);

-- Insert Sample Airline-Flight Relationships
INSERT INTO AirlineFlights (flightID, airlineID)
VALUES 
(1, 1),
(2, 2),
(3, 3);

-- Enable Foreign Key Checks After Execution
SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
