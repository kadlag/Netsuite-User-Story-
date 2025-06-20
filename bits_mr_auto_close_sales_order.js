/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record','N/search'], (record,search) => {

    const getInputData = () => {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        log.debug("Six Month Ago", sixMonthsAgo);

        const day = sixMonthsAgo.getDate();
        const month = sixMonthsAgo.getMonth() + 1;
        const year = sixMonthsAgo.getFullYear();
        const formattedDate = `${day}/${month < 10 ? '0' + month : month}/${year}`;
        log.debug("Formatted Date", formattedDate);

        return search.create({
            type: search.Type.SALES_ORDER,
            filters: [
                ['mainline', 'is', 'T'],
                'AND',
                ['status', 'anyof', 'SalesOrd:B'], // Pending Fulfillment
                'AND',
                ['trandate', 'onorafter', formattedDate],
                'AND',
                ['createdfrom.type', 'noneof', 'ItemShip']
            ],
            columns: [
                'internalid',
                'tranid',
                'memo'
            ]
        });
    };

    const map = (mapContext) => {

        const result = JSON.parse(mapContext.value);
        log.debug("Result:", result);
        const salesOrderId = result.id;
        mapContext.write({
            key: salesOrderId,
            value: 'update'
        })
    };

    const reduce = (reduceContext) => {
        const salesOrderId = reduceContext.key;
        log.debug("Sales Order Id:", salesOrderId);

        try {
            const salesOrder = record.load({
                type: record.Type.SALES_ORDER,
                id: salesOrderId,
                isDynamic: true
            });

            const lineCount = salesOrder.getLineCount({ sublistId: 'item' });

            for (let i = 0; i < lineCount; i++) {
                salesOrder.selectLine({
                    sublistId: 'item',
                    line: i
                });
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'isclosed',
                    value: true
                });
                salesOrder.commitLine({
                    sublistId: 'item'
                });
            }
            salesOrder.setValue({
                fieldId: 'memo',
                value: `${salesOrderId} Sales Order Closed`
            });

            const savedId = salesOrder.save();

            log.debug("Save Id", savedId);

        } catch (e) {
            log.error("ERROR", e);
        }
    };

    const summarize = (summaryContext) => {
    };

    return {
        getInputData,
        map,
        reduce,
        summarize
    };
});
