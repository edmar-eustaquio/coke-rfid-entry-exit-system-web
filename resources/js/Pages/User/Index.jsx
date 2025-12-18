import FieldError from "@/Components/FieldError";
import Modal from "@/Components/Modal";
import ResetPassword from "@/Components/ResetPassword";
import usePagination from "@/Components/usePagination";
import MainLayout from "@/Layouts/MainLayout";
import axios from "axios";
import React, { useEffect, useState } from "react";

export default function Index({ LOCATIONS }) {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [id, setId] = useState(null);
    const [errors, setErrors] = useState({});

    const [data, setD] = useState({
        name: "",
        email: "",
        role: "Branch Admin",
        branch: "",
        password: "",
        password_confirmation: "",
    });

    const { page, size, setTotalAndTotalPage, setPage, renderPagination } =
        usePagination({ className: "mt-4" });

    const refresh = () => {
        let params = {
            page_size: size,
            page: page + 1,
        };
        if (search) params["search"] = search;

        axios
            .get(route("user.all", params))
            .then((res) => {
                const { data, total, per_page } = res.data;

                setUsers(data);
                setTotalAndTotalPage(total, per_page);
            })
            .catch((e) => {
                console.log(e);
            });
    };

    useEffect(refresh, [page, size]);

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
        else refresh();
    };

    const onCancel = () => {
        setShowModal(false);
        setD({
            name: "",
            email: "",
            role: "Branch Admin",
            branch: "",
            password: "",
            password_confirmation: "",
        });
        setErrors({});
        setId(null);
    };

    const onSave = async () => {
        try {
            if (id) await axios.put(route("user.update", id), data);
            else await axios.post(route("user.create"), data);

            onCancel();
            refresh();
        } catch (e) {
            console.log(e.response.data.errors);

            setErrors(e.response.data.errors);
        }
    };

    const onEdit = (row) => {
        setData("name", row.name);
        setData("email", row.email);
        setData("role", row.role);
        setData("branch", row.branch ?? "");

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
            .delete(route("user.delete", id))
            .then(() => {
                refresh();
                onCancelDelete();
            })
            .catch((e) => {
                console.log(e);
            });
    };

    const onShowResetPassword = (userId) => {
        setId(userId);
        setShowResetPasswordModal(true);
    };

    const onCloseResetPassword = () => {
        setId(null);
        setShowResetPasswordModal(false);
    };

    return (
        <MainLayout>
            <div className="p-4">
                <div className="text-[25px] mb-4">Users</div>

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
                                <th>Email</th>
                                <th>Role</th>
                                <th>Branch</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>{user.branch}</td>
                                    <td>
                                        <button
                                            onClick={() =>
                                                onShowResetPassword(user.id)
                                            }
                                            className="px-4 py-1 bg-orange-700 text-white hover:bg-orange-600 rounded-md"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <title>Change Password</title>
                                                <rect
                                                    x="6"
                                                    y="11"
                                                    width="12"
                                                    height="10"
                                                    rx="2"
                                                    ry="2"
                                                />
                                                <path d="M9 11V8a3 3 0 1 1 6 0v3" />
                                                <path d="M3 6h6l-2-2" />
                                                <path d="M21 6h-6l2 2" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => onEdit(user)}
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
                                            onClick={() => onDelete(user.id)}
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
                        {id ? "Edit" : "New"} User
                    </h1>

                    <label className="w-full">Name</label>
                    <input
                        type="text"
                        className="w-full rounded-md bg-[#1c1f22]"
                        value={data.name}
                        placeholder="Enter name"
                        onChange={(e) => setData("name", e.target.value)}
                    />
                    <FieldError errors={errors} name="name" />

                    <div className="mt-2">
                        <label className="w-full">Email</label>
                        <input
                            type="text"
                            className="w-full rounded-md bg-[#1c1f22]"
                            value={data.email}
                            placeholder="Enter email"
                            onChange={(e) => setData("email", e.target.value)}
                        />
                        <FieldError errors={errors} name="email" />
                    </div>

                    <div className="mt-2">
                        <label className="w-full">Role</label>
                        <select
                            value={data.role}
                            onChange={(e) => setData("role", e.target.value)}
                            className="w-full rounded-md bg-[#1c1f22]"
                        >
                            <option value="Branch Admin">Branch Admin</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    {data.role !== "Admin" && (
                        <div className="mt-2">
                            <label className="w-full">Branch</label>
                            <select
                                value={data.branch}
                                onChange={(e) =>
                                    setData("branch", e.target.value)
                                }
                                className="w-full rounded-md bg-[#1c1f22]"
                            >
                                <option value="" disabled>
                                    Select Branch
                                </option>
                                {LOCATIONS.map((loc) => (
                                    <option key={loc.code} value={loc.name}>
                                        {loc.name}
                                    </option>
                                ))}
                            </select>
                            <FieldError errors={errors} name="branch" />
                        </div>
                    )}

                    {!id && (
                        <>
                            <div className="mt-2">
                                <label className="w-full">Password</label>
                                <input
                                    type="password"
                                    className="w-full rounded-md bg-[#1c1f22]"
                                    value={data.password}
                                    placeholder="Enter password"
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                />
                                <FieldError errors={errors} name="password" />
                            </div>
                            <div className="mt-2">
                                <label className="w-full">
                                    Password Confirmation
                                </label>
                                <input
                                    type="password"
                                    className="w-full rounded-md bg-[#1c1f22]"
                                    value={data.password_confirmation}
                                    placeholder="Enter password"
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                />
                                <FieldError
                                    errors={errors}
                                    name="password_confirmation"
                                />
                            </div>
                        </>
                    )}

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
                <ResetPassword
                    show={showResetPasswordModal}
                    userId={id}
                    onClose={onCloseResetPassword}
                />
            </div>
        </MainLayout>
    );
}
