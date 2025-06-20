/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/search', 'N/record', 'N/format', 'N/redirect'], (serverWidget, search, record, format, redirect) => {
    const onRequest = (scriptContext) => {

        var form = serverWidget.createForm({
            title: 'View Purchase Order Items'
        })
        log.debug("This is suitelet Page");

        var poId = form.addField({
            id: 'custpage_poid',
            type: serverWidget.FieldType.INTEGER,
            label: 'Purchase Id',
        })

        form.addSubmitButton({
            label: 'Submit'
        });

        if (scriptContext.request.method === 'POST') {
            const poId = scriptContext.request.parameters.custpage_poid;
            log.debug("Purchase Order Id:", poId);

            try {

                const poRecord = record.load({
                    type: record.Type.PURCHASE_ORDER,
                    id: poId
                })

                const lineCount = poRecord.getLineCount({
                    sublistId: 'item'
                })

                log.debug("linecount:", lineCount);

                const sublist = form.addSublist({
                    id: 'custpage_itemlist',
                    type: serverWidget.SublistType.LIST,
                    label: 'Items'
                })

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

                for(let i=0;  i<lineCount; i++){

                    const itemName = poRecord.getSublistText({
                        sublistId:'item',
                        fieldId:'item',
                        line:i
                    })

                    const quantity =poRecord.getSublistValue({
                        sublistId:'item',
                        fieldId:'quantity',
                        line:i
                    })

                    
                    const rate =poRecord.getSublistValue({
                        sublistId:'item',
                        fieldId:'rate',
                        line:i
                    })

                    
                    const amount =poRecord.getSublistValue({
                        sublistId:'item',
                        fieldId:'amount',
                        line:i
                    })


                    sublist.setSublistValue({
                        id:'item_name',
                        line:i,
                        value:itemName
                    })

                    sublist.setSublistValue({
                        id:'quantity',
                        line:i,
                        value:quantity.toString()
                    })

                    sublist.setSublistValue({
                        id:'rate',
                        line:i,
                        value:rate.toString()
                    })

                    sublist.setSublistValue({
                        id:'amount',
                        line:i,
                        value:amount.toString()
                    })
                }

            } catch (e) {
                log.error("Error:", e);
            }

        }

        scriptContext.response.writePage(form);
    }

    return { onRequest }
});