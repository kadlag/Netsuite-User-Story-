/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NAmdConfig /SuiteScripts/sakshi/UserScenario/jsExcelConfig.json
 */
define(['N/ui/serverWidget', 'N/record', 'N/search', 'N/file', 'N/encode', 'N/redirect', 'xlsx'],
    (serverWidget, record, search, file, encode, redirect, XLSX) => {

        const onRequest = (context) => {
            const request = context.request;
            const response = context.response;

            // GET Request with action=export
            if (request.method === 'GET' && request.parameters.custpage_action_type === 'export') {

                log.debug("Export method");

                const params = request.parameters;
                const customerId = params.custpage_customer;
                const startDate = params.custpage_start_date;
                const endDate = params.custpage_end_date;

                log.debug("customerId", customerId);
                log.debug("startDate", startDate);
                log.debug("endDate", endDate);


                if (customerId && startDate && endDate) {
                    generateExcel(response, customerId, startDate, endDate);
                    return;
                }
            }

            // Handle form submission - POST
            if (request.method === 'POST') {
                const params = request.parameters;
                const customerId = params.custpage_customer;
                const startDate = params.custpage_start_date;
                const endDate = params.custpage_end_date;

                log.debug("customerId Post", customerId);
                log.debug("startDate post", startDate);
                log.debug("endDate post", endDate);

                const form = createForm();

                if (customerId && startDate && endDate) {
                    form.getField({
                        id: 'custpage_customer'
                    }).defaultValue = customerId;

                    form.getField({
                        id: 'custpage_start_date'
                    }).defaultValue = startDate;

                    form.getField({
                        id: 'custpage_end_date'
                    }).defaultValue = endDate;

                    const invoiceData = getInvoiceData(customerId, startDate, endDate);
                    const invoiceSublist = addInvoiceSublist(form);
                    populateSublist(invoiceSublist, invoiceData, 'invoice_tranid', 'invoice_date', 'invoice_amount');

                    const salesOrderData = getSalesOrderData(customerId, startDate, endDate);
                    const salesOrderSublist = addSalesOrderSublist(form);
                    populateSublist(salesOrderSublist, salesOrderData, 'sales_order_tranid', 'sales_order_date', 'so_order_amount');
                }

                response.writePage(form);
                return;
            }

            // Initial GET load Empty form
            const form = createForm();
            response.writePage(form);
        };

        function createForm() {
            const form = serverWidget.createForm({ title: 'Customer Invoices And Sales Orders Details' });

            form.clientScriptModulePath = './bits_cs_fetch_data_export_to_xlsx.js';

            form.addField({
                id: 'custpage_customer',
                label: 'Customer',
                type: serverWidget.FieldType.SELECT,
                source: 'customer'
            });

            form.addField({
                id: 'custpage_start_date',
                label: 'Start Date',
                type: serverWidget.FieldType.DATE
            });

            form.addField({
                id: 'custpage_end_date',
                label: 'End Date',
                type: serverWidget.FieldType.DATE
            });

            const actionField = form.addField({
                id: 'custpage_action_type',
                label: 'Action',
                type: serverWidget.FieldType.TEXT
            });
            actionField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });

            form.addSubmitButton({ label: 'Submit' });

            form.addButton({
                id: 'custpage_export_excel',
                label: 'Export to Excel',
                functionName: 'triggerExportToExcel'
            });

            return form;
        }

        function getInvoiceData(customerId, startDate, endDate) {
            const results = [];
            let total = 0;

            const searchResults = search.create({
                type: 'invoice',
                filters: [
                    ['entity', 'anyof', customerId],
                    'AND', ['status', 'anyof', 'CustInvc:A'], // Open invoices
                    'AND', ['trandate', 'onorafter', startDate],
                    'AND', ['trandate', 'onorbefore', endDate],
                    'AND', ['mainline', 'is', 'T']
                ],
                columns: ['tranid', 'trandate', 'amount']
            });

            searchResults.run().each(result => {
                const amount = parseFloat(result.getValue('amount')) || 0;
                total += amount;

                results.push({
                    tranid: result.getValue('tranid'),
                    trandate: result.getValue('trandate'),
                    amount: amount.toFixed(2)
                });
                return true;
            });

            if (results.length > 0) {
                results.push({ tranid: 'Total', trandate: '', amount: total.toFixed(2) });
            }

            return results;
        }

        function getSalesOrderData(customerId, startDate, endDate) {
            const results = [];
            let total = 0;

            const searchResults = search.create({
                type: 'salesorder',
                filters: [
                    ['entity', 'anyof', customerId],
                    'AND', ['mainline', 'is', 'T'],
                    'AND', ['status', 'anyof', 'SalesOrd:B'], // Approved sales orders
                    'AND', ['trandate', 'onorafter', startDate],
                    'AND', ['trandate', 'onorbefore', endDate]
                ],
                columns: ['tranid', 'trandate', 'amount']
            });

            searchResults.run().each(result => {
                const amount = parseFloat(result.getValue('amount')) || 0;
                total += amount;

                results.push({
                    tranid: result.getValue('tranid'),
                    trandate: result.getValue('trandate'),
                    amount: amount.toFixed(2)
                });
                return true;
            });

            if (results.length > 0) {
                results.push({ tranid: 'Total', trandate: '', amount: total.toFixed(2) });
            }

            return results;
        }

        function addInvoiceSublist(form) {
            form.addSubtab({ id: 'custpage_tab_invoice', label: 'Invoices' });

            const sublist = form.addSublist({
                id: 'custpage_invoice_list',
                label: 'Open Invoices',
                tab: 'custpage_tab_invoice',
                type: serverWidget.SublistType.LIST
            });

            sublist.addField({
                id: 'invoice_tranid',
                label: 'Invoice #',
                type: serverWidget.FieldType.TEXT
            });

            sublist.addField({
                id: 'invoice_date',
                label: 'Date',
                type: serverWidget.FieldType.DATE
            });

            sublist.addField({
                id: 'invoice_amount',
                label: 'Amount',
                type: serverWidget.FieldType.CURRENCY
            });

            return sublist;
        }

        function addSalesOrderSublist(form) {
            form.addSubtab({ 
                id: 'custpage_tab_salesorder', 
                label: 'Approved Sales Orders' 
            });

            const sublist = form.addSublist({
                id: 'custpage_sales_order_list',
                label: 'Approved Sales Orders',
                tab: 'custpage_tab_salesorder',
                type: serverWidget.SublistType.LIST
            });

            sublist.addField({ 
                id: 'sales_order_tranid', 
                label: 'Sales Order #', 
                type: serverWidget.FieldType.TEXT 
            });

            sublist.addField({ 
                id: 'sales_order_date', 
                label: 'Date', 
                type: serverWidget.FieldType.DATE 
            });

            sublist.addField({ 
                id: 'so_order_amount', 
                label: 'Amount', 
                type: serverWidget.FieldType.CURRENCY 
            });

            return sublist;
        }

        function populateSublist(sublist, data, tranIdField, dateField, amountField) {
            for (let i = 0; i < data.length; i++) {
                const row = data[i];

                sublist.setSublistValue({ 
                    id: tranIdField, 
                    line: i, 
                    value: row.tranid 
                });

                if (row.trandate) {
                    sublist.setSublistValue({ 
                        id: dateField, 
                        line: i, 
                        value: row.trandate 
                    });
                }
                sublist.setSublistValue({ 
                    id: amountField, 
                    line: i, 
                    value: row.amount 
                });
            }
        }

        function generateExcel(response, customerId, startDate, endDate) {
            const invoiceData = getInvoiceData(customerId, startDate, endDate);
            const soData = getSalesOrderData(customerId, startDate, endDate);

            const invoiceSheetData = [["Invoice #", "Date", "Amount"]];
            invoiceData.forEach(row => {
                invoiceSheetData.push([row.tranid, row.trandate, row.amount]);
            });

            const salesOrderSheetData = [["Sales Order #", "Date", "Amount"]];
            soData.forEach(row => {
                salesOrderSheetData.push([row.tranid, row.trandate, row.amount]);
            });

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(invoiceSheetData), "Invoices");
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(salesOrderSheetData), "Sales Orders");

            const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });

            const excelFile = file.create({
                name: 'Customer_Invoice_sales_Order_data.xlsx',
                fileType: file.Type.EXCEL,
                contents: wbout,
                encoding: file.Encoding.BASE_64,
                folder: 727
            });

            const fileId = excelFile.save();
            const fileObj = file.load({ id: fileId });

            redirect.redirect({ url: fileObj.url });
        }

        return { onRequest };
    });
