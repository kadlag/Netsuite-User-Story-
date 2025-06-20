/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */

define(['N/record', 'N/search', 'N/query', 'N/log', 'N/runtime'],
    (record, search, query, log, runtime) => {
        const execute = (context) => {
            try {

                let cashSaleQuery = `
                 SELECT id, tranid, entity, trandate, currency, status, memo
                FROM transaction 
                WHERE type = 'CashSale'
                `;

                let queryResult = query.runSuiteQL({
                    query: cashSaleQuery
                })

                let result = queryResult.asMappedResults();
                log.debug("Existing Cash Sale Result:", result);

                const newRecord = record.create({
                    type: record.Type.CASH_SALE,
                    isDynamic: true,
                })

                newRecord.setValue({
                    fieldId:'entity',
                    value:3532
                })

                newRecord.setValue({
                    fieldId:'location',
                    value:5
                })

                newRecord.selectNewLine({
                    sublistId:'item'
                })

                newRecord.setCurrentSublistValue({
                    sublistId:'item',
                    fieldId:'item',
                    value:230
                })

                  newRecord.setCurrentSublistValue({
                    sublistId:'item',
                    fieldId:'quantity',
                    value:5
                })

                let price = 100;

                let calAmount = price*5;

                 newRecord.setCurrentSublistValue({
                    sublistId:'item',
                    fieldId:'amount',
                    value:calAmount
                })

                newRecord.commitLine({
                    sublistId:'item'
                });

                let recordId =newRecord.save();
                log.debug("Record Id:" , recordId);

            } catch (e) {
                log.error({ title: 'SCRIPT_EXECUTION_ERROR', details: e });

            }
        }
        return {
            execute
        };
    });