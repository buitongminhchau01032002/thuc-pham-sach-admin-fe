import clsx from 'clsx';
import { Fragment, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import useModal from '../../../hooks/useModal';
import DeleteDialog from '../../../components/DeleteDialog';
import HeaderCell from '../../../components/Table/HeaderCell';
import Table from '../../../components/Table';
import Pagination from '../../../components/Table/Pagination';

function NameAndImageCell({ row, getValue }) {
    const avatar = row.getValue('avatar');
    return (
        <div className="flex items-center space-x-2">
            <img
                src={avatar || '/placeholder.png'}
                className="h-10 w-10 rounded-full border object-cover"
            />
            <p className="flex-1">{getValue()}</p>
        </div>
    );
}

function ActionCell({ table, row }) {
    return (
        <div className="flex justify-end">
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
        cell: NameAndImageCell,
        size: 'full',
    },
    {
        accessorKey: 'phone',
        header: (props) => (
            <HeaderCell align="center" tableProps={props}>
                Số điện thoại
            </HeaderCell>
        ),
        cell: ({ getValue }) => <p className="text-center">{getValue()}</p>,
        size: 300,
    },

    {
        id: 'action',
        header: '',
        cell: ActionCell,
        size: 200,
    },
    {
        accessorKey: 'avatar',
    },
];
function CustomerList() {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletingCustomerId, setDeletingCustomerId] = useState(null);

    const [search, setSearch] = useState('');
    const [customers, setCustomers] = useState([]);
    const navigate = useNavigate();

    const showDeleteNoti = () => toast.success('Xóa khách hàng thành công!');
    const showErorrNoti = () => toast.error('Có lỗi xảy ra!');
    // const account = useSelector(accountSelector);
    // function isHiddenItem(functionName) {
    //     if (!account) {
    //         return true;
    //     }
    //     if (!functionName) {
    //         return false;
    //     }
    //     const findResult = account?.functions?.find((_func) => _func?.name === functionName);
    //     if (findResult) {
    //         return false;
    //     }
    //     return true;
    // }
    useEffect(() => {
        getCustomers();
    }, []);

    function getCustomers() {
        fetch('http://localhost:5000/api/customer')
            .then((res) => res.json())
            .then((resJson) => {
                if (resJson.success) {
                    setCustomers(resJson.customers);
                } else {
                    setCustomers([]);
                }
            })
            .catch((error) => {
                console.log(error);
                setCustomers([]);
            });
    }

    function deleteCustomer(id) {
        fetch('http://localhost:5000/api/customer/' + id, {
            method: 'DELETE',
        })
            .then((res) => res.json())
            .then((resJson) => {
                if (resJson) {
                    showDeleteNoti();
                    getCustomers();
                } else {
                    showErorrNoti();
                }
            })
            .catch(() => {
                showErorrNoti();
            })
            .finally(() => {
                closeDeleteDialog();
            });
    }

    const [openDeleteDialog, closeDeleteDialog] = useModal({
        modal: DeleteDialog,
        meta: {
            onDelete: deleteCustomer,
        },
    });

    const table = useReactTable({
        data: customers,
        columns,
        state: {
            // columnFilters,
            columnVisibility: { avatar: false },
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        meta: {
            onRowClick: (row) => {
                navigate('/customer/detail/' + row.getValue('id'));
            },
            onEditButtonClick: (row) => {
                navigate('/customer/update/' + row.getValue('id'));
            },
            onDeleteButtonClick: (row) => {
                openDeleteDialog({ deleteId: row.getValue('id') });
            },
        },
    });
    return (
        <div className="container w-full">
            <div>
                <Table table={table} notFoundMessage="Không có khách hàng" />
                <Pagination table={table} />
            </div>
        </div>
    );
}

export default CustomerList;
