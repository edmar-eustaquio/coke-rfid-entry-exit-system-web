import FieldError from "@/Components/FieldError";
import Modal from "@/Components/Modal";
import usePagination from "@/Components/usePagination";
import MainLayout from "@/Layouts/MainLayout";
import axios from "axios";
import React, { useEffect, useState } from "react";

export default function Index({ LOCATIONS }) {
    const [trucks, setTrucks] = useState([]);
    const [search, setSearch] = useState("");
    const [id, setId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [errors, setErrors] = useState({});

    const [data, setD] = useState({
        vehicle_id: "",
        plate_no: "",
        capacity: "",
        agent: "",
        location_code: "",
        location: "",
        provider: "",
    });

    const { page, size, setTotalAndTotalPage, setPage, renderPagination } =
        usePagination({ className: "mt-4" });

    useEffect(() => refresh(), [page, size]);

    const setData = (key, value) => {
        setD((prev) => {
            let n = { ...prev };
            n[key] = value;
            return n;
        });
    };

    const refresh = () => {
        let params = {
            page_size: size,
            page: page + 1,
        };
        if (search) params["search"] = search;

        axios
            .get(route("truck.all", params))
            .then((res) => {
                const { data, total, per_page } = res.data;
                setTrucks(data);
                setTotalAndTotalPage(total, per_page);
            })
            .catch((e) => {
                console.log(e);
            });
    };

    const onSearchKeyUp = (e) => {
        if (e.key !== "Enter") return;

        setPage(0);
        refresh();
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
            .delete(route("truck.delete", id))
            .then(() => {
                refresh();
                onCancelDelete();
            })
            .catch((e) => {
                console.log(e);
            });
    };

    const onCancel = () => {
        setShowModal(false);
        setD({
            vehicle_id: "",
            plate_no: "",
            capacity: "",
            agent: "",
            location_code: "",
            location: "",
            provider: "",
        });
        setErrors({});
        setId(null);
    };

    const onEdit = (row) => {
        setData("rfid", row.rfid);
        setData("vehicle_id", row.vehicle_id);
        setData("plate_no", row.plate_no);
        setData("capacity", row.capacity);
        setData("agent", row.agent);
        setData("location_code", row.location_code);
        setData("location", row.location);
        setData("provider", row.provider);

        setId(row.id);
        setShowModal(true);
    };

    const onSave = async () => {
        try {
            if (id) await axios.put(route("truck.update", id), data);

            onCancel();
            refresh();
        } catch (e) {
            console.log(e.response.data.errors);

            setErrors(e.response.data.errors);
        }
    };

    const onUpload = () => {
        const inp = document.getElementById("upload-file");
        inp.click();
    };

    const handleUpload = (e) => {
        axios
            .post(
                route("truck.upload"),
                {
                    file: e.target.files[0],
                },
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            )
            .then(() => {
                refresh();
            })
            .catch((e) => {
                console.log(e);
            });
    };

    const onLocationChange = (location) => {
        setData("location", location);
        for (let loc of LOCATIONS) {
            if (loc.name === location) {
                setData("location_code", loc.code);
                break;
            }
        }
    };

    const onExport = () => {
        let params = {
            page_size: size,
            page: page + 1,
        };
        if (search.trim() != "") params["search"] = search.trim();

        document.location.href = route("truck.export", params);
    };

    return (
        <MainLayout>
            <input
                id="upload-file"
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleUpload}
            />

            <div className="p-4">
                <div className="text-[25px] mb-4">Trucks</div>

                <div className="flex justify-between gap-2 flex-wrap">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyUp={onSearchKeyUp}
                        placeholder="Search here"
                        className="w-full min-w-[120px] shadow-sm shadow-white/50 bg-[#1c1f22] rounded-md max-w-[500px]"
                    />

                    <div className="flex gap-2">
                        <button
                            onClick={onUpload}
                            className="px-4 py-1 bg-teal-700 text-white hover:bg-teal-600 rounded-md"
                        >
                            Upload
                        </button>

                        <button
                            onClick={onExport}
                            className="px-4 py-1 bg-lime-700 text-white hover:bg-lime-600 rounded-md"
                        >
                            Export
                        </button>
                    </div>
                </div>

                <div className="shadow-lg overflow-auto shadow-white/50 border rounded-lg mt-4 border-[#1c1f22]">
                    <table className="w-full min-w-[750px]">
                        <thead className="border-b border-dotted">
                            <tr>
                                <th>RFID</th>
                                <th>Vehicle ID</th>
                                <th>Plate No</th>
                                <th>Capacity</th>
                                <th>Agent</th>
                                <th>Location Code</th>
                                <th>Location</th>
                                <th>Provider</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {trucks.map((truck) => (
                                <tr key={truck.id}>
                                    <td>{truck.rfid}</td>
                                    <td>{truck.vehicle_id}</td>
                                    <td>{truck.plate_no}</td>
                                    <td>{truck.capacity}</td>
                                    <td>{truck.agent}</td>
                                    <td>{truck.location_code}</td>
                                    <td>{truck.location}</td>
                                    <td>{truck.provider}</td>
                                    <td>
                                        <button
                                            onClick={() => onEdit(truck)}
                                            className="px-4 py-1 ml-2 bg-lime-700 text-white hover:bg-lime-600 rounded-md"
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
                                            onClick={() => onDelete(truck.id)}
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

                {renderPagination}
            </div>

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

            <Modal show={showModal}>
                <h1 className="text-[22px] font-semibold mb-4 ">Edit Truck</h1>

                <label className="w-full">Vehicle ID</label>
                <input
                    type="text"
                    className="w-full rounded-md bg-[#1c1f22]"
                    value={data.vehicle_id}
                    placeholder="Enter vehicle id"
                    onChange={(e) => setData("vehicle_id", e.target.value)}
                />
                <FieldError errors={errors} name="vehicle_id" />

                <div className="mt-2">
                    <label className="w-full">Plate No.</label>
                    <input
                        type="text"
                        className="w-full rounded-md bg-[#1c1f22]"
                        value={data.plate_no}
                        placeholder="Enter plate no"
                        onChange={(e) => setData("plate_no", e.target.value)}
                    />
                    <FieldError errors={errors} name="plate_no" />
                </div>

                <div className="mt-2">
                    <label className="w-full">Capacity</label>
                    <input
                        type="text"
                        className="w-full rounded-md bg-[#1c1f22]"
                        value={data.capacity}
                        placeholder="Enter capacity"
                        onChange={(e) => setData("capacity", e.target.value)}
                    />
                    <FieldError errors={errors} name="capacity" />
                </div>

                <div className="mt-2">
                    <label className="w-full">Agent</label>
                    <input
                        type="text"
                        className="w-full rounded-md bg-[#1c1f22]"
                        value={data.agent}
                        placeholder="Enter agent"
                        onChange={(e) => setData("agent", e.target.value)}
                    />
                    <FieldError errors={errors} name="agent" />
                </div>

                <div className="mt-2">
                    <label className="w-full">Location</label>
                    <select
                        value={data.location}
                        onChange={(e) => onLocationChange(e.target.value)}
                        className="w-full rounded-md bg-[#1c1f22]"
                    >
                        <option value="" disabled>
                            Select Location
                        </option>
                        {LOCATIONS.map((loc) => (
                            <option key={loc.code} value={loc.name}>
                                {loc.name}
                            </option>
                        ))}
                    </select>
                    <FieldError errors={errors} name="location" />
                </div>

                <div className="mt-2">
                    <label className="w-full">Location Code</label>
                    <input
                        type="text"
                        disabled
                        className="w-full rounded-md bg-[#2e3235]"
                        value={data.location_code}
                        placeholder="Location Code"
                    />
                </div>

                <div className="mt-2">
                    <label className="w-full">Provider</label>
                    <input
                        type="text"
                        className="w-full rounded-md bg-[#1c1f22]"
                        value={data.provider}
                        placeholder="Enter provider"
                        onChange={(e) => setData("provider", e.target.value)}
                    />
                    <FieldError errors={errors} name="provider" />
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
        </MainLayout>
    );
}
