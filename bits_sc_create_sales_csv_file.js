/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */

define(['N/record', 'N/search', 'N/file', 'N/log', 'N/runtime'],
    (record, search, file, log, runtime) => {
        const execute = (context) => {
            try {
                const mySearch = search.create({
                    type: "salesorder",
                    filters: [
                        ["type", "anyof", "SalesOrd"],
                        "AND",
                        ["mainline", "is", "T"],
                        "AND",
                        ["datecreated", "onorafter", "startofthisyear"]
                    ],
                    columns: [
                        "internalid", "tranid", "trandate", "amount"
                    ]
                });

                let fileLines = 'internalId,tranid,tranDate,amount\n';

                mySearch.run().each(result => {
                    const internalId = result.getValue('internalid') || '';
                    const tranId = result.getValue('tranid') || '';
                    const tranDate = result.getValue('trandate') || '';
                    const amount = result.getValue('amount') || '';

                    fileLines += `${internalId},${tranId},${tranDate},${amount}\n`;
                    return true;
                })

                const fileObj = file.create({
                    name: 'sales_data_scheduled.csv',
                    fileType: file.Type.CSV,
                    folder: 522,
                    contents: fileLines
                });

                const fileId = fileObj.save();
                log.debug('File Saved Successfully', { fileId });

            } catch (e) {
                log.error({ title: 'SCRIPT_EXECUTION_ERROR', details: e });

            }
        }
        return {
            execute
        };
    });