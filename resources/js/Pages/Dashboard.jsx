import TruckIcon from "@/Components/TruckIcon";
import usePagination from "@/Components/usePagination";
import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function Dashboard({
    LOCATIONS,
    logo,
    REFRESH_SECONDS_DURATION,
    LOGISTICS_UNITS,
}) {
    const isRefreshing = useRef(false);
    const [data, setData] = useState([]);
    const [refetch, setRefetch] = useState(1);
    const [lastFetched, setLastFetched] = useState("");
    const [totals, setTotals] = useState({
        trucks_total: [],
        trucks_overall_total: 0,
        onsite_trucks_total: {},
        onsite_per_station: {},
        onsite_trucks_overall_total: 0,
    });
    const [plate_no, setPlateNo] = useState("");
    const [logistics_unit, setLogisticsUnit] = useState("");
    const [cluster, setCluster] = useState("");
    const [date, setDate] = useState("");
    const [capacity, setCapacity] = useState("");
    const [location_code, setLocationCode] = useState("");

    const { page, size, setTotalAndTotalPage, setPage, renderPagination } =
        usePagination({
            className: "mt-4",
            defaultPageSize: 20,
            pageSizeList: [5, 10, 20, 50, 100, 500],
            // onChange: (_page, _size) => {
            //     refresh(_page, _size);
            // },
        });

    const allowedCodes = useMemo(() => {
        if (!logistics_unit && !cluster) return null;

        if (logistics_unit && cluster)
            return LOGISTICS_UNITS[logistics_unit][cluster] ?? [];

        if (logistics_unit)
            return Object.values(LOGISTICS_UNITS[logistics_unit]).flat();

        return Object.values(LOGISTICS_UNITS)
            .map((u) => u[cluster])
            .filter(Boolean)
            .flat();
    }, [logistics_unit, cluster]);

    const refresh = useCallback(
        (_page, _size) => {
            if (isRefreshing.current) return;

            if (allowedCodes == null && location_code == "") {
                setData([]);
                setTotalAndTotalPage(0);
                setTotals({
                    trucks_total: [],
                    trucks_overall_total: 0,
                    onsite_trucks_total: {},
                    onsite_per_station: {},
                    onsite_trucks_overall_total: 0,
                });
                return;
            }

            isRefreshing.current = true;
            axios
                .get(
                    route("dashboard.get", {
                        date: date,
                        capacity: capacity,
                        logistics_unit: logistics_unit,
                        cluster: cluster,
                        plate_no: plate_no,
                        page: _page,
                        page_size: _size,
                        location_codes:
                            location_code == ""
                                ? allowedCodes ?? null
                                : [location_code],
                    })
                )
                .then((res) => {
                    setData(res.data.data);
                    setTotalAndTotalPage(res.data.total_data, _size);

                    setTotals({
                        trucks_total: res.data.trucks_total,
                        trucks_overall_total: res.data.trucks_overall_total,
                        onsite_trucks_total: res.data.onsite_trucks_total,
                        onsite_per_station: res.data.onsite_per_station,
                        onsite_trucks_overall_total:
                            res.data.onsite_trucks_overall_total,
                    });

                    setLastFetched(formatDate());
                })
                .catch((e) => {
                    console.log(e);
                })
                .finally(() => {
                    isRefreshing.current = false;
                });
        },
        [date, capacity, plate_no, location_code, allowedCodes]
    );

    useEffect(() => {
        const intervalRef = { current: null };

        const startInterval = () => {
            intervalRef.current = setInterval(() => {
                setRefetch((prev) => -prev);
            }, REFRESH_SECONDS_DURATION * 1000);
        };

        const stopInterval = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };

        startInterval();

        const handleVisibility = () => {
            if (document.hidden) stopInterval();
            else {
                setRefetch((prev) => -prev);
                startInterval();
            }
        };

        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            stopInterval();
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, []);

    useEffect(() => {
        setPage(0);
        refresh(0, size);
    }, [date, capacity, location_code, allowedCodes]);
    useEffect(() => refresh(page, size), [refetch, page, size]);

    const onKeyupPlateNo = (e) => {
        if (e.key !== "Enter") return;

        refresh(0, size);
    };

    // const onChangeFilter = (key, value) => {
    //     setPage(0);
    //     setFilter((prev) => {
    //         return { ...prev, [key]: value };
    //     });
    // };

    const onReset = () => {
        setLogisticsUnit("");
        setCluster("");
        setPlateNo("");
        setCapacity("");
        setDate("");
        setLocationCode("");
    };

    const onExport = useCallback(() => {
        document.location.href = route("dashboard.export", {
            date: date,
            capacity: capacity,
            logistics_unit: logistics_unit,
            cluster: cluster,
            plate_no: plate_no,
            page: page,
            page_size: size,
            location_codes:
                location_code == "" ? allowedCodes ?? null : [location_code],
        });
    }, [page, size]);

    const formatDate = () => {
        const d = new Date();

        return d.toLocaleString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    };

    const onChangeLogisticsUnit = (value) => {
        setLocationCode("");
        setLogisticsUnit(value);
        setCluster("");
    };

    const onChangeCluster = (value) => {
        setLocationCode("");
        setCluster(value);
    };

    const clusters = useMemo(() => {
        if (logistics_unit) return Object.keys(LOGISTICS_UNITS[logistics_unit]);

        return Object.values(LOGISTICS_UNITS).flatMap((unit) =>
            Object.keys(unit)
        );
    }, [logistics_unit]);

    const locations = useMemo(() => {
        if (!allowedCodes) return LOCATIONS;
        return LOCATIONS.filter((loc) => allowedCodes.includes(loc.code));
    }, [allowedCodes]);

    return (
        <div className="text-black bg-white">
            <header className="px-4 flex justify-between flex-wrap items-center gap-2 md:h-[60px] bg-gray-100">
                <img className="w-[100px]" src={logo} alt="" />
                <div className="flex gap-2 flex-wrap items-center">
                    <svg
                        viewBox="0 0 160 80"
                        width="100"
                        height="40"
                        role="img"
                        aria-label="Semi-trailer truck icon"
                    >
                        <defs>
                            <linearGradient id="g" x1="0" x2="1">
                                <stop offset="0" stopColor="red" />
                                <stop offset="1" stopColor="orange" />
                            </linearGradient>
                        </defs>
                        <rect
                            x="6"
                            y="18"
                            width="96"
                            height="36"
                            rx="4"
                            fill="url(#g)"
                        />
                        <rect
                            x="106"
                            y="28"
                            width="40"
                            height="26"
                            rx="4"
                            fill="#1f6feb"
                        />
                        <rect
                            x="118"
                            y="20"
                            width="10"
                            height="10"
                            rx="2"
                            fill="#a7c4ff"
                        />
                        <rect
                            x="18"
                            y="26"
                            width="12"
                            height="20"
                            rx="1"
                            fill="#ffffff"
                            opacity="0.18"
                        />
                        <rect
                            x="36"
                            y="26"
                            width="12"
                            height="20"
                            rx="1"
                            fill="#ffffff"
                            opacity="0.12"
                        />
                        <g fill="#111">
                            <circle cx="30" cy="62" r="8" />
                            <circle cx="74" cy="62" r="8" />
                            <circle cx="126" cy="62" r="8" />
                        </g>
                        <g fill="#e6e6e6">
                            <circle cx="30" cy="62" r="3" />
                            <circle cx="74" cy="62" r="3" />
                            <circle cx="126" cy="62" r="3" />
                        </g>
                        <ellipse
                            cx="80"
                            cy="70"
                            rx="68"
                            ry="6"
                            fill="#000"
                            opacity="0.08"
                        />
                    </svg>
                    <h1 className="text-[25px] font-bold">
                        Daily Truck RFID Tracker
                    </h1>
                </div>

                <div>Last Refresh : {lastFetched}</div>
            </header>

            <div className="flex min-h-[calc(100vh-60px)] flex-wrap">
                <aside className="m-1 bg-gray-200 p-1 w-[200px]">
                    <div className="mt-4">
                        <label className="font-bold">Plate Number</label>
                        <input
                            value={plate_no}
                            onChange={(e) => setPlateNo(e.target.value)}
                            onKeyUp={onKeyupPlateNo}
                            type="text"
                            className="w-full rounded-[0.20rem] border-gray-300 text-sm text-gray-700"
                            placeholder="Search"
                        />
                    </div>

                    <div className="mt-4">
                        <label className="font-bold">Date</label>
                        <input
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            type="date"
                            className="w-full py-1 rounded-[0.20rem] border-gray-300 text-sm text-gray-700"
                        />
                    </div>

                    <div className="mt-4">
                        <label className="font-bold">Logistics Unit</label>
                        <select
                            value={logistics_unit}
                            onChange={(e) =>
                                onChangeLogisticsUnit(e.target.value)
                            }
                            className="w-full py-1 rounded-[0.20rem] border-gray-300 text-sm text-gray-700"
                        >
                            <option value={""}>All</option>
                            {Object.keys(LOGISTICS_UNITS).map((unit) => (
                                <option key={unit} value={unit}>
                                    {unit}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-4">
                        <label className="font-bold">Cluster</label>
                        <select
                            value={cluster}
                            onChange={(e) => onChangeCluster(e.target.value)}
                            className="w-full py-1 rounded-[0.20rem] border-gray-300 text-sm text-gray-700"
                        >
                            <option value={""}>All</option>
                            {clusters.map((_cluster) => (
                                <option key={_cluster} value={_cluster}>
                                    {_cluster}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-4">
                        <label className="font-bold">Site Name</label>
                        <select
                            value={location_code}
                            onChange={(e) => setLocationCode(e.target.value)}
                            className="w-full py-1 rounded-[0.20rem] border-gray-300 text-sm text-gray-700"
                        >
                            <option value={""}>All</option>
                            {locations.map((location) => (
                                <option
                                    key={location.code}
                                    value={location.code}
                                >
                                    {location.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-4">
                        <label className="font-bold">Pallet Capacity</label>
                        <select
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            className="w-full py-1 rounded-[0.20rem] border-gray-300 text-sm text-gray-700"
                        >
                            <option value={""}>All</option>
                            {Array.from({ length: 50 }, (_, i) => i + 1).map(
                                (cap) => (
                                    <option key={cap} value={cap}>
                                        {cap}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <button
                        onClick={onReset}
                        className="w-full mt-[1.5rem] py-2 border text-gray-800 rounded-[0.2rem] border-gray-500"
                    >
                        Reset
                    </button>
                    <button
                        onClick={onExport}
                        className="w-full mt-[10px] py-2 border text-gray-800 rounded-[0.2rem] border-gray-500"
                    >
                        Export
                    </button>
                </aside>

                <main className="flex-1 mt-1 min-w-[300px] overflow-x-auto p-2 border rounded-sm">
                    {data.length > 0 ? (
                        <>
                            <table id="dashboard-table">
                                <thead className="bg-black text-white">
                                    <tr className="text-[0.91rem]">
                                        <th>Date</th>
                                        <th>Plate Number</th>
                                        <th>Ownership</th>
                                        <th>Location</th>
                                        <th>Pallet Capacity</th>
                                        <th>Truck Source</th>
                                        <th>Station</th>
                                        <th className="min-w-[75px]">In</th>
                                        <th className="min-w-[75px]">Out</th>
                                        <th>Duration</th>
                                        {/* <th>Entry</th> */}
                                        <th>Parking</th>
                                        <th>Dock</th>
                                        {/* <th>Yard</th> */}
                                        <th>Exit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((row, i) => (
                                        <tr
                                            key={i}
                                            className="border-b text-sm text-gray-600 hover:bg-gray-200"
                                        >
                                            <td className="font-semibold text-black">
                                                {row.date}
                                            </td>
                                            <td>{row.plate_no}</td>
                                            <td>{row.ownership}</td>
                                            <td>{row.location}</td>
                                            <td>{row.capacity}</td>
                                            <td>{row.location_source}</td>
                                            <td>{row.station}</td>
                                            <td>
                                                {row.entry_error ? (
                                                    <p className="p-1 rounded-sm bg-red-200 text-red-700">
                                                        {row.entry_error}
                                                    </p>
                                                ) : (
                                                    row.in
                                                )}
                                            </td>
                                            <td>
                                                {row.exit_error ? (
                                                    <p className="p-1 rounded-sm bg-red-200 text-red-700">
                                                        {row.exit_error}
                                                    </p>
                                                ) : (
                                                    row.out ?? "-"
                                                )}
                                            </td>
                                            <td>{row.duration ?? "-"}</td>
                                            {/* <td></td> */}
                                            <td>
                                                {row.current_station ==
                                                    "Parking" && <TruckIcon />}
                                            </td>
                                            <td>
                                                {row.current_station ==
                                                    "Dock" && <TruckIcon />}
                                            </td>
                                            {/* <td>
                                                {row.current_station ==
                                                    "Yard" && <TruckIcon />}
                                            </td> */}
                                            <td>
                                                {row.current_station ==
                                                    "Exit" && <TruckIcon />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {renderPagination}
                        </>
                    ) : (
                        <div className="w-full h-full text-2xl font-bold flex justify-center items-center">
                            No data found.
                        </div>
                    )}
                </main>

                <aside className="m-1 bg-gray-200 w-[200px]">
                    <h4 className="w-full font-bold bg-gray-300 text-center">
                        Announcement Board
                    </h4>
                    <div className="bg-blue-200 w-full p-1 h-[100px]">
                        <div className="flex gap-2 font-bold text-sm border-b border-blue-400">
                            <button className="">Site</button>
                            <button className="">Message</button>
                        </div>

                        <div className="flex gap-2 text-sm">
                            <button className="">{location_code}</button>
                            <button className="">Work in Progress</button>
                        </div>
                    </div>

                    <h4 className="w-full font-bold bg-gray-300 text-center">
                        Fleet Inventory
                    </h4>
                    <div className="px-2">
                        <div className="flex gap-2 justify-between font-bold text-sm border-b border-blue-400">
                            <div className="">Owner</div>
                            <div className=""># of Trucks</div>
                        </div>
                        {totals.trucks_total.map((row, i) => (
                            <div
                                key={i}
                                className="flex gap-2 justify-between text-gray-600 text-sm border-b border-blue-400"
                            >
                                <div className="">{row.provider}</div>
                                <div className="">{row.total}</div>
                            </div>
                        ))}
                        <div className="flex gap-2 justify-between text-sm font-bold">
                            <div className="">Total</div>
                            <div className="">
                                {totals.trucks_overall_total}
                            </div>
                        </div>
                    </div>

                    <h4 className="w-full mt-10 font-bold bg-gray-300 text-center">
                        On-site Trucks
                    </h4>
                    <div className="px-2 pb-1">
                        <div className="flex gap-2 justify-between font-bold text-sm border-b border-blue-400">
                            <div className="">Owner</div>
                            <div className=""># of Trucks</div>
                        </div>
                        {Object.keys(totals.onsite_trucks_total).map(
                            (provider) => (
                                <div
                                    key={provider}
                                    className="flex gap-2 justify-between text-gray-600 text-sm border-b border-blue-400"
                                >
                                    <div className="">{provider}</div>
                                    <div className="">
                                        {totals.onsite_trucks_total[provider]}
                                    </div>
                                </div>
                            )
                        )}
                        <div className="flex gap-2 justify-between text-sm font-bold">
                            <div className="">Total</div>
                            <div className="">
                                {totals.onsite_trucks_overall_total}
                            </div>
                        </div>
                    </div>

                    <h4 className="w-full mt-10 font-bold bg-gray-300 text-center">
                        On-site Trucks Per Station
                    </h4>
                    <div className="px-2 pb-3">
                        <div className="flex gap-2 justify-between font-bold text-sm border-b border-blue-400">
                            <div className="">Station</div>
                            <div className=""># of Trucks</div>
                        </div>
                        {Object.keys(totals.onsite_per_station).map(
                            (station) => (
                                <div
                                    key={station}
                                    className="flex gap-2 justify-between text-gray-600 text-sm border-b border-blue-400"
                                >
                                    <div className="">{station}</div>
                                    <div className="">
                                        {totals.onsite_per_station[station]}
                                    </div>
                                </div>
                            )
                        )}
                        <div className="flex gap-2 justify-between text-sm font-bold">
                            <div className="">Total</div>
                            <div className="">
                                {totals.onsite_trucks_overall_total}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
