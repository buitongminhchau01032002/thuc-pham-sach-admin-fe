import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import Table from '../../../components/Table';
import Pagination from '../../../components/Table/Pagination';
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import PriceFormat from '../../../components/PriceFormat';
import ReactToPrint from 'react-to-print';
import HeaderCell from '../../../components/Table/HeaderCell';
import useIsHasPermission from '../../../hooks/useIsHasPermission';
import emailjs from '@emailjs/browser';
function NameAndImageCell({ row, getValue }) {
    const image = row.getValue('image');
    return (
        <div className='flex items-center space-x-2'>
            <img src={image || '/placeholder.png'} className='h-10 w-10 rounded-full border object-cover' />
            <p className='flex-1'>{getValue()}</p>
        </div>
    );
}

const columns = [
    {
        accessorKey: 'id',
        header: (props) => (
            <HeaderCell align='center' tableProps={props}>
                Mã
            </HeaderCell>
        ),
        cell: ({ getValue }) => <p className='text-center'>{getValue()}</p>,
        size: 80,
    },
    {
        id: 'product',
        accessorFn: (item) => item?.product?.name,
        header: (props) => <HeaderCell tableProps={props}>Sản phẩm</HeaderCell>,
        cell: NameAndImageCell,
        size: 'full',
    },
    {
        accessorKey: 'price',
        header: (props) => (
            <HeaderCell align='right' tableProps={props}>
                Giá
            </HeaderCell>
        ),
        cell: ({ getValue }) => (
            <p className='text-right'>
                <PriceFormat>{getValue()}</PriceFormat>
            </p>
        ),
        size: 100,
    },
    {
        accessorKey: 'quantity',
        header: (props) => (
            <HeaderCell align='right' tableProps={props}>
                SL
            </HeaderCell>
        ),
        cell: ({ getValue }) => <p className='text-right'>{getValue()}</p>,
        size: 80,
    },
    {
        id: 'image',
        accessorFn: (item) => item?.images?.[0],
    },
];

