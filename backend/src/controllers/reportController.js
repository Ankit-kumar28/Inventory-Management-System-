import * as reportService from '../services/reportService.js';
import { arrayToCsv, sendCsvResponse } from '../utils/csvExport.js';
import { ApiResponse } from '../utils/apiResponse.js';

export async function getInventoryReport(req, res, next) {
  try {
    const { page = 1, limit = 20, search, category, supplier, export: exportCsv } = req.query;
    const isExport = exportCsv === 'csv';
    const result = await reportService.getInventoryReport({
      page: parseInt(page),
      limit: isExport ? 10000 : parseInt(limit),
      search,
      category,
      supplier,
    });

    if (isExport) {
      const headers = [
        { label: 'Product Name', accessor: (r) => r.productName },
        { label: 'SKU', accessor: (r) => r.sku },
        { label: 'Category', accessor: (r) => r.category?.categoryName || '' },
        { label: 'Supplier', accessor: (r) => r.supplier?.supplierName || '' },
        { label: 'Quantity', accessor: (r) => r.quantity },
        { label: 'Unit', accessor: (r) => r.unit },
        { label: 'Purchase Price', accessor: (r) => r.purchasePrice },
        { label: 'Selling Price', accessor: (r) => r.sellingPrice },
        { label: 'Min Stock Level', accessor: (r) => r.minimumStockLevel },
      ];
      return sendCsvResponse(res, arrayToCsv(result.products, headers), 'inventory-report.csv');
    }

    return ApiResponse.paginated(res, result.products, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (err) {
    next(err);
  }
}

export async function getTransactionReport(req, res, next) {
  try {
    const { page = 1, limit = 20, type, startDate, endDate, product, category, export: exportCsv } = req.query;
    const isExport = exportCsv === 'csv';
    const result = await reportService.getTransactionReport({
      type,
      page: parseInt(page),
      limit: isExport ? 10000 : parseInt(limit),
      startDate,
      endDate,
      product,
      category,
    });

    if (isExport) {
      const headers = [
        { label: 'Date', accessor: (r) => new Date(r.createdAt).toLocaleDateString() },
        { label: 'Type', accessor: (r) => r.transactionType },
        { label: 'Product', accessor: (r) => r.product?.productName || '' },
        { label: 'SKU', accessor: (r) => r.product?.sku || '' },
        { label: 'Quantity', accessor: (r) => r.quantity },
        { label: 'Unit Price', accessor: (r) => r.unitPrice },
        { label: 'Reference', accessor: (r) => r.referenceNumber },
        { label: 'Reason', accessor: (r) => r.reason },
        { label: 'Created By', accessor: (r) => r.createdBy?.fullName || '' },
      ];
      const filename =
        type === 'stock-in' ? 'stock-in-report.csv' : type === 'stock-out' ? 'stock-out-report.csv' : 'transactions-report.csv';
      return sendCsvResponse(res, arrayToCsv(result.transactions, headers), filename);
    }

    return ApiResponse.paginated(res, result.transactions, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (err) {
    next(err);
  }
}

export async function getLowStockReport(req, res, next) {
  try {
    const { export: exportCsv } = req.query;
    const products = await reportService.getLowStockReport();

    if (exportCsv === 'csv') {
      const headers = [
        { label: 'Product Name', accessor: (r) => r.productName },
        { label: 'SKU', accessor: (r) => r.sku },
        { label: 'Category', accessor: (r) => r.category?.categoryName || '' },
        { label: 'Supplier', accessor: (r) => r.supplier?.supplierName || '' },
        { label: 'Current Stock', accessor: (r) => r.quantity },
        { label: 'Minimum Stock Level', accessor: (r) => r.minimumStockLevel },
        { label: 'Unit', accessor: (r) => r.unit },
      ];
      return sendCsvResponse(res, arrayToCsv(products, headers), 'low-stock-report.csv');
    }

    return ApiResponse.success(res, { products, count: products.length });
  } catch (err) {
    next(err);
  }
}

export async function getValuationReport(req, res, next) {
  try {
    const { page = 1, limit = 20, category, supplier, export: exportCsv } = req.query;
    const isExport = exportCsv === 'csv';
    const result = await reportService.getValuationReport({
      page: parseInt(page),
      limit: isExport ? 10000 : parseInt(limit),
      category,
      supplier,
    });

    if (isExport) {
      const headers = [
        { label: 'Product Name', accessor: (r) => r.productName },
        { label: 'SKU', accessor: (r) => r.sku },
        { label: 'Category', accessor: (r) => r.category?.categoryName || '' },
        { label: 'Quantity', accessor: (r) => r.quantity },
        { label: 'Purchase Price', accessor: (r) => r.purchasePrice },
        { label: 'Total Value', accessor: (r) => r.totalValue },
      ];
      return sendCsvResponse(res, arrayToCsv(result.products, headers), 'valuation-report.csv');
    }

    return ApiResponse.paginated(
      res,
      result.products,
      {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        grandTotalValue: result.grandTotalValue,
      }
    );
  } catch (err) {
    next(err);
  }
}
