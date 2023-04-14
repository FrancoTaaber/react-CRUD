import React, { useEffect, useState } from "react";
import { AddPicture } from "./components/AddPicture";
import { Picture } from "./components/Home";
import { io } from "socket.io-client";

export default function App() {
    const [photos, setPhotos] = useState([]);

    const api = "http://localhost:3001/photos";
    const socket = io("http://localhost:3001");

    useEffect(() => {
        fetchData();
        setupSocketListeners();

        return () => {
            socket.disconnect();
        };
    }, []);

    const fetchData = async () => {
        await fetch(api + "?_limit=10")
            .then((response) => response.json())
            .then((data) => setPhotos(data))
            .catch((error) => console.log(error));
    };

    const setupSocketListeners = () => {
        socket.on("photoAdded", (newPhoto) => {
            setPhotos((photos) => [...photos, newPhoto]);
        });

        socket.on("photoUpdated", (updatedPhoto) => {
            const updatedPhotos = photos.map((photo) => {
                if (photo.id === updatedPhoto.id) {
                    return updatedPhoto;
                }
                return photo;
            });
            setPhotos(updatedPhotos);
        });

        socket.on("photoDeleted", (id) => {
            setPhotos(photos.filter((photo) => photo.id !== id));
        });
    };

    const onAdd = async (title, url) => {
        await fetch( api, {
            method: "POST",
            body: JSON.stringify({
                title: title,
                url: url,
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
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

    const onEdit = async (id, title, url) => {
        await fetch(api + '/' + id, {
            method: "PUT",
            body: JSON.stringify({
                title: title,
                url: url,
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
            .then((response) => {
                if (response.status !== 200) {
                    return;
                } else {
                    return response.json();
                }
            })
            .then((data) => {
                // setUsers((users) => [...users, data]);
                const updatedPhotos = photos.map((photo) => {
                    if (photo.id === id) {
                        photo.title = title;
                        photo.url = url;
                    }

                    return photo;
                });

                setPhotos((photos) => updatedPhotos);
            })
            .catch((error) => console.log(error));
    };

    const onDelete = async (id) => {
        await fetch(api + '/' + id, {
            method: "DELETE"
        })
            .then((response) => {
                if (response.status !== 200) {
                    return;
                } else {
                    setPhotos(
                        photos.filter((photo) => {
                            return photo.id !== id;
                        })
                    );
                }
            })
            .catch((error) => console.log(error));
    };


    return (
        <div className="App">
            <h1>Photos</h1>
            <AddPicture onAdd={onAdd} />
            <div className="form_body">
                {photos.map((photo) => (
                    <Picture
                        id={photo.id}
                        key={photo.id}
                        title={photo.title}
                        url={photo.url}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    );
}
