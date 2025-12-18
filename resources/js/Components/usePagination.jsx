import { useCallback, useMemo, useState } from "react";

export default function usePagination({
    className,
    onChange,
    defaultPageSize,
    pageSizeList,
}) {
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(defaultPageSize ?? 10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    const pageList = useMemo(() => {
        if (totalPages === 1 || totalPages === 0) return [0];

        if (totalPages < 8)
            return Array.from({ length: totalPages }, (_, i) => i);

        const pages = [0];
        const isInLast = page > totalPages - 5;
        if (page > 3) {
            pages.push(-1);
            if (!isInLast) pages.push(page - 1, page, page + 1, -1);
            else
                pages.push(
                    totalPages - 5,
                    totalPages - 4,
                    totalPages - 3,
                    totalPages - 2
                );
        } else {
            pages.push(1, 2, 3, 4, -1);
        }

        pages.push(totalPages - 1);

        return pages;
    }, [page, totalPages]);

    const onPageChange = useCallback(
        (value) => {
            setPage(value);
            if (onChange) onChange(value, size);
        },
        [onChange, size]
    );

    const onNext = useCallback(() => {
        if (totalPages < 2) return;
        const nv = page + 1 >= totalPages ? 0 : page + 1;
        onPageChange(nv);
    }, [page, totalPages, onPageChange]);

    const onPrev = useCallback(() => {
        if (totalPages < 2) return;
        const nv = page - 1 < 0 ? totalPages - 1 : page - 1;
        onPageChange(nv);
    }, [page, totalPages, onPageChange]);

    const onSizeChange = useCallback((value) => {
        setSize(value);
        setPage(0);
        if (onChange) onChange(0, value);
    }, []);

    const setTotalAndTotalPage = useCallback((items, perPage) => {
        setTotalItems(items);
        let _total = parseInt(items / perPage);
        if (items % perPage !== 0) _total++;

        setTotalPages(_total);
    }, []);

    const renderPagination = useMemo(
        () => (
            <div
                className={`${className} flex flex-wrap items-center justify-end gap-1 text-white`}
            >
                <div className="px-3 text-[17px] mr-3">
                    Total : {totalItems ?? 0}
                </div>

                <select
                    className="bg-teal-800 rounded-md px-2 mr-4 w-[60px]"
                    value={size}
                    onChange={(e) => onSizeChange(e.target.value)}
                >
                    {(pageSizeList ?? [5, 10, 50, 100, 500]).map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>

                <div
                    onClick={onPrev}
                    className="rounded-full size-[30px] flex justify-center items-center hover:bg-teal-700 cursor-pointer bg-teal-800"
                >
                    {"<"}
                </div>

                {pageList.map((i, k) =>
                    i === -1 ? (
                        <button
                            key={k}
                            disabled
                            className="rounded-full size-[30px] flex justify-center items-center cursor-not-allowed bg-teal-800"
                        >
                            ...
                        </button>
                    ) : (
                        <button
                            key={k}
                            onClick={() => onPageChange(i)}
                            className={`rounded-full size-[30px] flex justify-center items-center hover:bg-teal-700 cursor-pointer ${
                                page === i ? "bg-teal-500" : "bg-teal-800"
                            }`}
                        >
                            {i + 1}
                        </button>
                    )
                )}

                <div
                    onClick={onNext}
                    className="rounded-full size-[30px] flex justify-center items-center hover:bg-teal-700 cursor-pointer bg-teal-800"
                >
                    {">"}
                </div>
            </div>
        ),
        [
            className,
            page,
            size,
            totalItems,
            pageList,
            onNext,
            onPrev,
            onPageChange,
            onSizeChange,
        ]
    );

    return {
        page,
        setPage,
        size,
        setSize,
        setTotalPages,
        setTotalItems,
        setTotalAndTotalPage,
        renderPagination,
    };
}
