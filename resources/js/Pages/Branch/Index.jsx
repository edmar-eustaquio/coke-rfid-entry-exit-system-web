import Modal from "@/Components/Modal";
import usePagination from "@/Components/usePagination";
import MainLayout from "@/Layouts/MainLayout";
import axios from "axios";
import React, { useEffect, useState } from "react";

export default function Index() {
    const [branches, setBranches] = useState([]);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [id, setId] = useState(null);
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState(null);

    const { page, size, setTotalAndTotalPage, setPage, renderPagination } =
        usePagination({ className: "mt-4" });

    const refresh = () => {
        let params = {
            page_size: size,
            page: page + 1,
        };
        if (search) params["search"] = search;

        axios
            .get(route("branch.all", params))
            .then((res) => {
                const { data, total, per_page } = res.data;

                setBranches(data);
                setTotalAndTotalPage(total, per_page);
            })
            .catch((e) => {
                console.log(e);
            });
    };

    useEffect(refresh, [page, size]);

    const onSearchKeyUp = (e) => {
        if (e.key !== "Enter") return;

        if (page != 0) setPage(0);
        else refresh();
    };

    const onCancel = () => {
        setShowModal(false);
        setName("");
        setNameError(null);
        setId(null);
    };

    const onSave = async () => {
        const _name = name.trim();
        if (_name.length == 0) {
            setNameError("Name is required.");
            return;
        }

        try {
            if (id)
                await axios.put(route("branch.update", id), { name: _name });
            else await axios.post(route("branch.create"), { name: _name });
            onCancel();
            refresh();
        } catch (e) {
            console.log(e);
        }
    };

    const onEdit = (row) => {
        setName(row.name);
        setId(row.id);
        setShowModal(true);
    };

    const onDelete = (row) => {
        setId(row.id);
        setShowDeleteModal(true);
    };

    const onCancelDelete = () => {
        setId(null);
        setShowDeleteModal(false);
    };

    const onDeleteConfirmed = () => {
        axios
            .delete(route("branch.delete", id))
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
                <div className="text-[25px] mb-4">Branches</div>

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
                                <th>Name</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {branches.map((branch) => (
                                <tr key={branch.id}>
                                    <td>{branch.name}</td>
                                    <td>
                                        <button
                                            onClick={() => onEdit(branch)}
                                            className="px-4 py-1 bg-lime-700 text-white hover:bg-lime-600 rounded-md"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => onDelete(branch)}
                                            className="px-4 py-1 ml-2 bg-red-700 text-white hover:bg-red-600 rounded-md"
                                        >
                                            Delete
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
                        {id ? "Edit" : "New"} Branch
                    </h1>

                    <label className="w-full">Name</label>
                    <input
                        type="text"
                        className="w-full rounded-md bg-[#1c1f22]"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    {nameError && <p className="text-red-600">{nameError}</p>}

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
