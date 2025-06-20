/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(['N/url', 'N/runtime'], function (url, runtime) {

    const formatDate = (dateValue) => {
        const dateObj = new Date(dateValue);
        const day = dateObj.getDate();
        const month = dateObj.getMonth() + 1;
        const year = dateObj.getFullYear();
        return `${day}/${month}/${year}`;
    };

    function fieldChanged(context) {
        var fieldId = context.fieldId;

        if (fieldId === 'custpage_date' || fieldId === 'custpage_transaction_type') {
            var currentRecord = context.currentRecord;

            var selectedDate = currentRecord.getValue({
                fieldId: 'custpage_date'
            });
            
            if (selectedDate) {
                selectedDate = formatDate(selectedDate);
            }else{
                selectedDate = '';
            }

            var selectedType = currentRecord.getValue({
                fieldId: 'custpage_transaction_type'
            });

            var suiteletUrl = url.resolveScript({
                scriptId: 'customscript_bits_ss_show_so_transfer',
                deploymentId: 'customdeploy_bits_ss_show_so_transfer',
                params: {
                    custpage_date: selectedDate,
                    custpage_transaction_type: selectedType
                }
            });

            window.onbeforeunload = null;
            window.location.href = suiteletUrl;
        }
    }

    return {
        fieldChanged
    };
});
