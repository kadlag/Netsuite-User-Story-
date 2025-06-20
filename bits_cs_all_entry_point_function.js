/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/ui/dialog', 'N/ui/message'],

    (currentRecord, dialog, message) => {
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

            const currentRec = scriptContext.currentRecord;

            alert("Sales Order Page");

            currentRec.setValue({
                fieldId: 'memo',
                value: 'this is sales order'
            })

            currentRec.setValue({
                fieldId: 'custbody_bits_duscount_per',
                value: 60
            })

            var setMessage = message.create({
                title: "Memo",
                message: "Set memo and discount field value successfully",
                type: message.Type.INFORMATION
            });

            setMessage.show();

        }

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {

            const currentRec = scriptContext.currentRecord;
            const fieldID = scriptContext.fieldId;

            if (fieldID === 'entity') {
                currentRec.setValue({
                    fieldId: 'memo',
                    value: 'Customer is selected'
                })
            }

            if (fieldID === 'startdate') {
                currentRec.setValue({
                    fieldId: 'custbody_bits_total_value',
                    value: 1000
                })
            }
        }

        /**
         * Function to be executed when field is slaved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         *
         * @since 2015.2
         */
        function postSourcing(scriptContext) {

            const currentRec = scriptContext.currentRecord;
            const fieldID = scriptContext.fieldId;

            alert("Post Sourcing");
            if (fieldID === 'entity') {
                const customer = currentRec.getValue({
                    fieldId: 'entity'
                })

                alert("customer:" + customer);

                if (customer) {
                    currentRec.setValue({
                        fieldId: 'memo',
                        value: 'Customer Selected' + customer
                    })
                }
            }
        }

        /**
         * Function to be executed after sublist is inserted, removed, or edited.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function sublistChanged(scriptContext) {

            const currentRec = scriptContext.currentRecord;
            const sublistID = scriptContext.sublistId;

            log.debug("Sublist changed");
            if (sublistID === 'item') {
                const total = currentRec.getValue({
                    fieldId: 'total'
                })
                log.debug("Total:", total);
                currentRec.setValue({
                    fieldId: 'custbody_bits_total_value',
                    value: total
                })
            }
        }

        /**
         * Function to be executed after line is selected.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function lineInit(scriptContext) {

            const currentRec = scriptContext.currentRecord;
            const sublistID = scriptContext.sublistId;

            if (sublistID === 'item') {
                currentRec.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_bits_so_discount',
                    value: 80
                })

                dialog.confirm({
                    title: 'Discount',
                    message: 'Discount Added Successsfully'
                })
            }
        }

        /**
         * Validation function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @returns {boolean} Return true if field is valid
         *
         * @since 2015.2
         */
        function validateField(scriptContext) {

            const currentRec = scriptContext.currentRecord;

            log.debug("Validate Field");
            if (scriptContext.fieldId === 'custbody_bits_duscount_per') {
                const discount = currentRec.getValue({
                    fieldId: 'custbody_bits_duscount_per',
                })

                log.debug("Discount:", discount);
                if (discount < 50) {
                    var setMessage = message.create({
                        title: "Discount",
                        message: "Discount must be greater than 50",
                        type: message.Type.ERROR
                    });

                    setMessage.show();
                }

            }
            return true;
        }

        /**
         * Validation function to be executed when sublist line is committed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateLine(scriptContext) {

            const currentRec = scriptContext.currentRecord;

            log.debug("Validate line");

            if (scriptContext.sublistId === 'item') {
                const quantity = currentRec.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity'
                })

                if (quantity < 5) {
                    dialog.alert({
                        title: 'Quantity Alert',
                        message: 'Quantity must be greater than 5'
                    })
                    return false;
                } else {
                    dialog.confirm({
                        title: "Quantity Confirmation",
                        message: "Quantity Accepted"
                    })
                }
            }
            return true;
        }

        /**
         * Validation function to be executed when sublist line is inserted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateInsert(scriptContext) {

            const currentRec = scriptContext.currentRecord;

            if (scriptContext.sublistId === 'item') {
                const amount = currentRec.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'amount'
                })

                log.debug("Amount", amount);
                if (amount < 200) {
                    var setMessage = message.create({
                        title: "Amount",
                        message: "Amount Must be greater than 200",
                        type: message.Type.WARNING,
                    });

                    setMessage.show();
                }
            }
            return true;
        }

        /**
         * Validation function to be executed when record is deleted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateDelete(scriptContext) {

            const currentRec = scriptContext.currentRecord;

            if (scriptContext.sublistId === 'item') {
                const amount = currentRec.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'amount'
                })

                const quantity = currentRec.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity'
                })

                if (amount > 500 && quantity > 2) {
                    var setMessage = message.create({
                        title: "Deleted Warning",
                        message: "The selected item cannot be deleted",
                        type: message.Type.WARNING,
                    });

                    setMessage.show();
                    return false;
                }
            }
            return true;
        }

        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        function saveRecord(scriptContext) {

            const currentRec = scriptContext.currentRecord;

            const lineCount = currentRec.getLineCount({
                sublistId: 'item'
            })

            log.debug("line count:", lineCount);

            if (lineCount < 2) {

                 dialog.alert({
                    title: 'Error',
                    message: 'Record not Created'
                })
                return false;
            } else {
                 dialog.alert({
                    title: 'Error',
                    message: 'Record  Created Successfully'
                })

            }
            return true;

        }

        return {
            // pageInit,
            // fieldChanged,
            // postSourcing,
            // sublistChanged,
            // lineInit,
            // validateField,
            // validateLine,
            // validateInsert,
            // validateDelete,
            saveRecord,
        };
    });