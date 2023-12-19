import PriceFormat from '../PriceFormat';

export default function ProductCard({ product, onProductClick, isImport = false }) {
    return (
        <div
            key={product.id}
            className="cursor-pointer overflow-hidden rounded-md border border-gray-200 hover:border-blue-600"
            onClick={onProductClick}
        >
            <img
                className="aspect-[5/3] w-full object-cover"
                src={product.images?.[0] || '/placeholder.png'}
            />
            <div className="space-y-1 p-2">
                <p className="font-semibold text-blue-600">{product.name}</p>
                <p className="text-sm font-semibold">{'Mã: ' + product.id}</p>
                <p className="text-sm font-semibold">{'Loại: ' + product.type?.name || '-'}</p>
                <p className="">
                    <PriceFormat>{!isImport ? product.price : product.importPrice}</PriceFormat>
                    <span className="ml-1">VNĐ</span>
                </p>
            </div>
        </div>
    );
}
