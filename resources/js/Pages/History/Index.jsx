import usePagination from "@/Components/usePagination";
import MainLayout from "@/Layouts/MainLayout";
import axios from "axios";
import React, { useEffect, useState } from "react";

export default function Index({ LOCATIONS }) {
    const [histories, setHistories] = useState([]);
    const [search, setSearch] = useState("");
    // const [type, setType] = useState("");
    const [locationCode, setLocationCode] = useState("");
    const [station, setStation] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateUntil, setDateUntil] = useState("");

    const { page, setPage, size, setTotalAndTotalPage, renderPagination } =
        usePagination({
            className: "mt-4",
            onChange: (_page, _size) => {
                refresh({
                    page_size: _size,
                    page: _page + 1,
                });
            },
        });

    const refresh = (paginationData) => {
        let params = paginationData ?? {
            page_size: size,
            page: page + 1,
        };

        if (search.trim() != "") params["search"] = search.trim();
        if (dateFrom.trim() != "") params["date_from"] = dateFrom.trim();
        if (dateUntil.trim() != "") params["date_until"] = dateUntil.trim();
        // if (type != "") params["type"] = type;
        if (locationCode != "") params["location_code"] = locationCode;
        if (station != "") params["station"] = station;

        axios
            .get(route("history.all", params))
            .then((res) => {
                const { data, total, per_page } = res.data;
                setHistories(data);
                setTotalAndTotalPage(total, per_page);
            })
            .catch((e) => {
                console.log(e);
            });
    };

    useEffect(() => {
        setPage(0);
        refresh({
            page_size: size,
            page: 1,
        });
    }, [dateFrom, dateUntil, locationCode, station]);

    const onExport = () => {
        let params = {
            page_size: size,
            page: page + 1,
        };
        if (search.trim() != "") params["search"] = search.trim();
        if (dateFrom.trim() != "") params["date_from"] = dateFrom.trim();
        if (dateUntil.trim() != "") params["date_until"] = dateUntil.trim();

        document.location.href = route("history.export", params);
    };

    const onSearchKeyUp = (e) => {
        if (e.key !== "Enter") return;

        setPage(0);
        refresh({
            page_size: size,
            page: 1,
        });
    };

    return (
        <MainLayout>
            <div className="p-4">
                <div className="flex justify-between items-center">
                    <div className="text-[25px] mb-4">History</div>
                    <button
                        onClick={onExport}
                        className="px-4 h-fit py-1 rounded-md bg-teal-700 text-white hover:bg-teal-600"
                    >
                        Export
                    </button>
                </div>

                <div className="flex gap-2 flex-wrap justify-between">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyUp={onSearchKeyUp}
                        placeholder="Search here"
                        className="flex-1 min-w-[150px] shadow-sm shadow-white/50 bg-[#1c1f22] rounded-md max-w-[500px]"
                    />

                    <div className="flex gap-2 flex-wrap">
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            placeholder="Select date from"
                            className="shadow-sm w-[150px] shadow-white/50 bg-[#1c1f22] rounded-md"
                        />

                        <input
                            type="date"
                            value={dateUntil}
                            onChange={(e) => setDateUntil(e.target.value)}
                            placeholder="Select date until"
                            className="shadow-sm w-[150px] shadow-white/50 bg-[#1c1f22] rounded-md"
                        />
                    </div>
                </div>

                <div className="flex gap-2 flex-wrap mt-2 justify-between">
                    {/* <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-[150px] shadow-sm shadow-white/50 bg-[#1c1f22] rounded-md"
                    >
                        <option value="">All Type</option>
                        <option value="in">In</option>
                        <option value="out">Out</option>
                    </select> */}

                    <select
                        value={locationCode}
                        onChange={(e) => setLocationCode(e.target.value)}
                        className="min-w-[150px] max-w-[500px] flex-[2] shadow-sm shadow-white/50 bg-[#1c1f22] rounded-md"
                    >
                        <option value="">All Location</option>
                        {LOCATIONS.map((loc) => (
                            <option key={loc.code} value={loc.code}>
                                {loc.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={station}
                        onChange={(e) => setStation(e.target.value)}
                        className="min-w-[150px] max-w-[310px] flex-1 shadow-sm shadow-white/50 bg-[#1c1f22] rounded-md"
                    >
                        <option value="">All Station</option>
                        {/* <option value="Site">Site</option> */}
                        <option value="Parking">Parking</option>
                        <option value="Dock">Dock</option>
                        <option value="Yard">Yard</option>
                    </select>
                </div>
                <div className="shadow-lg overflow-auto shadow-white/50 border rounded-lg mt-4 border-[#1c1f22]">
                    <table className="w-full min-w-[400px]">
                        <thead className="border-b border-dotted">
                            <tr>
                                <th>Vehicle ID</th>
                                <th>Plate No</th>
                                <th>Date Scan</th>
                                <th>Time Scan</th>
                                <th>Out Date Scan</th>
                                <th>Out Time Scan</th>
                                {/* <th>Type</th> */}
                                <th>Location Code</th>
                                <th>Location</th>
                                <th>Station</th>
                            </tr>
                        </thead>

                        <tbody>
                            {histories.map((history) => (
                                <tr key={history.id}>
                                    <td>{history.truck.vehicle_id}</td>
                                    <td>{history.truck.plate_no}</td>
                                    <td>{history.date_scan}</td>
                                    <td>{history.time_scan}</td>
                                    <td>{history.out_date_scan}</td>
                                    <td>{history.out_time_scan}</td>
                                    {/* {history.type == "in" ? (
                                        <td className="text-teal-700">IN</td>
                                    ) : (
                                        <td className="text-lime-700">OUT</td>
                                    )} */}
                                    <td>{history.location_code}</td>
                                    <td>{history.location}</td>
                                    <td>{history.station}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {renderPagination}
            </div>
        </MainLayout>
    );
}
