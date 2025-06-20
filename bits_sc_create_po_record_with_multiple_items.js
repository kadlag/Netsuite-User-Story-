/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
define(['N/record', 'N/log'], function(record, log) {

    function execute(context) {
        try {
            var purchaseOrder = record.create({
                type: record.Type.PURCHASE_ORDER,
                isDynamic: true
            });

           
            purchaseOrder.setValue({
                fieldId: 'entity',
                value: 3517
            });

           
            purchaseOrder.setValue({
                fieldId: 'trandate',
                value: new Date()
            });

          
            var itemsToAdd = [
                { itemId: 125, quantity: 2 },
                { itemId: 225, quantity: 4 },
                { itemId: 233, quantity: 3 }
            ];


            itemsToAdd.forEach(function(item) {
                purchaseOrder.selectNewLine({ sublistId: 'item' });
                purchaseOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: item.itemId
                });
                purchaseOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    value: item.quantity
                });
                purchaseOrder.commitLine({ sublistId: 'item' });
            });

           
            var purchaseOrderId = purchaseOrder.save();

            log.debug({
                title: 'Purchase Order Created',
                details: 'Purchase Order ID: ' + purchaseOrderId
            });

        } catch (e) {
            log.error({
                title: 'Error creating purchase order',
                details: e.message
            });
        }
    }

    return {
        execute: execute
    };
});
