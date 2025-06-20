/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/query', 'N/redirect', 'N/record', 'N/search'], function (serverWidget, query, redirect, record, search) {

    function addFields(form) {

        form.addField({
            id: 'custpage_sales_order_transaction',
            type: serverWidget.FieldType.SELECT,
            label: 'Sales Order',
            source: 'Transaction'
        }).isMandatory = true;
    }

    function createSummaryRecord(salesOrderId, invoiceId, paymentId, customer) {

        var summaryRecord = record.create({
            type: 'customrecord_bits_summery_sales_order',
            isDynamic: true
        })

        summaryRecord.setValue({
            fieldId: 'custrecord_bits_sales_order',
            value: salesOrderId
        })

        summaryRecord.setValue({
            fieldId: 'custrecord_bits_invoice',
            value: invoiceId
        })

        summaryRecord.setValue({
            fieldId: 'custrecord_bits_summary_payment',
            value: paymentId
        })

        summaryRecord.setValue({
            fieldId: 'custrecord_bits_summary_customer_name',
            value: customer
        })

        summaryRecord.setValue({
            fieldId: 'name',
            value: 'SO Summary Record'
        })

        const summaryRecordId = summaryRecord.save();
        log.debug("Summary Record Id:", summaryRecordId);


        redirect.toRecord({
            type: 'customrecord_bits_summery_sales_order',
            id: summaryRecordId
        });
    }

    function createSummaryRecordData(request) {
        const salesOrderId = request.parameters.custpage_sales_order_transaction;
        log.debug("Sales Order Id", salesOrderId);

        const salesOrderData = search.lookupFields({
            type: search.Type.SALES_ORDER,
            id: salesOrderId,
            columns: ['tranid']
        });

        const salesOrderTranId = salesOrderData.tranid;

        log.debug("Sales Order Tran Id", salesOrderTranId);

        const sqlQuery =
            `SELECT
        t.id AS invoice_id,
        t.tranid,
        t.trandate AS invoice_date,
        t.entity AS customer,
        tl.createdfrom AS sales_order_id
        FROM
        transaction t
        JOIN
        transactionline tl ON tl.transaction = t.id
        WHERE
        t.type = 'CustInvc'
        AND tl.createdfrom = '${salesOrderId}'
        AND tl.mainline = 'T'
      `
        const runQuery = query.runSuiteQL({
            query: sqlQuery
        });

        const queryResult = runQuery.asMappedResults();

        log.debug("Query Result:", queryResult);

        var invoiceTranId = '';
        var paymentTranId = '';
        var customer = '';

        for (let i = 0; i < queryResult.length; i++) {
            var invoiceId = queryResult[i].invoice_id;
            log.debug("Invoice Id:", invoiceId);

            if (invoiceTranId || invoiceTranId != '') {
                invoiceTranId += ', ';
            }
            invoiceTranId += queryResult[i].tranid;

            const customerData = search.lookupFields({
                type: search.Type.CUSTOMER,
                id: queryResult[i].customer,
                columns: ['entityid']
            });

            customer = customerData.entityid;
            log.debug("Customer", customer);

            const paymentSearch = search.create({
                type: 'customerpayment',
                filters: [
                    ['appliedtoTransaction.internalid', 'anyof', invoiceId]
                ],
                columns: ['internalid', 'tranid']
            })

            paymentSearch.run().each((pay) => {
                const paymentId = pay.getValue('internalid');
                log.debug("Payment Id:", paymentId);

                var tranId = pay.getValue('tranid');
                if (paymentTranId) {
                    paymentTranId += ', ';
                }
                paymentTranId += tranId;

                log.debug("Payment TranId", paymentTranId);

                return true;
            })

        }

        createSummaryRecord(salesOrderTranId, invoiceTranId, paymentTranId, customer);
    }
    function onRequest(scriptContext) {

        var request = scriptContext.request;
        if (request.method === 'GET') {

            var form = serverWidget.createForm({
                title: 'Create Summary Record'
            });

            addFields(form);

            form.addSubmitButton({
                label: 'Submit'
            });
            scriptContext.response.writePage(form);
        } else {
            createSummaryRecordData(request);
        }

    }

    return {
        onRequest: onRequest
    };
});
