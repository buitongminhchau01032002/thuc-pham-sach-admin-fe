import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import {
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import HeaderCell from '../../../components/Table/HeaderCell';
import Pagination from '../../../components/Table/Pagination';
import Table from '../../../components/Table';
import useModal from '../../../hooks/useModal';
import DeleteDialog from '../../../components/DeleteDialog';

function StatusCell({ getValue }) {
    return (
        <div className="flex justify-center">
            <div
                className={clsx('rounded p-2 py-1 text-xs font-medium ', {
                    'bg-green-100 text-green-800': getValue() === 'active',
                    'bg-red-100 text-red-800': getValue() !== 'active',
                })}
            >
                {getValue() === 'active' ? 'Đang bán' : 'Không bán'}
            </div>
        </div>
    );
}

function NameAndImageCell({ row, getValue }) {
    const images = row.getValue('images');
    return (
        <div className="flex items-center space-x-2">
            <img
                src={images?.[0] || '/placeholder.png'}
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
        size: 80,
    },
    {
        accessorKey: 'name',
        header: (props) => <HeaderCell tableProps={props}>Tên</HeaderCell>,
        cell: NameAndImageCell,
        size: 'full',
    },
    {
        id: 'type',
        accessorFn: (o) => o.type.name,
        header: (props) => <HeaderCell tableProps={props}>Danh mục</HeaderCell>,
        size: 160,
        enableSorting: false,
        filterFn: 'arrIncludesSome',
    },
    {
        accessorKey: 'quantity',
        header: (props) => (
            <HeaderCell align="right" tableProps={props}>
                Kho
            </HeaderCell>
        ),
        cell: ({ getValue }) => <p className="text-right">{getValue()}</p>,
        size: 100,
    },
    {
        accessorKey: 'saledQuantity',
        header: (props) => (
            <HeaderCell align="right" tableProps={props}>
                Đã bán
            </HeaderCell>
        ),
        cell: ({ getValue }) => <p className="text-right">{getValue()}</p>,
        size: 120,
    },
    {
        accessorKey: 'price',
        header: (props) => (
            <HeaderCell align="right" tableProps={props}>
                Giá
            </HeaderCell>
        ),
        cell: ({ getValue }) => <p className="text-right">{getValue()}</p>,
        size: 120,
        filterFn: (row, columnId, filterValue) => {
            if (filterValue.max && filterValue.max < row.getValue(columnId)) return false;
            return true;
        },
    },

    {
        accessorKey: 'status',
        header: (props) => (
            <HeaderCell align="center" tableProps={props}>
                Trạng thái
            </HeaderCell>
        ),
        cell: StatusCell,
        size: 120,
        enableSorting: false,
    },
    {
        id: 'action',
        header: '',
        cell: ActionCell,
        size: 140,
    },
    {
        id: 'images',
        accessorKey: 'images',
    },
];

function ProductList() {
    // const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    // const [deletingProductId, setDeletingProductId] = useState(null);
    // const [products, setProducts] = useState([]);
    // const [filters, setFilters] = useState({});
    const navigate = useNavigate();
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

    const [products, setProducts] = useState([]);

    const [columnFilters, setColumnFilters] = useState([
        // {
        //     id: 'type',
        //     value: ['Giay thoi trang'],
        // },
        // {
        //     id: 'price',
        //     value: {
        //         max: 120000,
        //     },
        // },
    ]);

    useEffect(() => {
        getProducts();
    }, []);

    const [openDeleteDialog, closeDeleteDialog] = useModal({
        modal: DeleteDialog,
        meta: {
            onDelete: deleteProduct,
        },
    });

    const table = useReactTable({
        data: products,
        columns,
        state: {
            columnFilters,
            columnVisibility: { images: false },
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        meta: {
            onRowClick: (row) => {
                navigate('/product/detail/' + row.getValue('id'));
            },
            onEditButtonClick: (row) => {
                navigate('/product/update/' + row.getValue('id'));
            },
            onDeleteButtonClick: (row) => {
                openDeleteDialog({ deleteId: row.getValue('id') });
            },
        },
    });

    function getProducts() {
        fetch('http://localhost:5000/api/product')
            .then((res) => res.json())
            .then((resJson) => {
                if (resJson.success) {
                    let _product = resJson.products.sort((p1, p2) => p2.id - p1.id);
                    setProducts(_product);
                } else {
                    setProducts([]);
                }
            });
    }

    function deleteProduct(id) {
        fetch('http://localhost:5000/api/product/' + id, {
            method: 'DELETE',
        })
            .then((res) => res.json())
            .then((resJson) => {
                if (resJson.success) {
                    toast.success('Xoá sản phẩm thành công');
                    getProducts();
                } else {
                    toast.error('Có lỗi xảy ra!');
                }
            })
            .catch(() => {
                toast.error('Có lỗi xảy ra!');
            })
            .finally(() => {
                closeDeleteDialog();
            });
    }

    return (
        <div className="container">
            {/* LIST */}
            <div>
                <Table table={table} notFoundMessage="Không có sản phẩm" />
                <Pagination table={table} />
            </div>
        </div>
    );
}

export default ProductList;
