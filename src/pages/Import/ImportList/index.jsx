import { Fragment, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Listbox, Popover } from '@headlessui/react';
import clsx from 'clsx';
import { useEffect } from 'react';
import moment from 'moment';
import PriceFormat from '../../../components/PriceFormat';
import { toast, ToastContainer } from 'react-toastify';
import { useSelector } from 'react-redux';
import { accountSelector } from '../../../redux/selectors';
import {
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import Table from '../../../components/Table';
import Pagination from '../../../components/Table/Pagination';
import HeaderCell from '../../../components/Table/HeaderCell';
import useModal from '../../../hooks/useModal';
import DeleteDialog from '../../../components/DeleteDialog';

function ActionCell({ table, row }) {
    return (
        <div className="flex justify-end">
            <button
                className="btn btn-red px-3 py-1"
                onClick={(e) => {
                    e.stopPropagation();
                    table.options.meta?.onDeleteButtonClick(row);
                }}
            >
                Xoá
            </button>
        </div>
    );
}

const columns = [
    {
        accessorKey: 'id',
        header: (props) => (
            <HeaderCell align="center" tableProps={props}>
                Mã
            </HeaderCell>
        ),
        cell: ({ getValue }) => <p className="text-center">{getValue()}</p>,
        size: 100,
    },
    {
        accessorKey: 'createdAt',
        header: (props) => (
            <HeaderCell align="center" tableProps={props}>
                Ngày lập
            </HeaderCell>
        ),
        cell: ({ getValue }) => (
            <p className="text-center">{moment(getValue()).format('HH:MM DD/MM/YYYY')}</p>
        ),
        size: 300,
    },
    {
        accessorKey: 'totalPrice',
        header: (props) => (
            <HeaderCell align="right" tableProps={props}>
                Tổng tiền
            </HeaderCell>
        ),
        cell: ({ getValue }) => (
            <p className="text-right">
                <PriceFormat>{getValue()}</PriceFormat>
            </p>
        ),
        size: 'full',
    },

    {
        id: 'action',
        header: '',
        cell: ActionCell,
        size: 300,
    },
];

function ImportList() {
    const [imports, setImports] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        getImports();
    }, []);

    const [openDeleteDialog, closeDeleteDialog] = useModal({
        modal: DeleteDialog,
        meta: {
            onDelete: deleteImport,
        },
    });

    function getImports() {
        fetch('http://localhost:5000/api/import')
            .then((res) => res.json())
            .then((resJson) => {
                if (resJson.success) {
                    setImports(resJson.imports.sort((a, b) => b.id - a.id));
                } else {
                    setImports([]);
                }
            })
            .catch((error) => {
                console.log(error);
                setImports([]);
            });
    }

    function deleteImport(id) {
        fetch('http://localhost:5000/api/import/' + id, {
            method: 'DELETE',
        })
            .then((res) => res.json())
            .then((resJson) => {
                if (resJson) {
                    toast.success('Xoá phiếu nhập thành công');
                    getImports();
                } else {
                    toast.error('Có lỗi xảy ra');
                }
            })
            .catch((e) => {
                console.log(e);
                toast.error('Có lỗi xảy ra');
            })
            .finally(() => {
                closeDeleteDialog();
            });
    }

    const table = useReactTable({
        data: imports,
        columns,
        state: {
            // columnFilters,
            // columnVisibility: { images: false },
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        meta: {
            onRowClick: (row) => {
                navigate('/import/detail/' + row.getValue('id'));
            },
            onEditButtonClick: (row) => {
                navigate('/import/update/' + row.getValue('id'));
            },
            onDeleteButtonClick: (row) => {
                openDeleteDialog({ deleteId: row.getValue('id') });
            },
        },
    });

    return (
        <div className="container max-w-[800px]">
            <div>
                <Table table={table} notFoundMessage="Không có phiếu nhập" />
                <Pagination table={table} />
            </div>
        </div>
    );
}

export default ImportList;
