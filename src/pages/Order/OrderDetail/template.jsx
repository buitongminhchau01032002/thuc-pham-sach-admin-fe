// EmailTemplate.jsx
import React from 'react';
import PriceFormat from '../../../components/PriceFormat';

const EmailTemplate = ({ order }) => {
    return (
        <html lang='en'>
            <head>
                <meta charSet='UTF-8' />
                <meta name='viewport' content='width=device-width, initial-scale=1.0' />
                <title>Order Confirmation</title>
                <style>
                    {`
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              background-color: #0073e6;
              color: #ffffff;
              padding: 20px;
              text-align: center;
            }
            .header img {
              max-width: 150px;
              margin-bottom: 10px;
            }
            .header h1 {
              margin: 0;
            }
            .content {
              padding: 20px;
            }
            .content h2 {
              color: #333333;
            }
            .content p {
              color: #555555;
            }
            .invoice-info {
              margin-top: 20px;
            }
            .invoice-info table {
              width: 100%;
              border-collapse: collapse;
            }
            .invoice-info th,
            .invoice-info td {
              padding: 10px;
              border: 1px solid #dddddd;
              text-align: left;
            }
            .invoice-info img {
              max-width: 50px;
              height: auto;
              display: block;
            }
            .footer {
              background-color: #f4f4f4;
              color: #555555;
              padding: 10px;
              text-align: center;
              font-size: 12px;
            }
            .footer a {
              color: #0073e6;
              text-decoration: none;
            }
          `}
                </style>
            </head>
            <body>
                <div className='container'>
                    <div className='header'>
                        <img src='/mainLogo.png' alt='Logo' />
                        <h1>Cảm ơn bạn đã mua hàng!</h1>
                    </div>
                    <div className='content'>
                        <h2>Thông tin khách hàng</h2>
                        <p>Tên khách hàng: {order?.name}</p>
                        <p>Số điện thoại: {order?.phone}</p>
                        <p>Địa chỉ giao hàng: {order?.address}</p>

                        <div className='invoice-info'>
                            <h2>Thông tin hóa đơn</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th>Hình ảnh</th>
                                        <th>Số lượng</th>
                                        <th>Giá</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.details.map((product, index) => (
                                        <tr key={index}>
                                            <td>{product?.product.name}</td>
                                            <td>
                                                <img src={product?.product.image} alt={product?.product.name} />
                                            </td>
                                            <td>{product?.product.quantity}</td>

                                            <td>
                                                <PriceFormat>{product?.product.price}</PriceFormat> VND
                                            </td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <th colSpan='3'>Tổng giá </th>
                                        <th>
                                            <PriceFormat>{order?.totalPrice}</PriceFormat>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th colSpan='3'>Giảm giá</th>
                                        <th>
                                            <PriceFormat>{order?.discountPercent} </PriceFormat> VND
                                        </th>
                                    </tr>

                                    <tr>
                                        <th colSpan='3'>Thành tiền2</th>
                                        <th>
                                            <PriceFormat>{order?.intoMoney} </PriceFormat> VND
                                        </th>
                                    </tr>
                                    <tr>
                                        <th colSpan='3'>Tiền nhận</th>
                                        <th>
                                            <PriceFormat>{order?.receivedMoney} </PriceFormat>VND
                                        </th>
                                    </tr>
                                    <tr>
                                        <th colSpan='3'>Tiền thừa</th>
                                        <th>
                                            <PriceFormat>{order?.totalPrice} </PriceFormat>VND
                                        </th>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className='footer'>
                        <p>
                            Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi tại
                            <a href='mailto:support@example.com'>support@example.com</a>.
                        </p>
                    </div>
                </div>
            </body>
        </html>
    );
};

export default EmailTemplate;
