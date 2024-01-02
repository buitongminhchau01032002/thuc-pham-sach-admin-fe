import { useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import 'react-toastify/dist/ReactToastify.css';
import LoadingForm from '../../../components/LoadingForm';

const validationSchema = Yup.object({
    name: Yup.string()
        .required('Trường này bắt buộc')
        .max(30, 'Tên loại sản phẩm dài tối đa 30 kí tự'),
});

function AddProductType() {
    const [loading, setLoading] = useState(false);
    const [validateOnChange, setValidateOnChange] = useState(false);
    const showSuccessNoti = () => toast.success('Thêm thông tin loại sản phẩm thành công!');
    const showErorrNoti = () => toast.error('Có lỗi xảy ra!');

    const form = useFormik({
        initialValues: {
            name: '',
        },
        validationSchema,
        onSubmit: handleFormsubmit,
        validateOnBlur: false,
        validateOnChange: validateOnChange,
    });

    function handleFormsubmit(values) {
        setLoading(true);
        fetch('http://localhost:5000/api/product-type', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        })
            .then((res) => res.json())
            .then((resJson) => {
                if (resJson.success) {
                    showSuccessNoti();
                    form.resetForm();
                    setValidateOnChange(false);
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
            <form
                onSubmit={(e) => {
                    setValidateOnChange(true);
                    form.handleSubmit(e);
                }}
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
                        <span>Thêm</span>
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddProductType;
