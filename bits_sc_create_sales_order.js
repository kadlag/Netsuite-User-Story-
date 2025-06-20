/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */

define(['N/record', 'N/search', 'N/query', 'N/log', 'N/runtime'],
    (record, search, query, log, runtime) => {
        const execute = (context) => {
            try {

                let salesQuery = `
                SELECT id, tranid, entity, trandate ,  status, memo
                FROM transaction 
                WHERE type = 'SalesOrd' 
                `;

                let queryResult = query.runSuiteQL({
                    query: salesQuery
                })

                let result = queryResult.asMappedResults();
                log.debug("Existing Sales Order Result:", result);

                const newRecord = record.create({
                    type: record.Type.SALES_ORDER,
                    isDynamic: true,
                })

                newRecord.setValue({
                    fieldId:'entity',
                    value:3590 //Bits Tech Company
                })

                newRecord.setValue({
                    fieldId:'location',
                    value:2 //India
                })

                newRecord.selectNewLine({
                    sublistId:'item'
                })

                newRecord.setCurrentSublistValue({
                    sublistId:'item',
                    fieldId:'item',
                    value:225
                })

                  newRecord.setCurrentSublistValue({
                    sublistId:'item',
                    fieldId:'quantity',
                    value:5
                })

                   newRecord.setCurrentSublistValue({
                    sublistId:'item',
                    fieldId:'rate',
                    value:100
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