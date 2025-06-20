/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */

define(['N/record', 'N/search', 'N/query', 'N/log', 'N/runtime'],
    (record, search, query, log, runtime) => {
        const execute = (context) => {
            try {

                const cashSaleId = runtime.getCurrentScript().getParameter({
                    name: 'custscript_bits_cash_sale_id'
                });

                let cashSaleRecord = record.load({
                    type: record.Type.CASH_SALE,
                    id: cashSaleId,
                    isDynamic: true,
                })

                log.debug("Record Loaded Successfully", cashSaleRecord);

                let linecount = cashSaleRecord.getLineCount({
                    sublistId: 'item'
                })

                log.debug("Line Count:", linecount);


                for (let i = 0; i < linecount; i++) {

                    cashSaleRecord.selectLine({
                        sublistId: 'item',
                        line: i
                    })

                    let quantity = cashSaleRecord.getSublistField({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i
                    })

                    let rate = cashSaleRecord.getSublistField({
                        sublistId: 'item',
                        fieldId: 'rate',
                        line: i
                    })
                    if (!quantity || !rate) {
                        log.debug("Field not Present");
                    } else {
                        cashSaleRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            value: 8
                        })

                        log.debug("Current line:", i);
                        cashSaleRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            value: 200
                        })

                        cashSaleRecord.commitLine({
                            sublistId: 'item'
                        });

                        let recordId = cashSaleRecord.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });

                        log.debug("Record Save Successfully", recordId);
                    }
                }
            } catch (e) {
                log.error({ title: 'SCRIPT_EXECUTION_ERROR', details: e });

            }
        }
        return {
            execute
        };
    });