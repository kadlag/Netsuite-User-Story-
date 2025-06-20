/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(['N/currentRecord', 'N/url'], function (currentRecord, url) {

    function openReturnAuthSuiteletButtonClick() {
        const record = currentRecord.get();
        const recId = record.id;

        const suiteletUrl = url.resolveScript({
            scriptId: 'customscript_bits_suit_return_auth',
            deploymentId: 'customdeploy_bits_suite_return_auth',
            params: {
                recId: recId
            }
        });
        window.location.href = suiteletUrl;
    }

    let isSyncingCheckboxes = false; // Flag to prevent recursion
    const sublistId = 'custpage_vehicle_sublist';

    const pageInit = (scriptContext) => {
        const rec = currentRecord.get();
        const lineCount = rec.getLineCount({ sublistId });

        for (let i = 0; i < lineCount; i++) {
            const returnQty = parseFloat(rec.getSublistValue({
                sublistId,
                fieldId: 'custpage_return_quantity',
                line: i
            }) || 0);

            const authorizedQty = parseFloat(rec.getSublistValue({
                sublistId,
                fieldId: 'custpage_return_authorize_quantity',
                line: i
            }) || 0);

            if (returnQty === authorizedQty) {
                try {
                    const field = rec.getSublistField({
                        sublistId,
                        fieldId: 'custpage_return',
                        line: i
                    });
                    if (field) {
                        field.isDisabled = true;
                    }
                } catch (e) {
                    console.log('Error processing line', i, e);
                }
            }
        }
    };

    const fieldChanged = (scriptContext) => {
        if (isSyncingCheckboxes) return;

        const rec = currentRecord.get();

        if (scriptContext.fieldId === 'custpage_filter') {
            const filter = rec.getValue({ fieldId: 'custpage_filter' });
            const invoiceId = rec.getValue({ fieldId: 'custpage_invoice_id' });

            const suiteletUrl = url.resolveScript({
                scriptId: 'customscript_bits_suit_return_auth',
                deploymentId: 'customdeploy_bits_suite_return_auth',
                params: {
                    recId: invoiceId,
                    custpage_filter: filter
                }
            });

            window.onbeforeunload = null;
            window.location.href = suiteletUrl;
            return;
        }

        if (scriptContext.sublistId === sublistId && scriptContext.fieldId === 'custpage_return') {
            const changedLine = scriptContext.line;

            const isChecked = rec.getSublistValue({
                sublistId,
                fieldId: 'custpage_return',
                line: changedLine
            });

            const relatedId = rec.getSublistValue({
                sublistId,
                fieldId: 'custpage_item_related_id',
                line: changedLine
            });

            const lineCount = rec.getLineCount({ sublistId });

            try {
                isSyncingCheckboxes = true;

                for (let i = 0; i < lineCount; i++) {
                    const currentRelatedId = rec.getSublistValue({
                        sublistId,
                        fieldId: 'custpage_item_related_id',
                        line: i
                    });

                    if (currentRelatedId === relatedId) {
                        const returnQty = parseFloat(rec.getSublistValue({
                            sublistId,
                            fieldId: 'custpage_return_quantity',
                            line: i
                        }) || 0);

                        const authorizedQty = parseFloat(rec.getSublistValue({
                            sublistId,
                            fieldId: 'custpage_return_authorize_quantity',
                            line: i
                        }) || 0);

                        // Only update if not fully returned
                        if (returnQty !== authorizedQty) {
                            rec.selectLine({ sublistId, line: i });
                            rec.setCurrentSublistValue({
                                sublistId,
                                fieldId: 'custpage_return',
                                value: isChecked
                            });
                            rec.commitLine({ sublistId });
                        }
                    }
                }
            } catch (e) {
                console.log(`Error updating lines: ` + e.message);
            } finally {
                isSyncingCheckboxes = false;
            }
        }
    };

    return {
        openReturnAuthSuiteletButtonClick,
        pageInit,
        fieldChanged,
    };
});
