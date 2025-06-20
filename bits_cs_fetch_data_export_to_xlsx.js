/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(['N/currentRecord', 'N/url'], (currentRecord, url) => {

    // Format date to D/M/YYYY
    const formatDate = (dateValue) => {
        const dateObj = new Date(dateValue);
        const day = dateObj.getDate(); 
        const month = dateObj.getMonth() + 1; 
        const year = dateObj.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const triggerExportToExcel = () => {
        const rec = currentRecord.get();

        const customer = rec.getValue({ fieldId: 'custpage_customer' });
        let startDate = rec.getValue({ fieldId: 'custpage_start_date' });
        let endDate = rec.getValue({ fieldId: 'custpage_end_date' });

        if (!customer || !startDate || !endDate) {
            alert('Please select Customer, Start Date, and End Date.');
            return;
        }

        // Format the date values to D/M/YYYY
        startDate = formatDate(startDate);
        endDate = formatDate(endDate);

        alert('Start Date: ' + startDate + '\nEnd Date: ' + endDate);

        const suiteletUrl = url.resolveScript({
            scriptId: 'customscript_bits_suit_data_export_xlsx',
            deploymentId: 'customdeploy_bit_suit_fetch_data_xlsx',
            params: {
                custpage_customer: customer,
                custpage_start_date: startDate,
                custpage_end_date: endDate,
                custpage_action_type: 'export'
            }
        });

        window.location.href = suiteletUrl;
    };

    const saveRecord = () => {
        return true;
    };

    return {
        triggerExportToExcel,
        saveRecord
    };
});
