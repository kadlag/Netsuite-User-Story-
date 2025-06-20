/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @Name
*/
define([
    'N/record',
    'N/search',
],
    (record, search) => {
        /**
             * Defines the function definition that is executed before record is loaded.
             * @param {Object} scriptContext
             * @param {Record} scriptContext.newRecord - New record
             * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
             * @param {Form} scriptContext.form - Current form
             * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
             * @since 2015.2
             */
        const beforeLoad = (scriptContext) => {

            if (scriptContext.type === scriptContext.UserEventType.CREATE || scriptContext.type === scriptContext.UserEventType.EDIT) {

                const form = scriptContext.form;

                const emailField = form.getField({
                    id: 'email'
                })

                if (emailField) {
                    emailField.isMandatory = true;
                }

                const customerRecord = scriptContext.newRecord;

                customerRecord.setValue({
                    fieldId: 'email',
                    value: 'bits@gmail.com'
                })

                customerRecord.setValue({
                    fieldId: 'custentity_esc_annual_revenue',
                    value: 100000
                })
            }
        };
        /**
               * Defines the function definition that is executed before record is submitted.
               * @param {Object} scriptContext
               * @param {Record} scriptContext.newRecord - New record
               * @param {Record} scriptContext.oldRecord - Old record
               * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
               * @since 2015.2
               */
        const beforeSubmit = (scriptContext) => {
            if (scriptContext.type === scriptContext.UserEventType.CREATE) {
                const customerRecord = scriptContext.newRecord;

                customerRecord.setValue({
                    fieldId: 'phone',
                    value: 7858748596
                })

                const phone = customerRecord.getValue({
                    fieldId: 'phone'
                })

                log.debug("Phone:", phone);
            }
        };
        /**
               * Defines the function definition that is executed after record is submitted.
               * @param {Object} scriptContext
               * @param {Record} scriptContext.newRecord - New record
               * @param {Record} scriptContext.oldRecord - Old record
               * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
               * @since 2015.2
               */
        const afterSubmit = (scriptContext) => {
              if (scriptContext.type === scriptContext.UserEventType.CREATE || scriptContext.type === scriptContext.UserEventType.EDIT) {
                const customerRecord = scriptContext.newRecord;

                const customerId = customerRecord.id;

                var customerRec = record.create({
                    type:'customrecord_bits_cust_record',
                    isDynamic: true
                })

                const email=customerRecord.getValue({
                    fieldId:'email'
                })

                const phone=customerRecord.getValue({
                    fieldId:'phone'
                })

                  customerRec.setValue({
                    fieldId:'name',
                    value:'Customer Info'
                })
                  customerRec.setValue({
                    fieldId:'custrecord_bits_customer_name',
                    value:customerId
                })
                customerRec.setValue({
                    fieldId:'custrecord_bits_cust_email',
                    value:email
                })
                  customerRec.setValue({
                    fieldId:'custrecord_bits_cust_phone',
                    value:phone
                })

                 try{
                    var customerRecordId = customerRec.save();
                    log.debug("Customer Id:" +customerRecordId);

                }catch(e){
                    log.error(e);
                }
              }

        };
        return {
            beforeLoad,
            beforeSubmit,
            afterSubmit,
        };
    });