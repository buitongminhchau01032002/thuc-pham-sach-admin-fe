import { useEffect, useState } from 'react';

import Datepicker from 'react-tailwindcss-datepicker';

export default function StatisticProduct() {
    const [orderDetails, setOrderDetails] = useState([]);
    const [importDetails, setImportDetails] = useState([]);

    const [data, setData] = useState({});
    const [value, setValue] = useState({
        startDate: moment(new Date()).format('YYYY-MM-DD'),
        endDate: moment(new Date()).format('YYYY-MM-DD'),
    });

    useEffect(() => {
        fetch('http://localhost:5000/api/detail-order')
            .then((res) => res.json())
            .then((resJson) => {
                if (resJson.success) {
                    setOrderDetails(resJson.detailOrders);
                }
            });
        fetch('http://localhost:5000/api/detail-import')
            .then((res) => res.json())
            .then((resJson) => {
                if (resJson.success) {
                    setImportDetails(resJson.detailImports);
                }
            });
    }, []);

    return (
        <div className="container">
            <Datepicker
                value={value}
                i18n={'en'}
                configs={{
                    shortcuts: {
                        today: 'Hôm nay',
                        yesterday: 'Hôm qua',
                        past: (period) => `${period} ngày trước`,
                        currentMonth: 'Tháng này',
                        pastMonth: 'Tháng trước',
                    },
                }}
                inputClassName="border-2 border-gray-500 outline-none w-full text-base !py-1.5 hover:border-blue-500"
                displayFormat={'DD/MM/YYYY'}
                separator={'đến'}
                onChange={(newValue) => setValue(newValue)}
                showShortcuts={true}
            />
        </div>
    );
}
