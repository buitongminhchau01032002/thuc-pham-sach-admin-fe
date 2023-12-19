import { Fragment, useState } from 'react';
import * as Yup from 'yup';
import { Formik, useFormik } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import clsx from 'clsx';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import LoadingForm from '../../../components/LoadingForm';

const validationSchema = Yup.object({
    name: Yup.string()
        .required('Trường này bắt buộc')
        .max(30, 'Tên loại sản phẩm dài tối đa 30 kí tự'),
});

function UpdateProductType() {
    const [loading, setLoading] = useState(false);
    const [validateOnChange, setValidateOnChange] = useState(false);
    const showSuccessNoti = () => toast.success('Chỉnh sửa loại sản phẩm thành công!');
    const showErorrNoti = () => toast.error('Có lỗi xảy ra!');

    const { id } = useParams();
    const [productType, setProductType] = useState({});
    useEffect(() => {
        getProductType();
    }, []);

    function getProductType() {
        fetch('http://localhost:5000/api/product-type' + '/' + id)
            .then((res) => res.json())
            .then((resJson) => {
                if (resJson.success) {
                    setProductType(resJson.productType);
                } else {
                    setProductType({});
                }
            });
    }
    const form = useFormik({
        initialValues: {
            name: productType.name,
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: handleFormsubmit,
        validateOnBlur: false,
        validateOnChange: validateOnChange,
    });

    function handleFormsubmit(values) {
        setValidateOnChange(true);
        setLoading(true);
        fetch('http://localhost:5000/api/product-type/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        })
            .then((res) => res.json())
            .then((resJson) => {
                if (resJson.success) {
                    showSuccessNoti();
                } else {
                    showErorrNoti();
                }
            })
            .catch(() => {
                showErorrNoti();
            })
            .finally(() => {
                setLoading(false);
            });
    }

    return (
        <div className="container">
            <div className="mb-6 mt-2 flex items-center justify-center space-x-3 rounded bg-blue-50 py-4">
                <span className="text-lg font-medium text-gray-700">Mã loại sản phẩm:</span>
                <span className="text-lg font-bold text-blue-600">{productType.id}</span>
            </div>
            <form
                onSubmit={form.handleSubmit}
                className="mx-auto mt-5 max-w-[500px] rounded-xl border border-slate-300 p-5"
            >
                <div className="relative pt-10">
                    <div className="flex flex-col">
                        <label className="label" htmlFor="name">
                            Tên loại sản phẩm
                        </label>
                        <input
                            type="text"
                            id="name"
                            className={clsx('text-input w-full py-[5px]', {
                                invalid: form.errors.name,
                            })}
                            onChange={form.handleChange}
                            onBlur={form.handleBlur}
                            value={form.values.name}
                            name="name"
                            placeholder="Giày thể thao"
                        />
                        <span
                            className={clsx('text-sm text-red-500 opacity-0', {
                                'opacity-100': form.errors.name,
                            })}
                        >
                            {form.errors.name || 'No message'}
                        </span>
                    </div>
                    <LoadingForm loading={loading} />
                </div>

                <div className="mt-6 flex items-center justify-end border-t pt-6">
                    <Link to={'/product-type'} className="btn btn-red btn-md">
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
            </form>
        </div>
    );
}

export default UpdateProductType;
