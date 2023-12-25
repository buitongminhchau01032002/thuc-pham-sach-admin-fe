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

function DeliveryStatusCell({ getValue }) {
    return (
        <div className="flex justify-center">
            <div
                className={clsx('rounded p-2 py-1 text-xs font-medium ', {
                    'bg-green-100 text-green-800': getValue() === 'delivered',
                    'bg-orange-100 text-orange-800': getValue() === 'pending',
                    'bg-red-100 text-red-800': getValue() === 'aborted',
                })}
            >
                {getValue() === 'delivered'
                    ? 'Đã giao'
                    : getValue() === 'pending'
                    ? 'Đang chờ'
                    : 'Đã huỷ'}
            </div>
        </div>
    );
}

function PaymentStatusCell({ getValue }) {
    return (
        <div className="flex justify-center">
            <div
                className={clsx('rounded p-2 py-1 text-xs font-medium ', {
                    'bg-green-100 text-green-800': getValue() === 'paid',
                    'bg-orange-100 text-orange-800': getValue() === 'unpaid',
                })}
            >
                {getValue() === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
            </div>
        </div>
    );
}

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
        size: 80,
    },
    {
        accessorKey: 'createdAt',
        header: (props) => (
            <HeaderCell align="center" tableProps={props}>
                Ngày lập
            </HeaderCell>
        ),
        cell: ({ getValue }) => (
            <p className="text-center">{moment(getValue()).format('HH:mm DD/MM/YYYY')}</p>
        ),
        size: 200,
    },
    {
        accessorKey: 'phone',
        header: (props) => (
            <HeaderCell align="center" tableProps={props}>
                Số điện thoại
            </HeaderCell>
        ),
        cell: ({ getValue }) => <p className="text-center">{getValue()}</p>,
        size: 'full',
    },
    {
        accessorKey: 'totalPrice',
        header: (props) => (
            <HeaderCell align="right" tableProps={props}>
                Giá
            </HeaderCell>
        ),
        cell: ({ getValue }) => (
            <p className="text-right">
                <PriceFormat>{getValue()}</PriceFormat>
            </p>
        ),
        size: 150,
    },

    {
        accessorKey: 'deliveryStatus',
        header: (props) => (
            <HeaderCell align="center" tableProps={props}>
                Nhận hàng
            </HeaderCell>
        ),
        cell: DeliveryStatusCell,
        size: 150,
        enableSorting: false,
    },
    {
        accessorKey: 'paymentStatus',
        header: (props) => (
            <HeaderCell align="center" tableProps={props}>
                Thanh toán
            </HeaderCell>
        ),
        cell: PaymentStatusCell,
        size: 150,
        enableSorting: false,
    },
    {
        id: 'action',
        header: '',
        cell: ActionCell,
        size: 100,
    },
];

function OrderList() {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    // function checkDateInFilter(order) {
    //     if (dateFilter === 'all') {
    //         return true;
    //     }
    //     if (
    //         dateFilter === 'yesterday' &&
    //         moment().subtract(1, 'days').format('YYYY-MM-DD') ==
    //             moment(order.createdAt).format('YYYY-MM-DD')
    //     ) {
    //         return true;
    //     }
    //     if (
    //         dateFilter === 'today' &&
    //         moment().format('YYYY-MM-DD') == moment(order.createdAt).format('YYYY-MM-DD')
    //     ) {
    //         return true;
    //     }
    //     return false;
    // }

    useEffect(() => {
        getOrders();
    }, []);

    const [openDeleteDialog, closeDeleteDialog] = useModal({
        modal: DeleteDialog,
        meta: {
            onDelete: deleteOrder,
        },
    });

    function getOrders() {
        fetch('http://localhost:5000/api/order')
            .then((res) => res.json())
            .then((resJson) => {
                if (resJson.success) {
                    setOrders(resJson.orders.sort((a, b) => b.id - a.id));
                } else {
                    setOrders([]);
                }
            })
            .catch((error) => {
                console.log(error);
                setOrders([]);
            });
    }

    function deleteOrder(id) {
        fetch('http://localhost:5000/api/order/' + id, {
            method: 'DELETE',
        })
            .then((res) => res.json())
            .then((resJson) => {
                if (resJson) {
                    toast.success('Xoá hoá đơn thành công');
                    getOrders();
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
        data: orders,
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
                navigate('/order/detail/' + row.getValue('id'));
            },
            onEditButtonClick: (row) => {
                navigate('/order/update/' + row.getValue('id'));
            },
            onDeleteButtonClick: (row) => {
                openDeleteDialog({ deleteId: row.getValue('id') });
            },
        },
    });

    return (
        <div className="container">
            <div>
                <Table table={table} notFoundMessage="Không có hoá đơn" />
                <Pagination table={table} />
            </div>
        </div>
    );
}

export default OrderList;
