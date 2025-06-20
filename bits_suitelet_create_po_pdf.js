/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/query', 'N/render', 'N/file'], (record, query, render, file) => {

    const onRequest = (scriptContext) => {
        if (scriptContext.request.method === 'GET') {
            const poId = scriptContext.request.parameters.id;

            if (!poId) {
                scriptContext.response.write('Missing purchase order ID.');
                return;
            }

            // Load parent record
            const poRecord = record.load({
                type: 'customrecord_bits_po_form',
                id: poId
            });

            const childRecordQuery = `
            SELECT 
            custrecord_bits_cust_vendor_name,
            custrecord_bits_cust_subsidiary,
            custrecord_bits_vendor_location,
            custrecord_bits_contact_number,
            custrecord_bits_vendor_company_name,
            name
            FROM
            customrecord_bits_custom_vendor
            WHERE
            custrecord_bits_cust_vendor_name =?
            `;

            const  queryResult = query.runSuiteQL({
                query:childRecordQuery,
                params:[poId]
            });
            
            const childResults = queryResult.asMappedResults();

            log.debug('Child Result Data:', childResults);

         //   log.debug('Child Records', JSON.stringify(childResults));

            // Load FTL template file from File Cabinet
            const templateFile = file.load({
                id: 9737  //File Id
            });

            const renderer = render.create();
            renderer.templateContent = templateFile.getContents();

            renderer.addRecord({
                templateName: 'record',
                record: poRecord
            })

            renderer.addCustomDataSource({
                alias: 'vendor_info',
                format: render.DataSource.OBJECT,
                data: { lines: childResults }
            });

            // Render and return the PDF
            const pdfFile = renderer.renderAsPdf();
            scriptContext.response.writeFile(pdfFile, true);
        }
    };

    return { onRequest };
});
