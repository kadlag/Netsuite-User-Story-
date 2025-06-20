/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(['N/url', 'N/runtime'], function (url, runtime) {

    function fieldChanged(scriptContext) {
        if (scriptContext.fieldId === 'custpage_item_type') {
            var selectedValue = scriptContext.currentRecord.getValue({
                fieldId: 'custpage_item_type'
            });

            var suiteletUrl = url.resolveScript({
                scriptId:'customscript_bits_ss_create_item',
                deploymentId:'customdeploy_bits_ss_create_item',
                params: {
                    custpage_item_type: selectedValue
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
