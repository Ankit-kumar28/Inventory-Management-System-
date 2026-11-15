export function StockBadge({ quantity, minimumStockLevel }) {
  if (quantity === 0) {
    return <span className="badge-danger">Out of Stock</span>;
  }
  if (minimumStockLevel > 0 && quantity <= minimumStockLevel) {
    return <span className="badge-warning">Low Stock ({quantity})</span>;
  }
  return <span className="badge-success">In Stock ({quantity})</span>;
}
