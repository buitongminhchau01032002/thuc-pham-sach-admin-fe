import { Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Popover } from '@headlessui/react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import {
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import DeleteDialog from '../../../components/DeleteDialog';
import HeaderCell from '../../../components/Table/HeaderCell';
import useModal from '../../../hooks/useModal';
import Table from '../../../components/Table';
import Pagination from '../../../components/Table/Pagination';

function ActionCell({ table, row }) {
    return (
        <div className="flex justify-center">
            <button
                className="btn btn-yellow px-3 py-1"
                onClick={(e) => {
                    e.stopPropagation();
                    table.options.meta?.onEditButtonClick(row);
                }}
            >
                Sửa
            </button>
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
        accessorKey: 'name',
        header: (props) => <HeaderCell tableProps={props}>Tên</HeaderCell>,
        size: 300,
    },
    {
        accessorKey: 'description',
        header: (props) => <HeaderCell tableProps={props}>Mô tả</HeaderCell>,
        size: 'full',
    },
    {
        id: 'action',
        header: '',
        cell: ActionCell,
        size: 200,
    },
];

function RoleList() {
    const [roles, setRoles] = useState([]);
    const navigate = useNavigate();
    const [openDeleteDialog, closeDeleteDialog] = useModal({
        modal: DeleteDialog,
        meta: {
            onDelete: deleteRole,
        },
    });

    useEffect(() => {
        getRoles();
    }, []);

    function getRoles() {
        fetch('http://localhost:5000/api/role')
            .then((res) => res.json())
            .then((resJson) => {
                if (resJson.success) {
                    setRoles(resJson.roles);
                } else {
                    setRoles([]);
                }
            });
    }

    function deleteRole(id) {
        fetch('http://localhost:5000/api/role/' + id, {
            method: 'DELETE',
        })
            .then((res) => res.json())
            .then((resJson) => {
                if (resJson) {
                    toast.success('Xóa chức vụ thành công!');
                    getRoles();
                } else {
                    showErorrNoti();
                }
            })
            .catch(() => {
                toast.error('Có lỗi xảy ra!');
            })
            .finally(() => {
                closeDeleteDialog();
            });
    }

    const table = useReactTable({
        data: roles,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        meta: {
            onEditButtonClick: (row) => {
                navigate('/role/update/' + row.getValue('id'));
            },
            onDeleteButtonClick: (row) => {
                openDeleteDialog({ deleteId: row.getValue('id') });
            },
        },
    });

    return (
        <div className="container">
            {/* LIST */}
            <div>
                <Table table={table} notFoundMessage="Không có chức vụ" />
                <Pagination table={table} />
            </div>
        </div>
    );
}

export default RoleList;
