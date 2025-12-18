import FieldError from "@/Components/FieldError";
import Modal from "@/Components/Modal";
import usePagination from "@/Components/usePagination";
import MainLayout from "@/Layouts/MainLayout";
import { Link } from "@inertiajs/react";
import axios from "axios";
import React, { useEffect, useState } from "react";

export default function Index({ LOCATIONS }) {
    const [readers, setReaders] = useState([]);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [id, setId] = useState(null);
    const [errors, setErrors] = useState({});

    const [data, setD] = useState({
        serial_no: "",
        arduino_id: "",
        location: "",
        location_code: "",
    });

    const { page, size, setTotalAndTotalPage, setPage, renderPagination } =
        usePagination({
            className: "mt-4",
            onChange: (_page, _size) => {
                refresh({
                    page: _page + 1,
                    page_size: _size,
                });
            },
        });

    const refresh = (paginationData) => {
        let params = paginationData ?? {
            page_size: size,
            page: page + 1,
        };
        if (search) params["search"] = search;

        axios
            .get(route("reader.all", params))
            .then((res) => {
                const { data, total, per_page } = res.data;

                setReaders(data);
                setTotalAndTotalPage(total, per_page);
            })
            .catch((e) => {
                console.log(e);
            });
    };

    useEffect(refresh, []);

    const setData = (key, value) => {
        setD((prev) => {
            let n = { ...prev };
            n[key] = value;
            return n;
        });
    };

    const onSearchKeyUp = (e) => {
        if (e.key !== "Enter") return;

        if (page != 0) setPage(0);
        else
            refresh({
                page: 1,
                page_size: size,
            });
    };

    const onLocationChange = (location) => {
        setData("location", location);
        for (let loc of LOCATIONS) {
            if (loc.name === location) {
                setData("location_code", loc.code);
                return;
            }
        }
        setData("location_code", "");
    };

    const onCancel = () => {
        setShowModal(false);
        setD({
            serial_no: "",
            arduino_id: "",
            location: "",
            location_code: "",
        });
        setErrors({});
        setId(null);
    };

    const onSave = async () => {
        try {
            if (id) await axios.put(route("reader.update", id), data);
            else await axios.post(route("reader.create"), data);

            onCancel();
            refresh();
        } catch (e) {
            console.log(e.response.data.errors);

            setErrors(e.response.data.errors);
        }
    };

    const onEdit = (row) => {
        setData("serial_no", row.serial_no);
        setData("arduino_id", row.arduino_id);
        setData("location", row.location);
        setData("location_code", row.location_code);

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
            .delete(route("reader.delete", id))
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
                <div className="text-[25px] mb-4">Readers</div>

                <div className="flex justify-between gap-3 flex-wrap">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyUp={onSearchKeyUp}
                        placeholder="Search here"
                        className="flex-1 min-w-[120px] shadow-sm shadow-white/50 bg-[#1c1f22] rounded-md max-w-[500px]"
                    />
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-1 bg-cyan-700 text-white hover:bg-cyan-600 rounded-md"
                    >
                        New
                    </button>
                </div>

                <div className="shadow-lg overflow-auto shadow-white/50 border rounded-lg mt-4 border-[#1c1f22]">
                    <table className="w-full min-w-[400px]">
                        <thead className="border-b border-dotted">
                            <tr>
                                <th>Serial No</th>
                                <th>Arduino ID</th>
                                <th>Location</th>
                                <th>Location Code</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {readers.map((reader) => (
                                <tr key={reader.id}>
                                    <td>{reader.serial_no}</td>
                                    <td>{reader.arduino_id}</td>
                                    <td>{reader.location}</td>
                                    <td>{reader.location_code}</td>
                                    <td>
                                        <Link
                                            href={route(
                                                "reader.antenna.index",
                                                reader.id
                                            )}
                                        >
                                            <button className="px-4 ml-2 py-1 bg-teal-700 text-white hover:bg-teal-600 rounded-md">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="18"
                                                    height="18"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <title>
                                                        Manage Antennas
                                                    </title>
                                                    <line
                                                        x1="12"
                                                        y1="20"
                                                        x2="12"
                                                        y2="10"
                                                    />
                                                    <line
                                                        x1="9"
                                                        y1="20"
                                                        x2="15"
                                                        y2="20"
                                                    />
                                                    <path d="M12 6c2 0 4 2 5 3" />
                                                    <path d="M12 3c3 0 6 3 7 5" />
                                                </svg>
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => onEdit(reader)}
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
                                            onClick={() => onDelete(reader.id)}
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

                <Modal show={showModal}>
                    <h1 className="text-[22px] font-semibold mb-4 ">
                        {id ? "Edit" : "New"} Reader
                    </h1>

                    <label className="w-full">Serial No.</label>
                    <input
                        type="text"
                        className="w-full rounded-md bg-[#1c1f22]"
                        value={data.serial_no}
                        placeholder="Enter serial no"
                        onChange={(e) => setData("serial_no", e.target.value)}
                    />
                    <FieldError errors={errors} name="serial_no" />

                    <div className="mt-2">
                        <label className="w-full">Arduino ID</label>
                        <input
                            type="text"
                            className="w-full rounded-md bg-[#1c1f22]"
                            value={data.arduino_id}
                            placeholder="Enter arduino id"
                            onChange={(e) =>
                                setData("arduino_id", e.target.value)
                            }
                        />
                        <FieldError errors={errors} name="arduino_id" />
                    </div>

                    <div className="mt-2">
                        <label className="w-full">Location</label>
                        <select
                            value={data.location}
                            onChange={(e) => onLocationChange(e.target.value)}
                            className="w-full rounded-md bg-[#1c1f22]"
                        >
                            <option value="">Select Location</option>
                            {LOCATIONS.map((row) => (
                                <option key={row.code} value={row.name}>
                                    {row.name}
                                </option>
                            ))}
                        </select>
                        <FieldError errors={errors} name="location" />
                    </div>

                    <div className="mt-2">
                        <label className="w-full">Location Code</label>
                        <input
                            type="text"
                            className="w-full rounded-md bg-[#1c1f22]"
                            value={data.location_code}
                            disabled
                        />
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
