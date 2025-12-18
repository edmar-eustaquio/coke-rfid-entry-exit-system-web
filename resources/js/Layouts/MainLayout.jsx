import SidebarItem from "@/Components/SidebarItem";
import { Link, usePage } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useState } from "react";

export default function MainLayout({ children }) {
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);
    const [showSidebar, setShowSidebar] = useState(window.innerWidth > 768);

    useEffect(() => {
        const handleResize = () => {
            const desktop = window.innerWidth > 768;
            setIsDesktop(desktop);
            setShowSidebar(desktop);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const { auth, logo } = usePage().props;

    return (
        <div
            className={`container ${
                !showSidebar || !isDesktop ? "shrink-sidebar" : ""
            }`}
        >
            <aside className={`sidebar ${showSidebar ? "show-sidebar" : ""}`}>
                <div className="flex text-red-700 justify-center items-center h-[70px] text-[30px] border-b border-dashed border-b-red-700">
                    <img src={logo} alt="" className="m-2 w-[90%]" />
                </div>
                {/* <h1 className="flex text-red-700 justify-center items-center h-[70px] text-[30px] border-b border-dashed border-b-red-700">
                    Coke
                </h1> */}

                <ul className="mx-4 mt-[3rem]">
                    <a
                        target="_blank"
                        href={route("dashboard")}
                        className={`py-1 flex text-left mt-2 cursor-pointer hover:bg-red-600 rounded-md px-4`}
                    >
                        Dashboard
                    </a>

                    {auth.user.role === "Admin" && (
                        <SidebarItem label="Users" href={route("user.index")} />
                    )}
                    {/* <SidebarItem
                        label="Branches"
                        href={route("branch.index")}
                    /> */}
                    <SidebarItem label="Readers" href={route("reader.index")} />
                    <SidebarItem label="Trucks" href={route("truck.index")} />
                    <SidebarItem
                        label="Histories"
                        href={route("history.index")}
                    />
                    <SidebarItem label="Profile" href={route("profile.edit")} />
                    <Link
                        method="post"
                        href={route("logout")}
                        className={`py-1 w-full text-left mt-2 cursor-pointer hover:bg-red-600 rounded-md px-4`}
                    >
                        Logout
                    </Link>
                </ul>
            </aside>

            <nav className="navbar">
                <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="text-[20px]"
                >
                    ☰
                </button>
            </nav>

            <main className="content">{children}</main>

            {!isDesktop && showSidebar && (
                <div
                    className="mobile-main-blur"
                    onClick={() => setShowSidebar(false)}
                />
            )}
        </div>
    );
}
