import FieldError from "@/Components/FieldError";
import Modal from "@/Components/Modal";
import MainLayout from "@/Layouts/MainLayout";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Antenna({ reader }) {
    const [antennas, setAntennas] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [id, setId] = useState(null);
    const [errors, setErrors] = useState({});

    const [data, setD] = useState({
        port: "",
        station: "",
        entry_or_exit_site: "",
    });

    const refresh = () => {
        axios
            .get(route("reader.antenna.get-by-reader", reader.id))
            .then((res) => {
                setAntennas(res.data);
            })
            .catch((e) => {
                console.log(e);
            });
    };

    useEffect(refresh, []);

    const setData = (key, value) =>
        setD((prev) => ({
            ...prev,
            [key]: value,
        }));

    const onCancel = () => {
        setShowModal(false);
        setD({
            port: "",
            station: "",
            entry_or_exit_site: "",
        });
        setErrors({});
        setId(null);
    };

    const onSave = async () => {
        try {
            const _data = { ...data, reader_id: reader.id };
            if (id) await axios.put(route("reader.antenna.update", id), _data);
            else await axios.post(route("reader.antenna.create"), _data);

            onCancel();
            refresh();
        } catch (e) {
            console.log(e.response.data.errors);

            setErrors(e.response.data.errors);
        }
    };

    const onEdit = (row) => {
        setData("port", row.port);
        setData("station", row.station);
        setData("entry_or_exit_site", row.entry_or_exit_site ?? "");

        setId(row.id);
        setShowModal(true);
    };

    const onDelete = (id) => {
        setId(id);
        setShowDeleteModal(true);
    };

    const onCancelDelete = () => {
        setId(null);
        setShowDeleteModal(false);
    };

    const onDeleteConfirmed = () => {
        axios
            .delete(route("reader.antenna.delete", id))
            .then(() => {
                refresh();
                onCancelDelete();
            })
            .catch((e) => {
                console.log(e);
            });
    };

    return (
        <MainLayout>
            <div className="p-4">
                <div className="text-[25px] mb-4">Antennas</div>

                <div className="border-dashed border rounded-md p-5 gap-x-6 flex justify-between flex-wrap">
                    <h3 className="text-lg font-bold mb-2 w-full border-b border-b-gray-500">
                        Reader Details
                    </h3>
                    <div className="flex-1 min-w-fit">
                        <div>
                            Serial :{" "}
                            <span className="text-cyan-600 font-semibold italic">
                                {reader.serial_no}
                            </span>
                        </div>
                        <div>
                            Arduino ID :{" "}
                            <span className="text-cyan-600 font-semibold italic">
                                {reader.arduino_id}
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 min-w-fit">
                        <div>
                            Location :{" "}
                            <span className="text-cyan-600 font-semibold italic">
                                {reader.location}
                            </span>
                        </div>
                        <div>
                            Location Code :{" "}
                            <span className="text-cyan-600 font-semibold italic">
                                {reader.location_code}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-1 mt-3 bg-cyan-700 text-white hover:bg-cyan-600 rounded-md"
                >
                    New
                </button>

                <div className="shadow-lg overflow-auto shadow-white/50 border rounded-lg mt-4 border-[#1c1f22]">
                    <table className="w-full min-w-[400px]">
                        <thead className="border-b border-dotted">
                            <tr>
                                <th>Port</th>
                                {/* <th>Scan Type</th>
                                <th>Station Where Read</th> */}
                                <th>Station</th>
                                <th>Entry/Exit Site</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {antennas.map((antenna) => (
                                <tr key={antenna.id}>
                                    <td>{antenna.port}</td>
                                    <td>{antenna.station}</td>
                                    <td>{antenna.entry_or_exit_site}</td>
                                    <td>
                                        <button
                                            onClick={() => onEdit(antenna)}
                                            className="px-4 ml-2 py-1 bg-lime-700 text-white hover:bg-lime-600 rounded-md"
                                        >
                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                xmlns="http://www.w3.org/2000/svg"
                                                aria-hidden="true"
                                            >
                                                <title>Edit</title>
                                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => onDelete(antenna.id)}
                                            className="px-4 py-1 ml-2 bg-red-700 text-white hover:bg-red-600 rounded-md"
                                        >
                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                xmlns="http://www.w3.org/2000/svg"
                                                aria-hidden="true"
                                            >
                                                <title>Delete</title>
                                                <path d="M6 8h1v8H6V8zm3 0h1v8H9V8zm3 0h1v8h-1V8zM4 5V4h3l1-1h4l1 1h3v1H4zm1 2h10l-1 11H6L5 7z" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Modal show={showModal}>
                    <h1 className="text-[22px] font-semibold mb-4 ">
                        {id ? "Edit" : "New"} Antenna
                    </h1>

                    <div>
                        <label className="w-full">Port</label>
                        <select
                            value={data.port}
                            onChange={(e) => setData("port", e.target.value)}
                            className="w-full rounded-md bg-[#1c1f22]"
                        >
                            <option value="">Select Port</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                        </select>
                        <FieldError errors={errors} name="port" />
                    </div>

                    {/* <div className="mt-2">
                        <label className="w-full">Scan Type</label>
                        <select
                            value={data.type}
                            onChange={(e) => setData("type", e.target.value)}
                            className="w-full rounded-md bg-[#1c1f22]"
                        >
                            <option value="">Select Scan Type</option>
                            <option value="in">IN</option>
                            <option value="out">OUT</option>
                        </select>
                        <FieldError errors={errors} name="type" />
                    </div>

                    <div className="mt-2">
                        <label className="w-full">Station Where Read</label>
                        <select
                            className="w-full rounded-md bg-[#1c1f22]"
                            value={data.station_where_read}
                            onChange={(e) =>
                                setData("station_where_read", e.target.value)
                            }
                        >
                            <option value="">Select Station Where Read</option>
                            <option value="Site">Site</option>
                            <option value="Parking">Parking</option>
                            <option value="Dock">Dock</option>
                            <option value="Yard">Yard</option>
                        </select>
                        <FieldError errors={errors} name="station_where_read" />
                    </div> */}

                    <div className="mt-2">
                        <label className="w-full">Station</label>
                        <select
                            className="w-full rounded-md bg-[#1c1f22]"
                            value={data.station}
                            onChange={(e) => {
                                const v = e.target.value;
                                if (v === "Exit") {
                                    setData("entry_or_exit_site", "Exit");
                                } else if (
                                    data.entry_or_exit_site === "Exit" &&
                                    v !== "Exit"
                                ) {
                                    setData("entry_or_exit_site", "");
                                }
                                setData("station", v);
                            }}
                        >
                            <option value="">Select Station</option>
                            {/* <option value="Entry">Entry</option> */}
                            <option value="Parking">Parking</option>
                            <option value="Dock">Dock</option>
                            {/* <option value="Yard">Yard</option> */}
                            <option value="Exit">Exit</option>
                        </select>
                        <FieldError errors={errors} name="station" />
                    </div>

                    <div className="mt-2">
                        <label className="w-full">Entry/Exit Site</label>
                        <select
                            className="w-full rounded-md bg-[#1c1f22]"
                            value={data.entry_or_exit_site}
                            onChange={(e) =>
                                setData("entry_or_exit_site", e.target.value)
                            }
                        >
                            <option value="">None</option>
                            <option value="Entry">Entry</option>
                            <option value="Exit">Exit</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 mt-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-1 bg-yellow-700 text-white hover:bg-yellow-600 rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSave}
                            className="px-4 py-1 bg-teal-700 text-white hover:bg-teal-600 rounded-md"
                        >
                            Save
                        </button>
                    </div>
                </Modal>

                <Modal show={showDeleteModal}>
                    <h1 className="text-[22px] font-semibold mb-4">
                        Delete Confirmation
                    </h1>

                    <p className="">Are you sure you want to delete this?</p>

                    <div className="flex justify-end gap-2 mt-3">
                        <button
                            onClick={onCancelDelete}
                            className="px-4 py-1 bg-gray-700 text-white hover:bg-gray-600 rounded-md"
                        >
                            No
                        </button>
                        <button
                            onClick={onDeleteConfirmed}
                            className="px-4 py-1 bg-red-700 text-white hover:bg-red-600 rounded-md"
                        >
                            Yes
                        </button>
                    </div>
                </Modal>
            </div>
        </MainLayout>
    );
}
