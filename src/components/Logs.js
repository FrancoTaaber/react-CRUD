import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "../styles/Logs.css";

export const Logs = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = () => {
            fetch("http://localhost:3001/logs")
                .then((response) => response.text())
                .then((data) => {
                    const parsedLogs = Papa.parse(data, {
                        delimiter: ";",
                        header: true,
                        skipEmptyLines: true,
                        transform: (value, header) => {
                            if (header === "timestamp") {
                                return new Date(value);
                            }
                            return value;
                        },
                    });

                    setLogs(parsedLogs.data);
                });
        };

        fetchLogs();
        const intervalId = setInterval(fetchLogs, 5000); // Uuendab iga 5 sekundi järel

        return () => {
            clearInterval(intervalId); // Tühista intervall, kui komponent eemaldatakse
        };
    }, []);

    return (
        <div className="logs">
            <h2>Logs</h2>
            <table>
                <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Details</th>
                </tr>
                </thead>
                <tbody>
                {logs.map((log, index) => (
                    <tr key={index}>
                        <td>{log.timestamp.toLocaleString()}</td>
                        <td>{log.level}</td>
                        <td>{log.message}</td>
                    </tr>
                ))}

                </tbody>
            </table>
        </div>
    );
};
