/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */

define(['N/record', 'N/search', 'N/query', 'N/log', 'N/runtime'],
    (record, search, query, log, runtime) => {
        const execute = (context) => {
            try {

                const soSaveSearchId = runtime.getCurrentScript().getParameter({
                    name: 'custscript_bits_so_saved_search_id'
                });

                log.debug("Sales order save search id", soSaveSearchId);

                if (!soSaveSearchId) {
                    log.error('Missing Parameter', 'Saved Search ID is not defined');
                    return;
                }

                var soSearch = search.load({
                    id: soSaveSearchId
                })

                soSearch.run().each(result => {
                    var salesOrderId = result.id;

                    log.debug("Sales Order Id:", salesOrderId);

                    var itemFulfillment = record.transform({
                        fromType: record.Type.SALES_ORDER,
                        fromId: salesOrderId,
                        toType: record.Type.ITEM_FULFILLMENT,
                        isDynamic: false

                    })

                    var itemLineCount = itemFulfillment.getLineCount({
                        sublistId:'item'
                    })

                    log.debug("Item Line count:",itemLineCount);

                    var fulfillmentId = itemFulfillment.save();

                    log.debug("Fulfillment ID:" ,fulfillmentId);

                    var salesOrder = record.load({
                        type: record.Type.SALES_ORDER,
                        id:salesOrderId
                    })

                    salesOrder.setValue({
                        fieldId:'memo',
                        value:'Order Fulfilled with Id:'+fulfillmentId
                    })

                    salesOrder.save();

                    log.debug("Sales Order Saved Successfully");


                })
            } catch (e) {
                log.error({ title: 'SCRIPT_EXECUTION_ERROR', details: e });

            }
        }
        return {
            execute
        };
    });