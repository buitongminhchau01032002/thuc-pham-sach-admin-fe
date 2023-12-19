import { useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProductTypeInput from '../../../components/ProductTypeInput';
import clsx from 'clsx';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import PriceInput from '../../../components/PriceInput';
import ImagesInput from '../../../components/ImagesInput';
import LoadingForm from '../../../components/LoadingForm';

const validationSchema = Yup.object({
    name: Yup.string().required('Trường này bắt buộc'),
    description: Yup.string().required('Trường này bắt buộc'),
    price: Yup.number().required('Trường này bắt buộc').min(1, 'Giá phải lớn hơn 0'),
    importPrice: Yup.number().required('Trường này bắt buộc').min(1, 'Giá phải lớn hơn 0'),
    type: Yup.string().required('Trường này bắt buộc'),
    sizes: Yup.array().min(1, 'Chọn ít nhất 1 size'),
});

function UpdateProduct() {
    const [loading, setLoading] = useState(false);
    const [validateOnChange, setValidateOnChange] = useState(false);
    const showSuccessNoti = () => toast.success('Chỉnh sửa phẩm thành công!');
    const showErorrNoti = () => toast.error('Có lỗi xảy ra!');
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        getProduct();
    }, []);

    const [product, setProduct] = useState({});
    function getProduct() {
        fetch('http://localhost:5000/api/product' + '/' + id)
            .then((res) => res.json())
            .then((resJson) => {
                if (resJson.success) {
                    const _product = resJson.product;
                    _product.images = _product.images.map((image) => ({
                        type: 'live',
                        url: image,
                    }));
                    setProduct(_product);
                } else {
                    setProduct({});
                }
            });
    }

    const form = useFormik({
        initialValues: {
            name: product.name || '',
            type: product.type?._id || '',
            description: product.description || '',
            price: product.price || 0,
            importPrice: product.importPrice || 0,
            status: product.status || 'active',
            images: product?.images || [],
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: handleFormsubmit,
        validateOnBlur: false,
        validateOnChange: validateOnChange,
    });

    function handleFormsubmit(values) {
        console.log(values);
        setValidateOnChange(true);
        setLoading(true);

        updateProduct(values)
            .then(() => {
                showSuccessNoti();
                setValidateOnChange(false);
            })
            .catch(() => {
                showErorrNoti();
            })
            .finally(() => {
                setLoading(false);
            });
    }

    async function updateProduct(values) {
        let imageUrls = [];
        if (values.images.length > 0) {
            const uploadPromise = values.images.map(async (image) => {
                if (image.type === 'live') {
                    return image.url;
                }

                let formdata = new FormData();
                formdata.append('image', image.file);
                const res = await fetch('http://localhost:5000/api/upload', {
                    method: 'POST',
                    body: formdata,
                });

                const data = await res.json();
                return data.image.url;
            });
            imageUrls = await Promise.all(uploadPromise);
        }
        const res = await fetch('http://localhost:5000/api/product' + '/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...values,
                images: imageUrls,
            }),
        });

        const resJson = await res.json();
        if (!resJson.success) {
            throw new Error(resJson);
        }

        return resJson;
    }

    return (
        <div className="container">
            <div className="mb-6 mt-2 flex items-center justify-center space-x-3 rounded bg-blue-50 py-4">
                <span className="text-lg font-medium text-gray-700">Mã sản phẩm:</span>
                <span className="text-lg font-bold text-blue-600">{product.id}</span>
            </div>
            <form
                onSubmit={(e) => {
                    setValidateOnChange(true);
                    form.handleSubmit(e);
                }}
            >
                <div className="relative grid grid-cols-2 gap-x-8 gap-y-1">
                    {/* NAME AND TYPE */}
                    <div className="space-y-1">
                        {/* NAME */}
                        <div>
                            <label className="label" htmlFor="name">
                                Tên sản phẩm *
                            </label>
                            <input
                                type="text"
                                id="name"
                                className={clsx('text-input', {
                                    invalid: form.errors.name,
                                })}
                                onChange={form.handleChange}
                                value={form.values.name}
                                name="name"
                            />
                            <span
                                className={clsx('text-sm text-red-500 opacity-0', {
                                    'opacity-100': form.errors.name,
                                })}
                            >
                                {form.errors.name || 'No message'}
                            </span>
                        </div>

                        {/* TYPE */}
                        <div>
                            <label className="label" htmlFor="type">
                                Loại sản phẩm *
                            </label>
                            <ProductTypeInput
                                id="type"
                                className={clsx('text-input cursor-pointer', {
                                    invalid: form.errors.type,
                                })}
                                onChange={form.handleChange}
                                value={form.values.type}
                                name="type"
                            />

                            <span
                                className={clsx('text-sm text-red-500 opacity-0', {
                                    'opacity-100': form.errors.type,
                                })}
                            >
                                {form.errors.type || 'No message'}
                            </span>
                        </div>
                    </div>

                    {/* IMAGE */}
                    <div className="mb-2">
                        <label className="label">Chọn ảnh</label>
                        <ImagesInput
                            images={form.values.images}
                            onChange={(images) => form.setFieldValue('images', images)}
                        />
                    </div>

                    {/* DESCRIPTION */}

                    <div>
                        <label className="label" htmlFor="description">
                            Mô tả sản phẩm *
                        </label>
                        <textarea
                            type="text"
                            id="description"
                            className={clsx('text-input !h-auto py-2', {
                                invalid: form.errors.description,
                            })}
                            onChange={form.handleChange}
                            value={form.values.description}
                            name="description"
                            rows={4}
                        ></textarea>
                        <span
                            className={clsx('text-sm text-red-500 opacity-0', {
                                'opacity-100': form.errors.description,
                            })}
                        >
                            {form.errors.description || 'No message'}
                        </span>
                    </div>

                    {/* IMPORT PRICE, PRICE AND STATUS */}
                    <div>
                        <div className="mb-1 flex space-x-8">
                            {/* IMPORT PRICE */}
                            <div className="flex-1">
                                <label className="label" htmlFor="importPrice">
                                    Giá nhập *
                                </label>
                                <PriceInput
                                    id="importPrice"
                                    onChange={form.handleChange}
                                    value={form.values.importPrice}
                                    error={form.errors.importPrice}
                                    name="importPrice"
                                    placeholder="Giá nhập"
                                />
                                <span
                                    className={clsx('text-sm text-red-500 opacity-0', {
                                        'opacity-100': form.errors.importPrice,
                                    })}
                                >
                                    {form.errors.importPrice || 'No message'}
                                </span>
                            </div>
                            {/* PRICE */}
                            <div className="flex-1">
                                <label className="label" htmlFor="price">
                                    Giá bán *
                                </label>
                                <PriceInput
                                    id="price"
                                    onChange={form.handleChange}
                                    value={form.values.price}
                                    error={form.errors.price}
                                    name="price"
                                    placeholder="Giá bán"
                                />
                                <span
                                    className={clsx('text-sm text-red-500 opacity-0', {
                                        'opacity-100': form.errors.price,
                                    })}
                                >
                                    {form.errors.price || 'No message'}
                                </span>
                            </div>
                        </div>
                        {/* STATUS */}
                        <div>
                            <label className="label !cursor-default">Trạng thái</label>
                            <div className="flex items-center space-x-5">
                                <div className="flex items-center">
                                    <input
                                        className="h-5 w-5 accent-blue-600"
                                        type="radio"
                                        id="status-active"
                                        name="status"
                                        value="active"
                                        onChange={form.handleChange}
                                        checked={form.values.status === 'active'}
                                    />
                                    <label htmlFor="status-active" className="cursor-pointer pl-2">
                                        Đang bán
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        className="h-5 w-5 accent-blue-600"
                                        type="radio"
                                        id="status-inactive"
                                        name="status"
                                        value="inactive"
                                        onChange={form.handleChange}
                                        checked={form.values.status === 'inactive'}
                                    />
                                    <label
                                        htmlFor="status-inactive"
                                        className="cursor-pointer pl-2"
                                    >
                                        Không bán
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <LoadingForm loading={loading} />
                </div>

                <div className="mt-6 flex items-center justify-end border-t pt-6">
                    <div className="flex">
                        <Link to={'/product'} className="btn btn-red btn-md">
                            <span className="pr-2">
                                <i className="fa-solid fa-circle-xmark"></i>
                            </span>
                            <span>Hủy</span>
                        </Link>
                        <button type="submit" className="btn btn-blue btn-md" disabled={loading}>
                            <span className="pr-2">
                                <i className="fa-solid fa-circle-plus"></i>
                            </span>
                            <span>Cập nhật</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default UpdateProduct;
