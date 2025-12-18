import { useState } from "react";
import Modal from "./Modal";
import FieldError from "./FieldError";
import axios from "axios";

export default function ResetPassword({ show, userId, onClose }) {
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [errors, setErrors] = useState({});

    const onCancel = () => {
        setPassword("");
        setPasswordConfirmation("");
        setErrors({});
        onClose();
    };

    const onSave = async () => {
        try {
            await axios.patch(route("user.update-password", userId), {
                password: password,
                password_confirmation: passwordConfirmation,
            });

            onCancel();
        } catch (e) {
            console.log(e.response.data.errors);

            setErrors(e.response.data.errors);
        }
    };

    return (
        <Modal show={show} title="Reset Password">
            <h1 className="text-[22px] font-semibold mb-4 ">Change Password</h1>

            <div className="mt-2">
                <label className="w-full">Password</label>
                <input
                    type="password"
                    className="w-full rounded-md bg-[#1c1f22]"
                    value={password}
                    placeholder="Enter password"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <FieldError errors={errors} name="password" />
            </div>
            <div className="mt-2">
                <label className="w-full">Password Confirmation</label>
                <input
                    type="password"
                    className="w-full rounded-md bg-[#1c1f22]"
                    value={passwordConfirmation}
                    placeholder="Enter password"
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                />
                <FieldError errors={errors} name="password_confirmation" />
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
    );
}
