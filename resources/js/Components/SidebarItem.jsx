import { Link } from "@inertiajs/react";

export default function SidebarItem({ label, href }) {
    return (
        <Link
            className={`py-1 flex mt-2 cursor-pointer hover:bg-red-600 rounded-md px-4 ${
                href === window.location.href ||
                href + "/" === window.location.href
                    ? "bg-red-600"
                    : ""
            }`}
            href={href}
        >
            {label}
        </Link>
    );
}
