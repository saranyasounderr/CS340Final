// Import necessary modules
const express = require('express');
const path = require('path');
const db = require('./database/db-connector'); // Use the db-connector module for the DB connection

const app = express();
const PORT = 2903; // Change if needed

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
    } else {
        console.error('Server error:', err);
    }
});

// Serve static files from the same directory
app.use(express.static(__dirname));





// ------------------ PASSENGER ROUTES ------------------

// Get all passengers
app.get('/passengers', (req, res) => {
    db.query('SELECT * FROM Passenger', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Add a new passenger
app.post('/passengers', (req, res) => {
    const { firstName, lastName, birthDate, passportNum, phoneNumber } = req.body;

    if (!firstName || !lastName || !birthDate || !passportNum || !phoneNumber) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `
        INSERT INTO Passenger (firstName, lastName, birthDate, passportNum, phoneNumber)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [firstName, lastName, birthDate, passportNum, phoneNumber], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({ message: 'Passenger added successfully', passengerID: result.insertId });
    });
});

// Update an existing passenger
app.put('/passengers/:id', (req, res) => {
    const { firstName, lastName, birthDate, passportNum, phoneNumber } = req.body;
    const passengerID = req.params.id;

    if (!firstName || !lastName || !birthDate || !passportNum || !phoneNumber) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `
        UPDATE Passenger 
        SET firstName = ?, lastName = ?, birthDate = ?, passportNum = ?, phoneNumber = ?
        WHERE passengerID = ?
    `;

    db.query(query, [firstName, lastName, birthDate, passportNum, phoneNumber, passengerID], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Passenger not found' });
        }

        res.json({ message: 'Passenger updated successfully' });
    });
});

// Delete a passenger
app.delete('/passengers/:id', (req, res) => {
    const passengerID = req.params.id;

    const query = `DELETE FROM Passenger WHERE passengerID = ?`;

    db.query(query, [passengerID], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Passenger not found' });
        }

        res.json({ message: 'Passenger deleted successfully' });
    });
});

// ------------------ AIRLINE ROUTES ------------------

app.get('/airlines', (req, res) => {
    db.query('SELECT * FROM Airline', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ------------------ FLIGHT ROUTES ------------------

app.get('/flights', (req, res) => {
    db.query('SELECT * FROM Flights', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ------------------ AIRLINE-FLIGHT RELATIONSHIP ROUTES ------------------

app.get('/airlineFlights', (req, res) => {
    const query = `
        SELECT af.assignmentID, a.airlineName, 
               CONCAT(f.departureAirport, ' to ', f.arrivalAirport, ' (', f.departureTime, ')') AS flightDetails
        FROM AirlineFlights af
        JOIN Airline a ON af.airlineID = a.airlineID
        JOIN Flights f ON af.flightID = f.flightID
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/airlineFlights', (req, res) => {
    const { airlineID, flightID } = req.body;

    if (!airlineID || !flightID) {
        return res.status(400).json({ error: 'Both airline and flight must be selected' });
    }

    const checkQuery = `SELECT * FROM AirlineFlights WHERE airlineID = ? AND flightID = ?`;

    db.query(checkQuery, [airlineID, flightID], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
            return res.status(400).json({ error: 'This airline-flight assignment already exists' });
        }

        const insertQuery = `INSERT INTO AirlineFlights (airlineID, flightID) VALUES (?, ?)`;

        db.query(insertQuery, [airlineID, flightID], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            res.json({ message: 'Airline-Flight assignment added successfully', assignmentID: result.insertId });
        });
    });
});

app.delete('/airlineFlights/:id', (req, res) => {
    const assignmentID = req.params.id;

    const query = `DELETE FROM AirlineFlights WHERE assignmentID = ?`;

    db.query(query, [assignmentID], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        res.json({ message: 'Airline-Flight assignment deleted successfully' });
    });
});

// ------------------ BOOKINGS ROUTES ------------------

app.get('/bookings', (req, res) => {
    const query = `
        SELECT b.bookingID, p.firstName AS passengerName, 
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

// Add a new booking
app.post('/bookings', (req, res) => {
    const { passengerID, flightID, bookingDate, ticketClass, paymentStatus, seatNumber } = req.body;

    if (!passengerID || !flightID || !bookingDate || !ticketClass || !paymentStatus) {
        return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const query = `
        INSERT INTO Booking (passengerID, flightID, bookingDate, ticketClass, paymentStatus, seatNumber)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [passengerID, flightID, bookingDate, ticketClass, paymentStatus, seatNumber], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({ message: 'Booking added successfully', bookingID: result.insertId });
    });
});

// Update a booking
app.put('/bookings/:id', (req, res) => {
    const { passengerID, flightID, bookingDate, ticketClass, paymentStatus, seatNumber } = req.body;
    const bookingID = req.params.id;

    if (!passengerID || !flightID || !bookingDate || !ticketClass || !paymentStatus) {
        return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const query = `
        UPDATE Booking 
        SET passengerID = ?, flightID = ?, bookingDate = ?, ticketClass = ?, paymentStatus = ?, seatNumber = ?
        WHERE bookingID = ?
    `;

    db.query(query, [passengerID, flightID, bookingDate, ticketClass, paymentStatus, seatNumber, bookingID], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json({ message: 'Booking updated successfully' });
    });
});

// Delete a booking
app.delete('/bookings/:id', (req, res) => {
    const bookingID = req.params.id;

    const query = `DELETE FROM Booking WHERE bookingID = ?`;

    db.query(query, [bookingID], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({ message: 'Booking deleted successfully' });
    });
});

// ------------------ SERVER START ------------------


