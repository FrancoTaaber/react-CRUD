import React, { useEffect, useState } from "react";
import { AddPicture } from "./components/AddPicture";
import { Picture } from "./components/Home";
import { Logs } from "./components/Logs";
import { Login } from "./components/Login";
import { io } from "socket.io-client";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";

// The main App component
export default function App() {
    // State for storing the photos
    const [photos, setPhotos] = useState([]);

    // API and socket.io configuration
    const api = "http://localhost:3001/photos";
    const socket = io("http://localhost:3001");

    // Fetch initial data and set up socket listeners
    useEffect(() => {
        fetchData();
        setupSocketListeners();

        // Clean up socket connection on unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    // Fetch photos from the server
    const fetchData = async () => {
        const token = localStorage.getItem("token");

        await fetch(api + "?_limit=10", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Server error: ${response.statusText}`);
                }
                return response.json();
            })
            .then((data) => {
                setPhotos(data);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    };


    // Set up socket.io event listeners
    const setupSocketListeners = () => {
        socket.on("photoAdded", (newPhoto) => {
            setPhotos((photos) => {
                const updatedPhotos = [...photos, newPhoto];
                localStorage.setItem("photos", JSON.stringify(updatedPhotos));
                return updatedPhotos;
            });
        });

        socket.on("photoUpdated", (updatedPhoto) => {
            const updatedPhotos = photos.map((photo) => {
                if (photo.id === updatedPhoto.id) {
                    return updatedPhoto;
                }
                return photo;
            });
            setPhotos(updatedPhotos);
            localStorage.setItem("photos", JSON.stringify(updatedPhotos));
        });

        socket.on("photoDeleted", (id) => {
            setPhotos((photos) => {
                const updatedPhotos = photos.filter((photo) => photo.id !== id);
                localStorage.setItem("photos", JSON.stringify(updatedPhotos));
                return updatedPhotos;
            });
        });
    };

    // Function to handle adding a photo
    const onAdd = async (title, url) => {
        const token = localStorage.getItem("token");

        await fetch(api, {
            method: "POST",
            body: JSON.stringify({
                title: title,
                url: url,
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (response.status !== 201) {
                    return;
                } else {
                    return response.json();
                }
            })
            .then((data) => {
                setPhotos((comments) => [...comments, data]);
            })
            .catch((error) => console.log(error));
    };

    // Function to handle editing a photo
    const onEdit = async (id, title, url) => {
        const token = localStorage.getItem("token");

        await fetch(api + '/' + id, {
            method: "PUT",
            body: JSON.stringify({
                title: title,
                url: url,
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                Authorization: `Bearer ${token}`,
            }
        })
            .then((response) => {
                if (response.status !== 200) {
                    throw new Error('Not authorized to update this photo');
                } else {
                    return response.json();
                }
            })
            .then((data) => {
                const updatedPhotos = photos.map((photo) => {
                    if (photo.id === id) {
                        photo.title = title;
                        photo.url = url;
                    }

                    return photo;
                });

                setPhotos((photos) => updatedPhotos);
                localStorage.setItem("photos", JSON.stringify(updatedPhotos));
            })
            .catch((error) => {
                console.log(error);
            });
    };

    // Function to handle deleting a photo
    const onDelete = async (id) => {
        const token = localStorage.getItem("token");

        await fetch(api + '/' + id, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (response.status !== 200) {
                    return;
                } else {
                    setPhotos((photos) => {
                        const updatedPhotos = photos.filter((photo) => photo.id !== id);
                        localStorage.setItem("photos", JSON.stringify(updatedPhotos));
                        return updatedPhotos;
                    });
                }
            })
            .catch((error) => console.log(error));
    };
    // Function to handle logging in
    const onLogin = async (email, password) => {
        await fetch("http://localhost:3001/tokens", {
            method: "POST",
            body: JSON.stringify({ email, password }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                localStorage.setItem("token", data.token);

            })
            .catch((error) => console.log(error));
    };

    // Render the application with routes
    return (
        <Router>
            <div className="App">
                <h1>Photos</h1>
                <nav>
                    <Link to="/">Home</Link>
                    <Link to="/logs">Logid</Link>
                    <Link to="/tokens">Log in</Link>
                </nav>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <>
                                <AddPicture onAdd={onAdd} />
                                <div className="form_body">
                                    {photos.map((photo) => {
                                        if (!photo.id) {
                                            console.warn("Found a photo without an id", photo);
                                            return null;
                                        }

                                        return (
                                            <Picture
                                                id={photo.id}
                                                key={photo.id}
                                                title={photo.title}
                                                url={photo.url}
                                                onEdit={onEdit}
                                                onDelete={onDelete}
                                            />
                                        );
                                    })}
                                </div>
                            </>
                        }
                    />
                    <Route path="/logs" element={<Logs />} />
                    <Route path="/tokens" element={<Login onLogin={onLogin} />} />
                </Routes>
            </div>
        </Router>
    );
}
