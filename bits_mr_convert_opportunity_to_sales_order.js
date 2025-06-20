/**
* @NApiVersion 2.1
* @NScriptType MapReduceScript
*/
define(['N/record', 'N/search', 'N/log','N/runtime'],
    (record, search, log ,runtime) => {
        const getInputData = () => {

          const searchId = runtime.getCurrentScript().getParameter({
            name:'custscript_bits_opp_save_search_id'
        });

        log.debug('SearchId' , searchId);
        return search.load({
            id:searchId
        });
        };
        const map = (mapContext) => {
            const result = JSON.parse(mapContext.value);
            log.debug("Map Context Values: ", result);

            const oppId = result.id;
            const tranId = result.values.tranid;

            mapContext.write({
                key: oppId,
                value: tranId
            })

        };

        const reduce = (reduceContext) => {
            const oppId = parseInt(reduceContext.key);
            log.debug("Opportunity Id:", oppId);

            try {

                //transform opportunity to sales order
                const salesOrderRec = record.transform({
                    fromType: record.Type.OPPORTUNITY,
                    fromId: oppId,
                    toType: record.Type.SALES_ORDER,
                    isDynamic: true
                })

                const salesOrderId = salesOrderRec.save();
                log.debug("Sales Order Id", salesOrderId);

            } catch (e) {
                log.debug("Error:", e);
            }
        }

        return {
            getInputData,
            map,
            reduce
        };
    });