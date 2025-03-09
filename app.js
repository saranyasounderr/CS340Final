const express = require('express');
const path = require('path');
const db = require('./database/db-connector'); // Ensure correct DB connection


const app = express();
const PORT = 2345;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ------------------ PASSENGER ROUTES ------------------

// Get all passengers
app.get('/passengers', (req, res) => {
    db.query('SELECT * FROM Passenger', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get single passenger
app.get('/passengers/:id', (req, res) => {
    const passengerID = parseInt(req.params.id, 10);
    console.log("Fetching passenger with ID:", passengerID);

    if (isNaN(passengerID)) {
        return res.status(400).json({ error: "Invalid Passenger ID" });
    }

    db.query('SELECT * FROM Passenger WHERE passengerID = ?', [passengerID], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) {
            return res.status(404).json({ error: "Passenger not found" });
        }

        res.json(results[0]);
    });
});

app.put('/passengers/:id', (req, res) => {
    const passengerID = parseInt(req.params.id, 10);
    const { firstName, lastName, birthDate, passportNum, phoneNumber } = req.body;

    console.log("Received update request for Passenger ID:", passengerID);
    console.log("Update data received:", req.body);

    if (isNaN(passengerID)) {
        console.log("Invalid Passenger ID received.");
        return res.status(400).json({ error: "Invalid Passenger ID" });
    }

    const query = `
        UPDATE Passenger 
        SET firstName = ?, lastName = ?, birthDate = ?, passportNum = ?, phoneNumber = ?
        WHERE passengerID = ?
    `;

    db.query(query, [firstName, lastName, birthDate, passportNum, phoneNumber, passengerID], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: err.message });
        }

        console.log("Update result:", result);

        if (result.affectedRows === 0) {
            console.log("No changes were made. Either the ID was not found or the data was the same.");
            return res.status(404).json({ error: "Passenger not found or no changes made" });
        }

        res.json({ message: "Passenger updated successfully" });
    });
});

app.delete('/passengers/:id', (req, res) => {
    const passengerID = parseInt(req.params.id, 10);
    console.log("Received delete request for Passenger ID:", passengerID);

    if (isNaN(passengerID)) {
        console.log("Invalid Passenger ID received.");
        return res.status(400).json({ error: "Invalid Passenger ID" });
    }

    const query = `DELETE FROM Passenger WHERE passengerID = ?`;

    db.query(query, [passengerID], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: err.message });
        }

        console.log("Delete result:", result);

        if (result.affectedRows === 0) {
            console.log("Passenger not found.");
            return res.status(404).json({ error: "Passenger not found" });
        }

        console.log("Passenger deleted successfully.");
        res.json({ message: "Passenger deleted successfully" });
    });
});


// ------------------ FLIGHT ROUTES ------------------

// Get all flights
app.get('/flights', (req, res) => {
    const query = `
        SELECT f.flightID, COALESCE(a.airlineName, 'Unknown Airline') AS airlineName, 
               f.departureAirport, f.arrivalAirport, 
               DATE_FORMAT(f.departureTime, '%Y-%m-%d %H:%i') AS departureTime, 
               DATE_FORMAT(f.arrivalTime, '%Y-%m-%d %H:%i') AS arrivalTime,
               f.totalCapacity, f.availableSeats
        FROM Flights f
        LEFT JOIN Airline a ON f.airlineID = a.airlineID
    `;

    db.query(query, [], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Update flight
app.put('/flights/:id', (req, res) => {
    const flightID = parseInt(req.params.id, 10);
    const { airlineID, departureAirport, arrivalAirport, departureTime, arrivalTime, totalCapacity, availableSeats } = req.body;

    if (isNaN(flightID)) return res.status(400).json({ error: "Invalid Flight ID" });

    const query = `
        UPDATE Flights SET airlineID = ?, departureAirport = ?, arrivalAirport = ?, 
                          departureTime = ?, arrivalTime = ?, totalCapacity = ?, availableSeats = ?
        WHERE flightID = ?
    `;

    db.query(query, [airlineID, departureAirport, arrivalAirport, departureTime, arrivalTime, totalCapacity, availableSeats, flightID],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ error: "Flight not found" });
            res.json({ message: "Flight updated successfully" });
        }
    );
});

