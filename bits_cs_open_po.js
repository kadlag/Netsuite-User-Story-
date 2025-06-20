/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/ui/dialog', 'N/ui/message', 'N/url'],

    (currentRecord, dialog, message, url) => {
        /**
       * Function to be executed after page is initialized.
       *
       * @param {Object} scriptContext
       * @param {Record} scriptContext.currentRecord - Current form record
       * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
       *
       * @since 2015.2
       */
        function pageInit(scriptContext) {

        }

        function openPoSuiteletButtonClick() {

            alert("Suitelet open");

            const record = currentRecord.get();
            const poId = record.id;

            alert("Purchase Order Id:" + poId);

            var suiteletUrl = url.resolveScript({
                scriptId: 'customscript_bits_suitelet_po_data',
                deploymentId: 'customdeploy_bits_suitelet_po_data',
                params: {
                    poId: poId
                }
            });
            window.location.href = suiteletUrl;
        }

        return {
            pageInit,
            openPoSuiteletButtonClick

        };
    });