/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/search', 'N/record', 'N/format', 'N/redirect'], (serverWidget, search, record, format, redirect) => {
    const onRequest = (scriptContext) => {

        const poId = scriptContext.request.parameters.poId;
        log.debug("Purchase Order Id:", poId);

        if (!poId) {
            log.debug("Purchase order Id Not Available");
            return;
        }

        const form = serverWidget.createForm({
            title: 'Purchase Order Details'
        })

        const poRecord = record.load({
            type: record.Type.PURCHASE_ORDER,
            id: poId
        })

        log.debug("Purchase Order Record", poRecord);

        const vendor = poRecord.getText({
            fieldId: 'entity'
        })

        const trandate = poRecord.getValue({
            fieldId: 'trandate'
        })

        const memo = poRecord.getValue({
            fieldId: 'memo'
        })

        const approvalStatus = poRecord.getValue({
            fieldId: 'approvalstatus'
        })

        log.debug("approvalStatus", approvalStatus);

        form.addFieldGroup({
            id: 'bits_primary_information',
            label: 'Primary Information'
        });

        form.addField({
            id: 'custpage_vendor',
            type: serverWidget.FieldType.TEXT,
            label: 'Vendor',
            container: 'bits_primary_information'
        }).defaultValue = vendor;

        form.addField({
            id: 'custpage_trandate',
            type: serverWidget.FieldType.TEXT,
            label: 'Transaction Date',
            container: 'bits_primary_information'
        }).defaultValue = trandate;

        form.addField({
            id: 'custpage_memo',
            type: serverWidget.FieldType.TEXT,
            label: 'memo',
            container: 'bits_primary_information'
        }).defaultValue = memo;


        const approvalStatusField = form.addField({
            id: 'custpage_approval_status',
            type: serverWidget.FieldType.SELECT,
            label: 'Approval Status',
            container: 'bits_primary_information'

        });

        approvalStatusField.addSelectOption({
            value: '',
            text: '--Select--'
        });
        approvalStatusField.addSelectOption({
            value: '1',
            text: 'Pending Approval'
        });
        approvalStatusField.addSelectOption({
            value: '2',
            text: 'Approved'
        });
        approvalStatusField.addSelectOption({
            value: '3',
            text: 'Rejected'
        });

        approvalStatusField.defaultValue = approvalStatus ? approvalStatus.toString() : '';

        const sublist = form.addSublist({
            id: 'custpage_item_sublist',
            type: serverWidget.SublistType.LIST,
            label: 'Item Details'
        });

        sublist.addField({
            id: 'item_name',
            type: serverWidget.FieldType.TEXT,
            label: 'Item'
        });
        sublist.addField({
            id: 'quantity',
            type: serverWidget.FieldType.TEXT,
            label: 'Quantity'
        });

        sublist.addField({
            id: 'rate',
            type: serverWidget.FieldType.TEXT,
            label: 'Rate'
        });

        sublist.addField({
            id: 'amount',
            type: serverWidget.FieldType.TEXT,
            label: 'Amount'
        });

        const lineCount = poRecord.getLineCount({
            sublistId: 'item'
        })

        log.debug("Line Count", lineCount);
        try {
            for (let i = 0; i < lineCount; i++) {

                const itemName = poRecord.getSublistText({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i
                })

                const quantity = poRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: i
                })

                const rate = poRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'rate',
                    line: i
                })


                const amount = poRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'amount',
                    line: i
                })

                sublist.setSublistValue({
                    id: 'item_name',
                    line: i,
                    value: itemName
                }) || '';

                sublist.setSublistValue({
                    id: 'quantity',
                    line: i,
                    value: quantity.toString()
                })|| 0;

                sublist.setSublistValue({
                    id: 'rate',
                    line: i,
                    value: rate.toString()
                }) || 0;

                sublist.setSublistValue({
                    id: 'amount',
                    line: i,
                    value: amount.toString()
                }) || 0;

            }
        } catch (e) {
            log.error("Error", e);
        }
        scriptContext.response.writePage(form);
    }

    return { onRequest }
});