// ------------------ BOOKINGS ROUTES ------------------
// Get all bookings
app.get('/bookings', (req, res) => {
    const query = `
        SELECT b.bookingID, b.passengerID, b.flightID,
               p.firstName AS passengerName, 
               CONCAT(f.departureAirport, ' to ', f.arrivalAirport, ' (', f.departureTime, ')') AS flightDetails, 
               b.bookingDate, b.ticketClass, b.paymentStatus, b.seatNumber
        FROM Booking b
        JOIN Passenger p ON b.passengerID = p.passengerID
        JOIN Flights f ON b.flightID = f.flightID
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get a single booking by ID
app.get('/bookings/:id', (req, res) => {
    const bookingID = parseInt(req.params.id, 10);
    console.log("Fetching booking with ID:", bookingID);

    if (isNaN(bookingID)) {
        return res.status(400).json({ error: "Invalid Booking ID" });
    }

    const query = `
        SELECT b.*, p.firstName, p.lastName, f.departureAirport, f.arrivalAirport 
        FROM Booking b
        JOIN Passenger p ON b.passengerID = p.passengerID
        JOIN Flights f ON b.flightID = f.flightID
        WHERE b.bookingID = ?
    `;

    db.query(query, [bookingID], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) {
            return res.status(404).json({ error: "Booking not found" });
        }

        res.json(results[0]);
    });
});

// Update booking
app.put('/bookings/:id', (req, res) => {
    const bookingID = parseInt(req.params.id, 10);
    const { passengerID, flightID, bookingDate, ticketClass, paymentStatus, seatNumber } = req.body;

    console.log("Received update request for Booking ID:", bookingID);
    console.log("Update data received:", req.body);

    if (isNaN(bookingID)) {
        console.log("Invalid Booking ID received.");
        return res.status(400).json({ error: "Invalid Booking ID" });
    }

    const query = `
        UPDATE Booking 
        SET passengerID = ?, flightID = ?, bookingDate = ?, ticketClass = ?, 
            paymentStatus = ?, seatNumber = ?
        WHERE bookingID = ?
    `;

    db.query(query, [passengerID, flightID, bookingDate, ticketClass, paymentStatus, seatNumber, bookingID], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: err.message });
        }

        console.log("Update result:", result);

        if (result.affectedRows === 0) {
            console.log("No changes were made. Either the ID was not found or the data was the same.");
            return res.status(404).json({ error: "Booking not found or no changes made" });
        }

        res.json({ message: "Booking updated successfully" });
    });
});

// Delete a booking
app.delete('/bookings/:id', (req, res) => {
    const bookingID = parseInt(req.params.id, 10);
    console.log("Received delete request for Booking ID:", bookingID);

    if (isNaN(bookingID)) {
        console.log("Invalid Booking ID received.");
        return res.status(400).json({ error: "Invalid Booking ID" });
    }

    const query = `DELETE FROM Booking WHERE bookingID = ?`;

    db.query(query, [bookingID], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: err.message });
        }

        console.log("Delete result:", result);

        if (result.affectedRows === 0) {
            console.log("Booking not found.");
            return res.status(404).json({ error: "Booking not found" });
        }

        console.log("Booking deleted successfully.");
        res.json({ message: "Booking deleted successfully" });
    });
});

app.post('/bookings', (req, res) => {
    const { passengerID, flightID, bookingDate, ticketClass, paymentStatus, seatNumber } = req.body;

    console.log("Received new booking request:", req.body);  // Log incoming booking data

    // Validate data before inserting into the database
    if (!passengerID || !flightID || !bookingDate || !ticketClass || !paymentStatus) {
        return res.status(400).json({ error: "All required fields must be provided" });
    }

    const query = `
        INSERT INTO Booking (passengerID, flightID, bookingDate, ticketClass, paymentStatus, seatNumber)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [passengerID, flightID, bookingDate, ticketClass, paymentStatus, seatNumber], (err, result) => {
        if (err) {
            console.error("Error saving booking:", err);  // Log error details
            return res.status(500).json({ error: err.message });
        }

        console.log("Booking created successfully:", result.insertId);  // Log the inserted booking ID
        res.json({ message: "Booking created successfully", bookingID: result.insertId });
    });
});


// ------------------ STATIC FILES ------------------
// Serve static files from the same directory (Keep this below API routes)
app.use(express.static(__dirname));

// ------------------ START THE SERVER ------------------
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
    } else {
        console.error('Server error:', err);
    }
});

// ------------------ DEBUGGING TOOL ------------------
console.log("Loaded routes:");
app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
        console.log(r.route.path);
    }
});

module.exports = app;
