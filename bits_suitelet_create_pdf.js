/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/query', 'N/render', 'N/file'], (record, query, render, file) => {

    const onRequest = (scriptContext) => {
        if (scriptContext.request.method === 'GET') {
            const studentId = scriptContext.request.parameters.id;

            if (!studentId) {
                scriptContext.response.write('Missing student ID.');
                return;
            }

            // Load parent record
            const studentRecord = record.load({
                type: 'customrecord_bits_stud_registration_rec',
                id: studentId
            });

            // Query child records
            const childResults = query.runSuiteQL({
                query: `
          SELECT 
            custrecord_bits_stud_info_name, 
            custrecord_bits_subject_name, 
            custrecord_bits_stud_info_marks,
            custrecord_bits_student_info_grade
          FROM 
            customrecord_bits_student_info 
          WHERE 
            custrecord_bits_stud_info_name = ?
        `,
                params: [studentId]
            }).asMappedResults().filter(r => r.custrecord_bits_subject_name);

            log.debug('JSON Data:', childResults);

            log.debug('Child Records', JSON.stringify(childResults));

            // Load FTL template file from File Cabinet
            const templateFile = file.load({
                id: 9730  //File Id
            });

            const renderer = render.create();
            renderer.templateContent = templateFile.getContents();

            renderer.addRecord({
                templateName: 'record',
                record: studentRecord
            })

            renderer.addCustomDataSource({
                alias: 'student_info',
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
