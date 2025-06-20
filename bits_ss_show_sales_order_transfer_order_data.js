/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/query', 'N/url', 'N/runtime', 'N/record', 'N/search'], function (serverWidget, query, url, runtime, record, search) {

    function createForm() {
        return serverWidget.createForm({
            title: 'Bill Of Exit Update'
        });
    }

    function addFields(form, selectedDate, transactionType) {

        var dateField = form.addField({
            id: 'custpage_date',
            type: serverWidget.FieldType.DATE,
            label: 'Date',

        });

        log.debug("Date Field:", selectedDate);
        dateField.defaultValue = selectedDate || '';

        var transaction = form.addField({
            id: 'custpage_transaction_type',
            type: serverWidget.FieldType.SELECT,
            label: 'Transaction Type',
        });

        transaction.addSelectOption({
            value: '',
            text: '-- All --'
        });
        transaction.addSelectOption({
            value: 'SalesOrd',
            text: 'Sales Order'
        });
        transaction.addSelectOption({
            value: 'TrnfrOrd',
            text: 'Transfer Order'
        });

        transaction.defaultValue = transactionType;

        form.addField({
            id: 'custpage_bill_of_exit',
            type: serverWidget.FieldType.TEXT,
            label: 'Bill Of Exist',
        }).isMandatory = true;

        form.addField({
            id: 'custpage_boe_date',
            type: serverWidget.FieldType.DATE,
            label: 'BOE Date',

        }).isMandatory = true;
    }

    function addSublistFields(form, selectedDate, transactionType) {

        var sublist = form.addSublist({
            id: 'bits_sublist',
            type: serverWidget.SublistType.LIST,
            label: 'Item Fullfillment'
        });

        sublist.addField({
            id: 'custpage_select',
            type: serverWidget.FieldType.CHECKBOX,
            label: 'Select'
        });

        sublist.addField({
            id: 'custpage_item_fullfillment',
            type: serverWidget.FieldType.TEXT,
            label: 'Item Fullfillment'
        });

        sublist.addField({
            id: 'custpage_created_form',
            type: serverWidget.FieldType.TEXT,
            label: 'Created Form'
        });

        sublist.addField({
            id: 'custpage_sublist_date',
            type: serverWidget.FieldType.DATE,
            label: 'Date'
        });

        sublist.addField({
            id: 'custpage_bill_of_exit',
            type: serverWidget.FieldType.TEXT,
            label: 'Bill Of Exit'
        });
        sublist.addField({
            id: 'custpage_boe_date',
            type: serverWidget.FieldType.DATE,
            label: 'BOE Date'
        });

        if (selectedDate || transactionType) {
            log.debug("selectedDate", selectedDate);
            log.debug("Transaction type", transactionType);

            var results = getFilteredData(selectedDate, transactionType);
            populateSublist(sublist, results);
        }
    }

    function getFilteredData(date, type) {
        const filters = [
            ["type", "anyof", "ItemShip"],
            "AND",
            ["mainline", "is", "T"]
        ];

        if (date) {
            filters.push("AND");
            filters.push(["trandate", "onorafter", date]);
            filters.push("AND");
            filters.push(["trandate", "onorbefore", date]);
        }

        if (type) {
            const typeMap = {
                SalesOrd: 'SalesOrd',
                TrnfrOrd: 'TrnfrOrd'
            };
            filters.push("AND");
            filters.push(["createdfrom.type", "anyof", typeMap[type]]);
        }

        const itemFulfillmentSearch = search.create({
            type: 'itemfulfillment',
            filters: filters,
            columns: [
                search.createColumn({ name: 'tranid' }),
                search.createColumn({
                    name: 'trandate',
                    sort: search.Sort.DESC
                }),
                search.createColumn({ name: 'createdfrom' })
            ]
        });

        const results = [];
        itemFulfillmentSearch.run().each(function (result) {
            results.push({
                fulfillment: result.getValue({
                    name: 'tranid'
                }),
                date: result.getValue({
                    name: 'trandate'
                }),
                createdfrom: result.getText({
                    name: 'createdfrom'
                })
            });
            return true;
        });

        return results;
    }

    function populateSublist(sublist, results) {
        for (let i = 0; i < results.length; i++) {


            sublist.setSublistValue({
                id: 'custpage_item_fullfillment',
                line: i,
                value: results[i].fulfillment
            });

            sublist.setSublistValue({
                id: 'custpage_created_form',
                line: i,
                value: results[i].createdfrom
            });

            sublist.setSublistValue({
                id: 'custpage_sublist_date',
                line: i,
                value: results[i].date
            });
        }
    }

    function createBillOfExitUpdate(request) {

        const boe = request.parameters.custpage_bill_of_exit;
        const boeDate = request.parameters.custpage_boe_date;

        log.debug("Bill of Exit:", boe);
        log.debug("boe Date:", boeDate);

        const boeDateObj = parseDMYtoDate(boeDate);


        const lineCount = request.getLineCount({
            group: 'bits_sublist'
        });

        log.debug("Line Count:", lineCount);

        if (!boe || !boeDate) {
            return;
        }

        const parentRecBillOfExitHeader = record.create({
            type: 'customrecord_bits_bill_of_exits_header',
            isDynamic: true
        });

        parentRecBillOfExitHeader.setValue({
            fieldId: 'custrecord_bits_bill_of_exit',
            value: boe
        });

        parentRecBillOfExitHeader.setValue({
            fieldId: 'custrecord_bits_boe_date',
            value: boeDateObj
        });

        parentRecBillOfExitHeader.setValue({
            fieldId: 'name',
            value: 'Bill Exit'
        });

        const parentId = parentRecBillOfExitHeader.save();
        log.debug("Parent Record Id:", parentId);


        for (let i = 0; i < lineCount; i++) {
            const isSelected = request.getSublistValue({
                group: 'bits_sublist',
                name: 'custpage_select',
                line: i
            });

            if (isSelected === 'T') {
                const fulfillment = request.getSublistValue({
                    group: 'bits_sublist',
                    name: 'custpage_item_fullfillment',
                    line: i
                });
                const createdFrom = request.getSublistValue({
                    group: 'bits_sublist',
                    name: 'custpage_created_form',
                    line: i
                });

                const childRecBillOfExitDetails = record.create({
                    type: 'customrecord_bits_bil_of_exit_details',
                    isDynamic: true
                });

                childRecBillOfExitDetails.setValue({
                    fieldId: 'custrecord_bits_connection_field_boe',
                    value: parentId
                });
                childRecBillOfExitDetails.setValue({
                    fieldId: 'custrecord_bits_item_fulfillments',
                    value: fulfillment
                });
                childRecBillOfExitDetails.setValue({
                    fieldId: 'custrecord_bits_created_forms',
                    value: createdFrom
                });

                childRecBillOfExitDetails.setValue({
                    fieldId: 'name',
                    value: 'BOE Details'
                });

                const childId = childRecBillOfExitDetails.save();

                log.debug("Child Id", childId);
            }
        }
    }

    function parseDMYtoDate(dateStr) {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
    }

    function onRequest(scriptContext) {
        var request = scriptContext.request;
        var selectedDate = request.parameters.custpage_date || '';
        var selectedTransactionType = request.parameters.custpage_transaction_type || '';

        log.debug("Selected Date:", selectedDate);
        log.debug("selectedTransactionType:", selectedTransactionType);

        var form = createForm();

        form.clientScriptModulePath = './bits_cs_show_sales_order_tranfer_order_data.js';

        addFields(form, selectedDate, selectedTransactionType);
        addSublistFields(form, selectedDate, selectedTransactionType);

        form.addSubmitButton({
            label: 'Submit'
        });

        scriptContext.response.writePage(form);

        if (request.method === 'POST') {
            createBillOfExitUpdate(request);
        }
    }

    return {
        onRequest: onRequest
    };
});