function OrderDetail() {
    const { id } = useParams();
    const [order, setOrder] = useState({});
    const [loadingDeliveryStatus, setLoadingDeliveryStatus] = useState(false);
    const [loadingPaymentStatus, setLoadingPaymentStatus] = useState(false);
    const componentRef = useRef();
    const isHasPermission = useIsHasPermission();
    useEffect(() => {
        getOrder();
    }, []);

    function getOrder() {
        fetch('http://localhost:5000/api/order/' + id)
            .then((res) => res.json())
            .then((resJson) => {
                if (resJson.success) {
                    setOrder(resJson.order);
                } else {
                    setOrder({});
                }
            })
            .catch((error) => {
                console.log(error);
                setOrder({});
            });
    }
    const table = useReactTable({
        data: order.details || [],
        columns,
        state: {
            columnVisibility: { image: false },
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        meta: {},
    });

    function handleUpdateStatus(type, status) {
        if (type === 'deliveryStatus') {
            setLoadingDeliveryStatus(true);
        } else {
            setLoadingPaymentStatus(true);
        }
        fetch('http://localhost:5000/api/order/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ [type]: status }),
        })
            .then((res) => res.json())
            .then((resJson) => {
                if (resJson.success) {
                    toast.success('Cập nhật trạng thái thành công');
                    getOrder();
                    const templateParams = {
                        Subject: 'Đơn hàng cập nhật trạng thái',
                        Title: 'Đã cập nhật trạng thái đơn hàng của bạn tại',
                        Status: status == 'delivered' ? 'Đã xác nhận đơn hàng' : status == 'pending' ? 'Đang chờ xử lý' : 'Đã hủy đơn hàng',
                        Name: order?.customer?.name,
                        Address: order?.address,
                        Phone: order?.phone,
                        TotalPrice: order.totalPrice || '0',
                        DiscountPercent: order?.totalPrice - order?.intoMoney || '0',
                        IntoMoney: order?.intoMoney || '0',
                        Link: 'http://localhost:5173/profile',
                        reply_to: '20521154@gm.uit.edu.vn',
                    };
                    emailjs.send('service_3dwhkaf', 'template_m7a86er', templateParams, 'JcAqZIglb_PsOO35p').then(
                        (response) => {
                            console.log('SUCCESS!', response.status, response.text);
                        },
                        (err) => {
                            console.log('FAILED...', err);
                        }
                    );
                } else {
                    toast.error('Có lỗi xảy ra');
                }
            })
            .catch(() => {
                toast.error('Có lỗi xảy ra');
            })
            .finally(() => {
                if (type === 'deliveryStatus') {
                    setLoadingDeliveryStatus(false);
                } else {
                    setLoadingPaymentStatus(false);
                }
            });
    }

    return (
        <div className='container'>
            <div className='mt-5 flex space-x-6' ref={componentRef}>
                {/* PRODUCT */}
                <div className='flex-1'>
                    <Table table={table} notFoundMessage='Không có sản phẩm' rowClickable={false} />
                    <Pagination table={table} />
                </div>

                {/* INFOR */}
                <div className='flex-1'>
                    <div className='space-y-2 border-b pb-2'>
                        <div>
                            <span className='text-gray-700'>Số điện thoại: </span>
                            <span className='text-lg font-semibold text-gray-900'>{order?.phone || ''}</span>
                        </div>
                        {order?.address && (
                            <div>
                                <span className='text-gray-700'>Địa chỉ: </span>
                                <span className='text-lg font-semibold text-gray-900'>{order?.address || ''}</span>
                            </div>
                        )}

                        <div>
                            <span className='text-gray-700'>Ngày lập: </span>
                            <span className='text-lg font-semibold text-gray-900'>
                                {moment(order.createdAt).format('HH:mm DD/MM/YYYY ')}
                            </span>
                        </div>

                        {order?.customer && (
                            <div>
                                <p className='text-gray-700'>Tài khoản: </p>
                                <div className='mt-2 flex items-center space-x-2'>
                                    <img
                                        src={order.customer?.avatar || '/placeholder.png'}
                                        className='h-10 w-10 rounded-full border object-cover'
                                    />
                                    <p className='flex-1 font-medium'>{order.customer?.name}</p>
                                </div>
                            </div>
                        )}
                        {order?.coupon && (
                            <div>
                                <p className='text-gray-700'>Mã giảm giá: </p>
                                <div className='rounded border border-green-600 px-4 py-2'>
                                    <p className='font-medium text-gray-700'>{order.coupon.description}</p>
                                    <div className='flex space-x-6'>
                                        <p className='text-gray-600'>{'Mã: ' + order.coupon.name}</p>
                                        <div className='space-x-1'>
                                            <span className='text-gray-600'>Giảm:</span>
                                            <span className='font-bold text-green-600'>{order.coupon.discountPercent + '%'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className='mt-3 flex space-x-6 border-b pb-3'>
                        <div className='space-y-3 '>
                            <div>
                                <span className='text-gray-700'>Tổng giá: </span>
                                <span className='text-xl font-semibold text-blue-600'>
                                    <span>
                                        <PriceFormat>{order?.totalPrice}</PriceFormat>
                                    </span>
                                    <span> VNĐ</span>
                                </span>
                            </div>
                            <div>
                                <span className='text-gray-700'>Giảm giá: </span>
                                <span className='text-xl font-bold text-green-600'>
                                    <span>
                                        <PriceFormat>{order?.totalPrice - order?.intoMoney}</PriceFormat>
                                    </span>
                                    <span> VNĐ</span>
                                </span>
                            </div>
                            <div>
                                <span className='text-gray-700'>Thành tiền: </span>
                                <span className='text-xl font-bold text-blue-600'>
                                    <span>
                                        <PriceFormat>{order?.intoMoney}</PriceFormat>
                                    </span>
                                    <span> VNĐ</span>
                                </span>
                            </div>
                        </div>
                        <div className='border-l'></div>
                        <div className='space-y-3'>
                            <div>
                                <span className='text-gray-700'>Tiền nhận: </span>
                                <span className='text-xl font-semibold text-orange-400'>
                                    <span>
                                        <PriceFormat>{order?.receivedMoney}</PriceFormat>
                                    </span>
                                    <span> VNĐ</span>
                                </span>
                            </div>
                            <div className=''>
                                <span className='text-gray-700'>Tiền thừa: </span>
                                <span className='text-xl font-semibold text-blue-500'>
                                    <span>
                                        <PriceFormat>{order?.exchangeMoney}</PriceFormat>
                                    </span>
                                    <span> VNĐ</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div
                        className={clsx('mt-2 mb-4 space-y-3', {
                            'pointer-events-none': !isHasPermission('order/update'),
                        })}
                    >
                        <div className='space-y-2'>
                            <p className='text-gray-700'>Trạng thái giao hàng: </p>
                            <div className='relative flex space-x-3'>
                                <div className='inline-flex items-center' onClick={() => handleUpdateStatus('deliveryStatus', 'delivered')}>
                                    <input
                                        className='h-5 w-5  accent-blue-600'
                                        type='radio'
                                        readOnly
                                        checked={order?.deliveryStatus === 'delivered'}
                                    />
                                    <label className='cursor-pointer pl-2 font-semibold text-green-700'>Đã nhận</label>
                                </div>
                                <div className='inline-flex items-center' onClick={() => handleUpdateStatus('deliveryStatus', 'pending')}>
                                    <input
                                        className='h-5 w-5  accent-blue-600'
                                        type='radio'
                                        readOnly
                                        checked={order?.deliveryStatus === 'pending'}
                                    />
                                    <label htmlFor='de-2' className='cursor-pointer pl-2 font-semibold text-orange-600'>
                                        Đang chờ
                                    </label>
                                </div>
                                <div className='inline-flex items-center' onClick={() => handleUpdateStatus('deliveryStatus', 'aborted')}>
                                    <input
                                        className='h-5 w-5 accent-blue-600'
                                        type='radio'
                                        readOnly
                                        checked={order?.deliveryStatus === 'aborted'}
                                    />
                                    <label className='cursor-pointer pl-2 font-semibold text-red-600'>Đã huỷ</label>
                                </div>
                                <div
                                    className={clsx('absolute inset-0 bg-white opacity-50', {
                                        hidden: !loadingDeliveryStatus,
                                    })}
                                ></div>
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <p className='text-gray-700'>Trạng thái thanh toán: </p>
                            <div className='relative flex space-x-3'>
                                <div className='inline-flex items-center' onClick={() => handleUpdateStatus('paymentStatus', 'paid')}>
                                    <input
                                        className='h-5 w-5  accent-blue-600'
                                        type='radio'
                                        readOnly
                                        checked={order?.paymentStatus === 'paid'}
                                    />
                                    <label className='cursor-pointer pl-2 font-semibold text-green-700'>Đã thanh toán</label>
                                </div>
                                <div className='inline-flex items-center' onClick={() => handleUpdateStatus('paymentStatus', 'unpaid')}>
                                    <input
                                        className='h-5 w-5  accent-blue-600'
                                        type='radio'
                                        readOnly
                                        checked={order?.paymentStatus === 'unpaid'}
                                    />
                                    <label htmlFor='de-2' className='cursor-pointer pl-2 font-semibold text-orange-600'>
                                        Chưa thanh toán
                                    </label>
                                </div>
                                <div
                                    className={clsx('absolute inset-0 bg-white opacity-50', {
                                        hidden: !loadingPaymentStatus,
                                    })}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className=' flex justify-end'>
                <Link to='/order' className='btn btn-blue btn-md'>
                    Quay lại
                </Link>
                <ReactToPrint
                    trigger={() => <button className='btn btn-green btn-md'>In hoá đơn</button>}
                    content={() => componentRef.current}
                />
            </div>
        </div>
    );
}
//
//
export default OrderDetail;
