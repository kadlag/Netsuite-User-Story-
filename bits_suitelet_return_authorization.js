/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/record', 'N/search', 'N/redirect'], (serverWidget, record, search, redirect) => {

    // GET Handler
    function handleGetRequest(request, response) {
        const invoiceId = request.parameters.recId;
        if (!invoiceId) return;

        const invoiceRecord = record.load({
            type: record.Type.INVOICE,
            id: invoiceId
        });

        const selectedFilter = request.parameters.custpage_filter || 'to_return';

        const form = createForm(invoiceRecord, invoiceId, selectedFilter);
        populateSublist(form, invoiceRecord, selectedFilter);

        response.writePage(form);
    }

    // POST Handler
    function handlePostRequest(request, response) {
        const invoiceId = request.parameters.custpage_invoice_id;

        try {
            const returnAuthRecordId = transformToReturnAuth(request, invoiceId);
            updateInvoiceReturnQuantities(request, invoiceId);

            redirect.toRecord({
                type: record.Type.RETURN_AUTHORIZATION,
                id: returnAuthRecordId,
                isEditMode: false
            });
        } catch (e) {
            log.error('Error in POST', e);
        }
    }

    // Create Form
    function createForm(invoiceRecord, invoiceId, selectedFilter) {

        const form = serverWidget.createForm({
            title: 'Create Return Authorization'
        });
        form.clientScriptModulePath = './bits_cs_return_authorization.js';

        form.addField({
            id: 'custpage_invoice_id',
            label: 'Invoice ID',
            type: serverWidget.FieldType.TEXT
        }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN })
            .defaultValue = invoiceId;

        form.addField({
            id: 'custpage_tranid',
            label: 'Vehicle Invoice Number',
            type: serverWidget.FieldType.TEXT
        }).defaultValue = invoiceRecord.getValue('tranid');

        form.addField({
            id: 'custpage_date',
            label: 'Vehicle Invoice Date',
            type: serverWidget.FieldType.DATE
        }).defaultValue = invoiceRecord.getValue('trandate');

        const filter = form.addField({
            id: 'custpage_filter',
            label: 'Ready to Return',
            type: serverWidget.FieldType.SELECT
        });

        const optionTexts = {
            all: 'All',
            to_return: 'To Return',
            fully_return: 'Fully Returned'
        };

        ['all', 'to_return', 'fully_return'].forEach(opt => {
            filter.addSelectOption({
                value: opt,
                text: optionTexts[opt],
                isSelected: selectedFilter === opt
            });
        });


        form.addSubmitButton({ label: 'Save' });
        return form;
    }

    // Check Value
    function safeValue(value, fieldType) {
        if (value === null || value === undefined || value === '') {
            if (fieldType === serverWidget.FieldType.FLOAT || fieldType === serverWidget.FieldType.INTEGER) {
                return 0;
            }
            return ' ';
        }
        return value.toString();
    }


    // Populate Sublist
    function populateSublist(form, invoiceRecord, selectedFilter) {
        const sublist = form.addSublist({
            id: 'custpage_vehicle_sublist',
            type: serverWidget.SublistType.LIST,
            label: 'Item Details'
        });

        sublist.addMarkAllButtons();

        const fields = [
            { id: 'custpage_return', label: 'To Return', type: serverWidget.FieldType.CHECKBOX },
            { id: 'custpage_item_id', label: 'Item ID', type: serverWidget.FieldType.TEXT, hidden: true },
            { id: 'custpage_item', label: 'Item', type: serverWidget.FieldType.TEXT },
            { id: 'custpage_description', label: 'Description', type: serverWidget.FieldType.TEXT },
            { id: 'custpage_quantity', label: 'Quantity', type: serverWidget.FieldType.INTEGER },
            { id: 'custpage_amount', label: 'Amount', type: serverWidget.FieldType.TEXT },
            { id: 'custpage_tax_rate', label: 'Tax Rate', type: serverWidget.FieldType.TEXT },
            { id: 'custpage_tax_code', label: 'Tax Code', type: serverWidget.FieldType.TEXT },
            { id: 'custpage_tax_amt', label: 'Tax Amt', type: serverWidget.FieldType.TEXT },
            { id: 'custpage_gross_amt', label: 'Gross Amt', type: serverWidget.FieldType.TEXT },
            { id: 'custpage_discount_percent', label: 'Discount %', type: serverWidget.FieldType.TEXT },
            { id: 'custpage_discount', label: 'Discount Amount', type: serverWidget.FieldType.TEXT },
            { id: 'custpage_return_authorize_quantity', label: 'Return Authorization Quantity', type: serverWidget.FieldType.FLOAT },
            { id: 'custpage_return_quantity', label: 'Return Quantity', type: serverWidget.FieldType.FLOAT },
            { id: 'custpage_item_related_id', label: 'Item Related Id', type: serverWidget.FieldType.TEXT }
        ];

        fields.forEach(f => {
            const field = sublist.addField({
                id: f.id,
                label: f.label,
                type: f.type
            });

            if (f.hidden) {
                field.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });
            }
        });

        const lineCount = invoiceRecord.getLineCount({
            sublistId: 'item'
        });

        let displayIndex = 0;

        for (let i = 0; i < lineCount; i++) {

            const quantity = invoiceRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                line: i
            });

            const returned = invoiceRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_adme_returned_quantity',
                line: i
            });

            if (!shouldDisplayLine(selectedFilter, quantity, returned)) continue;

            const fieldData = {
                custpage_item_id: invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i }),
                custpage_item: invoiceRecord.getSublistText({ sublistId: 'item', fieldId: 'item', line: i }),
                custpage_description: invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'description', line: i }),
                custpage_quantity: quantity,
                custpage_amount: invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: i }),
                custpage_tax_rate: invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'taxrate1', line: i }),
                custpage_tax_code: invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'taxcode_display', line: i }),
                custpage_tax_amt: invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'tax1amt', line: i }),
                custpage_gross_amt: invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'grossamt', line: i }),
                custpage_discount_percent: invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_bits_so_discount', line: i }),
                custpage_discount: invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_bits_discount_amount', line: i }),
                custpage_return_authorize_quantity: invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_adme_return_authoriz_quantity', line: i }),
                custpage_return_quantity: returned,
                custpage_item_related_id: invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_bits_item_id', line: i }),
            };

            for (const [fieldId, val] of Object.entries(fieldData)) {
                const fieldDef = fields.find(f => f.id === fieldId);
                try {
                    sublist.setSublistValue({
                        id: fieldId,
                        line: displayIndex,
                        value: safeValue(val, fieldDef?.type)
                    });
                } catch (e) {
                    log.error('Missing value error', {
                        field: fieldId,
                        value: val,
                        error: e
                    });
                }
            }

            // Default the checkbox to 'F'
            sublist.setSublistValue({
                id: 'custpage_return',
                line: displayIndex,
                value: 'F'
            });

            displayIndex++;
        }
    }

    // Filter Logic
    function shouldDisplayLine(filterValue, quantity, returnedQty) {
        if (filterValue === 'all') return true;
        if (filterValue === 'to_return') return quantity > returnedQty;
        if (filterValue === 'fully_return') return quantity === returnedQty;
        return false;
    }

    // Transform to Return Authorization
    function transformToReturnAuth(request, invoiceId) {
        const returnAuth = record.transform({
            fromType: record.Type.INVOICE,
            fromId: invoiceId,
            toType: record.Type.RETURN_AUTHORIZATION,
            isDynamic: true
        });

        const originalLines = returnAuth.getLineCount({ sublistId: 'item' });
        for (let i = originalLines - 1; i >= 0; i--) {
            returnAuth.removeLine({
                sublistId: 'item',
                line: i
            });
        }

        const count = request.getLineCount({
            group: 'custpage_vehicle_sublist'
        });

        for (let i = 0; i < count; i++) {
            const checked = request.getSublistValue({
                group: 'custpage_vehicle_sublist',
                name: 'custpage_return',
                line: i
            });
            const itemId = request.getSublistValue({
                group: 'custpage_vehicle_sublist',
                name: 'custpage_item_id',
                line: i
            });

            const returnQty = parseFloat(request.getSublistValue({
                group: 'custpage_vehicle_sublist',
                name: 'custpage_return_quantity',
                line: i
            }) || '0');

            if (checked === 'T' && returnQty > 0) {
                returnAuth.selectNewLine({
                    sublistId: 'item'
                });
                returnAuth.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: itemId
                });

                returnAuth.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    value: returnQty
                });
                returnAuth.commitLine({ sublistId: 'item' });
            }
        }

        return returnAuth.save();
    }

    // Update Invoice Return Quantities
    function updateInvoiceReturnQuantities(request, invoiceId) {
        const invoiceRecord = record.load({
            type: record.Type.INVOICE,
            id: invoiceId
        });

        const lineCount = invoiceRecord.getLineCount({
            sublistId: 'item'
        });
        const uiLineCount = request.getLineCount({
            group: 'custpage_vehicle_sublist'
        });

        for (let i = 0; i < uiLineCount; i++) {
            const checked = request.getSublistValue({
                group: 'custpage_vehicle_sublist',
                name: 'custpage_return',
                line: i
            });
            const itemId = request.getSublistValue({
                group: 'custpage_vehicle_sublist',
                name: 'custpage_item_id',
                line: i
            });
            const returnQty = parseFloat(request.getSublistValue({
                group: 'custpage_vehicle_sublist',
                name: 'custpage_return_quantity',
                line: i
            }) || '0');

            if (checked === 'T' && returnQty > 0) {
                for (let j = 0; j < lineCount; j++) {
                    const currentItemId = invoiceRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: j
                    });
                    if (parseInt(currentItemId) === parseInt(itemId)) {
                        invoiceRecord.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_adme_return_authoriz_quantity',
                            line: j,
                            value: returnQty
                        });
                        break;
                    }
                }
            }
        }

        invoiceRecord.save();
    }

    const onRequest = (context) => {
        const request = context.request;
        const response = context.response;

        if (request.method === 'GET') {
            handleGetRequest(request, response);
        } else {
            handlePostRequest(request, response);
        }
    };


    return { onRequest };
});
